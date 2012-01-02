import localetools.l10n
import sys

	
path_to_content_input = raw_input("Path to foxtrick: (leave entry -> \"./../../\" )")
if path_to_content_input == "":
	path_to_content_input = "./../../"
	
oldkey = raw_input("Key to be renamed: ").lstrip().rstrip()
newkey = raw_input("Desired new name: ").lstrip().rstrip()

print "using", path_to_content_input
print "renaming", oldkey, "to", newkey
#relativ path to content, looking for mater file there and iterating /locale/

verbose = 1

#read master and locales
Locales = localetools.l10n.foxtrickLocalization( path_to_content_input + "/content/")

#all locales
all = Locales.getAll()
all.insert(0, Locales.getMaster())

#will have all locales that require renaming
required = []

if verbose:
	print "Searching:"
	
#look for oldkey abd add to required if found
for loc in all:
	translation = loc.getTranslation(oldkey)
	if translation:
		required.append(loc)
		if verbose:
			print "\t",loc.getShortName(), " requires renaming"

if verbose:
	print "Renaming:"
		
#actual replacing occurs here
count = 0
for locale in required:
	fin = open( locale.file, "r" )
	content = fin.readlines()
	fin.close()
	
	didreplace = 0
	
	#iterate content, search for key and replace
	for index, line in enumerate(content):
		e_line = line.lstrip()
		e_line = line.rstrip()
		if len(e_line) and e_line[0] != '#':
			partitionated = e_line.partition("=")
			if partitionated[1] is "=":
				if partitionated[0].lstrip().rstrip().lower() == oldkey.lower():
					#replace the first occurance of key in key
					replaced = line.replace(oldkey, newkey, 1);
					content[index] = replaced
					didreplace = 1
					if verbose:
						print "\t",locale.getShortName(), " changed line", index
	
	#save data back to disc
	if didreplace:
		try:
			fout = open( locale.file, "w" )
			fout.writelines(content)
			fout.close()
			localetools.l10n.convertCRLFtoLF(locale.file)
			count += 1
		except IOError as (errno, strerror):
			print "Locale:", locale.getShortName(), " I/O error({0}): {1}".format(errno, strerror)

print "Replaced", oldkey, "by", newkey, "in", count, "of", len(required), "files. "
print len(all) - len(required), " didn't have this key."
			
		