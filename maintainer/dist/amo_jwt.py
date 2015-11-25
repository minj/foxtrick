#!/usr/bin/env python
from __future__ import print_function

import time, random, jwt

from AMO.Credentials import JWT_ISSUER, JWT_SECRET

def make_token():
    now = int(time.time())
    payload = {
        'iss': JWT_ISSUER,
        'jti': str(random.random()),
        'iat': now,
        'exp': now + 60,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

if __name__ == '__main__':
    token = make_token()
    print(token.decode(), end='')
