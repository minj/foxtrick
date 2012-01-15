from localetools.l10n import foxtrickLocalization
import string

localization = foxtrickLocalization('./../../content/');
locales = localization.getAll();
locales.append(localization.getMaster());

for locale in locales:
	translations = locale.getTranslations();
	for translation in translations:
		if string.find(translation.getValue(),';') != -1:
			print locale.getShortName(), translation.getKey(), "uses a ;"