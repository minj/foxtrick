import localetools.l10n

path_to_content_input = "./../../"

#read master and locales
Locales = localetools.l10n.foxtrickLocalization( path_to_content_input + "/content/")

#english overwrite
englishTranslations = Locales.get("en").getTranslations()

#master
masterTranslations = Locales.getMaster().getTranslations()

for et in englishTranslations:
	for mt in masterTranslations:
		if et.getKey() == mt.getKey():
			if et.getValue() != mt.getValue():
				print(mt.getKey())
