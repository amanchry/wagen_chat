from django.contrib import admin
from .models import WagenUser, WagenArea, TaskHistory, WagenProject
from django.db.models import OuterRef, Subquery
from django_celery_results.models import TaskResult
# Register your models here.



@admin.register(WagenUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email','is_active')
    search_fields = ('name', 'email')
    ordering = ('id',)




@admin.register(WagenProject)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_name','id', 'user', 'registration_time')
    search_fields = ('project_name', )
    list_filter = ('registration_time',)
    ordering = ('-registration_time',)

    fieldsets = (
        ('Project Details', {
            'fields': (
                'project_name',
                'user',
                'registration_time',
            )
        }),
    )




@admin.register(WagenArea)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
    


@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
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




