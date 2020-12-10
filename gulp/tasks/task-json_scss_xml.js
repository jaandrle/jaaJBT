/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/* version 0.1.1 */
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        [ folder, ...files_extensions ]= [ app.directories.src+"**/", "json", "scss", "xml" ],
        destination= app.directories.bin;
    /* jshint -W061 */const ecalp_plug= require("../ecalp_plug.js")({gulp_replace: $g.replace, fs: $o.fs, variable_eval: (str)=> eval(str)});/* jshint +W061 */
    return function(cb){
        gulp.src(files_extensions.map(ex=> `${folder}*.${ex}`))
        .pipe(ecalp_plug({ folder, string_wrapper: '"' }))
        .pipe(gulp.dest(destination))
        .on('error', error.handler)
        .on('end', cb);
    };
};