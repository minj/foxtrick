import localetools.l10n
import localetools.utils.markup
import localetools.utils.ensuredirectory

def getPageString(locale, master, revision):
	if not locale or not master:
		return

	columns = ["locale","entry","line","masterline"]
	text = {"locale":"Locale", "entry":"Duplicated entry","line":"Line in locale", "masterline":"Line in master"}

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

	duplicates = locale.getDuplicates()
	for d in duplicates:
		masterTranslation = master.getTranslation(d.getKey())
		table.tr.open()
		table.td(locale.getShortName())
		table.td(d.getKey())
		table.td(d.getLine())
		if masterTranslation:
			table.td(masterTranslation.getLine())
		else:
			table.td(-1)
		table.tr.close()

	table.tbody.close()
	table.table.close()
	table.script("$(document).ready(function(){$(\"#mytable\").tablesorter();});", type="text/javascript")
	table.script.close()
	return str(table)
	
	
#this also reads all locales, but wont analize anything
#analization is done when info about missing/abandoned etc. is requested for the first time

def create(locales, revision, outdir):
	print "Generating duplicated-pages for r" + str(revision)
	if isinstance(locales, localetools.l10n.foxtrickLocalization):
		for loc in locales.getAll():
			localetools.utils.ensuredirectory.ensure(outdir +"/"+ str(revision))
			page = getPageString(loc, locales.getMaster(), revision)
			file = open(outdir +"/"+ str(revision)+ "/" + loc.getShortName() + "_duplicates.html","w+")
			file.write(page)
			file.close()
	else:
		raise TypeError, "You beed to pass an instance of localetools.l10n.foxtrickLocalization"