/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
module.exports= function({app, $gulp_folder, gulp, error, $g, $o, scripts}){
    const /* params */
        jsondoc_modifications= "readme_src/";
    const /* documentation functions */
        generateJSONDoc= require("../jsonDoc.js")({ fs: $o.fs, root_path: jsondoc_modifications, jsondoc_pattern: "\\/\\*jsondoc=JSON\\*\\/" }),
        writeDoc= file=> markdown=> new Promise(function(resolve,reject){ $o.fs.writeFile(file, markdown, err=> !err ? resolve() : reject(err)); });
    return function(cb){
        generateJSONDoc({
            files: app.directories.bin+"**/**/*.*",
            templateMain: jsondoc_modifications+"README_main.md",
            templateItem: jsondoc_modifications+"README_nth.md",
        })()
        .then(writeDoc("README.md"))
        .catch(error.handler)
        .then(cb);
    };
};