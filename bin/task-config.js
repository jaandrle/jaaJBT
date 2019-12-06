/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/*jsondoc={
    "version": "0.1.0",
    "script_name": "gulp_task_config",
    "description": "Gulp task for generating cordovas `config.xml`. More description __TBD__.",
    "root_path": "gulp_tasks"
}*/
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        [ folder, files_pattern, files_not_pattern ]= [ app.directories.src+"config/", "*.xml", "*.sub.xml" ],
        destination= app.directories.bin;
    /* jshint -W061 */const gulp_place= require("../gulp_place.js")({gulp_replace: $g.replace, fs: $o.fs, variable_eval: (str)=> eval(str)});/* jshint +W061 */
    return function(cb){
        if(error.getNum()) return cb();
        gulp.src([ `${folder}${files_pattern}`, `!${folder}${files_not_pattern}` ])
        .pipe(gulp_place({ folder, string_wrapper: '' }))
        .pipe(gulp.dest(destination))
        .on('end', cb);
    };
};
