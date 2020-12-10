/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/* version 0.1.1 */
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        [ folder, files_pattern ]= [ app.directories.bin+"**/", "*.json" ],
        destination= app.directories.bin;
    return function(cb){
        gulp.src([ `${folder}${files_pattern}` ])
        .pipe($g.replace(/\/\*jsondoc=\{[^\}]*\}\*\/\r?\n/g, ''))
        .pipe(gulp.dest(destination))
        .on('error', error.handler)
        .on('end', cb);
    };
};