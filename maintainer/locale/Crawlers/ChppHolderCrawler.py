from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import CHPPHolderParser
import getpass
import json

def login(username, password):
	#use stage for now
	ht = HattrickWeb(username, password, stage=True)
	try:
		ht.login()
	except Exception as e:
		return False, None
	
	return True, ht;

def getList(username, password):
	success, ht = login(username, password)
	if success:
		ht.open("/Community/CHPP/ChppPrograms.aspx")
		chppHolderParser = CHPPHolderParser.CHPPHolderParser()
		chppHolderParser.feed(ht.body)
		return chppHolderParser.get() 
	else:
		print('Login failed!')
		return []

def saveJson(list, filename):	
	file = open( filename, "w")
	file.write('{\n')
	file.write('\t"type": "%s",\n' % "chpp-holder")
	file.write('\t"internal": "true",\n')
	file.write('\t"list": [\n')
	file.write('\t\t' + ',\n\t\t'.join([('{ "id": %d, "name": "%s", "appNames": [ ' + ', '.join(['"%s"' % app.encode('utf-8') for app in a["appNames"]]) + ' ] }') % (a["id"], a["name"].encode('utf-8')) for a in list]))
	file.write('\n\t]\n}')
	file.close()
	print(filename, 'written')

def run(username, password):
	editors = getList(username, password);
	editors = sorted(editors, key=lambda x: x["name"])
	if len(editors):
		saveJson(editors, '/home/foxtrick/trunk/res/staff/chpp-holder.json')

if __name__ == "__main__":
	user = input("Login:");
	pw = getpass.getpass("Password:");
	run(user, pw);
