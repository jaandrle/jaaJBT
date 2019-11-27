# jaaJBT
Building tools for my projects (for now very naive)

# jaaJBT.js
This script provide basic script updating/version checking functionality. Copy this script to your repository and run `node jaaJBT check`. The script loads `package.json` (key `jaaJBT`) and compares regeistered scripts (see example) against `jaaJBT.json` in this repository.

By calling `node jaaJBT update` (or `pull`) script download all outdated scripts in location based on `"target_path"` key (in `jaaJBT.json`) and key with same name in `"config"` (in your `package.json`).

**`package.json` example:**
```
…
"jaaJBT": {
    "config": {
        "version": "0.1.0",
        "gulp_path": "gulp/"
    },
    "scripts": {
        "gulp_cleanJSHINT": "~0.1.0",
        "gulp_place": "~1.5.1",
        "jsonDoc": "~0.1.0"
    }
},
…
```

# jsonDoc.js
Documentation generator based on JSONs … more info/documentation/examples **TBD**

# gulp_place.js
Provide ability to concating/combinig files and very basic templating system during building in gulp … more info/documentation/examples **TBD**

# gulp_cleanJSHINT.js
With combination JSHINT and gulp_place provide validating JS files … more info/documentation/examples **TBD**