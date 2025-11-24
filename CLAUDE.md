# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Foxtrick** is a cross-browser extension for the Hattrick online football manager game (hattrick.org). It enhances the user experience with extra information, analytics, shortcuts, UI tweaks, match analyses, and forum enhancements.

- **Browsers**: Firefox (WebExt), Chrome, Opera (Blink), Safari
- **Architecture**: Modular system with 150+ independent feature modules
- **Languages**: 58+ languages via Crowdin localization
- **No jQuery**: Custom utility functions throughout

## Build Commands

```bash
# Build all browser versions
make
make all

# Build specific browsers
make webext-gecko    # Firefox WebExtension (.xpi)
make chrome          # Chrome extension (.crx and .zip)
make safari          # Safari extension (.safariextz)

# Clean builds
make clean           # Clean all artifacts
make clean-build     # Clean build directory only

# Module management
python module-update.py add category/module.js    # Link new module
python module-update.py build                      # Build module list
```

**Distribution Types** (via `DIST_TYPE` env var):
- `nightly` - Development/beta builds
- `release` - Production releases
- `light` - Lightweight version
- `hosting` - For store distribution

## High-Level Architecture

### Multi-Browser Architecture

**Sandboxed (Chrome/Opera/Safari):**
- **Background Page**: Elevated permissions for XHR, storage, messaging
- **Content Scripts**: Direct DOM access, module execution, UI injection
- Communication via message passing

**Gecko (Firefox):**
- Unified context without strict separation
- Direct access to all APIs from content scripts

### Module System

Each module is:
- 1 JavaScript file in `content/[CATEGORY]/`
- 1 object in `Foxtrick.modules` namespace
- Independently enable/disable by users

**Module Categories:**
- `PRESENTATION` - Visual enhancements
- `INFORMATION_AGGREGATION` - Data collection and display
- `SHORTCUTS_AND_TWEAKS` - UI improvements
- `LINKS` - External links and integrations
- `MATCHES` - Match analysis tools
- `FORUM` - Forum enhancements
- `ALERT` - Notifications and alerts
- `ACCESS` - Accessibility features

**Module Anatomy:**
```javascript
Foxtrick.modules['ModuleName'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'], // or specific pages from pages.js
	OPTIONS: ['Option1', 'Option2'], // optional
	CSS: Foxtrick.InternalPath + 'resources/css/module.css', // optional

	run: function(doc) {
		// Module functionality - doc is the document object
	},
};
```

### Core Structure

```
content/
├── env.js              # Environment detection (browser, arch, context)
├── core.js             # Core Foxtrick functionality
├── entry.js            # Extension entry point
├── prefs-util.js       # Settings/preferences API
├── l10n.js             # Localization system
├── pages.js            # Hattrick page detection
├── util/               # 30+ utility modules (dom, id, api, etc.)
├── pages/              # Page-specific common functions
├── api/                # External API integrations (CHPP, Youth Club)
├── lib/                # 3rd party libraries (oauth, sha1, etc.)
├── [category folders]/ # Feature modules by category
└── resources/          # CSS, images, sounds
```

**Key Utility Namespaces:**
- `Foxtrick.util.dom` - DOM manipulation, event handlers
- `Foxtrick.util.id` - ID extraction utilities
- `Foxtrick.Prefs` - Settings access
- `Foxtrick.L10n` - Internationalization
- `Foxtrick.Pages.*` - Page-specific utilities
- `Foxtrick.api.*` - External API integrations

**Page Detection Flow:**
1. DOMContentLoaded fires
2. Current page detected via `content/pages.js`
3. All enabled modules checked for page match
4. Matching modules' `run(doc)` functions executed

### Browser Abstraction

```javascript
// Detect environment
Foxtrick.arch       // 'Sandboxed' or 'Gecko'
Foxtrick.platform   // 'Chrome', 'Safari', 'Firefox', 'Android'
Foxtrick.context    // 'background' or 'content'

// Messaging abstraction (for sandboxed browsers)
Foxtrick.SB.ext.sendRequest({ ... });
```

## Critical Code Conventions

### Indentation & Formatting
- **Tabs for indentation** (1 tab = 4 columns)
- **Max line length**: 100 columns
- **Line endings**: Unix (LF only)
- **Encoding**: UTF-8 without BOM
- No trailing whitespace
- Final newline required

### JavaScript Style

**Required Patterns:**
```javascript
'use strict'; // Required in every file

// Namespace pattern
if (!Foxtrick)
	var Foxtrick = {};

// Function expressions only (no declarations)
Foxtrick.foo = function(arg) {
	return value;
};

// else/catch on new line
if (condition) {
	// ...
}
else {
	// ...
}

// Space before { and after keywords
if (condition) {
	// ...
}

// Use === for falsy checks
if (value === null || value === undefined) {
	// ...
}
```

**Forbidden Patterns:**
```javascript
// NO function declarations
function foo() { } // WRONG

// NO object literal syntax for multiple functions
Foxtrick.Bar = {
	foo: function() {},
	baz: function() {}
}; // WRONG

// Define individually instead:
Foxtrick.Bar.foo = function() {};
Foxtrick.Bar.baz = function() {};
```

### Document References

**CRITICAL**: Never use `document` or `window` globals directly in modules.

```javascript
// WRONG
var element = document.getElementById('foo');

// CORRECT - use doc parameter
Foxtrick.modules['Example'] = {
	run: function(doc) {
		var element = doc.getElementById('foo');
	},
};
```

### Variables & Functions
- Declare variables before use
- No redeclaration in same scope
- Use `===` and `!==` for comparisons
- Non-void functions must always return a value
- No functions declared inside loops
- Constructors must be capitalized
- Parentheses required around assignments in boolean tests

### JSDoc Format
```javascript
/**
 * Function description
 * @param  {Type}   arg1 param description
 * @param  {Type}   arg2 param description
 * @return {number}      return description
 */
Foxtrick.foo = function(arg1, arg2) {
	return 0;
};
```

## Module Development Workflow

### Adding a New Module

1. **Create module file**: `content/category/module-name.js`

2. **Define module object**:
```javascript
'use strict';

if (!Foxtrick)
	var Foxtrick = {};

Foxtrick.modules['ModuleName'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: ['Option1'],

	run: function(doc) {
		// Implementation
	},
};
```

3. **Link module to browsers**:
```bash
python module-update.py add category/module-name.js
```

4. **Add localization strings** to `content/foxtrick.properties`:
```properties
module.ModuleName.desc=Module description
module.ModuleName.Option1.desc=Option description
```

5. **Add default preferences** to `defaults/preferences/foxtrick.js`:
```javascript
pref("extensions.foxtrick.prefs.module.ModuleName.enabled", true);
pref("extensions.foxtrick.prefs.module.ModuleName.Option1", false);
```

### Development Environment

**Chrome/Opera:**
- Load unpacked extension from repo directory
- Reload extension after code changes
- Access background debugger via `background.html` link
- Open DevTools with Ctrl+Shift+J
- Sometimes need to reload content tab to clear cache

**Firefox:**
- More complex setup
- Requires browser restart or new window for changes
- Use Browser Debugger for debugging

### Debugging

Enable logging in Firefox prefs:
```javascript
user_pref("extensions.foxtrick.prefs.logDisabled", false);
```

Use in code:
```javascript
Foxtrick.log('Debug message', variable);
```

## Localization

- **DO NOT edit** `content/locale/*` files directly
- All translations managed via Crowdin: https://crowdin.com/project/foxtrick
- Add base strings to `content/foxtrick.properties`
- Use `Foxtrick.L10n.getString('key')` to access translations

## Important Configuration Files

- `/manifest.json` - Chrome/WebExt manifest (sections auto-generated during build)
- `/Info.plist` - Safari manifest
- `/Makefile` - Build configuration
- `/modules` - List of active modules (auto-updated by module-update.py)
- `/ignored-modules-*` - Modules excluded per distribution type
- `/.jshintrc` - JSHint linting rules
- `/.jscs.json` - JSCS style checking rules
- `/jsconfig.json` - TypeScript checking config (checkJs: true)
- `/content/foxtrick.properties` - Base localization strings
- `/defaults/preferences/foxtrick.js` - Default module settings

## Code Quality

Linters configured:
- JSHint (`.jshintrc`)
- JSCS (`.jscs.json`)
- gjslint (Google Closure Linter)

Follow all style guidelines strictly - the project has very specific conventions that must be maintained for consistency across 150+ modules.

## Git Workflow

- Fork the repo
- Create topic branch off `master`
- Make atomic commits (one logical change per commit)
- Submit pull requests
- Bug fixes for releases based on release tag

**Commit Message Format:**
```
Short line briefly describing changes

Describe what files, functions and/or interfaces are changed and
why you change them. References of issues are highly desirable.
```

## Architecture Philosophy

- **Modularity**: Each feature is independent and disableable
- **No External Dependencies**: Custom utilities instead of jQuery
- **Cross-Browser Compatibility**: Abstraction layer for browser differences
- **Internationalization First**: All user-facing strings externalized
- **Code Quality**: Strict style guidelines, comprehensive linting
