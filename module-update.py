# Update module listing in manifest files
#
# Author: Anastasios Ventouris <tasosventouris@gmail.com>

import re
import argparse
import os

def update(sourcefile, excludefile, dirfile):
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

    path = dirfile+"/"

    #if exclude file in fuction, read the file
    if excludefile:
        ignorelist = open(path+excludefile, "r").read()
        ignorelist = ignorelist.splitlines()

        #delete files from ignorelist in the build
        for mod in ignorelist:
            pathfile = dirfile + '/content/' + mod
            #replace the backslash with a slash
            #pathfile = pathfile.replace("/",'\\')
            if os.path.isfile(pathfile):
                os.remove(pathfile)
    else:
        ignorelist = []

    #get module file list from file *modules*
    modules = open(path+sourcefile, "r").read()
    modules = modules.splitlines()

    #iterate through targets
    for tar in targets:
        #open the file and copy the content to a list variable
        fh = file(path+tar['file'], 'r')
        #keep \n
        lines = fh.read().splitlines(True)
        fh.close()

        #find the index of *from* and *to*
        start = 0
        end = 0
        for step in lines:
            if tar['from'] in step:
                start = lines.index(step)
            elif tar['to'] in step:
                end = lines.index(step)

        #create the text with the modules list
        modlines = []
        for mod in modules:
            line = tar['prefix'] + mod + tar['suffix']
            modlines.append(line)

        #replace the content of the file
        lines[start+1:end] = modlines

        #write the new file
        f_out = file(path+tar['file'], 'w')
        f_out.writelines(lines)
        f_out.close()


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Update module listing in manifest files. Author: Anastasios Ventouris')
    parser.add_argument('-source','--sourcefile', help='The name of the source file. Default value = modules', required=False, default="modules")
    parser.add_argument('-exclude','--excludefile', help='The name of the source file to ignore. Default value = None', required=False)
    parser.add_argument('-dir','--dirfile', help='The path to the new working directory. Default value = .', default=".", required=False)

    args = parser.parse_args()
    update(args.sourcefile,args.excludefile,args.dirfile)
