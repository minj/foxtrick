import html.parser

# Crawls the entries from the AppDenominations.aspx page from Hattrick into a multidimensional dictionary
#
# CatzHoek
						
class DenominationsParser(html.parser.HTMLParser):
	def __init__(self):
		html.parser.HTMLParser.__init__(self)
		self.in_td = False
		self.in_main_body = False
		# name attributes in the links <a name="skills"> etc. used to identify which section comes next
		self.validCategories = ("skill","skillshort","teamskills","sponsors","FanMood","FanMatch","FanSeason","gentleness","honesty","aggressiveness","morale","confidence")
		self.currentCategory = None
		self.entries = {}
		self.even = False
	
	def handle_starttag(self, tag, attrs):
		#shop popup before actual page, make sure we're past that part
		if tag == 'div':
			for name, value in attrs:
				if name == 'id':
					if value == 'mainBody':
						self.in_main_body = True

		if not self.in_main_body:
			return

		# find out which section is next, <a name="" is our keyword
		if tag == 'a':
			for name, value in attrs:
				if name == 'name':
					if value in self.validCategories:
						self.currentCategory = value
						self.entries[self.currentCategory] = []
					else:
						self.currentCategory = None

		if tag == 'td':
			self.in_td = True
			self.even = not self.even			

	def handle_endtag(self, tag):
		if not self.in_main_body:
			return

		if tag == 'td':
			self.in_td = False

	def handle_data(self, data):
		if not self.in_main_body:
			return

		#gather string
		if self.in_td:
			if self.currentCategory:
				if not self.even:
					self.entries[self.currentCategory].append(data.lstrip().rstrip())

	def get(self):
		return self.entries