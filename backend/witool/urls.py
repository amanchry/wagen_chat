from django.urls import path
from witool import views

from django.contrib.auth import views as auth_views
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.shortcuts import redirect


urlpatterns = [


    path("", views.showHome, name='home'),

    path('login/', views.loginView, name='login'),
    # path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path('register/', views.UserRegisterView, name='register'),
    path('logout/', views.logoutView, name='logout'),
    path('send-otp/', views.send_email_otp, name='send-otp'),

    path("generate-report", views.generate_report),
    path("get-task-status/<str:task_id>/", views.get_task_status, name='get-task-status'),
    path("get-reports-list", views.get_reports_list),








   
]
