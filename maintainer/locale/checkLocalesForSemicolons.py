from localetools.l10n import foxtrickLocalization
import string

locales = foxtrickLocalization('./../../content/')

for locale in locales.getAll():
	translations = locale.getTranslations();
	for translation in translations:
		if string.find(translation.getValue(),';') != -1:
			print locale.getShortName(), translation.getKey(), "uses a ;"