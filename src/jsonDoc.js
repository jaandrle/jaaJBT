/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
/*jsondoc={
    "version": "0.1.2",
    "script_name": "jsonDoc",
    "root_path": "gulp_path"
}*/
module.exports= function initGenerateJSONDoc({
        fs,
        root_path= "",
        jsondoc_pattern: main_jsondoc_pattern= "<\\!--jsondoc=JSON-->",
        helpers_functions: main_helpers_functions= {},
        templateItem: main_templateItem,
        templateMain: main_templateMain
    }= {}){
    if(!fs) throw new Error("Missing argument `fs`!");
    const
        folder_glob_reg= /\*\*\/$/g,
        folder_deep_glob_reg= /\*\*\/\*\*\/$/g;
    const main_helpersFunctions= {
        joinLines: (multi_line, j= "\n")=> Array.isArray(multi_line) ? multi_line.join(j) : multi_line,
        ifPartial, partial
    };
    const 
        default_template_nth= initDefaultTemplateNth(),
        default_template= initDefaultTemplate();

    return function generateJSONDoc({
            files,
            jsondoc_pattern= main_jsondoc_pattern,
            helpers_functions= Object.create(main_helpers_functions),
            templateItem= main_templateItem,
            templateMain= main_templateMain
        }= {}){
        //console.log({ files, jsondoc_pattern, helpers_functions, templateItem, templateMain });
        if(!files) throw new Error("Missing argument `files`!");
        const /* consts values initialization */
            jsondoc_reg= initRegExp(jsondoc_pattern),
            [ folders_part, files_part ]= initFilesFolders(files);
        const /* generation consts initialization */
            templateNth= templateItem ? fs.readFileSync(templateItem, 'utf8') : default_template_nth,
            template= templateMain ? fs.readFileSync(templateMain, 'utf8') : default_template,
            helpers= Object.assign({}, helpers_functions, main_helpersFunctions);

        let folders= [ folders_part.replace(/\*\*\//g, "") ];
        if(folder_glob_reg.test(folders_part)) folders= folders.concat(getFolders(folders_part));

        return ()=> new Promise(function(resolve,reject){
            try{
                const jsons= folders.map(toJSONs).filter(obj_arrs=> obj_arrs.length).reduce(/* flat throught folders */(acc, curr)=> (acc.push(...curr), acc), []);
                resolve(toMarkdownNth(template, helpers)({ content: toDoc(jsons), data: jsons }));
            } catch (e){
                reject(e);
            }
        });
        function toJSONs(folder){
            return fs.readdirSync(folder)
                    .filter(file_name=> !fs.statSync(folder+file_name).isDirectory()&&files_part.test(file_name))
                    .map(file_name=> folder+file_name)
                    .map(file=> [file, catFile(file, jsondoc_reg)])
                    .filter(([file, parse])=> parse!=="[]")
                    .map(([file, content])=> { try { return JSON.parse(content); } catch(e){ throw new Error(`Non-valid documentation in '${file}': ${e}`); }})
                    .reduce(/* flat throught files */(acc, curr)=> (acc.push(...curr), acc), []);
        }
        function toDoc(jsons){
            return jsons
                .map(toMarkdownNth(templateNth, helpers))
                .filter(Boolean)
                .join("\n\n");
        }
    };
    function toMarkdownNth(template, helpers){
        return function(curr){
            const nth= template.replace(/\$\{([^\{\}]*)\}/g, handleDocGeneration);
            function handleDocGeneration(m, expression){
                const expression_arr= expression.split(" ");
                if(expression_arr.length===1) return curr[expression];
                const [_fun, ...args]= expression_arr;
                const fun= helpers[_fun];
                if(!fun) throw new Error(`Helper function '${_fun}' not found!`);
                try{
                    return fun.apply(helpers, args.map(e=> e.charAt(0)==='"'||e.charAt(0)==="'" ? templateRegexpFix(e.substring(1, e.length-1)) : curr[e]));
                }catch(e){
                    throw new Error(`'${_fun}': ${e}.`);
                }
            }
            return nth;
        };
    }
    function ifPartial(condition, ifTemplate= "", ifValue= "", elseTemplate= "", elseValue= ""){
        const isO= v=> typeof v==="object";
        const value_is_object= isO(condition);
        const elseFinalValue= elseTemplate ? toMarkdownNth(fs.readFileSync(root_path+elseTemplate, 'utf8'), this)(isO(elseValue) ? elseValue : { value: elseValue }) : elseValue;
        if(!condition||(value_is_object&&!Object.keys(condition).length)) return elseFinalValue;
        return ifTemplate ? toMarkdownNth(fs.readFileSync(root_path+ifTemplate, 'utf8'), this)(isO(ifValue) ? ifValue: { value: ifValue }) : ifValue;
    }
    function partial(template, value, type="object", j=""){
        const value_is_object= typeof value==="object";
        if(!value||(value_is_object&&!Object.keys(value).length)) return "";
        if(!value_is_object) value= { value };
        const templateFile= toMarkdownNth(fs.readFileSync(root_path+template, 'utf8'), this);
        if(type!=="loop") return templateFile(value);
        return Object.keys(value).map(k=> typeof value[k]==="object"&&!Array.isArray(value[k]) ? value[k] : { value: value[k], key: k }).map(templateFile).join(templateRegexpFix(j));
    }
    function templateRegexpFix(string){
        return string.replace(/\\n/g, "\n").replace(/\\s/g, " ");
    }
    function getFolders(folders_pattern){
        const parent_folder= folders_pattern.replace(/\*\*\//g, "");
        const first_deep= fs.readdirSync(parent_folder).filter(item=> fs.statSync(parent_folder+item).isDirectory()).map(folder_name=> parent_folder+folder_name+"/");
        if(!folder_deep_glob_reg.test(folders_pattern)) return first_deep;
        const subFoldersPattern= folder=> folder+"**/".repeat(folders_pattern.match(/\*\*\//g).length);
        return first_deep.concat(first_deep.reduce((acc, folder)=> acc.concat(getFolders(subFoldersPattern(folder))), []));
    }
    /* file reading */
    function catFile(file, jsondoc_reg){
        let out= [];
        try{
            fs.readFileSync(file, 'utf8').replace(jsondoc_reg, nthMatch);
            return "["+out.join(", ")+"]";
        }catch(e){
            throw new Error(`File '${e.path}' cannot be found!`);
        }
        function nthMatch(m, f, _, chars, file_text){
            const line_key= '"line": '+String((t=> t&&t.length+1||1)(file_text.substring(0, chars).match(/\r?\n/g)));
            const file_key= `"file": "${file}"`;
            out.push(f+', '+line_key+", "+file_key+"}");
            return m;
        }
    }
    /* initialization functions */
    function initRegExp(jsondoc_pattern){
        const pattern_array= jsondoc_pattern.split("JSON");
        const /* regexp parts: PATTERN_START{JSON_BODY+NOT_PATTERN_END}PATTERN_END */
            reg_start= pattern_array.shift(),
            reg_end= pattern_array.pop(),
            reg_prevent_wrong_end= reg_end.split(/(\\.|)/g /* string escaption> e.g.: "\\*" => \* in RegExp => (?!\*) */).filter(Boolean).reduce((acc,v)=> acc+="(?!"+v+")", ""),
            reg_json= `({([^}]|}${reg_prevent_wrong_end})*)}`;
        return new RegExp(`${reg_start}${reg_json}${reg_end}`, "g");
    }
    function initFilesFolders(files){
        const last_slash= files.lastIndexOf("/")+1;
        let [ folders_part, files_part ]= [ [ 0, last_slash ], [ last_slash ] ].map(p=> files.substring(...p));
        files_part= new RegExp(files_part
            .replace(/[\.\(\)]/g, m=> "\\"+m)
            .replace(/\*/g, ".*")
        );
        return [ folders_part, files_part ];
    }
    function initDefaultTemplateNth(){
        return [
            "### ${id}",
            "*[defined@${filename}:${line}](../${file}#L${line})*",
            "",
            ">${description}"
        ].join("\n");
    }
    function initDefaultTemplate(){
        return [
            "# Documentation",
            "",
            "${content}"
        ].join("\n");
    }
};