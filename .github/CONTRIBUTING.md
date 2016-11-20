# Information for contributing code
Thank you for your interesting in improving Foxtrick \o/

## Workflow
We are using a modified [github flow](https://guides.github.com/introduction/flow/index.html) for development:
* fork the repo and check it out locally
* decide what you are working on and choose the appropriate base point:
  * is it a new module/feature? Base it on `master`.
  * is it an enhancement, or a bug fix or an otherwise urgent change that has no other dependencies? Base it on the last **annotated tag** (like `0.17.0`, see [below](#repo-structure)) if possible, a merged topic branch otherwise.
* create a topic branch at the chosen base point
* add and push changes
* submit a pull request with your improvements

More information about developing foxtrick can be found in [HACKING.md](../HACKING.md) and [DevGuide.md](../maintainer/DevGuide.md).

## Repo structure
Repository contains these branches: `master` (beta builds), a stable release branch (e.g. `r0.17.0`), `rls-notes`, `l10n` (continuous crowdin integration), `cdn` (continuous `res/` integration) and `build` (server-side scripts).

When major releases are made, they are tagged with an annotated release tag, e.g. `0.17.0`. These should be accessible by both `master` and `r0.17.0` branches.

Point (bug) releases (e.g. `0.17.0.1`) are tagged with lightweight tags and are only accessible from a release branch (`r0.17.0`).
