#!/usr/bin/env python
from __future__ import print_function
import sys, os
import json
import codecs

if sys.version > '3':
	import urllib.request as urllib
else:
	import urllib

from Hattrick.Parsers import XMLParser
from Hattrick.CHPP import Client
from Hattrick.CHPP import Credentials
from Hattrick.CHPP import AccessToken

import xml.etree.ElementTree as ET

if len(sys.argv) > 1:
	FT_JSON = sys.argv[1]
else:
	FT_JSON = os.path.expanduser('~/trunk/res/staff/foxtrick.json')

SUPPORTER_JSON = 'https://www.foxtrick.org/paypal/list.php'

CONSUMER_KEY = Credentials.KEY
CONSUMER_SECRET = Credentials.SECRET

ACCESS_TOKEN_KEY = AccessToken.KEY
ACCESS_TOKEN_SECRET = AccessToken.SECRET

chpp = Client.ChppClient(CONSUMER_KEY, CONSUMER_SECRET)
chpp.setAccessToken((AccessToken.KEY, AccessToken.SECRET))
session = chpp.getSession()

# get supporter list
sup_json = urllib.urlopen(SUPPORTER_JSON)

if sys.version > '3':
	sup_json_str = sup_json.readall()
	sup_json_str = sup_json_str.decode()
else:
	sup_json_str = ''.join(sup_json.readlines())

sup_json.close()

supporters = json.loads(sup_json_str)

# parse existing staff
ft_json = codecs.open(FT_JSON, mode='rb', encoding='utf-8')
ft = json.load(ft_json)
ft_json.close()

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
	new_person = { 'id': str(new_id), 'name': '', 'duty': 'supporter' }
	staff.append(new_person)

# update manager names from CHPP
for person in staff:
	ht_id = person['id']
	resp = chpp.getFile('search', params={ 'searchType': 2, 'searchID': ht_id })
	dom = ET.fromstring(resp.content)
	result = dict()
	XMLParser.xml_to_python(dom, result)
	container = result['HattrickData']['SearchResults']
	if 'Result' in container:
		person['name'] = container['Result']['ResultName']
	else:
		person['name'] = '----------'

# output updated staff file
staff.sort(key=lambda person: person['id'])
ft['list'] = staff
o = codecs.open(FT_JSON, mode='wb', encoding='utf-8')
o.write(XMLParser.python_to_json(ft))
o.close()
