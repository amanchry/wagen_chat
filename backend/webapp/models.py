import os
import shutil
from django.contrib.gis.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.dispatch.dispatcher import receiver
from django.core.exceptions import ValidationError
from django.utils.encoding import smart_str


# Create your models here.



def _delete(path):
    try:
        shutil.rmtree(path)
    except:
        print("Problem removing output task results directory,\n{pa}".format(pa=path))


class WagenUser(models.Model):  # ✅ renamed
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class WagenProject(models.Model):

    user = models.ForeignKey(WagenUser, on_delete=models.CASCADE)
    project_name = models.CharField(max_length=255)
    registration_time = models.DateTimeField(default=timezone.now)


    class Meta:
        unique_together = ('user', 'project_name')


    def clean(self):
        if WagenProject.objects.filter(
            project_name__iexact=self.project_name.strip(),
            user=self.user
        ).exclude(pk=self.pk).exists():
            raise ValidationError("A project with this name already exists for this user.")
            
   

    def __str__(self):
        return self.project_name
    

class WagenArea(models.Model):
    """Class for country object, data are imported automatically with
       general.mapping
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, verbose_name=_("Area name"))
    user = models.ForeignKey(WagenUser, verbose_name=("User uploaded the area"),
                             on_delete=models.CASCADE)
    project = models.ForeignKey(WagenProject, on_delete=models.CASCADE, related_name='wagen_area', null=True, blank=True)
    geom = models.MultiPolygonField(srid=4326)

    class Meta:
        db_table = u"wagen_area"
        ordering = ["name"]
        verbose_name = _("wagen_area")
        verbose_name_plural = _("wagen_areas")
        unique_together = ['name', 'user']

    def __unicode__(self):
        return smart_str(self.name)

    def __str__(self):
        return self.__unicode__()

    def natural_key(self):
        return self.__unicode__()

    def clean(self):
        data = WagenArea.objects.filter(user__exact=self.user).filter(name__iexact=self.name)
        if len(data) > 0:
            from django.core.exceptions import ValidationError
            raise ValidationError("The name is already existing")

    def save(self, *args, **kwargs):
        self.full_clean()
        super(WagenArea, self).save(*args, **kwargs)


class Reports(models.Model):

    user = models.ForeignKey(WagenUser, on_delete=models.CASCADE)
    project_name = models.CharField(max_length=255)
    project_thumbnail = models.JSONField(default=list)
    registration_time = models.DateTimeField(default=timezone.now)


    class Meta:
        unique_together = ('user', 'project_name')


    def clean(self):
        if Reports.objects.filter(
            project_name__iexact=self.project_name.strip(),
            user=self.user
        ).exclude(pk=self.pk).exists():
            raise ValidationError("A project with this name already exists for this user.")
            
   

    def __str__(self):
        return self.project_name


class TaskHistory(models.Model):
    """Class to maintain an history of the tasks"""
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(WagenUser, verbose_name=("User running the task"),
                             on_delete=models.CASCADE)
    area = models.ForeignKey(WagenArea, verbose_name=("Area where task run"),
                             on_delete=models.CASCADE)
    task = models.CharField(max_length=150, verbose_name=_("Task id"))
    date = models.DateTimeField(auto_now_add=True, verbose_name=_("Date"))

    class Meta:
        db_table = u"taskhistory"
        ordering = ["-date"]
        verbose_name = _("Task history")
        verbose_name_plural = _("Tasks history")

    def __unicode__(self):
        return smart_str("{us} - {ar}, {da}".format(us=self.user,
                                                     ar=self.area,
                                                     da=self.date))

    def __str__(self):
        return self.__unicode__()

    def natural_key(self):
        return self.__unicode__()

@receiver(models.signals.post_delete, sender=TaskHistory)
def delete_file(sender, instance, *args, **kwargs):
    """ Deletes image files on `post_delete` """
    task_outdir = os.path.join(settings.MEDIA_ROOT, instance.task)
    if os.path.exists(task_outdir):
        _delete(task_outdir)
