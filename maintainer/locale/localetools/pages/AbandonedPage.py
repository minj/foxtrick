import localetools.l10n
import localetools.utils.markup
import localetools.utils.ensuredirectory

def getTableString(locale, master, id):
	if not locale or not master:
		return None
		
	columns = ["locale","entry","line","edit"]
	text = {"locale":"Locale", "entry":"Entry", "edit":"Edit locale", "line":"Found in locale"}
	
	table = localetools.utils.markup.page( )
	
	table.table.open(id=id, _class="tablesorter")
	
	#thead
	table.thead.open()
	for c in columns:
		table.th(text[c])
	table.thead.close()
	
	#tbody
	table.tbody.open()

	#rows
	abandoned = locale.getAbandoned()
	for a in abandoned:
		table.tr.open()
		#loc
		table.td(locale.getShortName())
		#key
		table.td(a.getKey())
		#line
		table.td(a.getLine())
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
	return str(table)
		
def getPageString(locale, master, revision):
	if not locale or not master:
		return

	page = localetools.utils.markup.page( )
	page.init( title="FoxTrick r"+ str(revision) + " Localization Statistics",
			   css=('./../style.css'), 
			   script=([['./../jquery-latest.js','javascript'],[ './../jquery.tablesorter.js','javascript']]))
				   
	tablecode = getTableString(locale, master, id="mytable")
	page.addcontent( tablecode )
	
	page.script("$(document).ready(function(){$(\"#mytable\").tablesorter();});", type="text/javascript")
	page.script.close()
	return str(page)	
	
#this also reads all locales, but wont analize anything
#locales are beeing analyzed when the info about missing/abandoned etc. is requested for the first time
def create(locales, revision, outdir):
	print "Generating abandoned-pages for r" + str(revision)
	if isinstance(locales, localetools.l10n.foxtrickLocalization):
		for loc in locales.getAll():
			if not loc.getAbandonedCount():
				continue
				
			localetools.utils.ensuredirectory.ensure(outdir +"/"+ str(revision))
			page = getPageString(loc, locales.getMaster(), revision)
			file = open(outdir +"/"+ str(revision)+ "/" + loc.getShortName() + "_abandoned.html","w+")
			file.write(page)
			file.close()
	else:
		raise TypeError, "You beed to pass an instance of localetools.l10n.foxtrickLocalization"
