#!/usr/bin/python

# parse-staff.py
# extract staff info from HTML to XML for StaffMarker
# Copyright (c) 2011 Ryan Li <ryan@ryanium.com>
# Usage:
# ./parse-staff.py [editor|chpp]
# ./parse-staff.py [editor|chpp] < origin.html > output.xmlfrag

import sys
import re
from lxml import etree

def traverse(result, node):
	for a in node.getchildren():
		result.append(a)
		traverse(result, a)

content = sys.stdin.read()
doc = etree.HTML(content)
links = [];

traverse(links, doc)
links = filter((lambda a: a.tag == "a" and a.attrib.has_key("href") and re.search("userId=\d+", a.attrib["href"])), links)
userList = map((lambda a: (re.search("userId=(\d+)", a.attrib["href"]).group(1), a.text)), links)
userSet = set(userList)
userList = list(userSet)
userList.sort(key=lambda x: x[1])
print '{'
print '\t"type": "%s",' % sys.argv[1]
print '\t"list": ['
print '\t\t' + ',\n\t\t'.join(map((lambda a: '{ "id": %s, "name": "%s" }' % (a[0], a[1])), userList))
print '\t]'
print '}'
