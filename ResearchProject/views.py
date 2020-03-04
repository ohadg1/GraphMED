import pandas as pd
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from HomeScreen.models import Project, Nets
from django.utils import timezone
from django.template import loader
from ResearchProject.grapher import get_net_from_CSV
from Bio import Entrez


def loadProject(request):
    """
    Handle the load project request.
    Load a project associated with the user and the given project name.
    :param request: HTTP request.
    :return: return all the matched networks.
    """
    username = request.user.get_username()

    # access to the DB
    nets = Nets.objects.filter(prog_name=request.POST.get('project_name'), user=username)
    ret = []

    for net in list(nets):
        ret.append((net.net_name, net.nodes, net.edges))

    return ret


def storeNetwork(request):
    """
    Handle the HTTP request for saving a network.
    network details is given by the request, and stored in the DB.
    """
    dict_data = json.loads(request.body)
    username = request.user.get_username()
    project_name = dict_data['project_name']

    # Delete old nets:
    Nets.objects.filter(prog_name=project_name, user=username).delete()

    # Save new nets
    for (net_name, nodes, edges) in dict_data['networks']:
        net = Nets(prog_name=project_name, user=username, net_name=net_name, nodes=nodes, edges=edges)
        net.save()

    return HttpResponse('')


def createProject(request):
    """
    Handle the a HTTP request for creating new project.
    Project name is passed by POST method.
    """
    if not request.user.is_authenticated:
        return HttpResponseRedirect('../')

    if 'project_name' not in request.POST:
        return HttpResponseNotFound("WRONG VARS create")

    ctx = dict()
    username = request.user.get_username()
    project_name = request.POST.get('project_name')
    user_projects = Project.objects.filter(user=username, name=project_name)
    if user_projects.exists():
        ctx['error'] = 'name already taken'

        # Render create page
        template = loader.get_template('HomeScreen/createProject.html')
        return HttpResponse(template.render(ctx, request))

    ctx['project_name'] = project_name

    ctx['networks'] = []

    ctx['project_description'] = request.POST.get('project_description')
    project = Project(name=ctx['project_name'], user=username, description=ctx['project_description'],
                      last_modified=timezone.now())
    project.save()

    return openProject(request)


@ensure_csrf_cookie
def openProject(request):
    """
    Handle the HTTP request for opening saved project.
    project details is given by the request, and stored in the DB.
    """
    if not request.user.is_authenticated:
        return HttpResponseRedirect('../')

    if 'project_name' not in request.POST:
        return HttpResponseNotFound("No name was given (in open)")

    ctx = dict()
    ctx['project_name'] = request.POST.get('project_name')

    nets = loadProject(request)
    ctx['networks'] = nets

    template = loader.get_template('ResearchProject/projectWorkbench.html')
    return HttpResponse(template.render(ctx, request))


def deleteProject(request):
    """
    Handle the HTTP request for deleting a project.
    The project is assiciated with the given project name (by post method), and by the user that owned the project.
    """

    if not request.user.is_authenticated:
        return HttpResponseRedirect('../')

    if 'project_name' not in request.POST:
        return HttpResponseNotFound("No name was given (in delete)")

    project_name = request.POST.get('project_name')
    username = request.user.get_username()
    Nets.objects.filter(prog_name=project_name, user=username).delete()
    Project.objects.filter(name=project_name, user=username).delete()

    return HttpResponseRedirect('../openProject', request)


def newNetRequest(request):
    data = json.loads(request.body)
    # Check data!
    src = data[0]
    dst = data[1]

    nodes, edges = get_net_from_CSV(src, dst)
    responseData = {'nodes': nodes, 'edges': edges}

    return HttpResponse(json.dumps(responseData), content_type="application/json")


def getPaperDetails(request):
    """
    Get all the details about the given papers.
    :param request: The http request. shoud contains the pmids of the requested papers.
    """
    dict_data = json.loads(request.body)
    Entrez.api_key = 'c3a77c497fa1e537a908b860c3c10f3cb708'
    Entrez.email = 'michael290398@gmail.com'

    if 'pmids' not in dict_data or 'sentencesIDs' not in dict_data:  # Error checking
        return HttpResponseNotFound()

    PMIDs = dict_data['pmids']
    sentencesIDs = dict_data['sentencesIDs']

    if len(PMIDs) != len(sentencesIDs) or len(PMIDs) == 0:  # Error checking
        return HttpResponseNotFound()

    pmids_as_string = PMIDs[0] + ''.join("," + str(e) for e in PMIDs[1:])
    handle = Entrez.esummary(db="pubmed", id=pmids_as_string)
    entrezResponseData = Entrez.read(handle)

    # Add the sentences:
    res_sentences = []
    for sent_ids in sentencesIDs:
        res_sentences.append(_getSentencesFromDB(sent_ids))

    # Entrez response (list of kind of dictionaries, one for each paper)
    # list (for each paper, consistent with entrezResponseData order ), of lists of tuples (for each sentence).
    responseData = {'DETAILS': entrezResponseData, 'SENTENCES': res_sentences}

    return HttpResponse(json.dumps(responseData), content_type="application/json")


def _getSentencesFromDB(sentence_ids):
    """
    Gets the sentence associated with any given sentence id, from out csv.
    Wrong sentences ids (ids that were not found) are ignored.
    :param sentence_ids: A list of sentences ids.
    :return: List of tuple of (<sentence_id>, <sentence>). sentence of each sentence_id.
    """
    df = pd.read_csv("./ResearchProject/InternalDataSets/sentenceExample.csv",
                     names=['SENTENCE_ID', 'PMID', 'TYPE', 'NUMBER', 'SENTENCE'], skiprows=1)
    results = list()
    for s_id in sentence_ids:
        matches = list(df.loc[df['SENTENCE_ID'] == s_id].SENTENCE)
        if len(matches) > 0:
            sentence = matches[0]
            tuple_to_add = (s_id, sentence)
            results.append(tuple_to_add)

    return results
