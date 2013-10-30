import http.client, urllib.request, urllib.parse, urllib.error

class Crowdin:
	def __init__(self, project_identfier, project_key):
		self.masterFileName = "foxtrick.properties"
		self.identifier = project_identfier
		self.key = project_key
		self.baseUrl = "api.crowdin.net"

	def getStatus(self):
		params = urllib.parse.urlencode({'key': self.key})
		print(params)
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
		conn = http.client.HTTPConnection(self.baseUrl)
		conn.request("POST", "/api/project/" + self.identifier + "/status", params, headers)
		response = conn.getresponse()
		print(response.status, response.reason)
		data = response.read()
		print(data)
