import cgi
import os
import urllib

from google.appengine.api import urlfetch 
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from django.utils import simplejson
import xml.dom.minidom
import freebase

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, {}))
        
class LookupHandler(webapp.RequestHandler):
    def get(self):
        # Get username
        username = self.request.get("username")
        # Get top 50 albums from last.fm
        lastFMurl = 'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&' + urllib.urlencode({'user':username}) + '&api_key=b25b959554ed76058ac220b7b2e0a026'        
        lastFMresponse = urlfetch.fetch(lastFMurl)
        lastFMdom = xml.dom.minidom.parseString(lastFMresponse.content)
        
        # If username not found, return error message
        if len(lastFMdom.getElementsByTagName('artist')) == 0:
            self.response.out.write(simplejson.dumps({'failure':'No Last.FM user by the username:' + cgi.escape(username)}))
            return
        
        # Get the list of artists
        names = []
        for artist in lastFMdom.getElementsByTagName('artist'):
            names.append(artist.getElementsByTagName('name')[0].childNodes[0].data.encode('ascii', 'ignore'))
        # Fidn artist by name in metabase
        mqlQuery = [{'type' : '/music/artist', "/common/topic/image":[{"id":None,"limit":1}],'name':None, 'name|=' : names, "origin": [{"name":None, "geolocation":[{"latitude":None, "longitude":None}]}]}]
        mqlResult = freebase.mqlread(mqlQuery)
        self.response.out.write(simplejson.dumps(mqlResult))

apps_binding = []
apps_binding.append(('/', MainPage))
apps_binding.append(('/lookup', LookupHandler))
application = webapp.WSGIApplication(apps_binding, debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()