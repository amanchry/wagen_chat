
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.http import JsonResponse, Http404, HttpResponse
from django.http import StreamingHttpResponse
from django.contrib.auth.hashers import make_password
import json
from django.utils import timezone
import os
import random
from django.contrib import messages
from django.http import JsonResponse, Http404, HttpResponse
from django.http import StreamingHttpResponse
# Create your views here.
import jwt
from django.contrib.auth.hashers import make_password
from .models import WIUser, WIArea, ReportHistory
from webapp.functions import send_otp,send_contact_email
import geopandas as gpd
from django.contrib.gis.geos import Point, LineString, Polygon, MultiPolygon, MultiLineString, MultiPoint
from django.contrib.gis.geos import GEOSGeometry
from osgeo import gdal, osr
from dotenv import load_dotenv
from django.db.models import Q
from django.db.models.expressions import RawSQL
import numpy as np
from datetime import timedelta
from django.utils.timezone import now
from django.contrib.auth.hashers import check_password
from django.conf import settings
from celery.result import AsyncResult
from django_celery_results.models import TaskResult
from django.core.serializers import serialize
from itertools import chain
from .tasks import wagen_report
load_dotenv()

base_url = settings.BASE_URL




def validate_jwt_request(request):
    """Check JWT in Authorization header and return (user, error_response)."""
    auth_header = request.headers.get("Authorization")


    if not auth_header or not auth_header.startswith("Token "):
        return None, JsonResponse({"success": False, "message": "Authorization header missing"}, status=401)

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")

        try:
            user = WIUser.objects.get(id=user_id, is_active=True)
        except WIUser.DoesNotExist:
            return None, JsonResponse({"success": False, "message": "User not found"}, status=401)

        return user, None

    except jwt.ExpiredSignatureError:
        return None, JsonResponse({"success": False, "message": "Token expired"}, status=401)
    except jwt.InvalidTokenError:
        return None, JsonResponse({"success": False, "message": "Invalid token"}, status=401)
    



@csrf_exempt
def showHome(request):
    return HttpResponse("Backend WI Tools Chat")



@csrf_exempt
def UserRegisterView(request):
    if request.method == "POST":
        # try:
            # Parse JSON request body
            data = json.loads(request.body)
            email = data.get("email")
            name = data.get("name")
            password = data.get("password")
            isActive = data.get("isActive")
            tool = data.get("tool")

            if not email or not password or not name:
                return JsonResponse({"success": False, "message": "Email, Name and Password are required"}, status=400)
            
            if WIUser.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "message": "User with this email already exists."}, status=400)
            
            
            hashed_password = make_password(password)

            user = WIUser.objects.create(
                username= f"{email.split('@')[0]}_{tool}",
                name=name,
                email=email,
                password=hashed_password,
                is_active=True if isActive else False,
                tool=tool
            )

            user.save()

            

            return JsonResponse({
                "success": True,
                "message": "User registered successfully, please verify your email."
            }, status=201)


        # except json.JSONDecodeError:
        #     return JsonResponse({"success": False, "message": "Invalid JSON data"}, status=400)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)


@csrf_exempt
def send_email_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get("email")

        otp = random.randint(100000, 999999)

        result = send_otp(email, otp)

        if result.get('status') == 'error':
            return JsonResponse({
                "success": False,
                "message": "Failed to send OTP.",
                "error": result.get("error")
            }, status=500)

        return JsonResponse({
            "success": True,
            "otp":otp,
            "message": "Email sent to your email."
        }, status=201)
    

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)






@csrf_exempt
def loginView(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")
            tool = data.get("tool")

            username = f"{email.split('@')[0]}_{tool}"

            print("username",username)


            if not email or not password:
                return JsonResponse({"success": False, "message": "Email and password are required"})

            try:
                user = WIUser.objects.get(username=username)
            except WIUser.DoesNotExist:
                return JsonResponse({"success": False, "message": "Invalid login credentials"})

            if not check_password(password, user.password):
                return JsonResponse({"success": False, "message": "Invalid login credentials"})
            
            if not user.is_active:
                return JsonResponse({"success": False, "message": "User account is not activated."})
        

            expires_at = now() + timedelta(days=2)
            payload = {
                "user_id": user.id,
                "email": user.email,
                "exp": expires_at,
                "iat": now(),
            }


            token_str = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

            # For PyJWT >= 2.0, token is already str. For older versions, decode.
            if isinstance(token_str, bytes):
                token_str = token_str.decode("utf-8")



            return JsonResponse({
                "success": True,
                "message": "Logged in successfully",
                "data": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "token": token_str
                }
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON data"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return JsonResponse({"success": False, "message": "Invalid request method"})


    

@csrf_exempt
def logoutView(request):
    # In stateless JWT, logout = client deletes token
    return JsonResponse({"success": True, "message": "Logged out successfully"}, status=200)











@csrf_exempt
def get_task_status(request, task_id):
    user, error = validate_jwt_request(request)
    if error:
        return error
    
    print("task_id",task_id)
    task = AsyncResult(task_id)

    # if task.state in ['SUCCESS', 'FAILURE']:
    #     mapset_name = f"job_{task_id}"
    #     mapset_path = os.path.join(settings.GRASS_DB, settings.GRASS_LOCATION, mapset_name)
    #     if os.path.exists(mapset_path):
    #         shutil.rmtree(mapset_path)
    #         print(f"Mapset '{mapset_name}' removed after task completion.")

    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'progress': 0,
            'status': 'Task is pending...'
        }
    elif task.state == 'PROGRESS':
        response = {
            'state': task.state,
            'progress': task.info.get('current', 0),
            'total': task.info.get('total', 100),
            'status': task.info.get('status', '')
        }
    elif task.state == 'SUCCESS':
        response = {
            'state': task.state,
            'progress': 100,
            'status': 'Task completed!',
            'web_report': f"{base_url}/media/{task_id}/index.html",
            'pdf_report': f"{base_url}/media/{task_id}/report.pdf",
        }
    else:
        response = {
            'state': task.state,
            'progress': 0,
            'status': str(task.info)  # task.info is the error traceback if the task failed
        }
    
    return JsonResponse(response)






def upload_area_geom(geoJson_str, featureName, user):
    """
    Given a geometry (WKT, GeoJSON, or GEOSGeometry), return
    the WagenArea.id that spatially matches or contains it.
    Returns None if no match is found.
    """
    # Normalize input type
    geojson = json.loads(geoJson_str)

    existing = WIArea.objects.filter(user=user, name__iexact=featureName).first()
    if existing:
        return existing.id
    

    # ✅ Normalize into list of features
    if geojson.get("type") == "FeatureCollection":
        features = geojson["features"]
    elif geojson.get("type") == "Feature":
        features = [geojson]
    elif geojson.get("type") in [
        "Polygon", "MultiPolygon", "LineString", "MultiLineString", "Point", "MultiPoint"
    ]:
        # Raw geometry — wrap as Feature
        features = [{
            "type": "Feature",
            "properties": {},
            "geometry": geojson
        }]
    else:
        raise ValueError(f"Unsupported GeoJSON type: {geojson.get('type')}")

    # ✅ Convert to GeoDataFrame
    gdf = gpd.GeoDataFrame.from_features(features)

    if gdf.crs and gdf.crs != 'EPSG:4326':
        gdf = gdf.to_crs('EPSG:4326')
    else:
        gdf.set_crs('EPSG:4326', inplace=True)
    
    merged_geometry = gdf.unary_union
    if merged_geometry.is_empty:
        return JsonResponse({"result": "Empty geometry after merge"}, status=400)
    
    
    geom = GEOSGeometry(merged_geometry.wkt)
    if isinstance(geom, Polygon):
        geom = MultiPolygon([geom])
    elif isinstance(geom, LineString):
        geom = MultiLineString([geom])
    elif isinstance(geom, Point):
        geom = MultiPoint([geom])

    if not isinstance(geom, (MultiPolygon, MultiLineString, MultiPoint)):
        return JsonResponse({"result": "Unsupported geometry type"}, status=400)


    # Search for the WagenArea that contains or overlaps it
    area = WIArea(
        name=featureName,
        geom=geom,
        user=user,
    )
    area.save()

    return area if area else None



@csrf_exempt
def get_reports_list(request):
    user, error = validate_jwt_request(request)
    if error:
        return error
    
    
    tasks = ReportHistory.objects.filter(user__exact=user)
    succeeded = TaskResult.objects.filter(
        status="SUCCESS",
        task_id__in=chain.from_iterable(tasks.values_list("task"))
    )

    # ✅ Keep only successful ones
    success_task_ids = list(succeeded.values_list("task_id", flat=True))
    successful_reports = tasks.filter(task__in=success_task_ids)

    # ✅ Serialize properly
    serialized = serialize(
        "json",
        successful_reports,
        use_natural_primary_keys=True,
        use_natural_foreign_keys=True
    )
    data = json.loads(serialized)

    return JsonResponse({"data": data}, status=200)



@csrf_exempt
def generate_report(request):
    if request.method == "POST":
        user, error = validate_jwt_request(request)
        if error:
            return error
        print("user",user.email)
        area_geom = request.POST.get('areaGeom')
        featureName = request.POST.get('featureName')
        start = request.POST.get('start')
        end = request.POST.get('end')
        precip = request.POST.get('precip')
        et = request.POST.get('et')
        wri_data = request.POST.get('wri_data')

        # print('area_geom',area_geom)
        print('start',start)
        print('end',end)
        print('precip',precip)
        print('et',et)
        print('wri_data',wri_data)
        print('featureName',featureName)

        area=upload_area_geom(area_geom,featureName,user)
        print('areaid',area.id)
        
        current_user = user.email
        tsk = wagen_report.delay(area.id, start, end, precip, et,wri_data, current_user)
        tskhist = ReportHistory(user=user, area=area, task=tsk.id)
        tskhist.save()
        #"job id {}".format(tsk.id)
        return JsonResponse({"result": "Generating Report", "task_id": tsk.id}, status=200)
    else:
        return JsonResponse({"result": "Wrong request method"}, status=400)


