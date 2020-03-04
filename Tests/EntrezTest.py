from Bio import Entrez

Entrez.api_key = 'c3a77c497fa1e537a908b860c3c10f3cb708'
Entrez.email = 'michael290398@gmail.com'

handle = Entrez.esummary(db="pubmed", id="11110509")
record = Entrez.read(handle)
print(record)

for i, item in enumerate(record):
    print(item['Title'])
    print(item['Volume'])
    print(item['PubDate'])
    print((item['DOI']))
    print("https://doi.org/" + str(item['DOI']))

    print()
