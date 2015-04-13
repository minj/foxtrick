# Developing Foxtrick

**Foxtrick** is a browser extension for the Hattrick online football manager game, currently available for Firefox, Google Chrome, Opera (blink), and Safari. It is mainly written in JavaScript.

**Foxtrick** uses git for version control, and is hosted at github: 
https://github.com/minj/foxtrick/

If you are bored and have nothing to do, you could check the [Foxtrick issue list](https://github.com/minj/foxtrick/issues) and help out.

## Getting a copy of the source

* Using git:
`git clone https://github.com/minj/foxtrick.git`

Please refer to the instructions how to use [git](http://git-scm.com/book/en/v2) and [github](https://help.github.com/).

* Using subversion:
`svn checkout https://github.com/minj/foxtrick`

## Localizing Foxtrick

We use [crowdin](https://crowdin.com/project/foxtrick) for localization. Please do not make any changes directly to files in `content/locale/*`.

## Contributing

For now we will be using the [github flow](https://guides.github.com/introduction/flow/index.html) for development:
* fork the repo and check it out locally
* create a topic branch off of `master`*
* add and push changes
* submit pull requests with your improvements

\* Bug fixes for release versions should be based of the last release branch. They will be merged into `master` later.

**NB:** import this preference to enable Foxtrick logging:
`user_pref("extensions.foxtrick.prefs.logDisabled",false);`

### Code style
Please refer to the [Code Style Guidelines](maintainer/CodeStyle.md).

Keep in mind that they are still subject to change since the code base has a lot of legacy code that is barely readable and is being constantly worked on. Your input is desirable.

### Defining a commit

You should make your commits as atomic as possible, do not make two separate changes in one commit, and don't make a commit that breaks something which requires other commits to fix if you are aware of the potential break.

Don't be afraid that your commit only fixes a simple typo, or fixes inconsistent white-space; don't let them hitchhike commits of other changes, leave them in a single commit.

You should learn and use advanced git functionality to split and manage your commits. Apps like `gitg`, `gitk` or [github tools](https://windows.github.com/) should be of use.

### Commit message

Please compose your commit message in the following format:
<pre>
A short line briefly describing your changes

Describe what files, functions and/or interfaces are changed and
why you change them. References of issues are highly desirable.
</pre>

### Creating a new module

Most of **Foxtrick** functions are implemented in modules. Generally, each module is a JavaScript file, placed in the directory `content/CATEGORY`.

Each file, named `module-name.js`, contains a single object, named `Foxtrick.modules['ModuleName']`, which should conform the following specifications:
* A property named `MODULE_CATEGORY`, which specifies its category. You can look up the list of categories in the [content/env.js](content/env.js) file.
* A property named `PAGES`, which is an array containing the pages that the module should run on. The pages are listed at [content/pages.js](content/pages.js).
* A property function `run(doc)`, which will be run on the pages specified in the PAGES property. The argument `doc` is the HTML `document` object.
* There are also other properties including `OPTIONS`, `CSS`, etc. You could refer to the source of existing modules for their uses. Of course, usually they mean what their names imply.

After creating that JavaScript file and placing it under the appropriate directory, you should run `python module-update.py add category/module.js` to link it across all browsers.

You also need to add internationalization and default properties for your module. Please refer to the [DevGuide](maintainer/DevGuide.md) for this and more advanced topics.

## Contact us
Should any questions arise you can find us at [Hattrick](https://www.hattrick.org/goto.ashx?path=/Forum/Read.aspx?t=16281487%26n=1%26v=4) and #foxtrick @ irc.quakenet.org.

## Happy Hacking!

<pre>
Ryan Li <ryan@ryanium.com>
26 June 2010

Revised 11 June 2011
Revised 17 July 2011
Revised 25 November 2011 (CatzHoek)
Revised 26 September 2013 (teles)
Revised 19 March 2015 (LA-MJ)
</pre>
