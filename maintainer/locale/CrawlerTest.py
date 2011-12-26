from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import MenuParser
from Hattrick.Parsers import DenominationsParser
from Hattrick import Language

from xml.dom.minidom import Document
def createXml(result):
	doc = Document()

	languages = doc.createElement("languages")
	doc.appendChild(languages)
	for lang in sorted(result.iterkeys()):
		language = doc.createElement("language")
		language.setAttribute("name", lang)
		languages.appendChild(language)
		
		for category in sorted(result[lang].iterkeys()):
			cat = doc.createElement(category)
			language.appendChild(cat)
			index = len(result[lang][category]["names"])-1
			for entry in result[lang][category]["names"]:
				e = doc.createElement("entry")
				e.setAttribute("text", entry)
				e.setAttribute("index", str(index))
				cat.appendChild(e)
				index -= 1
			
	file = open("xml_out.xml", "w")
	file.write(doc.toprettyxml(indent="	", encoding="utf-8"))
	file.close()
	
def login(username, password):
	ht = HattrickWeb(username, password)
	ht.login()
	
	dict = {}
	
	for key in Language.Codes:
		print "Crawling ", Language.getLanguageById(key)
		ht.setLanguage( key )
		
		print "Main Menu"
		menuParser = MenuParser.MenuParser()
		menuParser.feed(ht.body)
		
		print "AppDenominations.aspx"
		ht.open("/Help/Rules/AppDenominations.aspx")
		denominationsParser = DenominationsParser.DenominationsParser()
		denominationsParser.feed(ht.body)
		
		lang = Language.getLanguageById(key)
		result = denominationsParser.get();
		
		dict[lang] = result
		
	print "writing *.xml"
	createXml(dict)
	
login('htusername','htpassword')	
