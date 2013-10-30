import html.parser
import re
# Parses chpp holders
# CatzHoek

class EditorParser(html.parser.HTMLParser):
	def __init__(self):
		html.parser.HTMLParser.__init__(self)
		self.users = []
		self.currentUser = {}
		self.in_user_link = False

	def getUserIdFromUrl(self, url):
		pattern = re.compile("\/Club\/Manager\/\?userId=(\d+)")
		match = re.match(pattern, url)
		if match and match.group(1):
			return int(match.group(1))
		return None

	def handle_starttag(self, tag, attrs):
		if tag == 'a':
			self.in_user_link = False
			for name, value in attrs:
				if name == 'href':
					id = self.getUserIdFromUrl(value)
					if id:
						self.in_user_link = True
						self.currentUser["id"] = id;
				if name == 'title':
					if id:
						self.currentUser["name"] = value;

	def handle_endtag(self, tag):
		if tag == 'a' and self.in_user_link:
			if self.currentUser not in self.users:
				self.users.append(self.currentUser)
			self.currentUser = {}
			self.in_user_link = False
			
			
	def get(self):
		return self.users
