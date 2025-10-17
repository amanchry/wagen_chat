from django.urls import path
from webapp import views

from django.contrib.auth import views as auth_views
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.shortcuts import redirect


urlpatterns = [

    
    # path("", views.showHome, name='home'),
    # path("", lambda request: redirect("/api/")),
    path("", views.showHome, name='home'),
    path('login/', views.loginView, name='login'),
    # path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path('register/', views.UserRegisterView, name='register'),
    path('logout/', views.logoutView, name='logout'),
    path('send-otp/', views.send_email_otp, name='send-otp'),


    path("add-project/", views.RegisterProject, name='add-project'),
    path("get-projects/", views.get_projects, name='get-projects'),
    path('project-details/<int:id>/', views.project_details, name='project-details'),
    path('delete-project/<int:project_id>/', views.delete_project, name='delete-project'),
    
    path('save-draw-polygon/', views.saveDrawGeojson, name='save-draw-polygon'),
    path('get-added-area-list/', views.getAddedAreasList, name='save-draw-polygon'),
    # path('api/get-area-geom/', views.get_area_geometry, name='get-area-geom'),
    path('get-area-geom/<int:areaId>', views.get_area_geometry, name='get-area-geom'),


    path('delete-area-geom/<int:id>', views.deleteAreaGeom, name='delete-area-geom'),

    path("getreport", views.getReport),
    # path("gettasks", views.getTasks),
    path("get-task-status/<str:task_id>/", views.get_task_status, name='get-task-status'),



    # path('chats/<int:project_id>/', views.get_project_chats, name='get_project_chats'),



   
]
