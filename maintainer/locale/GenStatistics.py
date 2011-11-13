import localetools.l10n
import localetools.pages.IndexPage
import localetools.pages.AbandonedPage 
import localetools.pages.DuplicatePage
import localetools.pages.MissingPage

import sys 
import os
import shutil

argc = len(sys.argv)


if argc != 3:
	print 'Usage: ' + sys.argv[0] + ' outdir revision'
	print 'i.e: ' + sys.argv[0] + ' ./out 7700'
	print 'creates following files: ./out/7700/*.html'
	print 'and copies required styles, images and javascript from ./html/ to ./out/'
	print 'RUN this script from ./foxtrick/maintainer/locale'
else:

	#relativ path to content, looking for mater file there and iterating /locale/
	path_to_content = "./../../content/"
	
	#desired destination of the output, inside outdir folder "revision" will be created
	outdir = sys.argv[1]
	
	#revision, just for naming issues (see outdir)
	revision = sys.argv[2]
	
	#read master and locales
	Locales = localetools.l10n.foxtrickLocalization(path_to_content)
	
	#generate html, most of the time consumming analizing occurs here (on first request)
	localetools.pages.IndexPage.create(Locales, revision, outdir)
	localetools.pages.AbandonedPage.create(Locales, revision, outdir)
	localetools.pages.DuplicatePage.create(Locales, revision, outdir)
	localetools.pages.MissingPage.create(Locales, revision, outdir)
	
	#copy required presentation files to <outdir>
	print "Copying images, styles and javascript"
	files = os.listdir('./html/')
	for filename in files:
		dir = "./html/"
		htmlfile = os.path.join(dir, filename)
		outfile = os.path.join(dir, filename)
		if os.path.isfile(htmlfile):
			shutil.copy2("./html/" + filename, outdir + '/' + filename)

	

