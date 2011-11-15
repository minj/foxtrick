from xml.dom.minidom import Document

def createXmlFile(filename, result):
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
				
	print "Writing", sys.argv[1]			
	file = open(filename, "w")
	file.write(doc.toprettyxml(indent="	", encoding="utf-8"))
	file.close()
	
if __name__ == "__main__":
	from localetools import AppDenominationsCrawler
	import sys
	if len(sys.argv) != 2:
		print "Usage:", sys.argv[0], "outfile"
	else:
		#el = greek?
		sites = ("ar", "be", "bg", "bs", "ca", "cs", "da", "de", "el","en", "es", "eu", "fa", "fi","fr","fy","gl","he","hr","hu","it","ja","ka","ko","lb","lt","lv","mk","mt","nl","nn","pl","pt","ro","ru","sk","sl","sq","sr","sv","tr","uk","vi","zh")
		result, errors = AppDenominationsCrawler.parsePages(sites)
		
		createXmlFile(sys.argv[1],result)