/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
module.exports= function({app, $gulp_folder, gulp, error, $g, $o, scripts}){
    const /* params */
        jsondoc_modifications= "jaaJBT_json/";
    const /* documentation functions */
        generateJSONDoc= require("../jsonDoc.js")({ fs: $o.fs, root_path: jsondoc_modifications, jsondoc_pattern: "\\/\\*jsondoc=JSON\\*\\/" }),
        writeDoc= file=> markdown=> new Promise(function(resolve,reject){ $o.fs.writeFile(file, markdown, err=> !err ? resolve() : reject(err)); });
    return function(cb){
        $o.fs.writeFileSync(jsondoc_modifications+"jaaJBT_main.json.txt", [
            [ '{' ],
            [ '    "config": {' ],
            [ `        "version": "${app.version}",` ],
            [ '        "root_url": "https://raw.githubusercontent.com/jaandrle/jaaJBT/master/"' ],
            [ '    },' ],
            [ '    "scripts": {' ],
            [ '        ${toStructure data}' ],
            [ '    }' ],
            [ '}' ]
        ].join("\n"));
        generateJSONDoc({
            files: app.directories.bin+"**/**/*.*",
            helpers_functions: require("../../"+jsondoc_modifications+"helpers.js"),
            templateMain: jsondoc_modifications+"jaaJBT_main.json.txt",
            templateItem: jsondoc_modifications+"jaaJBT_nth.json.txt",
        })()
        .then(writeDoc("jaaJBT.json"))
        .catch(error.handler)
        .then(cb);
    };
};