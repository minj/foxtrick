#!/usr/bin/env python

# Update module listing in manifest files
#
# Author: Anastasios Ventouris <tasosventouris@gmail.com>
# LA-MJ <4mr.minj@gmail.com>

import re
import argparse
import os
import sys

tag = '<!-- %s -->'
targets = [
	{
		"file" : "manifest.json",
		"prefix" : "\t\t\t\"content/",
		"suffix" : "\",\n"
	},
	{
		"file" : "Info.plist",
		"prefix" : "\t\t\t\t<string>content/",
		"suffix" : "</string>\n"
	},
	{
		"file" : "content/scripts-fennec.js",
		"prefix" : "\t\t'",
		"suffix" : "',\n"
	},
	{
		"file" : "content/bootstrap-firefox.js",
		"prefix" : "\t\t'",
		"suffix" : "',\n"
	},
    {
        "file" : "content/bootstrap-fennec.js",
        "prefix" : "\t\t'",
        "suffix" : "',\n"
    },
	{
		"file" : "content/preferences.html",
		"prefix" : "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" : "\"></script>\n"
	},
	{
		"file" : "content/background.html",
		"prefix" : "\t<script type=\"application/x-javascript\" src=\"./",
		"suffix" : "\"></script>\n"
	}
]

def build(args=dict(sourcefile="modules", excludefile=None, dirfile=".")):
    sourcefile = args['sourcefile']
    excludefile = args['excludefile']
    dirfile = args['dirfile']

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

        #find the index of start and end tags
        start_tag = tag % 'categorized modules'
        end_tag = tag % 'end categorized modules'
        start = -1
        end = -1
        for step in lines:
            if start_tag in step:
                start = lines.index(step)
            elif end_tag in step:
                end = lines.index(step)

        if start == -1 or end == -1:
            print('No \'%s\' in %s. Skipping.' % (start_tag, pathfile))
            continue

        #create the text with the modules list
        modlines = []
        for mod in modules:
            line = tar['prefix'] + mod + tar['suffix']
            modlines.append(line)

        #replace the content of the file
        lines[start+1:end] = modlines

        #write the new file
        f_out = file(pathfile, 'wb')
        f_out.writelines(lines)
        f_out.close()
        print('%s updated.' % pathfile)

def add(args):
    filename = args['filename']
    light = args['light']

    module = normalize_path(filename)

    add_module('modules', module)
    if light:
        add_module('included-modules-light', module)

    build()

def rm(args):
    filename = args['filename']
    module = normalize_path(filename)

    rm_module('modules', module)
    rm_module('included-modules-light', module)

    build()

def normalize_path(path):
    #convert  '/path/to/foxtrick/content/category/module.js' to 'category/module.js
    r = re.compile('^(.*?/)?content/')
    path = r.sub('', path)
    return path


def rm_module(sourcefile, module):
    #get module file list from file *sourcefile*
    modules = open(sourcefile, "r").read()
    #take \n
    modules = modules.splitlines(True)
    module += '\n'
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
    module += '\n'
    if module not in modules:
        modules.append(module)
        modules.sort()

        #write the new file
        f_out = file(sourcefile,'wb')
        f_out.writelines(modules)

def add_util(args):

    # util types that should not be sorted (due to dependencies)
    NO_SORT_TYPES = ['ext-lib']

    filename = args['filename']
    util_type = args['type']

    util = normalize_path(filename)

    #iterate through targets
    for tar in targets:
        #check if file exists
        pathfile = tar['file']
        if not os.path.isfile(pathfile):
            continue

        #open the file and copy the content to a list variable
        fh = file(pathfile, 'r')
        #keep \n
        lines = fh.read().splitlines(True)
        fh.close()

        #find the index of start and end tags
        start_tag = tag % util_type
        end_tag = tag % ('end ' + util_type)
        start = -1
        end = -1
        for step in lines:
            if start_tag in step:
                start = lines.index(step)
            elif end_tag in step:
                end = lines.index(step)

        if start == -1 or end == -1:
            print('No \'%s\' in %s. Skipping.' % (start_tag, pathfile))
            continue

        #create a copy of utils
        utils = lines[start+1:end]
        #create the new line and add it
        utils.append(tar['prefix'] + util + tar['suffix'])
        #sort and replace
        if util_type not in NO_SORT_TYPES:
            utils.sort()
        lines[start+1:end] = utils

        #write the new file
        f_out = file(pathfile, 'wb')
        f_out.writelines(lines)
        f_out.close()
        print('%s updated.' % pathfile)

def rm_util(args):
    filename = args['filename']
    util = normalize_path(filename)

    #iterate through targets
    for tar in targets:
        #check if file exists
        pathfile = tar['file']
        if not os.path.isfile(pathfile):
            continue

        #open the file and copy the content to a list variable
        fh = file(pathfile, 'r')
        #keep \n
        lines = fh.read().splitlines(True)
        fh.close()

        search = tar['prefix'] + util + tar['suffix']
        try:
            pos = lines.index(search)
        except:
            print('No \'%s\' in %s. Skipping.' % (util, pathfile))
            continue

        #remove
        lines[pos:pos+1] = []

        #write the new file
        f_out = file(pathfile, 'wb')
        f_out.writelines(lines)
        f_out.close()
        print('%s updated.' % pathfile)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Update module listings in manifest files. Author: Anastasios Ventouris, LA-MJ')
    subparsers = parser.add_subparsers(help='Available commands:')

    parser_build = subparsers.add_parser('build', help='Update manifest files (default action). Optionally removes excluded modules.')
    parser_build.add_argument('-s','--sources-file', dest='sourcefile', help='The name of the sources file. Default value = modules', required=False, default="modules")
    parser_build.add_argument('-e','--excludes-file', dest='excludefile', help='The name of the file with sources to ignore when building. Default value = None', default=None, required=False)
    parser_build.add_argument('-d','--build-dir', dest='dirfile', help='The path to the new working directory. Default value = CWD', default=".", required=False)
    parser_build.set_defaults(func=build)

    parser_add = subparsers.add_parser('add', help='Link a module. The file will be loaded in Foxtrick.')
    parser_add.add_argument('-l', '--light-module', dest='light', help='Also include this module in Foxtrick Light.', required=False, action='store_true')
    parser_add.add_argument('filename', help='The module file you want to link.')
    parser_add.set_defaults(func=add)

    parser_rm = subparsers.add_parser('rm', help='Unlink a module. The file will no longer be loaded in Foxtrick.')
    parser_rm.add_argument('filename', help='The module file you want to unlink.')
    parser_rm.set_defaults(func=rm)

    parser_add_util = subparsers.add_parser('add-util', help='Link an util.')
    parser_add_util.add_argument('-t', '--type', dest='type', help='Type of util to add: util (default), ext-lib, page-util, api-util, core.', required=False, action='store', default='util')
    parser_add_util.add_argument('filename', help='The util file you want to link.')
    parser_add_util.set_defaults(func=add_util)

    parser_rm_util = subparsers.add_parser('rm-util', help='Unlink an util')
    parser_rm_util.add_argument('filename', help='The util file you want to unlink.')
    parser_rm_util.set_defaults(func=rm_util)

    if (len(sys.argv) < 2):
        args = parser.parse_args(['build'])
    else:
        args = parser.parse_args()

    args.func(vars(args))
