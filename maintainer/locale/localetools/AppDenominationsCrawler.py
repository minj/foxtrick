import HTMLParser

# Crawls the entries from the AppDenominations.aspx page from Hattrick into a multidimensional dictionary
#
# CatzHoek

class DenominationsParser(HTMLParser.HTMLParser):
	def __init__(self):
		HTMLParser.HTMLParser.__init__(self)
		self.text = ""
		self.headings = []
		self.in_td = False
		self.skills_comming_up = False
		self.read_skills = False	
		# name attributes in the links <a name="skills"> etc. used to identify which section comes next
		self.names = ("skill","skillshort","teamskills","sponsors","FanMood","FanMatch","FanSeason","gentleness","honesty","aggressiveness","morale","confidence")
		self.commingup = None
		self.entries = {}
		self.strings = []
		self.even = True
		
	
	def handle_starttag(self, tag, attrs):
		# find out which section is next, <a name="" is our keyword
		if tag == 'a':
			for name, value in attrs:
				if name == 'name':
					if value in self.names:
						self.commingup = value
						self.entries[self.commingup] = {}
				
		if tag == 'td':
			self.in_td = True
			self.even = not self.even

	def handle_endtag(self, tag):
		#append gathered string to result
		if tag == 'td':
			self.in_td = False
			if self.even:
				self.entries[self.commingup]['names'] = self.strings
			else:
				self.entries[self.commingup]['description'] = self.strings
				
			self.strings = []

	def handle_data(self, data):
		#gather string
		if self.in_td:
			str = data.lstrip().rstrip()
			self.strings.append(str)

	def get(self):
		return self.entries
		

import urllib
def parsePages(subdomains):
	result = {}
	errors = []
	for subdomain in subdomains:
		url = "http://"+subdomain+".hattrick.org/Help/Rules/AppDenominations.aspx"
		try:
			print "Crawling ", url
			connection = urllib.urlopen(url)
		except:
			errors.append(subdomain)
			print "Couldn't connect to", url
			continue
		encoding = connection.headers.getparam('charset')
		page = unicode(connection.read().decode('utf-8'))
		page.encode('utf-8')
		denomParser = DenominationsParser()
		denomParser.feed(page)
		result[subdomain] = denomParser.get()
	return result, errors
		
