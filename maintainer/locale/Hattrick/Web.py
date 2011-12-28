import urllib
import cookielib
import mechanize
import re

LanguageCodes = {}	
LanguageCodes['1']='se';	
LanguageCodes['2']='en';
LanguageCodes['3']='de';
LanguageCodes['4']='it';
LanguageCodes['5']='fr';
LanguageCodes['6']='es';
LanguageCodes['7']='no';
LanguageCodes['8']='dk';
LanguageCodes['9']='fi';
LanguageCodes['10']='nl';
LanguageCodes['11']='pt';
LanguageCodes['13']='pl';
LanguageCodes['14']='ru';
LanguageCodes['15']='zh_CN';
LanguageCodes['19']='tr';
LanguageCodes['23']='ro';
LanguageCodes['32']='sr';
LanguageCodes['33']='hu';
LanguageCodes['34']='gr';
LanguageCodes['35']='cz';
LanguageCodes['36']='ee';
LanguageCodes['37']='lv';
LanguageCodes['39']='hr';
LanguageCodes['40']='he_IL';
LanguageCodes['43']='bg';
LanguageCodes['45']='sl';
LanguageCodes['50']='pt_BR';
LanguageCodes['51']='es_SU';
LanguageCodes['53']='sk';
LanguageCodes['55']='vi';
LanguageCodes['56']='lt';
LanguageCodes['57']='ua';
LanguageCodes['58']='bs';
LanguageCodes['65']='nl_BE';
LanguageCodes['66']='ca';
LanguageCodes['74']='gl_ES';
LanguageCodes['75']='fa';
LanguageCodes['83']='mk';
LanguageCodes['85']='sq';
LanguageCodes['103']='es_ca';
LanguageCodes['109']='fy';
LanguageCodes['110']='eu_ES';
LanguageCodes['111']='lb_LU';
LanguageCodes['113']='fur';

# LanguageCodes['90']='Georgian';
# LanguageCodes['86']='Kyrgyz';
# LanguageCodes['84']='Belarusian';
# LanguageCodes['17']='korean';
# LanguageCodes['12']='japan';
	
class HattrickWeb:
	def __init__(self, username, password):
		self.username = username
		self.password = password
		self.browser = None
		self.recommendedsubdomain = ""
		self.url = ""
		self.subdomain = ""
		self.body = ""
		
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