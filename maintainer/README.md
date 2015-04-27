This file is intended for maintainers of FoxTrick, including notes for version and releasing.

## Version Scheme
FoxTrick has two major channels of versions, one is stable version for daily use and another is beta version for testing.

The major version number has two digits separated by dot, like 0.7, 0.8, and 1.0.
For minor version over major stable releases, a number starting from 1 is appended, like: 0.7.1, 0.7.2, etc.

Beta channel uses a custom versioning scheme using `git describe`. Due to the way it works there should **NOT** be any **annotated** tags unreachable from `master` branch! 

If you happen to merge/rebase a branch with annotated tags on `master`, those tags will be used instead of the `0.x.9` beta tag with (most probably) **disastrous effects** on release versioning and/or build scripts.

Lightweight (not annotated) tags like `cdn/*` are OK as they are not used unless you run `git describe --tags`.

### Version Bump
A version bump comes after the release of a major stable version

Keep in mind to modify the following files: (version.sh can/should be used for that)
* install.rdf (For Gecko)
* manifest.json (For Chrome)
* Info.plist (For Safari)
* default/preferences/foxtrick.js (For Foxtrick.version())

### Releasing Beta Versions
These are uploaded to foxtrick.org automatically (thanks to CatzHoek for providing the server!) at 13:00 CET everyday.
Chrome Web Store does not allow automatic uploads therefore it needs to be done manually.

### Releasing Stable Versions
* Run build scripts
* Upload to CWS
* Write a new post at Hattrick forum.

<pre>
Ryan Li <ryan@ryanium.com>
23 Aug 2011

Revised 19 March (LA-MJ)
</pre>
