# Foxtrick Dev Guide
## Foxtrick Architecture Overview
Foxtrick code is in a git repo at https://github.com/minj/foxtrick/.
Build scripts are in the `build` branch.

Foxtrick runs on a few different browsers that have significantly different environments, persistence and messaging models. These things are handled by the so-called back-end. Once all files are loaded and the back-end is set up, a `DOMContentLoaded` handler is attached to the content (Hattrick) pages. The handler detects what HT page was loaded, finds modules working (and enabled) on that page and executes them. See the [back-end mechanism in detail](https://github.com/minj/foxtrick/wiki/FoxtrickCallStack).

## Module Overview
A module is a piece of Foxtrick functionality that works independently from other modules thus modules can usually be disabled freely. Modules are typically stored one per file and arranged in certain folders in `content` according to their category (functionality type).

Each module is implemented as a javascript object (a member of `Foxtrick.modules`) that has some 'reserved' members which are used to declare its behavior. A simple example module:
```js
'use strict';
Foxtrick.modules['ExampleModule'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	run: function(doc) {
		// this is where the magic happens
	}
}
```
Due to quirks of certain browsers it is not possible to use `document` and `window` globals directly thus each module gets a reference to `doc` in `module.run(doc)` function which is the entrance point of the module functionality. Likewise it is not possible to use jQuery thus home-brew utility functions are used instead. A developer is strongly urged to get acquainted with the available APIs and [coding style guidelines](CodeStyle.md) before contributing.

## Utility Overview
Most utilities are arranged in folders in `content`:
* files in `api` folder define external APIs as `Foxtrick.api.*`, e. g. youthclub access as `Foxtrick.api.hy.*`.
* files in `pages` folder define common functions for certain pages in HT, e.g. `Foxtrick.Pages.Player.*` for common tasks on player details page.
* files in `util` define general purpose functions. Some of the most important:
	* [api.js](/content/util/api.js): CHPP access
	* [array.js](/content/util/array.js) for working with arrays, nodeLists and similar
	* [cookies.js](/content/util/cookies.js): manage cookies for external sites
	* [currency.js](/content/util/currency.js) essential for anything currency related
	* [dom.js](/content/util/dom.js) for creating functionality containers and images, managing classes and DOM relationships, adding event handlers
	* [id.js](/content/util/id.js) to retrieve IDs
	* [layout.js](/content/util/layout.js) to detect layout
	* [load.js](/content/util/load.js) to fetch files
	* [local-store.js](/content/util/local-store.js) to store persistent data
	* [log.js](/content/util/log.js) to log messages
	* [math.js](/content/util/math.js) for various calculations and predictions
	* [misc.js](/content/util/misc.js) contains a mixed bag of helpers
	* [note.js](/content/util/note.js) to add inline notification messages
	* [session-store.js](/content/util/session-store.js) to store temporary data
	* [time.js](/content/util/time.js) for working with time
* Additionally some core features are defined in:
	* [l10n.js](/content/util/l10n.js): localization (Foxtrick.L10n.*)
	* [pages.js](/content/util/pages.js): HT page detection
	* [prefs-util.js](/content/util/prefs-util.js): settings value access (Foxtrick.Prefs.*)
	* [xml-load.js](/content/util/xml-load.js): HT countries and leagues

## Adding new functionality
All modules must be linked and internationalized. Modules default to being completely off thus more appropriate default settings need to be defined as well.

### An advanced module example
```js
'use strict';
Foxtrick.modules['AdvancedModule'] = {
	// required, defined in env.js
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	// required, defined in pages.js
	PAGES: ['matchOrder', 'players'],
	// optional, module config
	OPTIONS: [
		'Option', 'AnotherOption',
		[
			'OptionWithSubOptions',
			'SubOption',
			'AnotherSubOption',
		]
	],
	// optional, css to include when module is enabled
	CSS: Foxtrick.InternalPath + 'resources/css/advanced-module.css',
	// optional, css to include when options are enabled
	OPTIONS_CSS: [
		null, null,
		[
			Foxtrick.InternalPath + 'resources/css/advanced-module-option-with-suboptions.css'
		],
	],
	run: function(doc) {
		// this is where the magic happens
		if (Foxtrick.Prefs.isModuleOptionEnabled('AdvancedModule', 'Option')) {
			// do something special
		}
	}
}
```

### Linking new modules
When a new module is created, it must be added to `modules` file. Executing `python module-update.py add category/module.js` does that for you and effectively links the module for all browsers. 

### Internationalization
Base strings reside in [content/foxtrick.properties](/content/foxtrick.properties) file. Localized strings are imported from `content/locale/*/foxtrick.properties` (they are imported from crowdin and should not be touched). 

Each module and module option must be specified in the base strings file:
```properties
module.AdvancedModule.desc=Module description
module.AdvancedModule.Option.desc=Option description
module.AdvancedModule.SubOption.desc=SubOption description
```
Additional strings used in the module are specified without the `module.` prefix, e. g. `AdvancedModule.SomeString=Some string`.

### Default settings
Default settings must be specified in [defaults/preferences/foxtrick.js](/defaults/preferences/foxtrick.js).
```js
pref("extensions.foxtrick.prefs.module.AdvancedModule.enabled", true);
pref("extensions.foxtrick.prefs.module.AdvancedModule.Option.enabled", true);
pref("extensions.foxtrick.prefs.module.AdvancedModule.OptionWithSubOptions.enabled", true);
pref("extensions.foxtrick.prefs.module.AdvancedModule.SubOption.enabled", false);
```
Usually we enable all modules to improve their discoverability.

## Development workflow
It's best to work on Google Chrome and afterwards check if Firefox is not broken.

### Google Chrome
Google Chrome platform is divided into two layers: background page and content scripts. Most files (including utils and modules) are linked in both layers. Only content can access HT page DOM so this is where most of module code is executed.

However, only the background can do various things that require elevated access (e. g. XHR). These two layers communicate by passing JSON messages that trigger callbacks when received.

![Chrome Development](http://i.imgur.com/gOYAgnv.png)
When `Developer Mode` is activated, you can use the `Load unpacked extension` button to load Foxtrick directly from the repo folder. If you want to test changes made afterwards, you need to reload it. 

Developing on Google Chrome is really convenient as no browser restarts are required and the [dev tools](https://developer.chrome.com/devtools/index) (`CTRL+SHIFT+J`) are awesome to debug with. Background debugger is accessible by clicking on the `background.html` link.

Sometimes, however, Chrome fails to clear the cached code. This is usually fixed by closing and reopening the Hattrick content tab. Background cache is discarded by executing `document.location.reload();` in the background context.

### Firefox
In contrast, in Firefox there is no clear separation between layers, and the 'background' is shared by all add-ons and Firefox itself. This leads to a high risks of memory leaks and security issues. However, each browser window has a different context.

Firefox development is messy. Code changes need a browser restart/opening a new window and the debugging is very inconvenient.

* First you need to [set up an extension development environment](https://developer.mozilla.org/en/docs/Setting_up_extension_development_environment).
* Foxtrick can then be debugged with the [Browser Debugger](https://developer.mozilla.org/en-US/docs/Tools/Debugger).

## Module API documentation
`TODO`
