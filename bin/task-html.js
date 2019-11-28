/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/* version 0.1.1 */
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        [ folder, files_pattern, files_not_pattern ]= [ app.directories.src+"html/", "*.html", "*.sub.html" ],
        destination= app.directories.bin_www;
    /* jshint -W061 */const gulp_place= require("../gulp_place.js")({gulp_replace: $g.replace, fs: $o.fs, variable_eval: (str)=> eval(str)});/* jshint +W061 */
    return function(cb){
        if(error.getNum()) return cb();
        gulp.src([ `${folder}${files_pattern}`, `!${folder}${files_not_pattern}` ])
            .pipe(gulp_place({ folder, string_wrapper: '' }))
            .pipe($g.htmlmin({ removeComments: true }))
            .pipe($g.replace(/^ *\r?\n/gm, ""))
            .pipe($g.replace(/    /g, " "))
            .pipe($g.rename(function(p){ if(p.basename==="main"){ p.basename="index"; } return p; }))
            .pipe(gulp.dest(destination))
            .on('end', cb);
    };
};
