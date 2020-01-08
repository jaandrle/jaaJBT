## jaaJBT
This repository contains my building tools for my projects (mainly Cordova) and for now very naive script for syncing these tools across my projects.
### jaaJBT.js
This script provide basic script updating/version checking functionality. Copy this script to your repository and run `node jaaJBT check`. The script loads `package.json` (key _jaaJBT_) and compares regeistered scripts (see example) against __jaaJBT.json in this repository__.

See **[package.json:line26](./package.json#L26)**

### Building tools overview
There are overview of my scripts.
#### aspect_ratio_scss
Pomocné utility pro zachování poměru (např. obrázku) pomocí vlastně `padding-bottom` triku a absolutního pozicování uvnitř relativního rodiče.

Zdroje/inspirace:

   - https://www.vzhurudolu.cz/prirucka/css-pomer-stran

   - https://codepen.io/airen/pen/BZQgRb
[Link to source](bin/aspect_ratio.scss)

#### gulpfile
Common gulpfile for my projects. It dynamically loads configuration from `package.json` and tasks from `./gulp/tasks/`. More description __TBD__.
[Link to source](bin/gulpfile.js)

#### gulp_cleanJSHINT
Utility for using in combination with `gulp_place` (see `filesCleaner` key in argument object).
[Link to source](bin/gulp_cleanJSHINT.js)

#### gulp_place
Returned function 'gulp_place' must be used in gulp.pipe and replacing 'gulp_place' in source files by another files content or eval inputed data (i.e. variables inside gulpfile).

In case of file replacing and situation `^    gulp_place('file');` also spaces and new line (and ';' if writted) is replaced (see 'gulp_place_regex').

The varibale (in case gulp_place('***', 'variable')) is replaced by `'`+***+`'` (means as string)
[Link to source](bin/gulp_place.js)

#### jsonDoc
Naive script for searching JSONs for given files and generating documentations based on templates. More description __TBD__.
[Link to source](bin/jsonDoc.js)

#### gulp_task_config
Gulp task for generating cordovas `config.xml`. More description __TBD__.
[Link to source](bin/task-config.js)

#### gulp_task_css
Gulp task for processing `*.css` and fonts (see line 24). More description __TBD__.
[Link to source](bin/task-css.js)

#### gulp_task_default
Main/default gulp task for serializing others tasks scripts. More description __TBD__.
[Link to source](bin/task-default.js)

#### gulp_task_gradle_fixes
Various fixes for `build.gradle`

There is also possibility to force different current work directory by defining `app.shared.*`. Where `*` must be defined in your `package.json` as `cordova_wrapper_cwd` (don’t forget setting `app_keys_map`)!!!
[Link to source](bin/task-gradle_fixes.js)

#### gulp_task_html
Gulp task for processing `*.html` files in `html/` subdirectory inside `app.directories.src`. More description __TBD__.
[Link to source](bin/task-html.js)

#### gulp_task_img
Gulp task for processing images in `img/` subdirectory inside `app.directories.src`. More description __TBD__.
[Link to source](bin/task-img.js)

#### gulp_task_javascript-libs
Gulp task for processing `*.js` in `js_libs/` subdirectory inside `app.directories.src`. More description __TBD__.
[Link to source](bin/task-javascript-libs.js)

#### gulp_task_javascript
Gulp task for processing `*.js` in `js/` subdirectory inside `app.directories.src`. More description __TBD__.
[Link to source](bin/task-javascript.js)

#### gulp_task_run_cordova_wrapper
Gulp task for running cordova commands (using your own win/mac/linux script defined in `app.shared.cordova_wrapper`).

There is also possibility to force different current work directory by defining `app.shared.*`. Where `*` must be defined in your `package.json` as `cordova_wrapper_cwd` (don’t forget setting `app_keys_map`)!!!
[Link to source](bin/task-run c !.js)

#### config_main_xml
undefined
[Link to source](bin/config/config.xml)

#### config_general_android_params_xml
undefined
[Link to source](bin/config/config_general/android_params.sub.xml)

#### config_general_params_xml
undefined
[Link to source](bin/config/config_general/global_params.sub.xml)

#### config_general_ios_params_xml
undefined
[Link to source](bin/config/config_general/ios_params.sub.xml)