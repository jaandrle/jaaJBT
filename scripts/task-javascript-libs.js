/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        folder= app.directories.src+"js_libs/",
        destination= app.directories.bin_www+"js/";
    return function(cb){
        if(error.getNum()) return cb();
        gulp.src([ folder+"*.js" ])
            .pipe($g.concat('libraries.js'))
            .pipe($g.minify_js({noSource : true}))
            .pipe($g.rename('libraries.js'))
            .pipe(gulp.dest(destination))
            .on('end', cb);
    };
};
