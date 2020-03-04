"""This file contains all the models we uses in out project. Each model represent SQL line """
from django.db import models
from django_mysql.models import JSONField, Model


class Project(models.Model):
    """
    Project model - contains metadata about a project.
    @entry name: project name.
    @entry user: the owner of the project.
    @entry description: A brief descriptor about the project.
    @entry last modified: time stamp of the last time the project has updated.
    """
    name = models.CharField(max_length=30)  # name
    user = models.CharField(max_length=30)  # user
    description = models.CharField(max_length=280)  # description
    last_modified = models.DateField(auto_now=True)  # date


class Nets(Model):
    """
    Project model - contains metadata a single network.
    @entry prog_name: project name.
    @entry user: the owner of the project.
    @entry net_name: network name.
    @entry nodes: The network's nodes
    @entry edges: The network's edges.
    """

    prog_name = models.CharField(max_length=30)  # name
    user = models.CharField(max_length=30)  # user
    net_name = models.CharField(max_length=30)  # net name
    nodes = JSONField()
    edges = JSONField()
