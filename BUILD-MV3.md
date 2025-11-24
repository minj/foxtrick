# Foxtrick Manifest V3 Build Guide

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Make (GNU Make)
- Git

### First Time Setup

1. **Install npm dependencies**:
```bash
npm install
```

This will install:
- webpack (^5.89.0)
- webpack-cli (^5.1.4)
- terser-webpack-plugin (^5.3.9)

### Building for Chrome (Manifest V3)

#### Step 1: Build the Service Worker Bundle

```bash
# Production build (minified)
npm run build:background

# Development build (with source maps, readable)
npm run build:background:dev

# Watch mode (rebuilds on file changes)
npm run watch:background
```

This creates:
- `content/background-bundle.js` - The bundled service worker
- `content/background-bundle.js.map` - Source map for debugging

#### Step 2: Build the Extension Package

```bash
# Build Chrome MV3 extension
make chrome-mv3

# Or build all versions
make all-mv3
```

**Output**: `build/foxtrick-chrome-mv3.zip`

### Building for Firefox (Manifest V2)

Firefox continues to use Manifest V2 (no bundling required):

```bash
make webext-gecko
```

**Output**: `build/foxtrick.xpi`

## npm Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build:background` | Production build of service worker |
| `npm run build:background:dev` | Development build with source maps |
| `npm run watch:background` | Watch mode for development |

## File Structure

### Source Files
```
content/
├── background-entry.js          # Webpack entry point (imports all scripts)
├── background.js                # Main background logic
├── env.js, core.js, etc.        # Core functionality
├── util/                        # Utility modules
├── lib/                         # Third-party libraries
└── [module folders]/            # Feature modules
```

### Generated Files (gitignored)
```
content/
├── background-bundle.js         # Bundled service worker (MV3)
└── background-bundle.js.map     # Source map
```

## Webpack Configuration

### Key Settings

**Target**: `webworker` - Optimized for service worker environment

**Entry**: `content/background-entry.js`

**Output**: `content/background-bundle.js`

**Optimization**:
- Minification: Yes (production mode)
- Mangle: No (preserves function/class names for debugging)
- Source maps: Yes (inline for dev, separate for prod)

**Size Limits**:
- Max entry size: 1MB
- Max asset size: 1MB

### Customization

Edit `webpack.config.js` to customize:
- Minification settings
- Source map generation
- Performance budgets
- Output paths

## Manifest Files

### manifest.json (Manifest V2 - Firefox)
- Original manifest
- Uses `background.page` with `background.html`
- Loads scripts via HTML `<script>` tags

### manifest-v3.json (Manifest V3 - Chrome)
- New MV3 manifest
- Uses `background.service_worker` with `background-bundle.js`
- Single bundled JavaScript file

## Development Workflow

### 1. Watch Mode for Active Development

```bash
# Terminal 1: Watch and rebuild on changes
npm run watch:background

# Terminal 2: Reload extension in Chrome
# chrome://extensions/ → Developer mode → Reload
```

### 2. Testing Changes

1. Make changes to any source file in `content/`
2. Watch mode automatically rebuilds bundle
3. Reload extension in browser
4. Check service worker console for errors

### 3. Debugging

**Service Worker Console**:
- Chrome: `chrome://extensions/`
- Click "service worker" link under Foxtrick
- Console shows logs from background-bundle.js

**Source Maps**:
- Enable source maps in DevTools
- Original files appear in Sources panel
- Set breakpoints in original source

## Common Issues & Solutions

### Issue: Bundle Size Too Large

**Symptoms**: Warning about bundle exceeding 1MB

**Solutions**:
1. Check `webpack.config.js` performance settings
2. Review included modules - remove unused ones
3. Enable tree-shaking for dead code elimination
4. Consider code splitting (advanced)

### Issue: Module Not Found

**Symptoms**: Webpack error: `Module not found: Error: Can't resolve './some-file.js'`

**Solutions**:
1. Verify file exists in `content/` directory
2. Check import path in `background-entry.js`
3. Ensure file extension is `.js`
4. Verify file is not in `.gitignore`

### Issue: Service Worker Fails to Load

**Symptoms**: Extension doesn't work, service worker shows errors

**Debug Steps**:
1. Check Chrome DevTools console for errors
2. Verify `manifest-v3.json` points to `content/background-bundle.js`
3. Rebuild bundle: `npm run build:background`
4. Check source maps are loading correctly
5. Look for global variable conflicts

### Issue: Changes Not Reflected

**Symptoms**: Code changes don't appear in extension

**Solutions**:
1. Ensure watch mode is running: `npm run watch:background`
2. Verify webpack rebuilt (check terminal output)
3. Hard reload extension in Chrome (remove + reload)
4. Clear service worker cache: `chrome://serviceworker-internals/`

## Build Performance

### Build Times (Approximate)

| Mode | Time | Size |
|------|------|------|
| Production | 10-15s | ~800KB minified |
| Development | 5-8s | ~1.2MB readable |
| Watch (incremental) | 2-3s | Varies |

### Optimization Tips

1. **Use watch mode** during development (faster incremental builds)
2. **Dev mode** for debugging (faster build, better stack traces)
3. **Production mode** before distribution (smaller size, optimized)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Chrome Extension

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:background
      - run: make chrome-mv3
      - uses: actions/upload-artifact@v3
        with:
          name: foxtrick-chrome-mv3
          path: build/foxtrick-chrome-mv3.zip
```

## Upgrading Dependencies

```bash
# Check for outdated packages
npm outdated

# Update webpack and related packages
npm update webpack webpack-cli terser-webpack-plugin

# Verify build still works
npm run build:background
```

## Troubleshooting

### Webpack Build Fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean build
rm content/background-bundle.js*
npm run build:background
```

### Extension Won't Load

1. Check manifest syntax: `jq . manifest-v3.json`
2. Verify bundle exists: `ls -lh content/background-bundle.js`
3. Check Chrome version: Must be 88+ for MV3
4. Review service worker errors in extension console

## Additional Resources

- [Webpack Documentation](https://webpack.js.org/concepts/)
- [Chrome Extension MV3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Foxtrick MV3 Migration Guide](./MIGRATION-MV3.md)

## Support

For issues or questions:
- Check existing [GitHub Issues](https://github.com/minj/foxtrick/issues)
- Review [MIGRATION-MV3.md](./MIGRATION-MV3.md) for migration details
- Contact Foxtrick development team

---

**Last Updated**: 2025-11-11
**Webpack Version**: 5.89.0
**Minimum Chrome**: 88
