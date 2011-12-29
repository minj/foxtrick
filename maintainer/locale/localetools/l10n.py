#for the case this will be changed in the future 
g_translationFile = "foxtrick.properties"
g_localDir = "locale"

import fileinput
import os
import localetools.utils.convertLineIndex

#convert CR LF windows style newline back to unix sytle
def convertCRLFtoLF(filename):
	try:
		data = open(filename, "rb").read()	
	except Exception as inst:
		print inst.args[0]
		return
	
	newdata = data.replace("\r\n", "\n")
	if newdata != data:
		f = open(filename, "wb")
		f.write(newdata)
		f.close()		
		return 1
		
	f.close()
	return 0
			
#one simple tuple connecting a key and a value
#it also knows in which line it was found when it was read
class Translation:
	"""Represents a Foxtrick localization pair"""
	def __init__(self, line, key, value):
		self.key = key
		self.value = value
		self.line = line
		
	def getLine(self):
		return self.line
		
	def getKey(self):
		return self.key
		
	def getValue(self):
		return self.value
		
import os		
class foxtrickLocalization:
	"""Interface for Localization"""
	def __init__(self, rel_path_to_content_dir):		
		self.locales = []
		
	    #load the master
		try:
			filelocation = os.path.join(rel_path_to_content_dir, g_translationFile)
			self.master = L10N("Master", filelocation, None)		
		except Exception as inst:
			print inst.args[0]     # arguments stored in .args			
		
		#then all others
		try:
			localesdirectorylocation =  os.path.join(rel_path_to_content_dir, g_localDir)
			for localedir in os.listdir(localesdirectorylocation):
				#skip directorys starting with ., like .svn
				if localedir[0] == ".":		
					continue
					
				localpropertyfile = os.path.join(localesdirectorylocation, localedir, g_translationFile)
				if os.path.isfile(localpropertyfile):
					try:
						locale = L10N(localedir, localpropertyfile, self.master)
						self.locales.append(locale)
					except Exception as inst:
						print inst.args[0]     # arguments stored in .args
		except:
			print 'shit'
			
	def getMaster(self):
		return self.master
		
	def get(self, search):
		if search.lower() == "master":
			return self.master
		else:
			for loc in self.locales:
				if loc.getShortName() == search:
					return loc
			
		return None
					
	def getAll(self):
		return self.locales
		
	def getProgress(self):
		masterentries = self.master.getTranslationCount()
		progress_sum = 0
		for loc in self.locales:
			progress_sum += loc.getProgress()
			
		try:
			return float(progress_sum) / float(len(self.locales))
		except ZeroDivisionError as detail:
			return 0.0
			
	def getStatus(self):
		status = {}
		for loc in self.locales:
			status[loc.getShortName()] = loc.getStatus()
			
		return status
			
		
	
#a localization file, no comments considered
class L10N:
	"""A Foxtrick localization in Python"""
	def __init__(self, name, file, master):
		#init vars
		self.master = master
		
		self.file = file		#filename for later use, mayb when deleting shit
		self.translations = []	#translations in this locale
		self.missing = []		#missing translations
		self.Abandoned = []		#undelete artifacts from former times
		self.duplicates = []    #duplicates
		
		self.validated = 0		#did we validate already
		self.shortName = name
		
		self.chaos = 0.0			#a percentage value of how well adjusted translations are compared to the master
		
		if os.path.exists(file):
			#read from file
			for (linecounter, o_line) in enumerate(fileinput.input([file]), start=1):
				#remove trailing and leading whitespaces
				e_line = o_line.lstrip()
				e_line = e_line.rstrip()
				if len(e_line) != 0:
					if e_line[0] != '#':
						partitionated = e_line.partition("=")
						if partitionated[1] is "=":
							entry = Translation(linecounter, partitionated[0].lstrip().rstrip(), partitionated[2])
							self.translations.append(entry)
					
			fileinput.close();
		else:
			self.file = None
			if name.lower() == "master":
				raise Exception(name + '-localization file \'' + file +  '\' does not exist!')

	def getTranslationCount(self):
		return len(self.translations)
		
	#ignore case and allow spaces ... keys are stored l and r striped on safe
	def hasTranslation(self, wantedkey):
		for translation in self.translations:
			if translation.getKey().lower() == wantedkey.lower().lstrip().rstrip(): 
				return 1			
		return 0
	
	#ignore case and allow spaces ... keys are stored l and r striped on safe
	def getTranslation(self, wantedkey):
		for translation in self.translations:
			if translation.getKey().lower() == wantedkey.lower().lstrip().rstrip():
				return translation
				
		return None
		
	def getTranslations(self):
		return self.translations
		
	def getShortName(self):
		return self.shortName
		
	def getChaos(self):
		self.validate()
		return self.chaos
		
	def isFilePresent(self):
		return self.file
		
	def invalidate(self):
		self.validated = False;
		
	def validate(self):
		if self.validated:
			return False
			
		print self.getShortName() + ': First access -> validating ...' 
			
		#locale file does not exist, no need to waste time
		if not self.isFilePresent():
			self.validated = 1
			return False
			
		# find Abandoned entries not present in master file
		for translation in self.translations:
			if not self.master.hasTranslation( translation.getKey() ):
				self.Abandoned.append(translation)
		
		#find missing	
		for masterTranslation in self.master.getTranslations():
			if not self.hasTranslation( masterTranslation.getKey() ):
				self.missing.append( masterTranslation )
		
		#compute chaos
		correct = 0
		offset = 0
		for translation in self.translations:
			l_line = translation.getLine()
			mtrans = self.master.getTranslation(translation.getKey())
			if mtrans:
				if l_line == mtrans.getLine():
					correct += 1
					offset = 0
				elif  l_line == mtrans.getLine() + offset:
					correct += 1
				else:
					offset = l_line - mtrans.getLine();
	
		try:
			self.chaos = 100*(1.0-float(correct)/float(self.getTranslationCount()))
		except ZeroDivisionError as detail:
			self.chaos = 0
			
		#duplicates
		for translation in self.translations:
			for compare in self.translations:
				if translation.getKey() == compare.getKey():
					if translation.getLine() is not compare.getLine():
						self.duplicates.append(translation)
				
		self.validated = 1
		
		#return true if validation was executed
		return 1
	
	def getChaos(self):
		self.validate()
		return self.chaos
		
	def getDuplicates(self):
		self.validate()
		return self.duplicates
		
	#returns the actual number of duplicates
	#getDuplicates returns all entries, including the "correct" occurance
	#that way getDuplicates returns 2 entries when a translation is found twice
	def getDuplicateCount(self):
		got = []
		self.validate()
		for dup in self.duplicates:
			if dup.getKey() not in got:
				got.append(dup.getKey())
		return len(self.duplicates)-len(got)
		
	def getProgress(self):
		self.validate()
		done = len(self.translations) - len(self.Abandoned) - self.getDuplicateCount()
		
		try:
			return 100* float(done) / float(len(self.master.getTranslations())) 
		except ZeroDivisionError as detail:
			return 0.0
	
	def getAbandoned(self):
		self.validate()
		return self.Abandoned
	
	def getMissing(self):
		self.validate()
		return self.missing
		
	def getAbandonedCount(self):
		self.validate()
		return len(self.Abandoned)
	
	def getMissingCount(self):
		self.validate()
		return len(self.missing)
		
	#this is ugly but it does the job
	def deleteAbandoned(self):
		self.validate()
		
		if not self.file:
			return 0
	#read file
		try:
			fin = open( self.file, "r" )
		except IOError as (errno, strerror):
			#print self.getShortName() + ": I/O error({0}): {1}".format(errno, strerror)
			return 0
			
		data_list = fin.readlines()
		fin.close()
		
	#delete from list
		print "deleting",self.getAbandonedCount(),"abandoned values"
		for Abandoned in self.Abandoned:
			trans = self.getTranslation( Abandoned.getKey() )
			if trans:
				#convertLineToIndex = line - 1
				entryindex = localetools.utils.convertLineIndex.convertLineToIndex(trans.getLine())
				data_list[entryindex]="\n"
				
	#write back to file
		fout = open( self.file, "w" )
		fout.writelines(data_list)
		fout.close()	

	#validation is no longer correct
		self.invalidate()
	
	#convert cr lf to lf
		if convertCRLFtoLF(self.file):
			return self.getAbandonedCount()

		return 0
	
	def printStatus(self):
		self.validate()
		print 'Status for: ' + str(self.getShortName())
		print "\t" + str(self.getProgress())[:5] + "% done"
		print "\t" + str(self.getTranslationCount() - self.getAbandonedCount()) + " / " + str(self.master.getTranslationCount()) +" translated"
		print "\t" + str(self.getTranslationCount()) + " entries"
		print "\t" + str(self.getMissingCount()) + " missing"
		print "\t" + str(self.getAbandonedCount()) + " abandoned"
		print "\t" + str(self.getDuplicateCount()) + " duplicates"
		print "\t" + str(self.getChaos())[:5] + "% chaos"
	
	def getStatus(self):
		self.validate()
		dict = {}
		dict["locale"] = self.getShortName()
		dict["progress"] = self.getProgress()
		dict["entries"] = self.getTranslationCount()
		dict["translated"] = self.getTranslationCount() - self.getAbandonedCount() - self.getDuplicateCount()
		dict["missing"] = self.getMissingCount()
		dict["abandoned"] = self.getAbandonedCount()
		dict["chaos"] = self.getChaos()
		dict["duplicates"] = self.getDuplicateCount()
		
		return dict