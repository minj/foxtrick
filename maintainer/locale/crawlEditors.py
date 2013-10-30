from Crawlers import EditorCrawler
import getpass

try:
	input = raw_input
except NameError:
	pass

if __name__ == "__main__":
	user = input("Login:");
	pw = getpass.getpass("Password:");
	EditorCrawler.run(user, pw);
