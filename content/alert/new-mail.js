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

	exec: function(doc, mailCount, forumCount) {
		const MODULE = this;

		const MAIL_URL = doc.location.origin + '/MyHattrick/Inbox/';
		const FORUM_URL = doc.location.origin + '/Forum/?actionType=refresh';

		const OPEN = Foxtrick.L10n.getString('notify.open');
		const MAIL_OPTS = {
			id: 'mail',
			buttons: [{ title: OPEN }],
		};
		const FORUM_OPTS = {
			id: 'forum',
			buttons: [{ title: OPEN }],
		};

		var oldMailCount = mailCount || 0;
		var oldForumCount = forumCount || 0;

		// mail count within My Hattrick link
		var newMailCount = 0;

		let menu = doc.getElementById('menu');
		let myHt = menu.querySelector('a[href^="/MyHattrick/"]');
		if (myHt.getElementsByTagName('span').length) {
			let mailCountSpan = myHt.getElementsByTagName('span')[0];
			mailCountSpan.className = 'ft-new-mail';

			Foxtrick.onClick(mailCountSpan, function() {
				let doc = this.ownerDocument;
				let newURL = new URL('/MyHattrick/Inbox/', doc.location.href);
				doc.location.assign(newURL);

				// disable MyHT link
				return false;
			});

			newMailCount = parseInt(mailCountSpan.textContent.match(/\d+/)[0], 10) || 0;
		}

		Foxtrick.sessionSet('mailCount', newMailCount);
		if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyMail')
			&& newMailCount > oldMailCount) {

			let mailL10n = Foxtrick.L10n.getString('notify.newMail', newMailCount);
			let mailMsg = mailL10n.replace(/%s/, newMailCount);

			Foxtrick.util.notify.create(mailMsg, MAIL_URL, MAIL_OPTS)
				.catch(e => e.message != Foxtrick.TIMEOUT_ERROR ? Promise.reject(e) : e)
				.catch(Foxtrick.catch(MODULE));

			// play sound if enabled
			if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyMailSound')) {
				let sound = Foxtrick.Prefs.getString('module.NewMail.NotifyMailSound_text');
				Foxtrick.playSound(sound);
			}
		}

		// mail count in left menu
		let subMenu = doc.getElementsByClassName('subMenu')[0];
		if (subMenu) {
			let subMenuBox = subMenu.getElementsByClassName('subMenuBox')[0];
			let listItems = subMenuBox.getElementsByTagName('li');
			let mailCountItems = Foxtrick.filter(function(n) {
				return n.getElementsByTagName('span').length > 0;
			}, listItems);

			if (mailCountItems.length) {
				let mailCountSpan = mailCountItems[0].getElementsByTagName('span')[0];
				mailCountSpan.className = 'ft-new-mail';
			}
		}

		// new forum message
		var newForumCount = 0;

		let forum = menu.querySelector('a[href^="/Forum/"]');

		if (forum.textContent.indexOf('(') > -1) {
			// has new message, no span this time, we need to add it
			newForumCount = Number(forum.textContent.match(/\d+/)[0]);
			forum.textContent = forum.textContent.replace(/\(\d+\)/, '');

			let span = doc.createElement('span');
			span.className = 'ft-new-forum-msg';
			span.textContent = '(' + newForumCount + ')';
			forum.appendChild(span);
		}
		else {
			// no new forum messages
			newForumCount = 0;
		}

		Foxtrick.sessionSet('forumCount', newForumCount);
		if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyForum')
			&& newForumCount > oldForumCount) {

			let forumL10n = Foxtrick.L10n.getString('notify.newMail', newForumCount);
			let forumMsg = forumL10n.replace(/%s/, newForumCount);

			Foxtrick.util.notify.create(forumMsg, FORUM_URL, FORUM_OPTS)
				.catch(e => e.message != Foxtrick.TIMEOUT_ERROR ? Promise.reject(e) : e)
				.catch(Foxtrick.catch(MODULE));

			// play sound if enabled
			if (Foxtrick.Prefs.isModuleOptionEnabled('NewMail', 'NotifyForumSound')) {
				let sound = Foxtrick.Prefs.getString('module.NewMail.NotifyForumSound_text');
				Foxtrick.playSound(sound);
			}
		}
		// Foxtrick.log('oldCount', oldCount)
		// Foxtrick.log('newCount', newForumCount, newMailCount)
	},

	run: function(doc) {
		const MODULE = this;

		Promise.all([Foxtrick.session.get('mailCount'), Foxtrick.session.get('forumCount')])
			.then(function(args) {
				args.unshift(doc);
				MODULE.exec.apply(MODULE, args);
			})
			.catch(Foxtrick.catch(MODULE));

	},
};
