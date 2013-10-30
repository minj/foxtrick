from __future__ import print_function
import localetools.l10n

path_to_content_input = "./../../"

#read master and locales
Locales = localetools.l10n.foxtrickLocalization( path_to_content_input + "/content/")

#all locales
translations = Locales.getAll()

#master
master = Locales.getMaster()

masterTranslations = master.getTranslations()
for translation in translations:
	trans = translation.getTranslations()
	for t in trans:
		for m in masterTranslations:
			if t.getKey() == m.getKey():
				if(t.getValue() == m.getValue()):
					print(translation.getShortName(), t.getKey(), t.getValue())
