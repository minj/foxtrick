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
		self.in_span = False;
		self.ignore = False;
		self.string = "";
		
	def handle_starttag(self, tag, attrs):
		if tag == 'a' or tag == 'span':
			self.ignore = True;
		
		if tag == 'td':
			self.in_teamTextRatings_td = False
			for name, value in attrs:
				if name == 'class' and value == 'teamTextRatings':
					self.in_teamTextRatings_td = True
					
	def handle_endtag(self, tag):
		if tag == 'a' or tag == 'span':
			self.ignore = False;
			
		if tag == 'td':
			if self.in_teamTextRatings_td:
				if len(self.teamTextRatings["Team_Home"]) == len(self.teamTextRatings["Team_Away"]):
					self.teamTextRatings["Team_Home"].append(self.string)
				else:
					self.teamTextRatings["Team_Away"].append(self.string)
			
				self.string = "";

			self.in_teamTextRatings_td = False;
			
	def handle_data(self, data):
		data = data.lstrip().rstrip();
		if self.in_teamTextRatings_td and not self.ignore:
			self.string = self.string + data
			
	def get(self):
		return self.teamTextRatings