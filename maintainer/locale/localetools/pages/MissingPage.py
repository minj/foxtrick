import localetools.l10n
import localetools.utils.markup
import localetools.utils.ensuredirectory


def getPageString(locale, master, revision):
	if not locale or not master:
		return

	columns = ["locale","entry","masterline","edit"]
	text = {"locale":"Locale", "entry":"Entry", "edit":"Edit locale", "masterline":"Line in master"}

	table = localetools.utils.markup.page( )
	table.init( title="FoxTrick r"+ str(revision) + " Localization Statistics",
			   css=('./../style.css'), 
			   script=([['./../jquery-latest.js','javascript'],[ './../jquery.tablesorter.js','javascript']]))
				   

	table.table.open(id="mytable", _class="tablesorter")
	table.thead.open()
	for c in columns:
		table.th(text[c])
	table.thead.close()
	table.tbody.open()
	
	
	missing = locale.getMissing()
	for m in missing:
		table.tr.open()
		#loc
		table.td(locale.getShortName())
		#key
		table.td(m.getKey())
		#master line, link to line in master
		table.td.open()
		table.a(m.getLine(), href="http://code.google.com/p/foxtrick/source/browse/trunk/content/foxtrick.properties#" + str(m.getLine()), title="View this line on Google Code")
		table.td.close()
		#edit
		if locale.isFilePresent():
			table.td.open()
			table.a("Edit", href="http://code.google.com/p/foxtrick/source/browse/trunk/content/locale/"+locale.getShortName()+"/foxtrick.properties?edit=1", title="Edit locale on Google Code")
			table.td.close()
		else:
			table.td("File not present")
		table.tr.close()
		
	table.tbody.close()
	table.table.close()
	table.script("$(document).ready(function(){$(\"#mytable\").tablesorter();});", type="text/javascript")
	table.script.close()
	return str(table)
	
	
#this also reads all locales, but wont analize anything
#locales are beeing analyzed when the info about missing/abandoned etc. is requested for the first time

def create(locales, revision, outdir):
	print "Generating missing-pages for r" + str(revision)
	if isinstance(locales, localetools.l10n.foxtrickLocalization):
		for loc in locales.getAll():
			if not loc.getMissingCount():
				continue
				
			localetools.utils.ensuredirectory.ensure(outdir +"/"+ str(revision))
			page = getPageString(loc, locales.getMaster(), revision)
			file = open(outdir +"/"+ str(revision)+ "/" + loc.getShortName() + "_missing.html","w+")
			file.write(page)
			file.close()
	else:
		raise TypeError, "You beed to pass an instance of localetools.l10n.foxtrickLocalization"