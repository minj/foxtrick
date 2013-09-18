from Crawlers import EditorCrawler
import getpass

if __name__ == "__main__":
	user = raw_input("Login:");
	pw = getpass.getpass("Password:");
	EditorCrawler.run(user, pw);