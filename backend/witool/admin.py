from django.contrib import admin
from .models import WIUser, WIArea, ReportHistory
from django.db.models import OuterRef, Subquery
from django_celery_results.models import TaskResult
# Register your models here.



admin.site.site_header = "WAGen Admin Panel"
admin.site.site_title = "WAGen Admin"
admin.site.index_title = "Welcome to the WAGen Admin Dashboard"


@admin.register(WIUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email','username','tool','is_active')
    search_fields = ('name', 'email','tool')
    ordering = ('id',)





@admin.register(WIArea)
class WIArea(admin.ModelAdmin):
    list_display = ('name', 'user')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
    


@admin.register(ReportHistory)
class ReportHistory(admin.ModelAdmin):
    list_display = ('task', 'user', 'area', 'task_status', 'date')
    ordering = ('-date',)  # Default ordering

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Annotate queryset with TaskResult status to allow sorting
        task_result_subquery = TaskResult.objects.filter(
            task_id=OuterRef('task')
        ).values('status')[:1]

        qs = qs.annotate(task_status_annotated=Subquery(task_result_subquery))
        return qs if request.user.is_superuser else qs.filter(user=request.user)

    def task_status(self, obj):
        return getattr(obj, 'task_status_annotated', 'PENDING')

    task_status.short_description = "Status"
    task_status.admin_order_field = 'task_status_annotated'  # Enables sorting




