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

    if dirfile.endswith('/'):
        path = dirfile
    else:
        path = dirfile+"/"

    #get module file list from file *modules*
    modules = open(sourcefile, "r").read()
    modules = modules.splitlines()

    #if exclude file in fuction, read the file
    if excludefile:
        ignorelist = open(excludefile, "r").read()
        ignorelist = ignorelist.splitlines()

        for mod in ignorelist:
            #remove mod from modules
            if mod in modules:
                modules.remove(mod)

            #delete files from ignorelist in the build
            pathfile = path + 'content/' + mod
            #replace the backslash with a slash
            #pathfile = pathfile.replace("/",'\\')
            if os.path.isfile(pathfile):
                os.remove(pathfile)

    #iterate through targets
    for tar in targets:
        #check if file exists
        pathfile = path + tar['file']
        if not os.path.isfile(pathfile):
            continue

        #open the file and copy the content to a list variable
        fh = file(pathfile, 'r')
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

def add(filename,light):
    #get module file list from file *modules*
    modules = open("modules", "r").read()
    #take \n
    modules = modules.splitlines(True)

    #convert  '/path/to/foxtrick/content/category/module.js' to 'category/module.js
    r = re.compile('^(.*?/)?content/')
    module = r.sub('', filename) + '\n'

    #add file in modules
    if module not in modules:
        modules.append(module)
        modules.sort()

        #write the new file
        f_out = file("modules",'w')
        f_out.writelines(modules)
        f_out.close()

        update("modules",None,".")

    #check if light is called and add the file also in light
    if light:
        modules = open("included-modules-light","r").read()
        modules = modules.splitlines()

        #add file in modules
        if module not in modules:
            modules.append(module)
            modules.sort()

            #write the new file
            f_out = file("included-modules-light",'w')
            f_out.writelines(modules)
            f_out.close()


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Update module listing in manifest files. Author: Anastasios Ventouris')
    parser.add_argument("function",
                    nargs="?",
                    choices=['update', 'add', 'rm']
                    )
    args, sub_args = parser.parse_known_args()

    if args.function == "update":
        parser.add_argument('-s','--sources-file', dest='sourcefile', help='The name of the sources file. Default value = modules', required=False, default="modules")
        parser.add_argument('-e','--excludes-file', dest='excludefile', help='The name of the file with sources to ignore. Default value = None', required=False)
        parser.add_argument('-d','--build-dir', dest='dirfile', help='The path to the new working directory. Default value = .', default=".", required=False)
        args = parser.parse_args(sub_args)
        update(args.sourcefile,args.excludefile,args.dirfile)

    elif args.function == "add":
        parser.add_argument('-l', '--light-module', dest='light', help='The name of the source file to ignore. Default value = None', required=False, action='store_true')
        parser.add_argument('filename', help='The name of the file with the path you want to add')
        args = parser.parse_args(sub_args)
        add(args.filename,args.light)

    elif args.function == "rm":
        pass


