#!/usr/bin/env python
from __future__ import print_function
from Hattrick.CHPP import Client
from Hattrick.CHPP import Credentials
from Hattrick.CHPP import AccessToken
from Hattrick.Parsers import XMLParser
from Hattrick import Language

import xml.etree.ElementTree as ET
import codecs
import os

CONSUMER_KEY = Credentials.KEY
CONSUMER_SECRET = Credentials.SECRET

ACCESS_TOKEN_KEY = AccessToken.KEY
ACCESS_TOKEN_SECRET = AccessToken.SECRET

chpp = Client.ChppClient(CONSUMER_KEY, CONSUMER_SECRET)
chpp.setAccessToken((AccessToken.KEY, AccessToken.SECRET))
session = chpp.getSession()

def getTacticTypeById(id):
	tactics = [
		'normal',		#	0,
		'pressing',		#	1,
		'ca',			#	2,
		'aim',			#	3,
		'aow',			#	4,
		'',				#	5, (N/A)
		'',				#	6, (N/A)
		'creatively',	#	7,
		'longshots'		#	8
	];
	return tactics[int(id, 10)]

def getSpecialtyTypeById(id):
	specs = [
		'None',				# 0
		'Technical',		# 1
		'Quick',			# 2
		'Powerful',			# 3
		'Unpredictable',	# 4
		'Head',				# 5
		'Regainer'			# 6
	];
	return specs[int(id, 10)]

def getTrainingTypeById(id):
	training = [
		'Gen',		# 0
		'Sta',		# 1
		'SP',		# 2
		'Def',		# 3
		'Sco',		# 4
		'Cross',	# 5
		'Shoot',	# 6
		'Pass',		# 7
		'PM',		# 8
		'GK',		# 9
		'ThPass',	# 10
		'DefPos',	# 11
		'WingAtt',	# 12
		'Indiv',	# 13
	];
	return training[int(id, 10)]

def getLanguage(id):
	response = chpp.getFile('translations', params={'version':'1.1', 'languageId': id })
	xml = ET.fromstring(response.content)
	obj = {}
	XMLParser.xml_to_python(xml, obj)
	return obj

def parseLanguage(o, code):
	t = o['Texts']
	out = {}

	propMap = {
		'honesty': 'PlayerHonesty',
		'agreeability': 'PlayerAgreeability',
		'aggressiveness': 'PlayerAgressiveness',
		'confidence': 'Confidence',
		'sponsors': 'Sponsors',
		'confidence': 'Confidence',
		'fans': 'FanMood',
		'fans_match': 'FanMatchExpectations',
		'fans_season': 'FanSeasonExpectations',
		'attitude': 'TeamAttitude',
		'spirit': 'TeamSpirit',
	}

	for prop in propMap:
		out[prop] = []
		for i in range(len(t[propMap[prop]]['Level'])):
			item = {}
			item['text'] = t[propMap[prop]]['Level'][i]['textContent']
			item['value'] = t[propMap[prop]]['Level'][i]['Value']
			out[prop].append(item)

	out['tactics'] = []
	for i in range(len(t['TacticTypes']['Item'])):
		item = {}
		item['value'] = t['TacticTypes']['Item'][i]['textContent']
		item['type'] = getTacticTypeById(t['TacticTypes']['Item'][i]['Value'])
		out['tactics'].append(item)

	out['specialties'] = []
	for i in range(len(t['PlayerSpecialties']['Item'])):
		item = {}
		item['value'] = t['PlayerSpecialties']['Item'][i]['textContent']
		item['type'] = getSpecialtyTypeById(t['PlayerSpecialties']['Item'][i]['Value'])
		out['specialties'].append(item)

	out['training'] = []
	for i in range(len(t['TrainingTypes']['Item'])):
		item = {}
		item['value'] = t['TrainingTypes']['Item'][i]['textContent']
		item['type'] = getTrainingTypeById(t['TrainingTypes']['Item'][i]['Value'])
		out['training'].append(item)

	out['positions'] = []
	for i in range(len(t['MatchPositions']['Item'])):
		item = {}
		item['value'] = t['MatchPositions']['Item'][i]['textContent']
		item['type'] = t['MatchPositions']['Item'][i]['Type']
		out['positions'].append(item)

	out['sectors'] = []
	for i in range(len(t['RatingSectors']['Item'])):
		item = {}
		item['value'] = t['RatingSectors']['Item'][i]['textContent']
		item['type'] = t['RatingSectors']['Item'][i]['Type']
		out['sectors'].append(item)

	#yey inconsistencies!
	out['skills'] = []
	for i in range(len(t['SkillNames'])):
		item = {}
		item['value'] = t['SkillNames'][i]['textContent']
		item['type'] = t['SkillNames'][i]['Type']
		out['skills'].append(item)

	out['levels'] = []
	for i in range(len(t['SkillLevels'])):
		item = {}
		item['text'] = t['SkillLevels'][i]['textContent']
		item['value'] = t['SkillLevels'][i]['Value']
		out['levels'].append(item)

	out['ratingSubLevels'] = []
	for i in range(len(t['SkillSubLevels'])):
		item = {}
		item['text'] = t['SkillSubLevels'][i]['textContent']
		item['value'] = t['SkillSubLevels'][i]['Value'].replace(',', '.')
		out['ratingSubLevels'].append(item)

	out['leagueNames'] = {}
	for i in range(len(t['LeagueNames'])):
		lId = t['LeagueNames'][i]['LeagueId']
		item = {}
		item['local'] = t['LeagueNames'][i]['LanguageLeagueName']
		item['native'] = t['LeagueNames'][i]['LocalLeagueName']
		out['leagueNames'][lId] = item

	out['desc'] = o['Language']['textContent']
	out['name'] = code
	out['id'] = o['Language']['Id']

	return out

def run():
	scriptDir = os.path.dirname(os.path.abspath(__file__))
	for langId in Language.Codes:
		code = Language.Codes[langId]
		langObject = getLanguage(langId)
		result = parseLanguage(langObject['HattrickData'], code)
		output = XMLParser.python_to_json({'language': result})
		of = '%s/../../content/locale/%s/htlang.json' % (scriptDir, code)
		o = codecs.open(of, mode='w', encoding='utf-8')
		o.write(output)
		o.close()

if __name__ == '__main__':
	run();
