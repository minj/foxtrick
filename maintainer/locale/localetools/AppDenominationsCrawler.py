import HTMLParser

class DenominationsParser(HTMLParser.HTMLParser):
	def __init__(self):
		HTMLParser.HTMLParser.__init__(self)
		self.text = ""
		self.headings = []
		self.in_a = False
		self.in_td = False
		self.skills_comming_up = False
		self.read_skills = False		
		self.names = ("skill","skillshort","teamskills","sponsors","FanMood","FanMatch","FanSeason","gentleness","honesty","aggressiveness","morale","confidence")
		self.commingup = None
		self.entries = {}
		self.strings = []
		self.even = True
		
	def handle_starttag(self, tag, attrs):
		if tag == 'a':
			self.in_a = True
			for name, value in attrs:
				if name == 'name':
					if value in self.names:
						self.commingup = value
						self.entries[self.commingup] = {}
						
		if tag == 'td':
			self.in_td = True
			self.even = not self.even

	def handle_endtag(self, tag):
		if tag == 'a':
			self.in_a = False
			
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
def parsePages(sites):
	result = {}
	errors = []
	for site in sites:
		url = "http://"+site+".hattrick.org/Help/Rules/AppDenominations.aspx"
		try:
			print "Crawling ", url
			connection = urllib.urlopen(url)
		except:
			errors.append(site)
			print "Couldn't connect to", url
			continue
		encoding = connection.headers.getparam('charset')
		page = unicode(connection.read().decode('utf-8'))
		page.encode('utf-8')
		denomParser = DenominationsParser()
		denomParser.feed(page)
		result[site] = denomParser.get()
	return result, errors
		
