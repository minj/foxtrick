from __future__ import print_function
import sys
if sys.version > '3':
       import http.cookiejar as cookielib
else:
       import cookielib
import mechanize
import re
import getpass
import Language

class HattrickWeb:
	def __init__(self, user, pw, stage=False):
		self.username = user
		self.password = pw

		self.browser = None
		self.recommendedsubdomain = ""
		self.url = ""
		self.subdomain = ""
		self.body = ""
		self.stage = False
		self.loginSiteStage = "http://www.hattrick.org/Logout.aspx"
		self.loginSite = "http://stage.hattrick.org/Logout.aspx"
		
	def updateRecommendedUrl(self):
		pattern = re.search("(\w+).hattrick.org", self.url)
		if pattern:
			self.subdomain = pattern.group(1)
		else:
			self.subdomain = None;
		
	def encodeUTF8(self):
		self.body = self.body.decode('utf-8')
		#self.body = self.body.encode('utf-8')
	
	def isLoginRequired(self):
		form = self.browser.select_form(name="aspnetForm")
		try:
			self.browser.form['ctl00$ctl00$CPContent$ucSubMenu$ucLogin$txtPassword'] = self.username
		except:
			return False;

		return True
		
	def open(self, url):
		self.response = self.browser.open(url)
		self.body = self.response.get_data();
		self.url = self.response.geturl()
		self.encodeUTF8()

	def login(self):
		url = self.loginSite
		if self.stage:
			url = self.loginSiteStage

		cookie = cookielib.CookieJar()
		self.browser = mechanize.Browser()

		self.browser.set_cookiejar(cookie)
		self.browser.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)

		self.browser.open(url)

		self.browser.select_form(name="aspnetForm")
		
		try:
			self.browser.form['ctl00$ctl00$CPContent$ucSubMenu$ucLogin$txtUserName'] = self.username
			self.browser.form['ctl00$ctl00$CPContent$ucSubMenu$ucLogin$txtPassword'] = self.password
		except:
			print("Login form not found!")
			
		self.response = self.browser.submit(name='ctl00$ctl00$CPContent$ucSubMenu$ucLogin$butLogin')
		self.body = self.response.get_data()
		self.url = self.response.geturl()

		# now we should be logged in and on the site
		self.updateRecommendedUrl()
			
		self.encodeUTF8()
		
		if self.isLoginRequired():
			raise Exception('login_failed')

	def setFormValue(self, form, value):
		self.browser.select_form(name="aspnetForm")
		try:
			self.browser.form[form] = [  str(value)  ]
		except:
			raise Exception('Form "' + form + '" not found!');

		self.response = self.browser.submit()
		self.body = self.response.get_data()
		self.encodeUTF8()	
			
	def setLanguage(self, languageid):
		self.response = self.browser.open("/")
		print("Setting language to: " + str(languageid), Language.getLanguageById(languageid))
		self.setFormValue('ctl00$ctl00$CPContent$CPSidebar$ucLanguages$ddlLanguages', languageid)
