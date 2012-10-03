try {
	console.log(this);
	var FoxtrickMutationObserver = (function() {


	// observer type -> event type
	var DOMEventTypes = {
		attributes: ['DOMAttrModified'],
		childList: ['DOMNodeInserted', 'DOMNodeRemoved'],
		characterData: ['DOMCharacterDataModified'],
		subtree: []
	};
	// event type -> observer type
	var ObserverTypes = {
		DOMAttrModified: 'attributes',
		DOMNodeInserted: 'childList',
		DOMNodeRemoved: 'childList',
		DOMCharacterDataModified: 'characterData',
	};

	//inherits(NodeList,Array);
	// NodeList object
	/*function NodeList(aNode) {
		NodeList.prototype = [];
		// public variables and functions
		/*NodeList.prototype.item = function(index) {
			if (typeof(this[index]) != 'undefined')
				return this[index];
			return null;
		};
		NodeList.prototype.constructor = NodeList;
	};*/

	// MutationRecord object
	function MutationRecord(record) {
		// public variables and functions
		this.addedNodes = record.addedNodes;
		this.attributeName = record.attributeName;
		this.attributeNamespace = record.attributeNamespace;
		this.nextSibling = record.nextSibling;
		this.oldValue = record.oldValue;
		this.previousSibling = record.previousSibling;
		this.removedNodes = record.removedNodes;
		this.target = record.target;
		this.type = record.type;
		this.event = record.event;
	};

	// the object we return in the end
	function FoxtrickMutationObserver(aHandler) {
	    // private variables and functions
		var handler = aHandler;
		var targets = [];
		var options = [];
		var eventLists = [];
		var _stackHandler = null;

		if (FoxtrickMutationObserver.prototype.observe)
			return;
		// privileged variables and functions
		FoxtrickMutationObserver.prototype.observe = function observe(aTarget, aOption) {
			try {

			if (!aTarget || aTarget.nodeType != window.Node.ELEMENT_NODE)
				throw 'SyntaxError';
			if ((!aOption.attributes && !aOption.childList && !aOption.characterData)
			|| (aOption.attributeFilter instanceof Array && aOption.attributeFilter.length == 0))
				throw 'SyntaxError';

			targets.push(aTarget);
			options.push(aOption);
			// collect events to be added
			var eventList = [];
			for (type in aOption) {
				if (aOption[type] && DOMEventTypes[type])
					eventList = eventList.concat(DOMEventTypes[type]);
			}
			eventLists.push(eventList);

			var MutationRecords = [];
			var changeScheduled = false;
			//var handler = this.handler;

			var _callback_handler = function() {
				// all changes have past and all changehandlers called. no we can call our actual handler
				handler(MutationRecords);
				// reset afterwards
				changeScheduled = false;
				/*for (var i=0; i<MutationRecords.length; ++i)
					delete MutationRecords[i];*/
				MutationRecords = [];
			};

			// listener function collects all events and returns when all changes are finished
			_stackHandler = function(aEvent) {
				try {

				if (!aOption.subtree && (aEvent.target != aTarget))
					return;
				// collect records
				if (aEvent.type == 'DOMNodeInserted') {
					console.log('NodeList', NodeList);
					try { var addedNodes = window.NodeList.call(null); } catch (e) { console.log(1, e) }
					try { var addedNodes = new window.NodeList(null); } catch (e) { console.log(2, e) }
					try {
						var addedNodes = window.NodeList.apply(aEvent.target);
					} catch (e) { console.log(3, e); }
					try {
						var addedNodes = new window.NodeList(aEvent.target);
					} catch (e) { console.log(4, e); }
					//addedNodes.push(aEvent.target);
					aTarget = aEvent.relatedNode;
					if (!aTarget)
						return;
					console.log(addedNodes, aTarget);
				}
				else if (aEvent.type == 'DOMNodeRemoved') {
					var removedNodes = 0;//new myNodeList(aEvent.target);
					//removedNodes.push(aEvent.target);
					aTarget = aEvent.relatedNode;
					if (!aTarget)
						return;
					console.log(removedNodes, aTarget);
				}
				else {
					aTarget = aEvent.target;
				}
				MutationRecords.push(new MutationRecord({
					type: ObserverTypes[aEvent.type],
					target: aTarget,
					addedNodes: addedNodes,
					removedNodes: removedNodes,
					event: aEvent
				}));

				// don't schedule subsequent callbacks
				if (changeScheduled)
					return;
				changeScheduled = true;
				// run callback delayed = after all events are though
				window.setTimeout(_callback_handler, 0);

				} catch (e) { Foxtrick.log('MutationRecords', e); }
			};
			// add listeners
			for (var i in eventList)
				aTarget.addEventListener(eventList[i], _stackHandler, false);

			} catch (e) { Foxtrick.log(e); }
		};

		// Stops the observer from observing any mutations.
		// Until the observe() method is used again, observer's callback will not be invoked.
		FoxtrickMutationObserver.prototype.disconnect = function disconnect() {
			for (var t in targets)
				for (var i in eventLists[t]) {
					var event = eventLists[t][i];
					targets[t].removeEventListener(event, _stackHandler, false);
				}
			/* chrome doesn't clear them it seems
			this.targets = [];
			this.options = [];
			this.eventLists = [];*/
		};

		//Empties the record queue and returns what was in there.
		/* not implemented in chrome;
		function takeRecords() {
		},*/
	};


	return FoxtrickMutationObserver;
	}());


} catch (e) { console.log(e); }
