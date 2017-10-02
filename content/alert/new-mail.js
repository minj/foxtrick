'use strict';
/**
 * new-mail.js
 * Script which makes the new mails more visible
 * @author htbaumanns, ryanli
 */

Foxtrick.modules['NewMail'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.ALERT,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	OPTIONS: ['NotifyMail', 'NotifyMailSound', 'NotifyForum', 'NotifyForumSound'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false, true, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS: [false, true, false, true],
	OPTION_EDITS_DATAURL_IS_SOUND: [false, true, false, true],


	CSS: Foxtrick.InternalPath + 'resources/css/new-mail.css',

	exec: function(doc, oldMailCount, oldForumCount) {
		oldMailCount = oldMailCount || 0;
		oldForumCount = oldForumCount || 0;

		var menu = doc.getElementById('menu');
		// mail count within My Hattrick link
		var myHt = menu.querySelector('.ft-mmdd-primary[href^="/MyHattrick/"]') ||
			menu.querySelector('a[href^="/MyHattrick/"]');

		if (myHt.getElementsByTagName('span').length) {
			var mailCountSpan = myHt.getElementsByTagName('span')[0];
			mailCountSpan.className = 'ft-new-mail';
			Foxtrick.onClick(mailCountSpan, function() {
				var doc = this.ownerDocument;
				var newURL = new URL('/MyHattrick/Inbox/', doc.location.href);
				doc.location.assign(newURL);

				// disable MyHT link
				return false;
			});
			var newMailCount = Number(mailCountSpan.textContent.match(/\d+/)[0]);
		}
		else {
			// no unread mails
			var newMailCount = 0;
		}

		var open = Foxtrick.L10n.getString('notify.open');

		Foxtrick.sessionSet('mailCount', newMailCount);
		if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyMail')
			&& newMailCount > oldMailCount) {
			Foxtrick.util.notify.create(Foxtrick.L10n.getString('notify.newMail', newMailCount)
			                            .replace(/%s/, newMailCount), 'http://' +
			                            doc.location.host + '/MyHattrick/Inbox/',
			                            {
		                            		id: 'mail',
		                            		buttons: [{ title: open }],
			                            });
			// play sound if enabled
			if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyMailSound')) {
				var sound = Foxtrick.Prefs.getString('module.NewMail.NotifyMailSound_text');
				Foxtrick.playSound(sound);
			}
		}

		// mail count in left menu
		var subMenu = doc.getElementsByClassName('subMenu')[0];
		if (subMenu) {
			var subMenuBox = subMenu.getElementsByClassName('subMenuBox')[0];
			var listItems = subMenuBox.getElementsByTagName('li');
			var mailCountItems = Foxtrick.filter(function(n) {
				return n.getElementsByTagName('span').length > 0;
			}, listItems);
			if (mailCountItems.length) {
				var mailCount = mailCountItems[0].getElementsByTagName('span')[0];
				mailCount.className = 'ft-new-mail';
			}
		}

		// new forum message
		var forum = menu.querySelector('.ft-mmdd-primary[href^="/Forum/"]') ||
			menu.querySelector('a[href^="/Forum/"]');
		if (forum.textContent.indexOf('(') > -1) {
			// has new message, no span this time, we need to add it
			var newForumCount = Number(forum.textContent.match(/\d+/)[0]);
			forum.textContent = forum.textContent.replace(/\(\d+\)/, '');
			var span = doc.createElement('span');
			span.className = 'ft-new-forum-msg';
			span.textContent = '(' + newForumCount + ')';
			forum.appendChild(span);
		}
		else {
			// no new forum messages
			var newForumCount = 0;
		}
		Foxtrick.sessionSet('forumCount', newForumCount);
		if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyForum')
			&& newForumCount > oldForumCount) {
			Foxtrick.log('alert',
			             Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyForumSound'),
			             Foxtrick.Prefs.getString('module.NewMail.NotifyForumSound_text'));
			Foxtrick.util.notify.create(Foxtrick.L10n.getString('notify.newForumMessage',
			                            newForumCount).replace(/%s/, newForumCount),
										'http://' + doc.location.host +
										'/Forum/?actionType=refresh',
			                            {
			                            	id: 'forum',
		                            		buttons: [{ title: open }],
			                            });
			// play sound if enabled
			if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyForumSound')) {
				var sound = Foxtrick.Prefs.getString('module.NewMail.NotifyForumSound_text');
				Foxtrick.playSound(sound);
			}
		}
		//Foxtrick.log('oldCount', oldCount)
		//Foxtrick.log('newCount', newForumCount, newMailCount)
	},

	run: function(doc) {
		var module = this;

		Promise.all([Foxtrick.session.get('mailCount'), Foxtrick.session.get('forumCount')])
			.then(function(args) {
				args.unshift(doc);
				module.exec.apply(module, args);
			})
			.catch(Foxtrick.catch(module));

	},
};
