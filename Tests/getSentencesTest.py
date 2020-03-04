import pandas as pd


def _getSentencesFromDB(sentence_ids):
    df = pd.read_csv("../ResearchProject/InternalDataSets/sentenceExample.csv",
                     names=['SENTENCE_ID', 'PMID', 'TYPE', 'NUMBER', 'SENTENCE'],
                     skiprows=1)
    results = list()
    for s_id in sentence_ids:
        matches = list(df.loc[df['SENTENCE_ID'] == s_id].SENTENCE)
        if len(matches) > 0:
            sentence = matches[0]
            tuple_to_add = (s_id, sentence)
            results.append(tuple_to_add)

    return results


print(_getSentencesFromDB([248180, 12313, 248181]))
