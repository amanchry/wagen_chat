import os
import shutil
from django.contrib.gis.db import models
# Create your models here.
from django.utils.encoding import smart_str
from django.utils.translation import gettext_lazy as _


class WIUser(models.Model):  # ✅ renamed
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255,unique=True)
    name = models.CharField(max_length=255)
    tool = models.CharField(max_length=255)
    email = models.EmailField()
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("WI Tools User")
        verbose_name_plural = _("WI Tools Users")

    def __str__(self):
        return self.name


class WIArea(models.Model):
    """Class for country object, data are imported automatically with
       general.mapping
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, verbose_name=_("Area name"))
    user = models.ForeignKey(WIUser, verbose_name=("User uploaded the area"),
                             on_delete=models.CASCADE)
   
    geom = models.MultiPolygonField(srid=4326)

    class Meta:
        db_table = u"witool_area"
        ordering = ["name"]
        verbose_name = _("WI Tools Area")
        verbose_name_plural = _("WI Tools Areas")
        unique_together = ['name', 'user']

    def __unicode__(self):
        return smart_str(self.name)

    def __str__(self):
        return self.__unicode__()

    def natural_key(self):
        return self.__unicode__()

    def clean(self):
        data = WIArea.objects.filter(user__exact=self.user).filter(name__iexact=self.name)
        if len(data) > 0:
            from django.core.exceptions import ValidationError
            raise ValidationError("The name is already existing")

    def save(self, *args, **kwargs):
        self.full_clean()
        super(WIArea, self).save(*args, **kwargs)


class ReportHistory(models.Model):
    """Class to maintain an history of the tasks"""
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(WIUser, verbose_name=("User running the task"),
                             on_delete=models.CASCADE)
    area = models.ForeignKey(WIArea, verbose_name=("Area where task run"),
                             on_delete=models.CASCADE)
    task = models.CharField(max_length=150, verbose_name=_("Task id"))
    date = models.DateTimeField(auto_now_add=True, verbose_name=_("Date"))

    class Meta:
        db_table = u"reportsHistory"
        ordering = ["-date"]
        verbose_name = _("Report History")
        verbose_name_plural = _("Reports History")

    def __unicode__(self):
        return smart_str("{us} - {ar}, {da}".format(us=self.user,
                                                     ar=self.area,
                                                     da=self.date))

    def __str__(self):
        return self.__unicode__()

    def natural_key(self):
        return self.__unicode__()
    