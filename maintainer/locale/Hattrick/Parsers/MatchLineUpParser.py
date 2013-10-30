import html.parser
import re
# Parses lineups to find abbreviations for positions
# Used to automatically validate htlang.xml
# 
# CatzHoek

class MatchLineUpParser(html.parser.HTMLParser):
	def __init__(self):
		html.parser.HTMLParser.__init__(self)
		self.players = []
		
		self.currentplayer = {}
		#doc position helpers
		self.in_player_div = False;
		self.in_player_name_div = False;
		self.in_player_position_div = False;
		self.nested = {}

	def getPlayerIdFromUrl(self, url):
		pattern = re.compile("\/Club\/Players\/Player.aspx\?PlayerID=(\d+)", re.I)
		match = re.match(pattern, url)
		if match and match.group(1):
			return match.group(1)
			
		raise Exception("no_player_link", url);
		
	def handle_starttag(self, tag, attrs):
		if tag == 'div':
			if self.in_player_div:
				self.nested['playerdiv'] += 1;
				
			for key, value in attrs:
				if key == 'id':
					pattern = re.compile("ctl00_ctl00_CPContent_CPMain_ucPlayer(\d+)_pnlbox")
					match = re.match(pattern, value)
					if match and match.group(1):
						self.in_player_div = True;
						self.nested['playerdiv'] = 0;
							
			if self.in_player_div:		
				if key == 'class' and value == 'name':
					self.in_player_name_div = True;
				elif key == 'class' and value == 'position':
					self.in_player_position_div = True;
						
		if tag == 'a' and self.in_player_name_div:
			for key, value in attrs:
				if key == 'title':
					self.currentplayer['name'] = value
				if key == 'href':
					try:
						self.currentplayer['id'] = self.getPlayerIdFromUrl(value)
					except Exception as e:
						print(e, value); 
						pass
						
	def handle_endtag(self, tag):
		if tag == 'div':
			self.in_player_name_div = False;
			self.in_player_position_div = False;
			if self.in_player_div:
				self.nested['playerdiv'] -= 1;
				if self.nested['playerdiv'] < 0:
					self.in_player_div = False;
					self.players.append(self.currentplayer);
					self.currentplayer = {}
		
	def handle_data(self, data):
		if self.in_player_position_div:
			self.currentplayer['position_abbr'] = data.lstrip().rstrip();
		
	def get(self):
		return self.players