#/Club/Players/?TeamID=818875

import html.parser
import re
# Parses chpp holders
# CatzHoek

class CHPPHolderParser(html.parser.HTMLParser):
	def __init__(self):
		html.parser.HTMLParser.__init__(self)
		self.users = []
		self.currentUser = {}
		self.currentUser['appNames'] = []
		self.currentAppname = ""
		#in relevant area?
		self.in_creator_paragraph = False;
		self.in_approvedApplications = False;
		self.in_approvedApplicationsSubDivCount = 0

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

		if tag == 'div':
			if self.in_approvedApplications:
				self.in_approvedApplicationsSubDivCount += 1
				if self.in_approvedApplicationsSubDivCount == 1:
					for name, value in attrs:
						if name == "title":
							self.currentAppname = value
							#print value.encode('utf-8')
				return

			for name, value in attrs:
				if name == 'id' and value == 'approvedApplications':		
					self.in_approvedApplications = True	


		
	def handle_endtag(self, tag):
		if tag == 'div' and self.in_approvedApplications:
			if self.in_approvedApplicationsSubDivCount == 0:
				self.in_approvedApplications = False
			else:
				self.in_approvedApplicationsSubDivCount -= 1		

		if tag == 'p':
			if self.in_creator_paragraph:
				found = False
				
				for u in self.users:
					if u['id'] == self.currentUser['id']:
						found = True
				if not found:
					self.currentUser["appNames"].append(self.currentAppname)
					self.users.append(self.currentUser)
				else:
					#print "already in there"
					for u in self.users:
						if u['id'] == self.currentUser['id']:
							u['appNames'].append(self.currentAppname)
				self.currentUser = {}
				self.currentUser['appNames'] = []
			self.in_creator_paragraph = False; #no nested divs in playerinfo, this is okay
			
			
	def get(self):
		for u in self.users:
			u['appNames'] = sorted(u['appNames'])
		return self.users
