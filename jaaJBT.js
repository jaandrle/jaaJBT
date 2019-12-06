/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
/* node has 5min cahce for requests!!! */
const /* configs files paths */
    version= "1.1.2",
    config_key_name= "jaaJBT",
    config_local= "./package.json",
    config_remote_name= "jaaJBT.json";
const /* dependences */
    fs= require("fs"),
    https= require("https");
const /* local config, arguments */
    package_json= JSON.parse(fs.readFileSync(config_local)),
    local_jaaJBT= package_json[config_key_name],
    colors= { e: "\x1b[31m", s: "\x1b[32m", w: "\x1b[33m", R: "\x1b[0m" },
    cmd_arguments= process.argv.slice(2);

let spaces= "  ";
toConsole(`${colors.w}${config_key_name}@v${version}`, "normal", "_info");
spaces= "    ";

if(!local_jaaJBT) cmd_arguments[0]+= "_ERROR_";
else local_jaaJBT.rename= local_jaaJBT.rename || {};

switch (cmd_arguments[0]){
    case "check":       check();                                                break;
    case "update":      check(update);                                          break;
    case "overview":    overview(cmd_arguments.slice(1));                       break;
    case "check_ERROR_": case "update_ERROR_": case "overview_ERROR_":     
                        toConsole("Local versions", "warn", "_no_local");       break;
    default :           toConsole("Help", "normal","_help");
}

function check(cb){
    Promise.all(local_jaaJBT.resourses.map(res=> `${res}${config_remote_name}?v=${Math.random()}`).map(getJSON))
    .then(function(data){
        const remote_jaaJBT= consolidateJSONObjects(data);
        let results= [];
        if(isNewer(remote_jaaJBT.config.version)) return toConsole(`Update is not possible (new version ${remote_jaaJBT.config.version})`, "error", spaces.repeat(2)+"Your `jaaJBT.js` script must be up-to-date to proper comparing/updating!");
        Object.keys(local_jaaJBT.scripts||{}).forEach(function(key){
            const remote_k= remote_jaaJBT.scripts[key];
            let local_k= local_jaaJBT.scripts[key];

            if(!remote_k) return results.push([ key, "is not registered in remote resourse!", colors.e, "" ]);
            const remote_k_version= remote_k.version;
            if(local_k[0]==="=") return results.push([ key, "skipped update check because of `=`!", colors.w, local_k ]);
            if(!/^\d/.test(local_k[0])) local_k= local_k.substring(1);

            const result= local_k!==remote_k_version ? [ "outdated", colors.e ] : [ "up-to-date", colors.s ];
            const version= remote_k_version.split("").map((v,i)=> v===local_k.charAt(i) ? v : colors.e+v).join("")+colors.R;
            results.push([ key, ...result, version ]);
        });
        toConsole("Versions comparisons", "normal", results.map(([ key, result, color, version ])=> `${spaces.repeat(2)}${key}: ${color}${result}${colors.R}` + (version ? ` (${version})` : "")).join("\n"));
        if(cb) cb(remote_jaaJBT, results);
    })
    .catch(err=> (toConsole("Remote versions", "error", "_no_connection"), toConsole(spaces+"Error in", "error", spaces.repeat(3)+err)));
}
function overview(types){
    const getKeys= types.indexOf("diff")===-1 ?
        scripts=> Object.keys(scripts) :
        scripts=> Object.keys(scripts).filter((local_keys=> function(key){ return local_keys.indexOf(key)===-1; })(Object.keys(local_jaaJBT.scripts)));
    const no_scripts_text= spaces.repeat(2)+"No scripts for your filter.";

    Promise.all(local_jaaJBT.resourses.map(res=> `${res}${config_remote_name}?v=${Math.random()}`).map(getJSON))
    .then(function(data){
        const remote_jaaJBT= consolidateJSONObjects(data);
        const { scripts }= remote_jaaJBT;
        if(types.indexOf("package")!==-1){
            toConsole("Lines to `package.json` (without `,` on EOL)", "normal",
                getKeys(scripts).map(key=> spaces.repeat(2)+`"${key}": "",`).join("\n") || no_scripts_text
            );
        } else {
            toConsole("Available scripts", "normal",
                getKeys(scripts)
                    .map(key=> [
                        `${colors.w}${key}${colors.s}@v${scripts[key].version}${colors.R}`,
                        ...[
                            `target_path: "${scripts[key].target_path}"`,
                            `description: "${scripts[key].description || "-"}"`
                        ].map(t=> spaces.repeat(2)+t)
                    ].map(t=> spaces+t).join("\n"))
                    .map(t=> spaces+t).join("\n") || no_scripts_text
            );
        }
    })
    .catch(err=> (toConsole("Remote versions", "error", "_no_connection"), toConsole(spaces+"Error in", "error", spaces.repeat(3)+err)));
}
function update(remote, results_all){
    const results= results_all.filter(([ _, result ])=> result==="outdated").map(([ key, _1, _2, version ])=> `${key}@v${version.replace(colors.e, "")}`);
    if(!results.length) return toConsole("Scripts to download", "normal", spaces.repeat(2)+"Nothing to download");
    arrayToConsole("Scripts to download", "normal", colors.w)(results);

    Promise.all(results.map(toObject).map(downloadNth))
    .then(UpdateConfig)
    .then(results=> results.map(({ target_full })=> target_full))
    .then(arrayToConsole("Download — successfull", "normal", colors.s))
    .catch(toConsole.bind(null, "Download — error", "error"));

    function toObject(res){ const key= res.split("@v")[0]; return Object.assign({ key }, remote.scripts[key]); }
}


function downloadNth(def){
    const { src, target_path, version, key }= def;
    const local_target_path= local_jaaJBT.config[target_path] || "";
    const file_name= local_jaaJBT.rename[key] || src.substring(src.lastIndexOf("/")+1);
    return download(`${src}?v=${version}`, local_target_path+file_name, def);
}
function UpdateConfig(results){
    results.forEach(({ key, version })=> local_jaaJBT.scripts[key]= `~${version}`);
    saveConfig();
    return results;
}

function getJSON(url){ return new Promise(function(resolve, reject){ https.get(url, response=> response.on("data", function(data){ try{ resolve(JSON.parse(data)); } catch(e){ reject(url); } })).on("error", reject); }); }
function download(from, to, share){ return new Promise(function(resolve, reject){
    const file= fs.createWriteStream(to);
    https.get(from, function(response) {
        response.pipe(file);
        file.on('finish', ()=> file.close(()=> resolve(Object.assign( { src_full: from, target_full: to }, share ))) /* close() is async, call cb after close completes. */);
    }).on('error', function(err) { // Handle errors
        fs.unlink(to); // Delete the file async. (But we don't check the result)
        reject(err.message);
    });
});}

function consolidateJSONObjects(data){
    return data.reduce(function(acc, curr){
        const { config: { version, root_url }= {}, scripts }= curr;
        Object.keys(scripts).forEach(key=> scripts[key].src= root_url+scripts[key].src);
        if(version&&isNewer(version, acc.config.version)) Object.assign(acc.config, { version });
        Object.assign(acc.scripts, scripts);
        return acc;
    }, { config: { version: "0.0.0" }, scripts: {} });
}
function isNewer(to_check, to_compare_with= version){
    const to_compare_with_arr= to_compare_with.split(".").map(Number);
    return to_check.split(".").map(Number).map((d,i)=> d-to_compare_with_arr[i]).map(d=> d===0 ? 0 : (d<0 ? -1 : 1)).map((d,i)=> Math.pow(10, 2-i)*d).reduce((acc, curr)=> acc+curr, 0)>0;
}


function saveConfig(){ fs.writeFileSync(config_local, JSON.stringify(package_json, null, "    ")); }
function arrayToConsole(cmd, type, color){ return arr=> toConsole(cmd, type, arr.map(v=> spaces.repeat(2)+color+v).join("\n")); }
function toConsole(cmd, type, out_mixed){ const color= colors[type.charAt(0)]||""; return console.log(`${spaces}${cmd}: ${toConsolePreDefined(color, out_mixed)||"\n"+color+out_mixed}${colors.R}`); }
function toConsolePreDefined(color, out_mixed){ return ({
    _info: `${color}
    Author: <${"zc.murtnec@naj.elrdna".split("").reverse().join("")}>
    `,
    _help: `
        - ${colors.s}check${colors.R}: Connect to remote repository to check new versions of scripts.
        - ${colors.s}overview ${colors.w}[type] [all|diff]${colors.R}:
            a) ${colors.w}[type]${colors.R}: Lists all available scripts for given resources
                ('type=package' in form for easy copy-paste to your config).
            b) ${colors.w}[all|diff]${colors.R}: List all available scripts in remote repository
                or only not included locally.
            c) NOTE: It doesn't matter on order — e.g. \`package diff\`=\`diff package\`.
        - ${colors.s}update${colors.R}: Connect to remote repository to download all new versions of scripts.`,
    _no_local: `${color}
        There is not registered any local version of any ${config_key_name} script!`,
    _no_connection: `${color}
        Cannot connect to remote ${config_key_name} repository!`
})[out_mixed]; }