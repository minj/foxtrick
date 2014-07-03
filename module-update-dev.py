# Update module listing in manifest files
#
# Author: Anastasios Ventouris <tasosventouris@gmail.com>

import re

targets = [
	{
		"file" : "manifest.json",
		"from" : "//<!-- categorized modules -->",
		"to" : "//<!-- end categorized modules -->",
		"prefix" : "\t\t\t\"content/",
		"suffix" : "\",\n"
	},
	{
		"file" : "Info.plist",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t\t\t\t<string>content/",
		"suffix" : "</string>\n"
	},
	{
		"file" : "content/scripts-fennec.js",
		"from" : "//<!-- categorized modules -->",
		"to" : "//<!-- end categorized modules -->",
		"prefix" : "\t\t'",
		"suffix" : "',\n"
	},
	{
		"file" : "content/bootstrap-firefox.js",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t\t'",
		"suffix" : "',\n"
	},
	{
		"file" : "content/preferences.html",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" : "\"></script>\n"
	},
	{
		"file" : "content/background.html",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" : "\"></script>\n"
	}
]

#get module file list from file *modules*
modules = open("modules", "r").read()
modules = modules.split("\n")

#remove the last empty entry due to *newline character* in file
del modules[-1]

#iterate through targets
for tar in targets:
    #open the file and copy the content to a variable
    fh = file(tar['file'], 'r')
    originaltext = fh.read()
    fh.close()

    #create the text with the modules list
    modstring = "\n"
    for mod in modules:
        line = tar['prefix'] + mod + tar['suffix']
        modstring = modstring + line

    #find and replace the content between *from* and *to*
    reg = reg = "(?<=%s).*?(?=%s)" % (tar['from'],tar['to'])
    r = re.compile(reg,re.DOTALL)
    result = r.sub(modstring, originaltext)

    #write the new file
    f_out = file(tar['file'], 'w')
    f_out.write(result)
    f_out.close()    
