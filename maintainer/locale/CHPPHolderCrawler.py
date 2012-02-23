from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import CHPPHolderParser

def login(username, password):
	#use stage for now
	ht = HattrickWeb(username, password, stage=True)
	try:
		ht.login()
	except Exception as e:
		print e
		return False, None
	
	return True, ht;

if __name__ == "__main__":
	import os
	import sys
	
	user = raw_input("Login: ");
	pw = raw_input("Password: ");
	outfile = raw_input("Outfile (*.xml): ");
	
	success = False
	success, ht = login( user, pw )
	
	while not success:
		user = raw_input("Login:");
		pw = raw_input("Password:");
		success, ht = login( user, pw )	

	ht.open("/Community/CHPP/ChppPrograms.aspx")
	chppHolderParser = CHPPHolderParser.CHPPHolderParser()
	chppHolderParser.feed(ht.body)
	sorted_users = sorted(chppHolderParser.get(), key=lambda x: x["name"])
	
	print 'writing', outfile, '...'
	file = open( outfile, "w")
	file.write('{\n')
	file.write('\t"type": "%s",\n' % "chpp-holder")
	file.write('\t"list": [\n')
	file.write('\t\t' + ',\n\t\t'.join(map(lambda a: '{ "id": %d, "name": "%s" }' % (a["id"], a["name"]), sorted_users)))
	file.write('\n\t]\n}')
	file.close()
	print outfile, 'written'