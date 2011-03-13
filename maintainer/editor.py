#!/usr/bin/python

# editor.py
# extract editor info from HTML to XML used by StaffMarker
# Copyright (c) 2011 Ryan Li <ryan@ryanium.com>
# Usage:
# ./editor.py
# ./editor.py < editor.html > editor.xmlfrag

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
pairs = map((lambda a: (re.search("userId=(\d+)", a.attrib["href"]).group(1), a.text)), links)
for pair in pairs:
	print '<editor value="%s" name="%s" />' % (pair[0], pair[1])
