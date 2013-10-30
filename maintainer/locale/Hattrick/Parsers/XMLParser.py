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
		parent[tag].append({})
	else:
		parent[tag] = {} #assume unique tag and make a assosiative node

	# parse childs recursively
	for child in childs:
		if isArray:
			areChildsArray = xml_to_python(child, parent[tag][len(parent[tag]) - 1])
		else:
			areChildsArray = xml_to_python(child, parent[tag])

	# add any attributes
	for key in attrs:
		if isArray:
			parent[tag][len(parent[tag]) - 1][key] = el.get(key)
		else:
			parent[tag][key] = el.get(key)

	if len(childs) == 0 and len(attrs) == 0:
		# text-only element
		if isArray:
			parent[tag][len(parent[tag]) - 1] = text
		else:
			parent[tag] = text
	elif text:
		# add textContent
		if isArray:
			parent[tag][len(parent[tag]) - 1]['textContent'] = text
		else:
			parent[tag]['textContent'] = text

	# bypass useless item name elements i.e. League in LeagueList > League
	# since we don't need them to detect isArray any more
	if areChildsArray:
		if hasattr(parent[tag], 'keys'):
			childKeys = list(parent[tag].keys())
			if len(childKeys) == 1:
				parent[tag] = parent[tag][childKeys[0]]

	return isArray

def toJSON(elem):
	"""
	turns ElementTree into JSON
	"""
	if hasattr(elem, 'getroot'):
		elem = elem.getroot()
	d = {}
	xml_to_python(elem, d)
	ret = json.dumps(d, ensure_ascii=False, indent=1, separators=(',', ': '))
	p = re.compile('^ +', re.M)
	# add tabs
	return p.sub((lambda m: (m.end() - m.start()) * '\t'), ret)
