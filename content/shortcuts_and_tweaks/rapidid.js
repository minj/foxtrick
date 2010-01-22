/**
 * rapidid.js
 * rapid way to view something by id
 * @author luminaryan
 */

var FoxtrickRapidId = {
	MODULE_NAME: "RapidId",
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ["all"],
	DEFAULT_ENABLED: true,
	NEW_AFTER_VERSION: "0.5.0.2",
	LATEST_CHANGE: "A convenient way to view team, player, etc. by id",
	LATEST_CHANGE_CATEGORY: Foxtrick.latestChangeCategories.NEW,

	options: [
		{ value: "match", text: "Match", url: "Club/Matches/Match.aspx?matchID" },
		{ value: "manager", text: "Manager", url: "Club/Manager/?userId" },
		{ value: "senior", text: "Senior" },
		{ value: "senior-team", text: "Team", url: "Club/?TeamID" },
		{ value: "senior-player", text: "Player", url: "Club/Players/Player.aspx?playerId" },
		{ value: "youth", text: "Youth" },
		{ value: "youth-team", text: "Team", url: "Club/Youth/Default.aspx?YouthTeamID" },
		{ value: "youth-player", text: "Player", url: "Club/Players/YouthPlayer.aspx?YouthPlayerID" }
	],

	setSelected: function(val) {
		FoxtrickPrefs.setString("module.RapidId.selected", val);
	},

	getSelected: function() {
		return FoxtrickPrefs.getString("module.RapidId.selected");
	},

	view: function(event) {
		// prevent the form from being submitted
		event.preventDefault();
		var doc = event.target.ownerDocument;
		var select = doc.getElementById("ft_rapidid_select");
		var type = select.options[select.selectedIndex].getAttribute("value");
		var input = doc.getElementById("ft_rapidid_input");
		var id = input.value;
		id = Foxtrick.trim(id);
		// only process int
		if (isNaN(id)) {
			return;
		}
		for (var i in FoxtrickRapidId.options) {
			if (FoxtrickRapidId.options[i].value === type) {
				FoxtrickRapidId.setSelected(type);
				var host = doc.location.hostname;
				var fullurl = "http://" + host + "/" + FoxtrickRapidId.options[i].url + "=" + id;
				doc.location.replace(fullurl);
			}
		}
	},

	init: function() {
		for (var i in this.options) {
			this.options[i].label = Foxtrickl10n.getString(this.options[i].text);
		}
	},

	run: function(page, doc) {
		try {
			var shortcuts = doc.getElementById("shortcuts");
			shortcuts.style.width = "auto";
			var container = doc.createElement("form");
			shortcuts.insertBefore(container, container.childNodes[0]);
			container.className = "ft_rapidid_container";
			container.setAttribute("action", "");
			container.addEventListener("submit", FoxtrickRapidId.view, true);
			var select = doc.createElement("select");
			var input = doc.createElement("input");
			var button = doc.createElement("input");
			container.appendChild(select);
			container.appendChild(input);
			container.appendChild(button);

			// the select element
			select.id = "ft_rapidid_select";
			var currentGroup = null;
			var saved = this.getSelected();
			for (var i in this.options) {
				// if no url, then it's an optgroup
				if (!this.options[i].url) {
					var optgroup = doc.createElement("optgroup");
					select.appendChild(optgroup);
					optgroup.setAttribute("label", this.options[i].label);
					currentGroup = optgroup;
				}
				else {
					var option = doc.createElement("option");
					option.setAttribute("value", this.options[i].value);
					option.appendChild(doc.createTextNode(this.options[i].label));
					if (saved === this.options[i].value) {
						option.setAttribute("selected", "selected");
					}
					if (currentGroup === null) {
						select.appendChild(option);
					}
					else {
						currentGroup.appendChild(option);
					}
				}
			}

			// the input element
			input.id = "ft_rapidid_input";

			// the <input type="button" /> element
			button.setAttribute("type", "submit");
			button.setAttribute("value", Foxtrickl10n.getString("View"));
		}
		catch (e) {
			Foxtrick.dump("RapidId: " + e + "\n");
		}
	},

	change: function(doc) {
	}
};
