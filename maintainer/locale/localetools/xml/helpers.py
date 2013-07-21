#find first child node matching tagname and optional require an (1) attribute to be of a certain value
def findFirstNodeRecursive(node, tagName, attributes=None):
	"""finds first child-node (recursive) matching tagName and attributes"""
	
	if not node:
		return None
		
	for n in node.childNodes:
		if hasattr(n,"tagName"):
			if n.tagName == tagName:
				if attributes:
					attr = n.attributes.items()
					for (key, value) in attr:
						for k in attributes:
							if key == k and value == attributes[k]:
								return n
				else:
					return n
					
		childresult = findFirstNodeRecursive(n, tagName, attributes)
		if childresult:
			return childresult
			
	return None
	
#find all child nodes matching tagname and optional require an (1) attribute to be of a certain value				
def findAllNodesRecursive(node, tagName, attributes=None):
	"""finds all child-nodes (recursive) matching tagName and attributes"""
	
	list = []
	if not node:
		return list
		
	for n in node.childNodes:
		if hasattr(n,"tagName"):
			if n.tagName == tagName:
				if attributes:
					attr = n.attributes.items()
					for (key, value) in attr:
						for k in attributes:
							if key == k and value == attributes[k]:
								list.append(n)
				else:
					list.append(n)
		
		childresult = findAllNodesRecursive(n, tagName, attributes)
		if len(childresult):
			list.append(childresult)
	
	return list
