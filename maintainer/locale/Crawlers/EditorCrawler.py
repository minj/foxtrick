from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import EditorParser
import json
import getpass

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
		ht.open("/Community/Crew/default.aspx")
		ht.setFormValue("ctl00$ctl00$CPContent$CPMain$ucLeagues$ddlLeagues", -1)
		ht.setFormValue("ctl00$ctl00$CPContent$CPMain$ddlWorkerTypes", 48)
		editorParser = EditorParser.EditorParser()
		editorParser.feed(ht.body)
		return editorParser.get()
	else:
		print 'Login failed!'
		return []

def saveJson(list, filename):	
	file = open( outfile, "w")
	file.write('{\n')
	file.write('\t"type": "%s",\n' % "editor")
	file.write('\t"internal": "true",\n')
	file.write('\t"list": [\n')
	file.write('\t\t' + ',\n\t\t'.join(map(lambda a: '{ "id": %d, "name": "%s" }' % (a["id"], a["name"].encode('utf-8')), list)))
	file.write('\n\t]\n}')
	file.close()
	print filename, 'written'

def run(username, password):
	editors = getList(username, password);
	editors = sorted(editors, key=lambda x: x["name"])
	if len(editors):
		saveJson(editors, '/home/foxtrick/trunk/res/staff/editor.json')

if __name__ == "__main__":
	user = raw_input("Login:");
	pw = getpass.getpass("Password:");
	run(user, pw);
