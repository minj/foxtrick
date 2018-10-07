#!/usr/bin/env python
from __future__ import print_function

from Hattrick.Parsers import XMLParser
from Hattrick.CHPP import Client
from Hattrick.CHPP import Credentials
from Hattrick.CHPP import AccessToken

import sys
import os
import json
import codecs

import xml.etree.ElementTree as ET
if sys.version > '3':
    import urllib.request as urllib
else:
    import urllib2 as urllib


if len(sys.argv) > 1:
    FT_JSON = sys.argv[1]
else:
    FT_JSON = os.path.expanduser('~/repos/master/res/staff/foxtrick.json')

CONSUMER_KEY = Credentials.KEY
CONSUMER_SECRET = Credentials.SECRET
ACCESS_TOKEN_KEY = AccessToken.KEY
ACCESS_TOKEN_SECRET = AccessToken.SECRET
chpp = Client.ChppClient(CONSUMER_KEY, CONSUMER_SECRET)
chpp.setAccessToken((AccessToken.KEY, AccessToken.SECRET))
session = chpp.getSession()

# get supporter list
SUPPORTER_JSON = 'https://www.foxtrick.org/paypal/list.php'
with urllib.urlopen(SUPPORTER_JSON) as sup_json:
    if sys.version > '3':
        sup_json_str = sup_json.read().decode()
    else:
        sup_json_str = sup_json.read()

supporters = json.loads(sup_json_str)

# parse existing staff
with codecs.open(FT_JSON, mode='rb', encoding='utf-8') as ft_json:
    ft = json.load(ft_json)

# create new staff list
old_staff = ft['list']
staff = list()

for person in old_staff:
    ht_id = int(person['id'])
    if ht_id in supporters:
        # remove already existing ID
        supporters.remove(ht_id)
    elif person['duty'] == 'supporter':
        # skip no longer valid supporters
        continue

    # add valid staff
    staff.append(person)

# add new supporters
for new_id in supporters:
    new_person = {'id': str(new_id), 'name': '', 'duty': 'supporter'}
    staff.append(new_person)

# update manager names from CHPP
for person in staff:
    ht_id = person['id']
    resp = chpp.getFile('search', params={'searchType': 2, 'searchID': ht_id})
    dom = ET.fromstring(resp.content)
    result = dict()
    XMLParser.xml_to_python(dom, result)

    container = result['HattrickData']['SearchResults']
    new_name = container['Result']['ResultName'] if 'Result' in container else ''
    if not new_name or new_name.startswith('DEL_'):
        if not person['name']:
            person['name'] = '<>'
        elif not person['name'].startswith('<'):
            person['name'] = f"<{person['name']}>"
        else:
            # already replaced
            pass
    else:
        person['name'] = new_name

# output updated staff file
staff.sort(key=lambda person: person['id'])
ft['list'] = staff

with codecs.open(FT_JSON, mode='wb', encoding='utf-8') as out:
    out.write(XMLParser.python_to_json(ft))
