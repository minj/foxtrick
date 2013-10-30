import sys
if sys.version > '3':
       import html.parser as HTMLParser
else:
       import HTMLParser

import re
HTMLParser.attrfind = re.compile(r'\s*([a-zA-Z_][-.:a-zA-Z_0-9]*)(\s*=\s*'
r'(\'[^\']*\'|"[^"]*"|[-a-zA-Z0-9./,:;+*%?!&$\(\)_#=~@]*))?')

# Parses Player detail page
# Currently used as tool to automatically validate htlang.xml
# 
# CatzHoek

class PlayerDetailParser(HTMLParser.HTMLParser):
	def __init__(self):
		HTMLParser.HTMLParser.__init__(self)
		self.entries = []
		self.even = True;
		self.in_player_info_table = False;
		self.in_player_info_div = False;
		self.in_player_info_tr = False;
		self.in_player_info_td = False;
		self.str = "";
		
	def handle_starttag(self, tag, attrs):
		if tag == 'div':
			self.in_teamTextRatings_td = False
			for name, value in attrs:
				if name == 'id' and value == 'ctl00_ctl00_CPContent_CPMain_pnlplayerInfo':
					self.in_player_info_div = True;
					
		if tag == 'table' and self.in_player_info_div:
			self.in_player_info_table = True;
			
		if tag == 'tr' and self.in_player_info_table:
			self.in_player_info_tr = True;
			
		if tag == 'td' and self.in_player_info_tr:
			self.in_player_info_td = True;
			self.str = "";
			
	def handle_endtag(self, tag):
		if tag == 'div':
			self.in_player_info_div = False;
		
		if tag == 'table':
			self.in_player_info_table = False;
			
		if tag == 'tr' and self.in_player_info_table:
			self.in_player_info_tr = False;
			
		if tag == 'td':
			if self.in_player_info_td:
				self.even = not self.even;
				if self.even:
					self.entries.append( self.str.lstrip().rstrip() )
				
			self.in_player_info_td = False;
			
	def handle_data(self, data):
		data = data.lstrip().rstrip();
		if self.in_player_info_td:
			self.str = self.str + data
			
	def get(self):
		return self.entries
