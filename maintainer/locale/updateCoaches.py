#!/usr/bin/env python
from __future__ import print_function
from Hattrick.CHPP import Client
from Hattrick.CHPP import Credentials
from Hattrick.CHPP import AccessToken

import xml.etree.ElementTree as ET

CONSUMER_KEY = Credentials.KEY
CONSUMER_SECRET = Credentials.SECRET

ACCESS_TOKEN_KEY = AccessToken.KEY
ACCESS_TOKEN_SECRET = AccessToken.SECRET

chpp = Client.ChppClient(CONSUMER_KEY, CONSUMER_SECRET)
chpp.setAccessToken((AccessToken.KEY, AccessToken.SECRET))
session = chpp.getSession()

def getCoaches(id):
	#no get started
	response = chpp.getFile('nationalteams', params={'version':'1.5', 'LeagueOfficeTypeID': id })
	dom = ET.fromstring(response.content)

	teams = []
	iTeams =  dom.iter("NationalTeam")
	for iTeam in iTeams:
		team = {}
		team['TeamId'] = int(iTeam.find('NationalTeamID').text)
		team['LeagueId'] = int(iTeam.find('LeagueId').text)
		team['TeamName'] = iTeam.find('NationalTeamName').text
		teams.append(team)

	teams_with_coaches = []

	for t in teams:
		response = chpp.getFile('nationalteamdetails', params={'version':'1.8', 'teamID':t['TeamId']})
		dom = ET.fromstring(response.content)
		iCoaches =  dom.iter("NationalCoach")
		for iCoach in iCoaches:
			t['CoachId'] = int(iCoach.find('NationalCoachUserID').text)
			t['CoachName'] = iCoach.find('NationalCoachLoginname').text
			if t['CoachId']:
				teams_with_coaches.append(t)	

	return teams_with_coaches

def saveCoaches(coaches, filename):
	file = open( filename, "w")
	file.write('{\n')
	file.write('\t"type": "%s",\n' % "coach")
	file.write('\t"list": [\n')
	file.write('\t\t' + ',\n\t\t'.join(['{ "LeagueId": %d, "TeamId": %d, "TeamName": "%s", "id": %d, "name": "%s" }' % (a["LeagueId"], a["TeamId"], a["TeamName"].encode('utf-8'), a["CoachId"], a["CoachName"].encode('utf-8')) for a in coaches]))
	file.write('\n\t]\n}')
	file.close()
	print(filename, 'written')

def run():
	u20 = getCoaches(4);
	nt = getCoaches(2);

	u20 = sorted(u20, key=lambda x: x["LeagueId"])
	nt = sorted(nt, key=lambda x: x["LeagueId"])

	saveCoaches(u20, '/home/foxtrick/trunk/res/staff/u20.json')
	saveCoaches(nt, '/home/foxtrick/trunk/res/staff/nt.json')

if __name__ == '__main__':
	run();
