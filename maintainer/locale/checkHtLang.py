from xml.dom.minidom import parse
import localetools.xml.helpers

#dump_entries = Entries from crawled xml dump
#ht_entries = Entries from existing htlang.xml
#dump_key_Attrib = name of the "key" attribute in crawled xml dump
#ht_key_attrib = name of the same "key" attribute in htlang.xml
#ht name of the attribute to be compared 
def checkNodes(dump_entries, ht_entries, dump_key_attrib, ht_key_Attrib, compare_Attrib):
	left = len(dump_entries)
	for dump_node in dump_entries:
		dump_text = dump_node.getAttribute(compare_Attrib)
		dump_value = dump_node.getAttribute(dump_key_attrib)
		matched = 0
		for ht_node in ht_entries:
			ht_text = ht_node.getAttribute(compare_Attrib)
			ht_value = ht_node.getAttribute(ht_key_Attrib)
			if ht_text == dump_text and dump_value == ht_value:
				matched = 1
				left -= 1
			elif dump_value == ht_value or ht_text == dump_text:
				print "\t","Current:", ht_text.encode('utf-8'),"(",ht_value,")", " Should be: " + dump_text.encode('utf-8'), "(",dump_value,")"
		
		if not matched:
			print "\t","Replace existing entry by: ", dump_text.encode('utf-8'), "(" +dump_value.encode('utf-8')+ ")"
	
	print "\t",len(dump_entries) - left, "/", len(dump_entries), "correct"
	
def checkLevels(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_levelnode = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "levels")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_levelnode, "level")

	ht_levelnode = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "levels")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_levelnode, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries, "value", "value", "text")
	
def checkPositions(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_levelnode = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "positions")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_levelnode, "position")

	ht_levelnode = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "positions")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_levelnode, "position")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries, "type", "type", "value")
	
def checkAgreeability(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_agreeabilitynode = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "agreeability")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_agreeabilitynode, "level")

	ht_agreeabilitynode = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "agreeability")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_agreeabilitynode, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries, "value", "value", "text")
	
def checkHonesty(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "honesty")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "level")

	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "honesty")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries, "value", "value", "text")
	
def checkAggressiveness(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "aggressiveness")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "level")

	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "aggressiveness")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries, "value", "value", "text")
	
def checkSpecialties(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "specialties")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "specialty")

	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "specialties")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "specialty")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries, "type", "type", "value")
	
def checkRatingSubLevels(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_ratingSubLevels = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "ratingSubLevels")
	dump_sublevels = localetools.xml.helpers.findAllNodesRecursive(dump_ratingSubLevels, "sublevel")

	ht_ratingSubLevels = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "ratingSubLevels")
	ht_sublevels = localetools.xml.helpers.findAllNodesRecursive(ht_ratingSubLevels, "sublevel")
	
	if not len(ht_sublevels):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_sublevels, ht_sublevels, "value", "value", "text")
	
def checkTactics(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_tacticslist = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "tactics")
	dump_tactics = localetools.xml.helpers.findAllNodesRecursive(dump_tacticslist, "tactic")

	ht_tacticslist = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "tactics")
	ht_tactics = localetools.xml.helpers.findAllNodesRecursive(ht_tacticslist, "tactic")
	
	if not len(ht_tactics):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_tactics, ht_tactics, "type", "type", "value")
	

# def checkMainMenuLinks(lang, htlang, lookup):	

# 	links = ['MyHattrick','MyClub','World','Shop','Forum','Help']
# 	correct = 0
	
# 	for link in links:
# 		if checkMainMenuLink(lang, htlang, lookup, link):
# 			correct += 1
# 		else:
# 			print '\t', link.encode('utf-8'), 'incorrect'
			
# 	print '\t', correct ,'/',len(links),'correct'
	
def checkMainMenuLink(lang, htlang, lookup, text):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_link = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, text)

	ht_link = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, text)
	
	if ht_link.getAttribute("value") != dump_link.getAttribute("value").rstrip():
		print '\t', ht_link.getAttribute("value").encode('utf-8'), '!=', dump_link.getAttribute("value").encode('utf-8')
		return False
	else:
		return True
	
def checklanguage(lang, lookup):
	print "Checking", lang
	file = "./../../content/locale/" + lang + "/htlang.xml"
	try:
		htlang = parse(file)
	except:
		print "\t","error opening",file,"! Aborting!" 
		return;
		
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	if not dump_lang:
		print "No dump found for this language, recrawl or specify correct dump file"
		return;
		
	print "\t","checking Levels" 
	checkLevels(lang, htlang, lookup)
	print "\t","checking Agreeability" 
	checkAgreeability(lang, htlang, lookup)
	print "\t","checking Honesty" 
	checkHonesty(lang, htlang, lookup)
	print "\t","checking Aggressiveness" 
	checkAggressiveness(lang, htlang, lookup)
	# print "\t","checking Main Menu Links" 
	# checkMainMenuLinks(lang, htlang, lookup)
	print "\t","checking RatingSubLevels"
	checkRatingSubLevels(lang, htlang, lookup)
	print "\t","checking Specialties"
	checkSpecialties(lang, htlang, lookup)
	print "\t","checking Tactics"
	checkTactics(lang, htlang, lookup)
	print "\t","checking Positions"
	checkPositions(lang, htlang, lookup)
	
from Hattrick import Language

if __name__ == "__main__":
	import sys
	
	if len(sys.argv) != 2:
		print "Usage:", sys.argv[0], "<dump xml input file>"
	else:
		dump = parse(sys.argv[1])
		for key in Language.Codes:
			checklanguage(Language.Codes[key], dump)
