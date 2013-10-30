#/Club/Players/?TeamID=818875

import html.parser
import re
# Parses menu links from hattrick sourcecode.
# Used to automatically validate htlang.xml
# 
# CatzHoek

class PlayerPageParser(html.parser.HTMLParser):
	def __init__(self):
		html.parser.HTMLParser.__init__(self)
		self.players = []
		
		self.currentPlayer = {}
		#document location identification helpers
		self.in_playerInfo_div = False;
		self.in_position_span = False;
		
	def getPlayerIdFromUrl(self, url):
		pattern = re.compile("\/Club\/Players\/Player.aspx\?(.*)PlayerID=(\d+)", re.I)
		match = re.match(pattern, url)
		if match and match.group(2):
			return match.group(2)
			
		raise Exception("no_player_link", url);
		
	def handle_starttag(self, tag, attrs):
		if tag == 'div':
			for key, value in attrs:
				if key == 'class' and value == 'playerInfo':
					self.in_playerInfo_div = True;
				
		if tag == 'a' and self.in_playerInfo_div:
			for key, value in attrs:
				if key == 'title':
					self.currentPlayer["name"] = value
				if key == 'href':
					try:
						id = self.getPlayerIdFromUrl( value )
						self.currentPlayer["id"] = id
					except Exception:
						pass
					
		if tag == 'span' and self.in_playerInfo_div:
			for key, value in attrs:
				if key == 'class' and value == 'shy':
					self.in_position_span = True;
					
		
	def handle_endtag(self, tag):
		if tag == 'div':
			if self.in_playerInfo_div:
				self.players.append(self.currentPlayer)
				self.currentPlayer = {}
				self.currentPlayer['lastposition'] = '';
			self.in_playerInfo_div = False; #no nested divs in playerinfo, this is okay
			
		if tag == 'span': # no nested spans in position span, this is okay
			self.in_position_span = False;
			
	def handle_data(self, data):
		if self.in_position_span:
			pattern = re.compile('\((.*)\)')
			match = re.match(pattern, data)
			if match and match.group(1):
				self.currentPlayer["lastposition"] = match.group(1)
			
	def get(self):
		return self.players