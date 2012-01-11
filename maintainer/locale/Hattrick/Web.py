import urllib
import cookielib
import mechanize
import re

class HattrickWeb:
	def __init__(self, username, password, stage=False):
		self.username = username
		self.password = password
		self.browser = None
		self.recommendedsubdomain = ""
		self.url = ""
		self.subdomain = ""
		self.body = ""
		self.stage = stage
		
	def updateRecommendedUrl(self):
		pattern = re.search("(\w+).hattrick.org", self.url)
		if pattern:
			self.subdomain = pattern.group(1)
		else:
			self.subdomain = None;
		
	def encodeUTF8(self):
		self.body = unicode(self.body.decode('utf-8'))
		#self.body = self.body.encode('utf-8')
	
	def isLoginRequired(self):
		self.browser.select_form(name="aspnetForm")
		try:
			self.browser.form['ctl00$CPHeader$ucLogin$txtUserName'] = self.username
		except:
			try:
				self.browser.form['ctl00$ctl00$CPContent$ucSubMenu$ucLogin$txtUserName'] = self.username
			except:
				return False
			
			return True;
		else:
			return True;
		
	def open(self, url):
		self.response = self.browser.open(url)
		self.body = self.response.get_data();
		self.url = self.response.geturl()
		self.encodeUTF8()
		
	def login(self):
		url = "http://www.hattrick.org/"
		if self.stage:
			url = "http://stage.hattrick.org/"

		cookie = cookielib.CookieJar()
		self.browser = mechanize.Browser()

		self.browser.set_cookiejar(cookie)
		self.browser.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)

		self.browser.open(url)
		self.browser.select_form(name="aspnetForm")
		
		try:
			self.browser.form['ctl00$CPHeader$ucLogin$txtUserName'] = self.username
			self.browser.form['ctl00$CPHeader$ucLogin$txtPassword'] = self.password
		except:
			pass #already logged in
			
		self.response = self.browser.submit()
		self.body = self.response.get_data()
		self.url = self.response.geturl()
		
		# now we should be logged in and on the site
		self.updateRecommendedUrl()
			
		self.encodeUTF8()
		
		if self.isLoginRequired():
			raise Exception('login_failed')
		else:
			print 'Logged in!'

			
	def setLanguage(self, languageid):
		self.response = self.browser.open("/")
		self.browser.select_form(name="aspnetForm")
		
		try:
			self.browser.form['ctl00$ctl00$CPContent$CPSidebar$ucLanguages$ddlLanguages'] = [  str(languageid)  ]
		except:
			print 'Unable to find language change select, not logged in?'
			
		self.response = self.browser.submit()
		self.body = self.response.get_data()
		self.encodeUTF8()