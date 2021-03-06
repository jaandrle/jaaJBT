/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/* version 0.1.1 */
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        [ folder, files_pattern, files_not_pattern ]= [ app.directories.src+"**/", "*.js", "*.sub.js" ],
        destination= app.directories.bin;
    const [jshint_cmd, ...jshint_rest]= scripts.jshint.split(" ");
    const skip_final_jshint= [ "core.js", "index.js" ];
    /* jshint -W061 */const ecalp_plug= require("../ecalp_plug.js")({gulp_replace: $g.replace, fs: $o.fs, variable_eval: (str)=> eval(str), filesCleaner: require("../gulp_cleanJSHINT.js")});/* jshint +W061 */
    return function(cb){
        let out_files= [];
        if(error.getNum()) return cb();
        jsHint(folder)
        .then(run)
        .then(()=> app.external_publication ? undefined : Promise.all(out_files.map(file=> destination+file).map(jsHint))).then(skipPromise)
        .catch(identityPromise)
        .then(cb);
    
        function run(){
            return new Promise(function(resolve){
                let main_stream= gulp.src([ `${folder}${files_pattern}`, `!${folder}${files_not_pattern}` ])
                        .pipe(ecalp_plug({ folder, string_wrapper: '"' }))
                        .pipe($g.replace(/[^\n]*(\/\*\s*gulp\s\*\/)?\/\*\s*global ecalp_plug\s*\*\/\r?\n/g,""));
                main_stream
                    .on('error', error.handler)
                    .on('data', function({ basename }= {}){ if(skip_final_jshint.indexOf(basename)===-1) out_files.push(basename); })
                    .pipe(gulp.dest(destination))
                    .on('end', resolve);
            });
        }
    
        function jsHint(files_for_lint){
            return new Promise(function(resolve, reject){
                let cmd= $o.spawn(jshint_cmd, [...jshint_rest, files_for_lint], {});
                cmd.stdout.on('data', error.logBuffer);
                cmd.on('close', code=> code ? error.logSave("javascripts", reject) : resolve());
            });
        }
    };
    function skipPromise(){ }
    function identityPromise(params){ return params; }
};