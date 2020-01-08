/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/*jsondoc={
    "version": "0.1.0",
    "script_name": "gulp_task_gradle_fixes",
    "description": [
        "Various fixes for `build.gradle`",
        "There is also possibility to force different current work directory by defining `app.shared.*`. Where `*` must be defined in your `package.json` as `cordova_wrapper_cwd` (don’t forget setting `app_keys_map`)!!!"
    ],
    "root_path": "gulp_tasks"
}*/
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        bin= app.shared[app.cordova_wrapper_cwd] || app.directories.bin,
        [ folder, destination ]= [ "", "" ].map((sep=> ()=> `${bin}platforms${sep}android${sep}`)(bin.indexOf("/")===-1?"\\":"/"));
    return function(cb){
        if(error.getNum()) return cb();
        if(!$o.fs.existsSync(folder)) {
            console.log('No android platform!');
            return cb();
        }
        gulp.src([ folder+"build.gradle" ])
            .pipe(repositoriesFix())
            .pipe(androidSupportGmsFix())
            .pipe(pinSupportForAllFix())
            .pipe(gulp.dest(destination))
            .on('end', cb);
    };
    function repositoriesFix(){
        const search= [
            '    repositories {',
            '        jcenter()',
            '        maven {',
            '            url "https://maven.google.com"',
            '        }',
            '    }'
        ].join("\n");
        const replace= [
            '    repositories {',
            '        mavenCentral()',
            '        maven { url "https://maven.google.com" }',
            '        jcenter()',
            '        maven { url "https://jitpack.io" }',
            '    }'
        ].join("\n");
        return $g.replace(/    repositories \{\r?\n([^\r\n]*\r?\n){4}    \}/g, function(m){
            if(m!==search) return m;
            return replace;
        });
    }
    function androidSupportGmsFix(){
        const search= [
            'dependencies {',
            '    compile fileTree(dir: \'libs\', include: \'*.jar\')',
            '    // SUB-PROJECT DEPENDENCIES START',
            '    debugCompile(project(path: "CordovaLib", configuration: "debug"))',
            '    releaseCompile(project(path: "CordovaLib", configuration: "release"))',
            '    // SUB-PROJECT DEPENDENCIES END',
            '}',
        ].join("\n");
        const replace= [
            'dependencies {',
            '    compile fileTree(dir: \'libs\', include: \'*.jar\')',
            '    // SUB-PROJECT DEPENDENCIES START',
            '    debugCompile(project(path: "CordovaLib", configuration: "debug"))',
            '    releaseCompile(project(path: "CordovaLib", configuration: "release"))',
            '    compile "com.android.support:support-v4:+"',
            '    compile "com.android.support:support-v13:24+"',
            '    compile "com.google.android.gms:play-services-gcm:15+"',
            '    compile "me.leolin:ShortcutBadger:1.1.14@aar"',
            '    // SUB-PROJECT DEPENDENCIES END',
            '}',
        ].join("\n");
        return $g.replace(/dependencies \{\r?\n([^\r\n]*\r?\n){5}\}/g, function(m){
            if(m!==search) return m;
            return replace;
        });
    }
    function pinSupportForAllFix(){
        const replace= [
            '',
            '// pinSupportForAllFix',
            'configurations.all {',
            '    resolutionStrategy.eachDependency { DependencyResolveDetails details ->',
            '        // Pin the support library version so that all libraries use the same one',
            '            if (details.getRequested().getGroup() == "com.android.support") {',
            '                details.useVersion("26.0.0")',
            '            }',
            '        }',
            '}',
        ].join("\n");
        return $g.replace(/(\/\/ pinSupportForAllFix|$(?![\r\n]))/m, function(m, _1, a){
            if(m!=="") return m;
            return replace;
        });
    }
};