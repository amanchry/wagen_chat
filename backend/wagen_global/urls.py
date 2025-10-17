"""
URL configuration for geochat project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import include
from django.contrib.auth.views import LogoutView
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def backend_status(request):
    return JsonResponse({
        "status": "✅ Backend is running",
        "apps": [
            {"name": "webapp", "url": "/djangoApi/wagen/"},
            {"name": "wittool", "url": "/djangoApi/witool/"}
        ],
        "admin": "/djangoApi/admin/"
    })


urlpatterns = [
    path("djangoApi/", backend_status, name="backend-status"),
    path("djangoApi/admin/", admin.site.urls, name='admin'),
    path('djangoApi/wagen/', include('webapp.urls')),
    path('djangoApi/witool/', include('witool.urls')),
    path('djangoApi/accounts/logout/', LogoutView.as_view(next_page='login'), name='logout'),


]


if settings.DEBUG:
    urlpatterns += static("/media/",
                          document_root=settings.MEDIA_ROOT)
    urlpatterns += static("/static/",
                          document_root=settings.STATIC_ROOT)
    