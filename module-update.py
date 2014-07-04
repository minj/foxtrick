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
		"suffix" : "\","
	},
	{
		"file" : "Info.plist",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t\t\t\t<string>content/",
		"suffix" : "</string>"
	},
	{
		"file" : "content/scripts-fennec.js",
		"from" : "//<!-- categorized modules -->",
		"to" : "//<!-- end categorized modules -->",
		"prefix" : "\t\t'",
		"suffix" : "',"
	},
	{
		"file" : "content/bootstrap-firefox.js",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t\t'",
		"suffix" : "',"
	},
	{
		"file" : "content/preferences.html",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" : "\"></script>"
	},
	{
		"file" : "content/background.html",
		"from" : "<!-- categorized modules -->",
		"to" : "<!-- end categorized modules -->",
		"prefix" : "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" : "\"></script>"
	}
    ]

    path = dirfile+"/"
    
    #if exclude file in fuction, read the file
    if excludefile:
        ignorelist = open(path+excludefile, "r").read()
        ignorelist = ignorelist.split("\n")
        
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
    modules = modules.split("\n")

    #remove the last empty entry due to *newline character* in file
    del modules[-1]

    #iterate through targets
    for tar in targets:
        #open the file and copy the content to a list variable
        fh = file(path+tar['file'], 'r')
        originaltext = fh.read().splitlines()
        fh.close()

        #find the index of *from* and *to*
        start = 0
        end = 0
        for step in originaltext:
            if tar['from'] in step:
                start = originaltext.index(step)
            elif tar['to'] in step:
                end = originaltext.index(step)
                
        #create the text with the modules list
        modstring = []
        for mod in modules:
            line = tar['prefix'] + mod + tar['suffix']
            modstring.append(line)

        #replace the content of the file   
        originaltext[start+1:end] = modstring

        #join the list to a text file
        result = '\n'.join(originaltext)

        #write the new file
        f_out = file(path+tar['file'], 'w')
        f_out.write(result)
        f_out.close()    


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Update module listing in manifest files. Author: Anastasios Ventouris')
    parser.add_argument('-source','--sourcefile', help='The name of the source file. Default value = modules', required=False, default="modules")
    parser.add_argument('-exclude','--excludefile', help='The name of the source file to ignore. Default value = None', required=False)
    parser.add_argument('-dir','--dirfile', help='The path to the new working directory. Default value = .', default=".", required=False)

    args = parser.parse_args()
    update(args.sourcefile,args.excludefile,args.dirfile)
