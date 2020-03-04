from django.urls import path

from . import views

urlpatterns = [

    path('', views.createProject, name='user'),
    path('storeProject', views.storeNetwork, name='storeProject'),
    path('openProject', views.openProject, name='openProject'),
    path('createProject', views.createProject, name='createProject'),
    path('deleteProject', views.deleteProject, name='deleteProject'),
    path('newNetRequest', views.newNetRequest, name='netRequest'),
    path('getPaperDetails', views.getPaperDetails, name='getPaperDetails'),

]
