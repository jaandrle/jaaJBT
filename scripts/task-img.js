/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        folder= app.directories.src+"img/",
        destination= app.directories.bin_www+"img/";
    return function(cb){
        if(error.getNum()) return cb();
        gulp.src([ folder+"*.*" ])
            .pipe($g.imagemin())
            .pipe(gulp.dest(destination))
            .on('end', cb);
    };
};
