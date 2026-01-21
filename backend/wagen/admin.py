from django.contrib import admin
from .models import WagenUser, WagenArea, TaskHistory, WagenProject
from django.db.models import OuterRef, Subquery
from django_celery_results.models import TaskResult
# Register your models here.



admin.site.site_header = "WAGen Admin Panel"
admin.site.site_title = "WAGen Admin"
admin.site.index_title = "Welcome to the WAGen Admin Dashboard"


@admin.register(WagenUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email','tool','username','is_active')
    search_fields = ('name', 'tool','email')
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
    list_display = (
        'name',
        'user_name',
        'user_tool',
        'project',

        'user_email',
    )

    search_fields = ('user__name', 'user__email', 'user__tool')
    list_filter = ('user__tool',  'project')

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('user', 'project')
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)

    # --- user columns ---
    def user_name(self, obj):
        return obj.user.name


    def user_email(self, obj):
        return obj.user.email

    def user_tool(self, obj):
        return obj.user.tool


    user_email.short_description = "Email"
    user_tool.short_description = "Tool"


    


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




