#!/usr/bin/env python
from __future__ import print_function

import time, jwt, os, base64

from AMO.Credentials import JWT_ISSUER, JWT_SECRET

def make_token():
    now = int(time.time())
    payload = {
        'iss': JWT_ISSUER,
        'jti': base64.b64encode(os.urandom(32))[:-1].decode(),
        'iat': now,
        'exp': now + 60,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

if __name__ == '__main__':
    token = make_token()
    print(token.decode(), end='')
