# Foxtrick Manifest V3 Migration Guide

## Overview

This document tracks the migration of Foxtrick from Manifest V2 to Manifest V3 for Chrome/Chromium browsers.

**Status**: 🟡 In Progress
**Target Chrome Version**: 88+
**Firefox Compatibility**: Firefox will continue using MV2 (no deprecation planned)

## Completed Migrations ✅

### 1. Manifest Configuration
- ✅ Created `manifest-v3.json` with MV3 structure
- ✅ Updated `manifest_version` from 2 to 3
- ✅ Minimum Chrome version updated from 73 to 88
- ✅ Added dual `background` configuration for cross-browser support:
  - `service_worker` for Chrome MV3
  - `scripts` for Firefox MV3 (event pages)
  - `type: "module"` for ES module support

### 2. API Migrations

#### page_action → action API
**File**: `content/ui.js`
**Changes**:
- `chrome.pageAction` → `chrome.action`
- Removed `chrome.action.show()` call (not needed in MV3)
- Updated icon and title setters to use action API

#### web_accessible_resources
**Format Changed**: Array → Object with matches

**Before (MV2)**:
```json
"web_accessible_resources": [
  "content/resources/css/*.css",
  "content/resources/img/*.png"
]
```

**After (MV3)**:
```json
"web_accessible_resources": [{
  "resources": ["content/resources/css/*.css", ...],
  "matches": ["*://*.hattrick.org/*", ...]
}]
```

#### Permissions Split
- ✅ Host permissions moved to `host_permissions` array
- ✅ Optional host permissions moved to `optional_host_permissions`

#### Content Security Policy
**Format Changed**: String → Object

**Before (MV2)**: Not defined (used defaults)
**After (MV3)**:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

### 3. Background Script Refactoring

#### Canvas Operations → OffscreenCanvas
**File**: `content/background.js` (lines 221-264)
**Issue**: Service workers don't have DOM access (no `document.createElement`)

**Solution Implemented**:
```javascript
// OLD (MV2 - uses DOM)
let canvas = document.createElement('canvas');
canvas.width = image.width;
let dataUrl = canvas.toDataURL();

// NEW (MV3 - uses OffscreenCanvas)
let response = await fetch(url);
let blob = await response.blob();
let bitmap = await createImageBitmap(blob);
let canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
let canvasBlob = await canvas.convertToBlob();
// Convert blob to data URL using FileReader
```

**Benefits**:
- Works in service workers (no DOM dependency)
- More efficient async workflow
- Better error handling

#### localStorage Removal
**File**: `content/prefs-util.js` (lines 905-1005)
**Issue**: localStorage not available in service workers

**Solution Implemented**:
- Removed all `localStorage.getItem()`, `localStorage.setItem()`, `localStorage.removeItem()` calls
- Use `chrome.storage.local` as primary storage (was already sync'ed)
- Updated `init()` to load from `chrome.storage.local` directly
- Updated `restore()` to use async storage API

**Impact**:
- All preference operations now fully async
- Slight performance impact (async vs sync), but necessary for MV3
- Better reliability (chrome.storage has better error handling)

#### Module onLoad() Document Parameter
**File**: `content/background.js` (lines 92-106)
**Change**: Pass `null` instead of `document` to module `onLoad()` functions

**Reason**: Service workers have no document object

**Action Required**: Modules with `onLoad()` must not rely on document parameter when in background context

### 4. Context Menus Migration
**File**: `content/shortcuts-and-tweaks/context-menu-copy.js`

**onclick Property Removed**:
```javascript
// OLD (MV2)
chrome.contextMenus.create({
  title: "Copy ID",
  onclick: function() { ... }
});

// NEW (MV3)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'menu-id') {
    // Handle click
  }
});

chrome.contextMenus.create({
  id: 'menu-id',  // Explicit ID for matching
  title: "Copy ID"
  // No onclick
});
```

### 5. Deprecated API Removal
**File**: `content/env.js` (line 435)
**File**: `content/popup.js` (line 14)

**chrome.extension.getBackgroundPage() Deprecated**:
- Returns `null` with warning in env.js
- Wrapped in try-catch in popup.js
- **TODO**: Refactor popup.js to use message passing instead

**Reason**: Service workers don't have a window/page object

## Pending Tasks 🚧

### 1. Service Worker Bundling
**Priority**: HIGH
**Complexity**: MEDIUM

**Current Situation**:
- Background page loads 200+ JavaScript files via `<script>` tags in `background.html`
- Service workers cannot load HTML files

**Required Solution**:
- Set up webpack/rollup bundler
- Bundle all background scripts into single `content/background-bundle.js`
- Update build process in Makefile
- Alternative: Use `importScripts()` for modular loading

**Files to Bundle**:
- content/env.js
- content/core.js
- content/background.js
- All util/*.js files
- All module files with onLoad() functions
- All lib/*.js dependencies

### 2. Build System Updates
**Priority**: HIGH
**Complexity**: MEDIUM

**Required Changes to Makefile**:
1. Add webpack build step for service worker bundle
2. Generate separate builds:
   - `chrome-mv3.zip` (Manifest V3 for Chrome 88+)
   - `firefox-webext.xpi` (Manifest V2 for Firefox)
3. Update manifest processing:
   - Use `manifest-v3.json` for Chrome
   - Use `manifest.json` for Firefox
4. Add build flags for distribution types

### 3. Popup.js Refactoring
**Priority**: MEDIUM
**Complexity**: MEDIUM

**Current Issue**:
```javascript
// This will fail in MV3 service workers
BackgroundPage = chrome.extension.getBackgroundPage();
Foxtrick = BackgroundPage.Foxtrick;
```

**Possible Solutions**:
1. **Option A**: Load Foxtrick resources independently in popup context
   - Bundle Foxtrick core with popup
   - Load prefs from chrome.storage
   - Simpler, but larger popup bundle

2. **Option B**: Use message passing to background
   - Send requests to background for all operations
   - Keep popup minimal
   - More complex, but cleaner separation

**Recommendation**: Option A for faster migration, Option B for long-term

### 4. Service Worker Lifecycle Management
**Priority**: MEDIUM
**Complexity**: HIGH

**Challenges**:
- Service workers are ephemeral (can be terminated any time)
- Global variables don't persist
- All state must be stored in chrome.storage

**Required Changes**:
1. Audit all global variables in background.js
2. Identify which state needs persistence
3. Implement save/restore patterns for critical data
4. Test wake/sleep cycles extensively

**Critical State to Persist**:
- Module enable/disable states (already in prefs)
- Data URL cache (`Foxtrick.dataUrlStorage`)
- Active tabs registry (`ACTIVE_TABS`)
- Any temporary caches

### 5. Testing Requirements
**Priority**: HIGH
**Complexity**: HIGH

**Test Matrix**:
- ✅ Chrome 88+ (MV3)
- ✅ Firefox Latest (MV2/MV3)
- ✅ All 150+ modules functionality
- ✅ Service worker lifecycle (sleep/wake)
- ✅ Preferences save/load
- ✅ Context menus
- ✅ Notifications
- ✅ Icon updates

**Performance Testing**:
- Measure chrome.storage latency vs old localStorage
- Test module initialization time
- Monitor service worker wake time

## Known Issues & Limitations

### 1. Firefox Compatibility
- Firefox does NOT support service workers in background
- Firefox MV3 uses non-persistent event pages with DOM access
- Must maintain dual manifest approach for foreseeable future

### 2. OffscreenCanvas Support
- Requires Chrome 88+ (hence minimum version update)
- FileReader API usage adds async overhead
- Consider caching converted images in chrome.storage

### 3. Storage Performance
- chrome.storage.local is async (adds latency vs localStorage)
- Quota limits: 10MB (can request more with unlimitedStorage)
- Consider batching storage operations

### 4. Popup Limitations
- Cannot access background window directly
- Need alternative for shared Foxtrick instance
- May increase popup load time

## Migration Timeline

### Phase 1: Core Infrastructure (COMPLETED)
- ✅ Manifest V3 structure
- ✅ API migrations (action, context menus, etc.)
- ✅ Background script DOM removal
- ✅ localStorage elimination

### Phase 2: Build System (IN PROGRESS)
- 🚧 Webpack configuration
- 🚧 Service worker bundling
- 🚧 Makefile updates
- 🚧 Dual manifest builds

### Phase 3: Testing & Refinement (PENDING)
- ⏳ Functionality testing
- ⏳ Performance optimization
- ⏳ Service worker lifecycle testing
- ⏳ Cross-browser compatibility

### Phase 4: Deployment (PENDING)
- ⏳ Beta testing (nightly distribution)
- ⏳ Documentation updates
- ⏳ Production release
- ⏳ User migration support

## Development Guidelines

### For Chrome MV3
1. **Never use `document` or `window` in background context**
2. **All storage must use chrome.storage APIs**
3. **Register event listeners at top level (not in async callbacks)**
4. **Use message passing for all background ↔ content communication**
5. **Handle service worker termination gracefully**

### For Firefox Compatibility
1. **Keep MV2 manifest.json for Firefox builds**
2. **Use `background.scripts` instead of `service_worker`**
3. **Event pages can use DOM but should avoid for consistency**
4. **Test both MV2 (Firefox) and MV3 (Chrome) builds**

### Cross-Browser Best Practices
1. **Use `browser.*` or polyfill for API calls**
2. **Feature detection over platform detection**
3. **Graceful degradation for missing features**
4. **Separate build artifacts for each browser**

## Resources

### Chrome MV3 Documentation
- [Manifest V3 Overview](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Migrating to MV3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/)

### Firefox WebExtensions
- [Firefox MV3 Support](https://blog.mozilla.org/addons/2024/03/13/manifest-v3-manifest-v2-march-2024-update/)
- [Background Scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)
- [MV2 Indefinite Support](https://blog.mozilla.org/addons/2022/05/18/manifest-v3-in-firefox-recap-next-steps/)

### Tools
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
- [Webpack](https://webpack.js.org/)
- [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

## Contributors

This migration was initiated and documented by the Foxtrick development team.

For questions or issues, please open a GitHub issue or contact the maintainers.

---

**Last Updated**: 2025-11-11
**Document Version**: 1.0
**Status**: Migration In Progress (Phase 2)
