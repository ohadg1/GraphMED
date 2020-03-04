from django.urls import path

from . import views

urlpatterns = [
    path('', views.loginPage, name='user'),
    path('homePage', views.homePage, name='profile'),
    path('logout', views.logoutUser, name='logout'),
    path('createProject', views.createProject, name='createProject'),
    path('contactUs', views.contactUs, name='contactUs'),
    path('aboutUs', views.aboutUs, name='aboutUs'),
    path('openProject', views.openProject, name='openProject'),
]