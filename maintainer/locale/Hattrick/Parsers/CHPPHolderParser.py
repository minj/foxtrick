#/Club/Players/?TeamID=818875

import HTMLParser
import re
# Parses chpp holders
# CatzHoek

class CHPPHolderParser(HTMLParser.HTMLParser):
	def __init__(self):
		HTMLParser.HTMLParser.__init__(self)
		self.users = []
		self.currentUser = {}

		#in relevant area?
		self.in_creator_paragraph = False;

	def getUserIdFromUrl(self, url):
		pattern = re.compile("\/Club\/Manager\/\?userId=(\d+)")
		match = re.match(pattern, url)
		if match and match.group(1):
			return int(match.group(1))

	def handle_starttag(self, tag, attrs):
		if tag == 'p':
			for name, value in attrs:
				if name == 'id' and value == 'creator':
					self.in_creator_paragraph = True;


		if tag == 'a' and self.in_creator_paragraph:
			for key, value in attrs:
				if key == 'title':
					self.currentUser["name"] = value
				if key == 'href':
					try:
						id = self.getUserIdFromUrl( value )
						self.currentUser["id"] = id
					except Exception:
						pass

		
	def handle_endtag(self, tag):
		if tag == 'div':
			if self.in_creator_paragraph:
				if self.currentUser not in self.users:
					self.users.append(self.currentUser)
				self.currentUser = {}
			self.in_creator_paragraph = False; #no nested divs in playerinfo, this is okay
			
			
	def get(self):
		return self.users