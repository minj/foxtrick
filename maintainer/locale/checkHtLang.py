from xml.dom.minidom import parse
import localetools.xml.helpers

def checkNodes(dump_entries, ht_entries):
	left = len(dump_entries)
	for dump_node in dump_entries:
		dump_text = dump_node.getAttribute("text")
		dump_value = dump_node.getAttribute("index")
		matched = 0
		for ht_node in ht_entries:
			ht_text = ht_node.getAttribute("text")
			ht_value = ht_node.getAttribute("value")
			if ht_text == dump_text and dump_value == ht_value:
				matched = 1
				left -= 1
			elif dump_value == ht_value or ht_text == dump_text:
				print "\t","Possible error:", ht_text.encode('utf-8'),"(",ht_value,")", " <> " +dump_text.encode('utf-8'), "(",dump_value,")"
		
		if not matched:
			print "\t","missing/missmatching", dump_text.encode('utf-8'), "(" +dump_value.encode('utf-8')+ ")"
	
	print "\t",len(dump_entries) - left, "/", len(dump_entries), "correct"
	
def checkLevels(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "skill")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "entry")

	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "levels")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries)
	
def checkAgreeability(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "gentleness")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "entry")
			
	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "agreeability")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries)
	
def checkHonesty(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "honesty")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "entry")

	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "honesty")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries)
	
def checkAggressiveness(lang, htlang, lookup):
	dump_lang = localetools.xml.helpers.findFirstNodeRecursive(lookup.documentElement, "language", {"name": lang})
	dump_skills = localetools.xml.helpers.findFirstNodeRecursive(dump_lang, "aggressiveness")
	dump_entries = localetools.xml.helpers.findAllNodesRecursive(dump_skills, "entry")

	ht_skills = localetools.xml.helpers.findFirstNodeRecursive(htlang.documentElement, "aggressiveness")
	ht_entries = localetools.xml.helpers.findAllNodesRecursive(ht_skills, "level")
	
	if not len(ht_entries):
		print "\t", "missing completly"
		return
	
	checkNodes(dump_entries, ht_entries)
	
def checklanguage(lang, lookup):
	print "Checking", lang
	file = "./../../content/locale/" + lang + "/htlang.xml"
	try:
		htlang = parse(file)
	except:
		print "\t","error opening",file,"! Aborting!" 
		return;
	
	print "\t","checking Levels" 
	checkLevels(lang, htlang, lookup)
	print "\t","checking Agreeability" 
	checkAgreeability(lang, htlang, lookup)
	print "\t","checking Honesty" 
	checkHonesty(lang, htlang, lookup)
	print "\t","checking Aggressiveness" 
	checkAggressiveness(lang, htlang, lookup)
	
from Hattrick import Language

if __name__ == "__main__":
	import sys
	
	if len(sys.argv) != 2:
		print "Usage:", sys.argv[0], "<dump xml input file>"
	else:
		dump = parse(sys.argv[1])
		for key in Language.Codes:
			checklanguage(Language.Codes[key], dump)