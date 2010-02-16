 /**
 * background_ticker.js
 * background.html part of foxtrickAlert
 * @author convincedd
 * from gmail example
 */
////////////////////////////////////////////////////////////////////////////////

	var mail_count = 0;
	var forum_count = 0;
	var unreadticker_count = 0;
	


var animationFrames = 36;
var animationSpeed = 10; // ms
var canvas;
var canvasContext;
var loggedInImage;
var pollIntervalMin = 1000 * 60;  // 1 minute
var pollIntervalMax = 1000 * 60 * 60;  // 1 hour
var requestFailureCount = 0;  // used for exponential backoff
var requestTimeout = 1000 * 2;  // 5 seconds
var rotation = 0;
var unreadCount = '0/0';
var loadingAnimation = new LoadingAnimation();


//chrome.browserAction.setTitle({title:'FoxtrickAlert'});

function isHTUrl(url) {
  if (url.search(/hattrick.org|hattrick.ws|hattrick.interia.ws/) == -1)
    return false;

  return true; 
}

// A "loading" animation displayed while we wait for the first response from
// ht. This animates the badge text with a dot that cycles from left to
// right.
function LoadingAnimation() {
  this.timerId_ = 0;
  this.maxCount_ = 8;  // Total number of states in animation
  this.current_ = 0;  // Current state
  this.maxDot_ = 4;  // Max number of dots in animation
}

LoadingAnimation.prototype.paintFrame = function() { return;
  var text = "";
  for (var i = 0; i < this.maxDot_; i++) {
    text += (i == this.current_) ? "." : " ";
  }
  if (this.current_ >= this.maxDot_)
    text += "";

  chrome.browserAction.setBadgeText({text:text});
  /*this.current_++;
  if (this.current_ == this.maxCount_)
    this.current_ = 0;*/
}

LoadingAnimation.prototype.start = function() {
  if (this.timerId_)
    return;

  var self = this;
  this.timerId_ = window.setInterval(function() {
    self.paintFrame();
  }, 100);
}

LoadingAnimation.prototype.stop = function() {
  if (!this.timerId_)
    return;

  window.clearInterval(this.timerId_);
  this.timerId_ = 0;
}


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.url && isHTUrl(changeInfo.url)) {
    getInboxCount(function(count) {
      updateUnreadCount(count);
    });
  }
});


function background_ticker_init() {
  canvas = document.getElementById('canvas');
  loggedInImage = document.getElementById('logged_in');
  canvasContext = canvas.getContext('2d');

  chrome.browserAction.setBadgeBackgroundColor({color:[83, 144, 255, 255]});
  chrome.browserAction.setIcon({path: "resources/img/foxtrick18.png"});
  loadingAnimation.start();

  startRequest(); 
}

function scheduleRequest() {
  var randomness = Math.random() * 2;
  var exponent = Math.pow(2, requestFailureCount);
  var delay = Math.min(randomness * pollIntervalMin * exponent,
                       pollIntervalMax);
  delay = Math.round(delay);

  window.setTimeout(startRequest, delay); 
}

// ajax stuff
function startRequest() { //alert('startRequest');
  getInboxCount(
    function(count) { //mail_count+forum_count+unreadticker_count
      loadingAnimation.stop();
      updateUnreadCount(String(parseInt(mail_count)+parseInt(forum_count))+'/'+String(unreadticker_count));
      scheduleRequest();
    },
    function() {
      loadingAnimation.stop();
      showLoggedOut();
      scheduleRequest();
    }
  );
}

function getInboxCount(onSuccess, onError) { 
  function handleSuccess(count) { 
    requestFailureCount = 0;
    if (onSuccess)
      onSuccess(count);
  }

  function handleError() {
    ++requestFailureCount;
    if (onError)
      onError();
  }

  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isHTUrl(tab.url)) { 
			if (tab.url.search(/hattrick.org\/$|hattrick.ws\/$|hattrick.interia.ws\/$/)==-1) handleSuccess(mail_count);
			return;
      }
    }
	handleError();
  });
  
}

function updateUnreadCount(count) { //alert(count);
  if (unreadCount != count) { 
	unreadCount = count; 
    animateFlip();
  }
}


function ease(x) {
  return (1-Math.sin(Math.PI/2+x*Math.PI))/2;
}

function animateFlip() {
  rotation += 1/animationFrames;
  drawIconAtRotation();

  if (rotation <= 1) {
    setTimeout("animateFlip()", animationSpeed);
  } else {
	rotation = 0;
	drawIconAtRotation(); 
    chrome.browserAction.setBadgeText({ //alert('unreadCount'+unreadCount);
      text: unreadCount=='0/0'?'':unreadCount
    });
    chrome.browserAction.setIcon({path: "resources/img/foxtrick18.png"});
    chrome.browserAction.setBadgeBackgroundColor({color:[83, 144, 255, 255]});
  }
}

function showLoggedOut() {  
  unreadCount = '0/0';  
  chrome.browserAction.setIcon({path:"resources/img/foxtrick18grey.png"});
  chrome.browserAction.setBadgeBackgroundColor({color:[143, 143, 143, 230]});
  chrome.browserAction.setBadgeText({text:"?"});
}

function drawIconAtRotation() { 
  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(
      Math.ceil(canvas.width/2),
      Math.ceil(canvas.height/2));
  canvasContext.rotate(2*Math.PI*ease(rotation));
  canvasContext.drawImage(loggedInImage,
      -Math.ceil(canvas.width/2),
      -Math.ceil(canvas.height/2));
  canvasContext.restore();

  chrome.browserAction.setIcon({imageData:canvasContext.getImageData(0, 0,
      canvas.width,canvas.height)});
}

function goToInbox() {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isHTUrl(tab.url)) {
		chrome.tabs.update(tab.id, {selected: true});
        return;
      }
    }
    chrome.tabs.create({url: 'http://www.hattrick.org'});
  });
}

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  goToInbox();
});
