# Update module listing in manifest files
#
# Author: Anastasios Ventouris <tasosventouris@gmail.com>

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
    #create the empty file
    output = open(tar['file'], "w")
    
    #write the *from* string
    output.write(tar['from'] + "\n")
    
    #iterate through modules and write them in the file
    for mod in modules:
        line = tar['prefix'] + mod + tar['suffix']
        output.write(line)
        
    #write the *to* strings
    output.write(tar['to'])

    #close the file
    output.close()
