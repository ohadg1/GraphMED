from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect
from HomeScreen.models import Project
from django.template import loader


def loginPage(request):
    """
    Handle the HTTP request for homePage html page.
    :param request: HTTP request - should contains two parameters by POST method: `username` and 'pass'.
    :return homePage if the logging successed. Logging page otherwise, with an error message.

    """
    ctx = {}
    if request.user.is_authenticated:
        # Already logged in:
        return HttpResponseRedirect('homePage')
    if request.method == 'POST':
        if ('username' not in request.POST) or ('pass' not in request.POST):
            return HttpResponseNotFound("Wrong values")

        # User tried to log in
        username = request.POST.get('username')
        password = request.POST.get('pass')

        # Validate user certificates (check if the username and the password are okay)
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect('homePage')
        else:
            ctx['error'] = 'wrong username or password'

    # Render login page
    template = loader.get_template('HomeScreen/login.html')
    return HttpResponse(template.render(ctx, request))


def homePage(request):
    """
    Handle the HTTP request for homePage html page.
    :param request: HTTP request
    :return homepage page if the user is authenticated. logging page otherwise
    """
    if request.user.is_authenticated:
        # Already logged in:
        template = loader.get_template('HomeScreen/homepage.html')
        return HttpResponse(template.render({}, request))
    else:
        return HttpResponseRedirect('../')


def logoutUser(request):
    """
    Handle the logout request.
    """
    logout(request)
    return HttpResponseRedirect('../')  # Return to home page (Login Page)


def createProject(request):
    """
    Handle the request for the "createProject" HTML page.
    :param request: HTTP request
    """
    if request.user.is_authenticated:
        # Already logged in:
        template = loader.get_template('HomeScreen/createProject.html')
        return HttpResponse(template.render({}, request))
    else:
        # Return to the login screen
        return HttpResponseRedirect('../')


def openProject(request):
    """
    Handle the request for the "openProject" HTML page.
    Note - the user must be authenticated.
    :param request: HTTP request
    """

    if request.user.is_authenticated:
        # Already logged in:
        template = loader.get_template('HomeScreen/openProject.html')
        username = request.user.get_username()
        user_projects = Project.objects.filter(user=username)
        user_projects = user_projects.order_by('-last_modified')
        output = {'projects': user_projects}
        return HttpResponse(template.render(output, request))
    else:
        # Return to the login screen
        return HttpResponseRedirect('../')


def contactUs(request):
    """
    Request for contactUs page
    """

    if request.user.is_authenticated:
        # Already logged in:
        template = loader.get_template('HomeScreen/contactUs.html')
        return HttpResponse(template.render({}, request))
    else:
        # Return to the login screen
        return HttpResponseRedirect('../')


def aboutUs(request):
    """
    Request for aboutUs page
    """
    if request.user.is_authenticated:
        # Already logged in:
        template = loader.get_template('HomeScreen/aboutUs.html')
        return HttpResponse(template.render({}, request))
    else:
        # Return to the login screen
        return HttpResponseRedirect('../')
