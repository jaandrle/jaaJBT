/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/*jsondoc={
    "version": "0.1.0",
    "script_name": "gulp_task_run_cordova_wrapper",
    "description": [
        "Gulp task for running cordova commands (using your own win/mac/linux script defined in `app.shared.cordova_wrapper`).",
        "There is also possibility to force different current work directory by defining `app.shared.*`. Where `*` must be defined in your `package.json` as `cordova_wrapper_cwd` (don’t forget setting `app_keys_map`)!!!"
    ],
    "root_path": "gulp_tasks"
}*/
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    var c_citac=0, c_citac_text="", c_citac_pro_text=0, c_citac_pro_text_max= 10;
    const { bin }= app.directories;
    const cwd= app.shared[app.cordova_wrapper_cwd];
    return function(cb){
        let cmd;
        if(!error.getNum()&&app.shared.cordova_wrapper){
            if(cwd) $o.fs.copyFileSync(bin+"config.xml", cwd+"config.xml");
            $g.util.log($g.util.colors.green('[Success]'), "Spoustim 'cordova run'.");
            cmd= $o.spawn(app.shared.cordova_wrapper, ["!", cordova_target_device], { cwd: cwd||bin });
            cmd.stdout.on('data', function(data){
                if(++c_citac===60){
                    c_citac_text= " | |".repeat(c_citac_pro_text)+" ||| "+"- - ".repeat((c_citac_pro_text_max-c_citac_pro_text));
                    c_citac= 0;
                    c_citac_pro_text= c_citac_pro_text===c_citac_pro_text_max ? c_citac_pro_text_max : c_citac_pro_text+1;
                    $g.util.log($g.util.colors.green('[Success]'), "'cordova run':  "+c_citac_text); //\x1Bc
                }
                error.logBuffer(data);}
            );
            cmd.on("close", function(){
                if(error.getText().toLowerCase().indexOf("fail")!==-1) $g.util.log($g.util.colors.red('[Error]'), "'cordova run' selhalo - vystup k nalezeni v ./gulp/logs/build.log!");
                else $g.util.log($g.util.colors.green('[Success]'), "'cordova run' probehlo uspesne.");
                $o.fs.writeFile(app.directories.gulp+'logs/build.log', error.getText(), cb);
            });
        } else if(app.shared.cordova_wrapper) {
            $g.util.log($g.util.colors.red('[Error]'), "'cordova run' nespusteno, nalezeny chyby!");
            cb();
        } else {
            cb();
        }
    };
};