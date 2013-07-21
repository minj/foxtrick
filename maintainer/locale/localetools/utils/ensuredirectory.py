import os
def ensure(dir):
	if not os.path.exists(dir):
		os.makedirs(dir)
