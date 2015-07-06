# Release instructions

<!-- MarkdownTOC autolink=true bracket=round depth=3 -->

- [Checklist](#checklist)
    - [Translations](#translations)
    - [World](#world)
    - [Staff](#staff)
    - [L10n](#l10n)
    - [Other](#other)
- [Release procedure](#release-procedure)
    - [cdn branch](#cdn-branch)
    - [master branch](#master-branch)
    - [new release branch 0.x.0](#new-release-branch-0x0)
    - [build branch](#build-branch)
    - [IMPORTANT re branching](#important-re-branching)
    - [Upload hosted builds](#upload-hosted-builds)

<!-- /MarkdownTOC -->

## Checklist
### Translations
#### Master files + glossary
```sh
cd ~/trunk/maintainer
./crowdin-upload.sh
```
It prints 'failed' but works (needs investigation). Don't upload localized files (script skips them for now): they are may be outdated.

**WARNING**: sometimes `'\'` fails to import!

#### Only glossary
```sh
cd ~/trunk/maintainer
./crowdin-glossary-upload.sh
```

### World
Save `https://www.hattrick.org/goto.ashx?path=/Community/CHPP/NewDocs/Example.aspx?file=worlddetails%26version=1.5` as `~/trunk/content/data/worlddetails.xml`
```sh
cd ~/trunk
python maintainer/locale/XMLToJSON.py content/data/worlddetails.xml
git diff content/data/worlddetails.json | grep -P '^[-+]\t' | grep -Pv \
    'FetchedDate|ActiveTeams|ActiveUsers|CupMatchDate|EconomyDate|LeagueName|MatchRound|NumberOfLevels|Season|SeriesMatchDate|TrainingDate|WaitingUsers'
rm content/data/worlddetails.xml
python ~/trunk/maintainer/locale/updateCurrencies.py
```

### Staff
Change files in `cdn` branch with:
- `~/build/foxtrick-cron-supporters.sh`
- `~/trunk/maintainer/locale/updateCoaches.py`
- `~/trunk/maintainer/userjs/ht.htp-editor-crawler.user.js`
- `~/trunk/maintainer/userjs/ht.chpp-holder-crawler.user.js`

### L10n
- `~/trunk/maintainer/locale/getTranslations.py`
- `~/build/foxtrick-cron-crowdin.sh`
- Compare [Crowdin statistics](https://crowdin.com/project/foxtrick/settings#reports-custom) for words translated from `last update` until `NOW()` with from `2012-01-12` to `NOW()`. Update `~/trunk/content/data/foxtrick_about.json` and `~/trunk/res/staff/foxtrick.json` accordingly.

### Other
Update:
- major donators in `~/trunk/content/data/foxtrick_about.json`
- Firefox versions in `~/trunk/install.rdf`
- `~/trunk/ignored-modules-nightly`
- `~/trunk/ignored-modules-hosting`
- `~/trunk/ignored-modules-release`
- `~/trunk/included-modules-light`

## Release procedure
### cdn branch
```sh
cd ~/cdn
git checkout cdn
git stash
git pull --rebase origin cdn
# update to master
git merge origin/master
git push origin cdn
```
### master branch
```sh
cd ~/trunk
git checkout master
git stash
git pull --rebase origin master
# merge resource updates
git merge origin/cdn
git tag -a -m 'release 0.x.0' 0.x.0
./version.sh 0.x.9
git commit -am 'bump master to 0.x.9'
git tag -a -m 'start 0.x.9 beta' 0.x.9
# clean used cdn tags before pushing
git tag -d $(git tag -l cdn/*)
git push --tags origin master
```
### new release branch 0.x.0
```sh
cd ~/
git clone git@github.com:minj/foxtrick.git 0.x.0
# copy hidden files from trunk
cp ~/trunk/maintainer/{upload.*,*.{pem,der}} ~/0.x.0/maintainer
cp ~/{trunk,0.x.0}/maintainer/locale/Hattrick/CHPP/AccessToken.py
cp ~/{trunk,0.x.0}/maintainer/locale/Hattrick/CHPP/Credentials.py
cp ~/{trunk,0.x.0}/maintainer/locale/ftp/Credentials.py
cd 0.x.0
# create a new stable branch from release tag
git checkout -b release-0.x.0 0.x.0
git push -u origin release-0.x.0
# remove master as there is no need to track origin/master here
git branch -D master
```
### build branch
```sh
cd ~/build
git checkout build
git stash
git pull --rebase origin build
# update version number 
nano foxtrick.release.sh 
nano foxtrick.release-light.sh
# update branch assignments
nano cron-config.sh
git commit -am 'release 0.x.0'
git push origin build
# release
./foxtrick-release.sh
./foxtrick.release-light.sh
```
Here we upload builds to https://www.foxtrick.org/release
### IMPORTANT re branching
Notice that `0.x.0` tag was created on `master`. There should **NOT** be any **annotated** tags unreachable from `master` branch!

This is due to the way `git describe` works (used for versioning). If you happen to merge/rebase a branch with annotated tags on `master`, those tags will be used instead of the `0.x.9` beta tag with (most probably) **disastrous effects** on release versioning and/or build scripts.

Lightweight (not annotated) tags like `cdn/*` are OK as they are not used unless you run `git describe --tags`.

**This means tags like `0.x.1` for point releases should be lightweight.**

**NB:** do NOT merge `master` into `cdn` if release branch is still live.

### Upload hosted builds
Chrome hosted version is uploaded to [/release/chrome/webstore](https://www.foxtrick.org/release/chrome/webstore)

Open [CWS dashboard](https://chrome.google.com/webstore/developer/edit/bpfbbngccefbbndginomofgpagkjckik): update file

**TODO:** fix AMO version upload

Open [AMO dashboard](https://addons.mozilla.org/en-US/developers/addon/foxtrick/edit): manage version and status
