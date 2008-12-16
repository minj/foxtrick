//
//  $Id$
//
//  Copyright 2007 The Growl Project. All rights reserved.
//
// This file is under the BSD License, refer to license.txt for details

////////////////////////////////////////////////////////////////////////////////
//// Constants

const nsISupports = Components.interfaces.nsISupports;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsIObserver = Components.interfaces.nsIObserver;
const nsICategoryManager = Components.interfaces.nsICategoryManager;
const nsIObserverService = Components.interfaces.nsIObserverService;
const grINotificationsList = Components.interfaces.grINotificationsList;

const CLASS_ID = Components.ID("6025df48-53f0-11dc-8314-0800200c9a66");
const CLASS_NAME = "FoxtrickGrowlNotificator";
const CONTRACT_ID = "@foxtrick/notifications;1";

////////////////////////////////////////////////////////////////////////////////
//// Implementation

function foxtrickGrowlNotifications()
{
  this.mObserverService = Components.classes["@mozilla.org/observer-service;1"]
                                    .getService(nsIObserverService);

  this.mObserverService.addObserver(this, "before-growl-registration", false);
}

foxtrickGrowlNotifications.prototype = {
  // nsIObserver
  observe: function observer(aSubject, aTopic, aData)
  {
    switch (aTopic) {
      case "before-growl-registration":
        this.mObserverService.removeObserver(this, "before-growl-registration");

        var nl = aSubject.QueryInterface(grINotificationsList);

        const notifications = [{name:"Hattrick.org (Foxtrick)", enabled:true}];

        for (var i = notifications.length - 1; i >= 0; i--) {
          var name = notifications[i].name;
          nl.addNotification(name, notifications[i].enabled);
        }

        break;
      default:
    }
  },

  QueryInterface: function(aIID)
  {
    if (aIID.equals(nsISupports) || aIID.equals(nsIObserver))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
}

var foxtrickGrowlNotificationsFactory = {
  singleton: null,
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new foxtrickGrowlNotifications();
    return this.singleton.QueryInterface(aIID);
  }
};

var foxtrickGrowlNotificationsModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID,
                                     aFileSpec, aLocation, aType);

    var cm = Components.classes["@mozilla.org/categorymanager;1"]
                       .getService(nsICategoryManager);
    cm.addCategoryEntry("app-startup", CLASS_NAME, "service," + CONTRACT_ID,
                        true, true);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
  },

  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return foxtrickGrowlNotificationsFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr)
  {
    return true;
  }
};

function NSGetModule(aCompMgr, aFileSpec)
{
  return foxtrickGrowlNotificationsModule;
}

