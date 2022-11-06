from django.urls import path, include
from game.views.settings import getinfo

urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo")
]
