import localetools.l10n
import localetools.utils.markup
import localetools.utils.ensuredirectory

def getPageString(Locales):
	if not isinstance(Locales, localetools.l10n.foxtrickLocalization):
		raise TypeError, "You beed to pass an instance of localetools.l10n.foxtrickLocalization"
		
	columns = ["locale","progress","entries","translated","missing","abandoned","duplicates", "chaos"]
	text = {"locale":"Locale", "progress":"Progress", "entries":"Entries", "translated":"Translated","missing":"Missing","abandoned":"Abandoned","duplicates":"Duplicates","chaos":"Chaos"}


	table = localetools.utils.markup.page( )
	table.init( title="FoxTrick Localization Statistics", 
			   css=('./../style.css'), 
			   script=([['./../jquery-latest.js','javascript'],[ './../jquery.tablesorter.js','javascript']]))
				   

	table.table.open(id="mytable", _class="tablesorter")
	table.thead.open()
	for c in columns:
		table.th(text[c])
	table.thead.close()
	table.tbody.open()

	for loc in Locales.getAll():
		locstat = loc.getStatus()
		table.tr.open()
		for c in columns:
			if c == "progress" or c == "chaos":
				table.td(str(locstat[c])[:8] +"%")
			elif c == "abandoned" and locstat[c] is not 0:
				table.td.open()
				table.a(locstat[c], href="./" + loc.getShortName() + "_abandoned.html" )
				table.td.close()
			elif c == "duplicates" and locstat[c] is not 0:
				table.td.open()
				table.a(locstat[c], href="./" + loc.getShortName() + "_duplicates.html" )
				table.td.close()
			elif c == "missing" and locstat[c] is not 0:
				table.td.open()
				table.a(locstat[c], href="./" + loc.getShortName() + "_missing.html" )
				table.td.close()
			else:
				table.td(locstat[c])
		table.tr.close()

	table.tbody.close()
	table.table.close()
	table.script("$(document).ready(function(){$(\"#mytable\").tablesorter();});", type="text/javascript")
	table.script.close()
	return str(table)


def create(locales, release, outdir):
	print "Generating index page for r" + str(release)
	if isinstance(locales, localetools.l10n.foxtrickLocalization):
		localetools.utils.ensuredirectory.ensure(outdir +"/"+ str(release))
		page = getPageString(locales)
		file = open(outdir +"/"+ str(release)+ "/index.html","w+")
		file.write(page)
		file.close()
	else:
		raise TypeError, "You beed to pass an instance of localetools.l10n.foxtrickLocalization"
