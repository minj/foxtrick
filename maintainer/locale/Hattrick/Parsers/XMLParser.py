import json
import re

def xml_to_python(el, parent):
	"""
	turns Element into python dictionary
	"""
	tag = el.tag
	childs = list(el)
	attrs = list(el.keys())
	if not el.text == None:
		text = el.text.strip()
	else:
		text = ''
	isArray = False
	areChildsArray = False
	if tag in parent:
		# if a tag is not unique, make an array and add nodes to that
		isArray = True
		if type(parent[tag]) is not list:
			parent[tag] = [parent[tag]]
		dest = {}
		parent[tag].append(dest)
	else:
		parent[tag] = dest = {} #assume unique tag and make an assosiative node

	# parse childs recursively
	for child in childs:
		areChildsArray = xml_to_python(child, dest)

	# add any attributes
	for key in attrs:
		dest[key] = el.get(key)

	if len(childs) == 0 and len(attrs) == 0:
		# text-only element
		dest = text
	elif text:
		# add textContent
		dest['textContent'] = text

	# bypass useless item name elements i.e. League in LeagueList > League
	# since we don't need them to detect isArray any more
	if areChildsArray:
		if hasattr(parent[tag], 'keys'):
			childKeys = list(parent[tag].keys())
			if len(childKeys) == 1:
				parent[tag] = parent[tag][childKeys[0]]

	return isArray

def python_to_json(obj):
	"""
	turns python dictionary into JSON
	"""
	ret = json.dumps(obj, ensure_ascii=False, indent=1, separators=(',', ': '))
	p = re.compile('^ +', re.M)
	# add tabs
	return p.sub((lambda m: (m.end() - m.start()) * '\t'), ret) + '\n'

def toJSON(elem):
	"""
	turns ElementTree into JSON
	"""
	if hasattr(elem, 'getroot'):
		elem = elem.getroot()
	d = {}
	xml_to_python(elem, d)
	return python_to_json(d)
