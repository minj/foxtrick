#!/usr/bin/env python

# Update module listing in manifest files
#
# Author: Anastasios Ventouris <tasosventouris@gmail.com>

import re
import argparse
import os

def update(args=dict(sourcefile="modules", excludefile=None, dirfile=".")):
    sourcefile = args['sourcefile']
    excludefile = args['excludefile']
    dirfile = args['dirfile']
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
        f_out = file(path+tar['file'], 'wb')
        f_out.writelines(lines)
        f_out.close()

def add(args):
    filename = args['filename']
    light = args['light']

    module = normalize_path(filename)

    add_module('modules', module)
    if light:
        add_module('included-modules-light', module)

    update()

def rm(args):
    filename = args['filename']
    module = normalize_path(filename)

    rm_module('modules', module)
    rm_module('included-modules-light', module)

    update()

def normalize_path(path):
    #convert  '/path/to/foxtrick/content/category/module.js' to 'category/module.js
    r = re.compile('^(.*?/)?content/')
    path = r.sub('', path) + '\n'
    return path


def rm_module(sourcefile, module):
    #get module file list from file *sourcefile*
    modules = open(sourcefile, "r").read()
    #take \n
    modules = modules.splitlines(True)
    if module in modules:
        modules.remove(module)
        modules.sort()

        #write the new file
        f_out = file(sourcefile,'wb')
        f_out.writelines(modules)
        f_out.close()

def add_module(sourcefile, module):
    #get module file list from file *sourcefile*
    modules = open(sourcefile, "r").read()
    #take \n
    modules = modules.splitlines(True)
    if module not in modules:
        modules.append(module)
        modules.sort()

        #write the new file
        f_out = file(sourcefile,'wb')
        f_out.writelines(modules)

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Update module listings in manifest files. Author: Anastasios Ventouris')
    subparsers = parser.add_subparsers(help='Available commands:')

    parser_add = subparsers.add_parser('add', help='Link a module. The file will be loaded in Foxtrick.')
    parser_add.add_argument('-l', '--light-module', dest='light', help='Also include this module in Foxtrick Light.', required=False, action='store_true')
    parser_add.add_argument('filename', help='The module file you want to link.')
    parser_add.set_defaults(func=add)

    parser_rm = subparsers.add_parser('rm', help='Unlink a module. The file will no longer be loaded in Foxtrick.')
    parser_rm.add_argument('filename', help='The module file you want to unlink.')
    parser_rm.set_defaults(func=rm)

    parser_up = subparsers.add_parser('build', help='Update manifest files and optionally remove excluded modules.')
    parser_up.add_argument('-s','--sources-file', dest='sourcefile', help='The name of the sources file. Default value = modules', required=False, default="modules")
    parser_up.add_argument('-e','--excludes-file', dest='excludefile', help='The name of the file with sources to ignore when building. Default value = None', default=None, required=False)
    parser_up.add_argument('-d','--build-dir', dest='dirfile', help='The path to the new working directory. Default value = CWD', default=".", required=False)
    parser_up.set_defaults(func=update)

    args = parser.parse_args()
    args.func(vars(args))
