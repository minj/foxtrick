#rauth
from rauth import OAuth1Session
from rauth import OAuth1Service
from rauth.oauth import HmacSha1Signature
from rauth.utils import parse_utf8_qsl
from rauth.service import process_token_request
from requests.exceptions import HTTPError

class ChppNotAuthorized(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)

class ChppOAuth1Service(OAuth1Service):
    def __init__(self, customer_key, customer_secret):
        OAuth1Service.__init__(self, consumer_key=customer_key,
            consumer_secret=customer_secret,
            request_token_url='https://chpp.hattrick.org/oauth/request_token.ashx',
            access_token_url='https://chpp.hattrick.org/oauth/access_token.ashx',
            authorize_url='https://chpp.hattrick.org/oauth/authorize.aspx',
            base_url='http://chpp.hattrick.org/chppxml.ashx',
            signature_obj=HmacSha1Signature)

    def _get_request_token(self,
                          method='GET',
                          decoder=parse_utf8_qsl,
                          key_token='oauth_token',
                          key_token_secret='oauth_token_secret',
                          **kwargs):

        r = super(ChppOAuth1Service, self).get_raw_request_token(method=method, **kwargs)

        if r.status_code == 401:
            raise ChppNotAuthorized('NotAuthorized: Invalid consumer credentials')
        else:
             r.raise_for_status()

        request_token, request_token_secret = process_token_request(r, decoder, key_token, key_token_secret)
        return request_token, request_token_secret

    def get_request_token(self, params):
        return self._get_request_token(params=params)

    def _get_access_token(self,
                         request_token,
                         request_token_secret,
                         method='GET',
                         decoder=parse_utf8_qsl,
                         key_token='oauth_token',
                         key_token_secret='oauth_token_secret',
                         **kwargs):

        r = super(ChppOAuth1Service, self).get_raw_access_token(request_token,
                                      request_token_secret,
                                      method=method,
                                      **kwargs)

        if r.status_code == 401:
            raise ChppNotAuthorized('NotAuthorized: Invalid verifier')
        else:
             r.raise_for_status()

        #added since the original impl didn't raise on errors that would break the decoder
        access_token, access_token_secret = \
            process_token_request(r, decoder, key_token, key_token_secret)
        return access_token, access_token_secret

    def get_access_token(self, request_token, request_token_secret, params):
        return self._get_access_token(request_token, request_token_secret, params=params)

class ChppClient():
    def __init__(self, consumer_key, consumer_secret):
        self.chppService = ChppOAuth1Service(consumer_key, consumer_secret)
        self.chppSession = None
        self.requestToken = None
        self.accessToken = None

    def getRequestToken(self, params={'oauth_callback': 'oob'}):
        return self.chppService.get_request_token(params=params)

    def _getAuthorizeUrl(self, request_token):
        authorize_url = self.chppService.get_authorize_url(request_token)
        return authorize_url

    def getAuthorizeUrl(self):
        self.requestToken = self.getRequestToken(params={'oauth_callback': 'oob'})
        return self._getAuthorizeUrl(self.requestToken[0])

    def getAccessToken(self, verifier):
        accessToken = self.chppService.get_access_token(self.requestToken[0], self.requestToken[1], params={'oauth_verifier': verifier})
        self.setAccessToken(accessToken)    
        return self.accessToken

    def setAccessToken(self, accessToken):
        self.accessToken = accessToken

    def getSession(self):
        self.chppSession = self.chppService.get_session(token=self.accessToken)
        return self.chppSession

    def getFile(self, file=None, params={}):
        if self.chppSession is None:
            self.getSession()

        if 'file' not in params:
            if file is not None:
                params['file'] = file
            else:
                raise ChppNoFileSpecified('No file specified')

        r = self.chppSession.get('', params=params)

        if r.status_code == 401:
            raise ChppNotAuthorized('NotAuthorized: Invalid verifier')
        else:
             r.raise_for_status()

        return r
