# Checks htlang.xml files for overall filestructure, missing attributes etc.
#
# Checks performed: 
#	- overall structure (child-count, child-names, attribute-count, attribute-names)
#   - presence of all master keys that are used to access the translation like value=1 for levels etc.
#   - will dump the stuff to console, so pipe it in a file
#   
# Caution:
#   - expects content directory to be "./../../content/
#   - currently checks against "./../../content/locale/en/htlang.xml
#   - attribute errors in repetitive nodes generate n*errorcount error messages 
#     since every entry in the reference file is checked against it, thus causing an error each time
#
# CatzHoek, 2011
from __future__ import print_function
from xml.dom.minidom import parse

#tab shit for a little nicer formatting
tabcount = 0

def inctabs():
	global tabcount
	tabcount += 1
def dectabs():
	global tabcount
	tabcount -= 1
def tabs():
	return "\t"*tabcount

def brackets(text):
	return "<" + text + ">"
	
def location(node):
	loc = ""
	if hasattr(node, 'tagName'):
		loc = brackets(node.tagName)
	while node.parentNode:
		if hasattr(node.parentNode, 'tagName'):
			loc = brackets(node.parentNode.tagName) + loc
		node = node.parentNode
	return loc

#ensure see if 2 notes have the same ammount of elementnodes
def compareChildElementNodeCount(r_node, t_node):
	r_childs = r_node.childNodes
	t_childs = t_node.childNodes
	r_count = t_count = 0
	
	for r_c in r_childs:
		if r_c.nodeType == r_c.ELEMENT_NODE:
			r_count += 1
			
	for t_c in t_childs:
		if t_c.nodeType == t_c.ELEMENT_NODE:
			t_count += 1
			
	if r_count != t_count:
		print(tabs(), location(t_node), "Child count missmatch. expected:", r_count, " found:", t_count)

#compare all childs of 
def compareChilds(r_node, t_node):
	inctabs()
	compareChildElementNodeCount(r_node, t_node)
	r_childs = r_node.childNodes
	t_childs = t_node.childNodes
	for r_c_node in r_childs:
		if r_c_node.nodeType == r_c_node.ELEMENT_NODE:
			found = 0
			#compare all element nodes vs. each other
			for t_c_node in t_childs:
				if t_c_node.nodeType == t_c_node.ELEMENT_NODE:
					if r_c_node.tagName == t_c_node.tagName:
						compareAttributes(r_c_node, t_c_node)
						compareChilds(r_c_node, t_c_node)
						found = 1
			if not found:
				print(tabs(), location(t_node),"Missing child node:", brackets(r_c_node.tagName))
				
	for t_c_node in t_childs:
		if t_c_node.nodeType == t_c_node.ELEMENT_NODE:
			found = 0
			#compare all element nodes vs. each other
			for r_c_node in r_childs:
				if r_c_node.nodeType == r_c_node.ELEMENT_NODE:
					if t_c_node.tagName == r_c_node.tagName:
						found = 1
			if not found:
				print(tabs(), location(t_node),"Unexpected child node:", brackets(t_c_node.tagName))
	
	dectabs()
	
def getChildAttributeValues(node, key):
	values = []
	if node:
		childs = node.childNodes
		for child in childs:
			if child.nodeType == child.ELEMENT_NODE:
				for (akey, value) in list(child.attributes.items()):
					if key == akey:
						values.append(value)
	return values
	
				
def compareAttributes(r_node, t_node):
	r_attributes = list(r_node.attributes.keys())
	t_attributes = list(t_node.attributes.keys())
	if sorted(r_attributes) != sorted(t_attributes):
		if len(r_attributes) != len(t_attributes):
			print(tabs(), location(t_node), "Attribute count mismatch", len(r_attributes), "<>", len(t_attributes))
			for t_key in t_attributes:
				if t_key not in r_attributes:
					print(tabs(), location(t_node), "Additional attribute:", t_key)
			
		for r_key in r_attributes:
			if r_key not in t_attributes:
				print(tabs(), location(t_node), "Missing attribute:", r_key)
				
def compareDocuments(r_node, t_node):
	if r_node.tagName != t_node.tagName:
		print(tabs(), location(t_node), "Tag mismatch")
	if r_node.nodeType != t_node.nodeType:
		print(tabs(), location(t_node), "Nodetype mismatch")
	else:
		if r_node.nodeType == r_node.ELEMENT_NODE:
			compareAttributes(r_node, t_node)
			compareChilds(r_node, t_node)
			
def findChildNode(node, tagName):
	for child in node.childNodes:
		if hasattr(child, 'tagName'):
			if child.tagName == tagName:
				return child
	
	return None
	
def getChildAttributeValueDifference(ref, test, key):
		r_attributes = getChildAttributeValues(ref, key)
		l_attributes = getChildAttributeValues(test, key)

		if r_attributes and l_attributes:
			if sorted(l_attributes) != sorted(r_attributes):
				return list(set(l_attributes).symmetric_difference(set(r_attributes)))
			return None
			
		return r_attributes
		
def ensureChildAttributes(reference, test, tagname, attributename):
	r_levelNode = findChildNode(reference, tagname)
	l_levelNode = findChildNode(test, tagname)
	
	difference = getChildAttributeValueDifference(r_levelNode, l_levelNode, attributename)
	if difference:
		print("\t", tagname, "differences:", difference) 



if __name__ == "__main__":
	import os
	import sys
	
	reference = parse('./../../content/locale/en/htlang.xml')

	localesdirectorylocation =  os.path.join("./../../content", "locale")
	for localedir in os.listdir(localesdirectorylocation):
		if localedir[0] == ".":		
			continue
		htlang = os.path.join(localesdirectorylocation, localedir, "htlang.xml")
		if os.path.isfile(htlang):
			test = parse(htlang)

			print("\nComparing Language:", localedir)
			
			print("Comparing overall file structure:")
			compareDocuments(reference.documentElement, test.documentElement)

			print("Comparing keyvalues for attributes:")
			ensureChildAttributes(reference.documentElement, test.documentElement, "levels", "value")
			ensureChildAttributes(reference.documentElement, test.documentElement, "ratingSubLevels", "value")
			ensureChildAttributes(reference.documentElement, test.documentElement, "tactics", "type")
			ensureChildAttributes(reference.documentElement, test.documentElement, "positions", "type")
			ensureChildAttributes(reference.documentElement, test.documentElement, "specialties", "type")
			ensureChildAttributes(reference.documentElement, test.documentElement, "agreeability", "value")	
			ensureChildAttributes(reference.documentElement, test.documentElement, "honesty", "value")	
		ensureChildAttributes(reference.documentElement, test.documentElement, "aggressiveness", "value")			
