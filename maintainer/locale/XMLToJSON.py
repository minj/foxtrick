#!/usr/bin/python
from Hattrick.Parsers import XMLParser
import xml.etree.ElementTree as ET

import sys
import re
import codecs

files = sys.argv
files.pop(0)
p = re.compile('(\\.xml)?$')

for f in files:
	xml = ET.parse(f)
	of = p.sub('.json', f)
	o = codecs.open(of, mode='w', encoding='utf-8')
	o.write(XMLParser.toJSON(xml))
	o.close()
