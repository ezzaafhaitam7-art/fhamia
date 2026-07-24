from django.urls import path

from . import views

urlpatterns = [
    path("linux/run/", views.linux_run, name="linux-run"),
    path("sql/execute/", views.sql_execute, name="sql-execute"),
    path("sql/reset/", views.sql_reset, name="sql-reset"),
    path("reseaux/subnet/", views.subnet_calculate, name="subnet-calculate"),
]
