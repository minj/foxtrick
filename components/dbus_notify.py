#!/usr/bin/env python
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# Copyright 2009 Abhishek Mukherjee <abhishek.mukher.g@gmail.com>
"""
addapted to show dbus alert for hattrick ticker (by convincedd)
"""

import os
import sys
import pynotify
import pygtk
pygtk.require('2.0')
import gtk
import logging
from subprocess import Popen, call

try:
    from gettext import gettext as _
except ImportError:
    _ = lambda x: unicode(x)


OPEN_COMMAND = "xdg-open"
BODY = _('%(title)s')


logging.basicConfig()
LOG = logging.getLogger(__name__)


class GalagoNotRunningException(Exception):

    """
    Could not find galago server or Galago server did not behave as expected
    """

    pass


if not pynotify.init("FirefoxNotify"):
    raise GalagoNotRunningException


POSSIBLE_ICON_NAMES = ('firefox', 'firefox-3.0', 'firefox-icon')

def get_icon():
    try:
        import xdg.IconTheme
    except ImportError:
        return POSSIBLE_ICON_NAMES[0]
    else:
        for name in POSSIBLE_ICON_NAMES:
            if xdg.IconTheme.getIconPath(name) is not None:
                return name
        return POSSIBLE_ICON_NAMES[0]


class FirefoxNotification(object):

    """
    Notification for a download complete from Firefox, essentially a wrapper
    around pynotify
    """

    def __init__(self, text, title):
        """Creates a Notification for Firefox"""
        self.title = title
        self.text = text
        self.location=''
        self.notif = None


    def show(self):
        """Displays a notification for firefox.
        """
        caps = pynotify.get_server_caps()
        if caps is None:
            raise GalagoNotRunningException

        body = BODY % {'title': self.text,
                       'location': self.location}
        self.notif = pynotify.Notification(self.title,
                                      body,
                                      get_icon(),
                                      )

        self.notif.connect('closed', self._cleanup)
        self.notif.set_hint_string("category", "transfer.complete")
        # Note: This won't work until we get the pynotify instance to be
        # static through calls
        self.notif.set_hint_string("x-canonical-append", "allowed")


        LOG.info(_("Displaying notification"))
        if not self.notif.show():
            raise GalagoNotRunningException(_("Could not display notification"))

    def _cleanup(self, notif=None, reason=None):
        """
        Clean up the notification
        """
        assert notif is None or notif == self.notif
        LOG.info(_("Closing"))

def main(argv):
    """Opens a notification in firefox

    sys.argv[1] should be the title and sys.argv[2] should be the location

    """
    if len(argv) != 3:
        LOG.critical(_("Invalid number of arguments called"))
        return 1
    notify = FirefoxNotification(argv[1], argv[2])
    notify.show()
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
