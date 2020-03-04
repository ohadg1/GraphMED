""" This scripts handler the net construction. The construction is done by an interaction with Galia’s algorithm"""

import os
import pandas as pd
from io import StringIO
import os
import ast


def deleteDuplicates(list):
    """
    remove duplicates in a given list.
    Naive algorithm - O(n^2)
    """
    new_list = []
    for element in list:
        if element not in new_list:
            new_list.append(element)
    return new_list


def get_net_from_CSV(source, target):
    """
    Return the net associated with the given source and target, using Galia's algorithm.
    :Warrning: Galia's server is currently down, so meanwhile we are using some internal csv, just for testing
    :param source:
    :param target:
    :return:
    """
    # TODO: restore these commands in the moment Galia's server is on.
    # FIXME: Before release to production, note that os.opopen is exposed to some RPC injection attack.
    # data_str = os.popen('sudo curl -d "target={}&source={}" http://localhost:80'.format(target, source)).read()
    # if data_str == "":
    #     return [], []
    # elif data_str == "Source or target unknown":
    #     return [], []

    # df = pd.read_csv(StringIO(data_str), names=['name', 'source', 'destination', 'pmids', 'sentence_ids'])

    # TODO: Remove these commands in the moment Galia's server is on.
    df = pd.read_csv("./ResearchProject/InternalDataSets/test.csv",
                     names=['name', 'source', 'destination', 'pmids', 'sentence_ids'], skiprows=1)

    # Extract data from the csv file
    nodes = df.iloc[:, 1].unique().tolist() + df.iloc[:, 2].unique().tolist()
    nodes = list(set(nodes))
    net_edges = []

    for index, row in df.iterrows():
        pmids = deleteDuplicates(ast.literal_eval(row['pmids']))
        sentence_ids = [deleteDuplicates(l) for l in ast.literal_eval(row['sentence_ids'])]

        net_edges += [
            {"id": index, "from": nodes.index(row['source']), "to": nodes.index(row['destination']),
             "arrows": 'to', "info": [*zip(pmids, sentence_ids)]}]

    net_nodes = []
    for i, n in enumerate(nodes):
        net_nodes += [{"id": i, "label": n}]
    return net_nodes, net_edges
