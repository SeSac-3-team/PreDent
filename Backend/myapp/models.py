# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Patient(models.Model):
    patid = models.AutoField(primary_key=True)
    patname = models.CharField(max_length=10)
    patgend = models.CharField(max_length=1, blank=True, null=True)
    patpnum = models.CharField(max_length=15)
    patadrs = models.CharField(max_length=50, blank=True, null=True)
    patpurpose = models.CharField(max_length=50)
    agree = models.BooleanField()
    patbirth = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'patient'
