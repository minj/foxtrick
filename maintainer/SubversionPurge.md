# Subversion purge
This repo was converted to git from svn @[Google Code](https://foxtrick.googlecode.com/svn/trunk/) (r13995).

## Commits
Most of the code history survived intact. A few useless branches were removed though. Committer names were standardized while commit messages were slightly modified and `git-svn-id` fields were left as is to provide a better interaction with the imported issues.

## Index purge
```bash
#!/bin/bash
git rm -r --ignore-unmatch --cached maintainer/crowdin_process.png crowdin_process.png 0.9.2/res/links.json.zip 0.9.2/res/staff/chpp.json.zip 0.9.2/res/staff/editor.json.zip content/information-aggregation/player-positions-evaluations.js~ content/pages/player.js~ content/resources/img/foxtrick_skin/HT-Images/Conf/Thumbs.db content/resources/img/foxtrick_skin/HT-Images/HoF/Thumbs.db content/resources/img/foxtrick_skin/HT-Images/Icons/Thumbs.db content/resources/img/foxtrick_skin/HT-Images/Matches/Thumbs.db content/resources/img/foxtrick_skin/HT-Images/Trophies/Thumbs.db content/resources/img/foxtrick_skin/HT-Images/Weather/Thumbs.db content/resources/personality/Thumbs.db db/rep-cache.db foxtrick.jar hooks/post-commit.tmpl hooks/post-lock.tmpl hooks/post-revprop-change.tmpl hooks/post-unlock.tmpl hooks/pre-commit.tmpl hooks/pre-lock.tmpl hooks/pre-revprop-change.tmpl hooks/pre-unlock.tmpl hooks/start-commit.tmpl locks/db-logs.lock maintainer/chrome_dev.pem res/links.json.zip res/staff/chpp.json.zip res/staff/editor.json.zip res/staff/foxtrick.json.zip res/staff/hy.json.gz res/staff/hy.json.zip res/staff/htls.json.zip chrome_dev.pem greasemonkey old_design userscripts 0.10.0 0.11.0 0.12.0 0.12.1 0.12.2 0.13.0 0.14.0 0.40.0 0.8 0.81 0.9.1 0.9.1.1 0.9.1.1@9099 0.9.2 0.9.2@9410 0.9.3 stats@11147 chatscripts league-news-filter old_design
```

## Tree filter
`largeflags.png` normally uses indexed colors (making the file more lightweight). However, this was not always the case.
```bash
#!/bin/bash
[ -f content/resources/img/largeflags.png ] && \
    [[ $(sha1sum content/resources/img/largeflags.png | grep -Po '^\S+') == \
        "887aea831c149274a9ac046fbb0a2bda5eade50f" ]] && \
        cp -f /tmp/flags.png content/resources/img/largeflags.png #new
[ -f content/resources/img/largeflags.png ] && \
    [[ $(sha1sum content/resources/img/largeflags.png | grep -Po '^\S+') == \
        "571da91fe87ffc10a3092cc3bfe64f337b349408" ]] && \
        cp -f /tmp/flags_old.png content/resources/img/largeflags.png #old

exit 0
```
