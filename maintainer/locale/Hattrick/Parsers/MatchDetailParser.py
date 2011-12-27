import HTMLParser

# Parses Match detail page
# Currently used as tool to automatically validate htlang.xml
# 
# CatzHoek

class MatchDetailParser(HTMLParser.HTMLParser):
	def __init__(self):
		HTMLParser.HTMLParser.__init__(self)
		self.teamTextRatings = {"Team_Home":[],"Team_Away":[]}
		self.in_teamTextRatings_td = False
		self.in_link = False;
		
	def handle_starttag(self, tag, attrs):
		if tag == 'a':
			self.in_link = True;
		
		if tag == 'td':
			self.in_teamTextRatings_td = False
			for name, value in attrs:
				if name == 'class' and value == 'teamTextRatings':
					self.in_teamTextRatings_td = True
					
	def handle_endtag(self, tag):
		
		if tag == 'a':
			self.in_link = False;
			
		if tag == 'td':
			self.in_teamTextRatings_td = False;

	def handle_data(self, data):
		data = data.lstrip().rstrip();
		if self.in_teamTextRatings_td and not self.in_link:
			if len(self.teamTextRatings["Team_Home"]) == len(self.teamTextRatings["Team_Away"]):
				self.teamTextRatings["Team_Home"].append(data)
			else:
				self.teamTextRatings["Team_Away"].append(data)
			
	def get(self):
		return self.teamTextRatings