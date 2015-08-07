'use strict';
/* global __doPostBack */
(function() {
	var ACTION = 'ctl00$ctl00$CPContent$ucLeftMenu$ucNewPosts';
	var markAll = document.querySelector('.ft-mark-all-as-read');
	markAll.addEventListener('click', function() {
		__doPostBack(ACTION, 'mrk|' + this.dataset.threadList);
	}, false);
})();
