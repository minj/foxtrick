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

	displayForm: function(event) {
		try {
			event.preventDefault();
			var doc = event.target.ownerDocument;
			var form = doc.getElementById("ft_rapidid_form");
			form.className = "display";
			var indicator = doc.getElementById("ft_rapidid_indicator");
			indicator.className = "hidden";
		}
		catch (e) {
			Foxtrick.dump(e);
		}
	},

	init: function() {
		for (var i in this.options) {
			this.options[i].label = Foxtrickl10n.getString(this.options[i].text);
		}
	},

	run: function(page, doc) {
		try {
			var header = doc.getElementById("header");
			var menu = doc.getElementById("menu");
			var container = doc.createElement("div");
			header.insertBefore(container, menu);
			container.id = "ft_rapidid_container";
			var indicator = doc.createElement("a");
			var form = doc.createElement("form");
			container.appendChild(indicator);
			container.appendChild(form);

			// indicator
			indicator.id = "ft_rapidid_indicator";
			var viewById = Foxtrickl10n.getString("foxtrick.RapidId.ViewById");
			indicator.appendChild(doc.createTextNode(viewById));
			indicator.setAttribute("href", "");
			indicator.addEventListener("click", FoxtrickRapidId.displayForm, true);

			// form
			form.id = "ft_rapidid_form";
			form.setAttribute("action", "");
			form.addEventListener("submit", FoxtrickRapidId.view, true);
			var select = doc.createElement("select");
			var input = doc.createElement("input");
			var button = doc.createElement("input");
			form.appendChild(select);
			form.appendChild(input);
			form.appendChild(button);

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
