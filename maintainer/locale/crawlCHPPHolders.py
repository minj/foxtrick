from Crawlers import ChppHolderCrawler
import getpass

if __name__ == "__main__":
	user = input("Login:");
	pw = getpass.getpass("Password:");
	ChppHolderCrawler.run(user, pw);
