import html.parser

# Parses Match detail page
# Currently used as tool to automatically validate htlang.xml
# 
# CatzHoek

class MatchDetailParser(html.parser.HTMLParser):
	def __init__(self):
		html.parser.HTMLParser.__init__(self)
		self.teamTextRatings = {"Team_Home":[],"Team_Away":[]}
		self.unclassedRatings = {"Team_Home":[],"Team_Away":[]}
		self.in_teamTextRatings_td = False
		self.in_link = False;
		self.in_span = False;
		self.ignore = False;
		self.string = "";
		self.in_ratings_div = False;
		self.in_ratings_table = False;
		
		self.in_unclassed_td = False;
		self.first_td = False;
		
	def handle_starttag(self, tag, attrs):
		if tag == 'tr':
			self.first_td = True;
			
		if tag == 'div':
			for name, value in attrs:
				if name == 'id' and value == 'ctl00_ctl00_CPContent_CPMain_ucMatchRating_pnlToggleRatings':
					self.in_ratings_div = True
					
		if tag == 'table':
			if self.in_ratings_div:
				self.in_ratings_table = True;
					
		if tag == 'a' or tag == 'span':
			self.ignore = True;
		
		if tag == 'td':
			self.in_teamTextRatings_td = False
			self.in_unclassed_td = False;
			for name, value in attrs:
				if name == 'class' and value == 'teamTextRatings':
					self.in_teamTextRatings_td = True
				
			#not a ratings entry, save those for tactics
			if self.first_td:
				self.first_td = False;
				return;
	
			has_class = False;
			for name, value in attrs:
				if name == 'class':
					has_class = True;
					
			if not has_class:
				self.in_unclassed_td = True;
					
	def handle_endtag(self, tag):
		if tag == 'a' or tag == 'span':
			self.ignore = False;
			
		if tag == 'table':
			self.in_ratings_table = False;
			self.in_ratings_div = False;
			
		if tag == 'td':
			if self.in_teamTextRatings_td:
				if len(self.teamTextRatings["Team_Home"]) == len(self.teamTextRatings["Team_Away"]):
					self.teamTextRatings["Team_Home"].append(self.string)
				else:
					self.teamTextRatings["Team_Away"].append(self.string)
			
				self.string = "";
				
			if self.in_unclassed_td and self.in_ratings_table:
				if len(self.unclassedRatings["Team_Home"]) == len(self.unclassedRatings["Team_Away"]):
					self.unclassedRatings["Team_Home"].append(self.string)
				else:
					self.unclassedRatings["Team_Away"].append(self.string)
				
				self.string = "";

			self.in_unclassed_td = False;
			self.in_teamTextRatings_td = False;
			
	def handle_data(self, data):
		data = data.lstrip().rstrip();
		if self.in_teamTextRatings_td and not self.ignore:
			self.string = self.string + data
			
		if self.in_unclassed_td and self.in_ratings_table:
			self.string = self.string + data
			
	def get(self):
		return {"textRatings":self.teamTextRatings, "unclassedRatings":self.unclassedRatings}
