
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
from django.core.serializers import serialize
from django.conf import settings
from django.contrib.auth.hashers import check_password
# from django.contrib.auth.models import User
from .models import WagenUser, WagenProject, WagenArea
from .models import TaskHistory

from django.db import models
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
from .functions import send_otp,send_contact_email
import shutil
from math import floor
from pyproj import CRS
import requests
import jwt
from .functions import validate_jwt_request
import uuid
import hashlib
from celery.result import AsyncResult
from .tasks import wagen_report

load_dotenv()

base_url = settings.BASE_URL






@csrf_exempt
def showHome(request):
    return HttpResponse("Backend WAGen")





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

            if not email or not password or not name:
                return JsonResponse({"success": False, "message": "Email, Name and Password are required"}, status=400)
            
            if WagenUser.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "message": "User with this email already exists."}, status=400)
            
            
            hashed_password = make_password(password)

            user = WagenUser.objects.create(
                name=name,
                email=email,
                password=hashed_password,
                is_active=True if isActive else False
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

            if not email or not password:
                return JsonResponse({"success": False, "message": "Email and password are required"})

            try:
                user = WagenUser.objects.get(email=email)
            except WagenUser.DoesNotExist:
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
def RegisterProject(request):
    if request.method == 'POST':
        # try:
            user, error = validate_jwt_request(request)
            if error:
                return error
            
            project_name = request.POST.get('project_name')

            if not project_name:
                return JsonResponse({'message': 'Project name is required.'}, status=400)

            if WagenProject.objects.filter(user_id=user.id, project_name=project_name).exists():
                return JsonResponse({'message': 'A project with this name already exists, please select another name.'})


            project = WagenProject.objects.create(
                user=user,  
                project_name=project_name,
                registration_time=timezone.now(), 
            )

            project.save()
               

            return JsonResponse({'message': 'Project created successfully!'})

        # except Exception as e:
        #     return JsonResponse({'error': str(e)}, status=500)








@csrf_exempt
# @login_required
def delete_project(request, project_id):  # Ensure `project_id` matches `urls.py`
    """Deletes a project if the user is authorized."""
    if request.method == "DELETE":
        print("project_id",project_id)
        try:
            user, error = validate_jwt_request(request)
            if error:
                return error
            print("user",user)
        
            project = WagenProject.objects.get(id=project_id)  # Ensure user owns the project
            
            project.delete()
            jobid = str(project_id) 
            project_dir = os.path.join(settings.MEDIA_ROOT, jobid)
            if os.path.exists(project_dir):
                shutil.rmtree(project_dir)
        
            return JsonResponse({"message": "Project deleted successfully!"}, status=200)
        except WagenProject.DoesNotExist:
            return JsonResponse({"error": "Project not found or you don't have permission to delete it."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)



@csrf_exempt
def get_projects(request):
    if request.method == "GET":
        user, error = validate_jwt_request(request)
        if error:
            return error
        
        user_projects = WagenProject.objects.filter(user=user).values(
                'id', 'project_name', 'registration_time',
        )


        return JsonResponse({"success": True, "projects": list(user_projects)}, status=200)



@csrf_exempt
def project_details(request, id):
    if request.method == "GET":
        user, error = validate_jwt_request(request)
        if error:
            return error
        
        project = get_object_or_404(WagenProject, id=id)

        all_areas = WagenArea.objects.filter(project=project, user=user)

        

        project_data = {
            'project_id': project.id,
            'project_name': project.project_name,
            'project_thumbnail': project.project_thumbnail,
            'registration_time':project.registration_time,
        }

        return JsonResponse({'project_data': project_data})


@csrf_exempt
def get_area_geometry(request, areaId):
    if request.method == "GET":
        user, error = validate_jwt_request(request)
        if error:
            return error
        print("user",user)
        

        try:
            area = WagenArea.objects.get(id=areaId, user=user)
        except WagenArea.DoesNotExist:
            raise Http404("Area not found")

        geojson = json.loads(serialize('geojson', [area], geometry_field='geom'))['features'][0]
        geometry = geojson['geometry']

        return JsonResponse({
            'id': area.id,
            'name': area.name,
            'geometry': geometry
        })
    


@csrf_exempt
def deleteAreaGeom(request, id):
    if request.method == "DELETE":
        user, error = validate_jwt_request(request)
        if error:
            return error

        try:
            area = WagenArea.objects.get(id=id, user=user)
            area_name =area.name
        except WagenArea.DoesNotExist:
            raise Http404("Area not found")

        area.delete()

        return JsonResponse({'message': f'Area {area_name} deleted successfully.'})

    return JsonResponse({'message': 'Invalid request method. Use DELETE.'}, status=405)









@csrf_exempt
def saveDrawGeojson(request):
    if request.method == 'POST':
        user, error = validate_jwt_request(request)
        if error:
            return error

        # try:
        data = json.loads(request.body)
        featureName = data.get('name')
        geoJson_str = data.get('geom')
        project_id_str = data.get('projectid')


        if not featureName:
            return JsonResponse({"result": "Feature name is required"}, status=400)
        if not geoJson_str:
            return JsonResponse({"result": "The geometry was not set"}, status=400)
        if not project_id_str:
            return JsonResponse({"result": "The project ID was not set"}, status=400)
            
        
        geojson = json.loads(geoJson_str)
        gdf = gpd.GeoDataFrame.from_features(geojson["features"])

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

        # Link to Project (optional)
        project = None
        if project_id_str:
            try:
                project_id = int(project_id_str)
                project = WagenProject.objects.get(id=project_id)
            except (ValueError, WagenProject.DoesNotExist):
                return JsonResponse({"result": f"Invalid project ID: {project_id_str}"}, status=400)
            
        area = WagenArea(
            name=featureName,
            geom=geom,
            user=user,
            project=project,
        )
        area.save()



        return JsonResponse({'message': 'Area added successfully!',})

        
        # except ValidationError as ve:
        #     return JsonResponse({"message": str(ve.messages[0])}, status=400)

        # except Exception as e:
        #     return JsonResponse({'message': f'Backend error: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid request method'}, status=405)




@csrf_exempt
def getAddedAreasList(request):
    user, error = validate_jwt_request(request)
    if error:
        return error

    areas = WagenArea.objects.filter(user=user).values('id', 'name')

    data = list(areas)
    
    return JsonResponse(data, safe=False)










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









@csrf_exempt
def getReport(request):
    if request.method == "POST":
        user, error = validate_jwt_request(request)
        if error:
            return error
    
        areaid = request.POST.get('areaid')
        start = request.POST.get('start')
        end = request.POST.get('end')
        precip = request.POST.get('precip')
        et = request.POST.get('et')
        wri_data = request.POST.get('wri_data')

        print('areaid',areaid)
        print('start',start)
        print('end',end)
        print('precip',precip)
        print('et',et)
        print('wri_data',wri_data)
        
        myarea = WagenArea.objects.get(id__exact=areaid)
        current_user = user.email
        tsk = wagen_report.delay(areaid, start, end, precip, et,wri_data, current_user)
        tskhist = TaskHistory(user=user, area=myarea, task=tsk.id)
        tskhist.save()
        #"job id {}".format(tsk.id)
        return JsonResponse({"result": "Generating Report", "task_id": 'tsk.id'}, status=200)
    else:
        return JsonResponse({"result": "Wrong request method"}, status=400)






@csrf_exempt
def deleteTaskHistory(request, idd):
    try:
        user, error = validate_jwt_request(request)
        if error:
            return error
        
        task = TaskHistory.objects.get(id=idd)
        task_id_str = str(task.task)


        task.delete()
        media_dir = os.path.join(settings.MEDIA_ROOT, task_id_str)
        if os.path.isdir(media_dir):
            shutil.rmtree(media_dir)

        return JsonResponse({"result": "Task id {} deleted".format(idd)},
                            status=200)
    except:
        return JsonResponse({"result": "Error deleting task id {}".format(idd)},
                            status=400)



