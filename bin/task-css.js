/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/*jsondoc={
    "version": "0.1.2",
    "script_name": "gulp_task_css",
    "description": "Gulp task for processing `*.css` and fonts (see line 24). More description __TBD__.",
    "root_path": "gulp_tasks"
}*/
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        folders_name= [ "css/", "fonts/" ],
        [ folder_css, files_pattern_css, files_not_pattern_css ]= [ app.directories.src+folders_name[0], "*.css", "*.sub.css" ],
        destination_css= app.directories.bin_www+folders_name[0],
        folder_fonts= app.directories.src+folders_name[1],
        destination_fonts= app.directories.bin_www+folders_name[1];
    /* jshint -W061 */const gulp_place= require("../gulp_place.js")({gulp_replace: $g.replace, fs: $o.fs, variable_eval: (str)=> eval(str)});/* jshint +W061 */
    return function(cb){
        if(error.getNum()) return cb();
        gulp.src([ `${folder_css}${files_pattern_css}`, `!${folder_css}${files_not_pattern_css}` ])
            .pipe(gulp_place({ folder: app.directories.src || "./", string_wrapper: '' }))
            .pipe($g.replace(/\r?\n\/\*# sourceMappingURL=[^\*]* \*\/\r?\n?/g, ""))
            .pipe($g.replace(/font\//g, folders_name[1]))
            .pipe(gulp.dest(destination_css))
            .on('end', ()=>{
                gulp.src(["eot", "svg", "ttf", "otf", "woff", "woff2"].map(v=> `${folder_fonts}/**/*.`+v))
                    .pipe($g.rename(function(path){
                        path.dirname= "";
                    }))
                    .pipe(gulp.dest(destination_fonts))
                    .on('end', cb);
            });
    };
};
