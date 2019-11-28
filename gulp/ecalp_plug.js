"use stric";
/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true *//* global module */
module.exports= function({ gulp_replace= false, fs= false, variable_eval= false, filesCleaner= content=> content }= {}){
    if(!gulp_replace) throw Error("Missing 'gulp-replace' function!");
    if(!fs) throw Error("Missing 'fs' object!");
    if(!variable_eval) throw Error("Missing 'variable_eval' function!");
    let /* shared vars */
        files_added= new Set();
    const /* shared consts */
        ecalp_plug_regex= /( *)ecalp_plug\(\s*(?:\"|\')([^\"\']+)(?:\"|\')(?:\s*,\s*(?:\"|\')([^\"\']+)(?:\"|\'))?\s*\)(;?)([^\r\n]*\/\*[^\*]*\*\/)?/g,
        folder_glob_reg= /\*\*\/$/g,
        folder_deep_glob_reg= /\*\*\/\*\*\/$/g;
    
    return function ecalp_plug({folder= "js/", string_wrapper= '"'}= {}){
        return gulp_replace(ecalp_plug_regex,function(full_match, spaces= "", name= false, type="file", semicol= "", jshint_global= ""){
            return parseFileHandler({name, full_match, type, spaces, string_wrapper, semicol, jshint_global});

            function parseFileHandler({name, full_match, type, spaces, string_wrapper, semicol, jshint_global}){
                if(!name) return full_match;
                name= name.replace(/&prime;/g, "'").replace(/&Prime;/g, "\"").replace(/`/g, "'");
                switch (type){
                    case "clean":           return (files_added= new Set(), spaces+jshint_global);
                    case "files":
                    case "glob":            return filesCleaner(parseFile(parseGlob(false, folder, ((name)=>[name, name.lastIndexOf("/")+1])(fileNameVarHandler(name)), spaces)));
                    case "files_once":
                    case "glob_once":       return filesCleaner(parseFile(parseGlob(true, folder, ((name)=>[name, name.lastIndexOf("/")+1])(fileNameVarHandler(name)), spaces)));
                    case "file":            return fileHandler(false, true, folder, fileNameVarHandler(name), spaces);
                    case "file_if_exists":  return fileHandler(false, false, folder, fileNameVarHandler(name), spaces);
                    case "file_once":       return fileHandler(true, true, folder, fileNameVarHandler(name), spaces);
                    case "variable":        return spaces+string_wrapper+variable_eval(name)+string_wrapper+semicol+jshint_global;
                    case "eval":            return (variable_eval(name), spaces+jshint_global);
                    case "eval_out":        return spaces+variable_eval(name)+semicol+jshint_global;
                }
            }
            function parseFile(file_data){
                return file_data.replace(ecalp_plug_regex, function(full_match, spaces= "", name= false, type="file", semicol= "", jshint_global= ""){
                    return parseFileHandler({name, full_match, type, spaces, string_wrapper, semicol, jshint_global});
                });
            }
            function fileHandler(once, strict, folder, file_name, spaces){
                if(once&&files_added.has(folder+file_name)) return "";
                files_added.add(folder+file_name);
                return parseFile(spaces+filesCleaner(catFile(folder+file_name, strict)).replace(/\r?\n/gm, "\n"+spaces));
            }
        });
    };
    function parseGlob(once, main_folder, match, spaces){
        const [ name, last_slash ] = match;
        let [ sub_folder, files ] = [ name.substr(0, last_slash), name.substr(last_slash) ];
        if(!last_slash) return "";
        files= new RegExp(files
            .replace(/[\.\(\)]/g, m=> "\\"+m)
            .replace(/\*/g, ".*")
        );
        let folders= [ main_folder+sub_folder.replace(/\*\*\//g, "") ];
        if(folder_glob_reg.test(sub_folder)) folders= folders.concat(getFolders(main_folder+sub_folder));
        
        const out= folders.reduce((acc, folder)=> acc+(acc?"\n":"")+parseFolder(folder), "");
        return out;

        function parseFolder(folder){
            return spaces+fs.readdirSync(folder)
                    .filter(file_candidate=> files.test(file_candidate)&&(!once||!files_added.has(folder+file_candidate)))
                    .map(file_name=> ( files_added.add(folder+file_name), catFile(folder+file_name).replace(/\r?\n/gm, "\n"+spaces) ))
                    .join("\n");
        }
        function getFolders(folders_pattern){
            const parent_folder= folders_pattern.replace(/\*\*\//g, "");
            const first_deep= fs.readdirSync(parent_folder).filter(item=> fs.statSync(parent_folder+item).isDirectory()).map(folder_name=> parent_folder+folder_name+"/");
            if(!folder_deep_glob_reg.test(folders_pattern)) return first_deep;
            const subFoldersPattern= folder=> folder+"**/".repeat(folders_pattern.match(/\*\*\//g).length);
            return first_deep.concat(first_deep.reduce((acc, folder)=> acc.concat(getFolders(subFoldersPattern(folder))), []));
        }
    }
    function fileNameVarHandler(str){
        if(typeof str !== "string") throw Error(`Type of '${str}' is not string!`);
        const reg= /\$\{([\s]*[^;\s\{]+[\s]*)\}/g;
        return str.replace(reg, replaceHandler);
        function replaceHandler(_, match){return variable_eval(match);}
    }
    function catFile(file, strict){
        try{
            return fs.readFileSync(file, 'utf8');
        }catch(e){
            if(!strict) return "";
            console.error(`File '${e.path}' cannot be found!`);
            return "/* ERROR: NO FILE FOUND!!! */";
        }
    }
};