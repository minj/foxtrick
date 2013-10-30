from Crawlers import ChppHolderCrawler
import getpass

try:
	input = raw_input
except NameError:
	pass

if __name__ == "__main__":
	user = input("Login:");
	pw = getpass.getpass("Password:");
	ChppHolderCrawler.run(user, pw);
