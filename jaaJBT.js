/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
const /* configs files paths */
    version= "0.2.1",
    remote_url= "https://raw.githubusercontent.com/jaandrle/jaaJBT/master/",
    config_key_name= "jaaJBT",
    config_local= "./package.json",
    config_remote= remote_url+"jaaJBT.json";
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

switch (cmd_arguments[0]){
    case "check":
        check();
        break;
    case "pull":
    case "update":
        check(pull);
        break;
    default :
        toConsole("Help", "normal","_help");
}

function check(cb){
    if(!local_jaaJBT) return toConsole("Local versions", "warn", "_no_local");
    get(`${config_remote}?v=${Math.random()}`)
    .then(function(data){
        const remote_jaaJBT= JSON.parse(data);
        let results= [];
        if(version!==remote_jaaJBT.config.version) return toConsole(`Update is not possible (new version ${remote_jaaJBT.config.version})`, "error", spaces.repeat(2)+"Your `jaaJBT.js` script must be up-to-date to proper comparing/updating!");
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
    .catch(toConsole.bind(null, "Remote versions", "error", "_no_connection"));
}
function pull(remote, results_all){
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
    const { src, target_path, version }= def;
    return download(`${remote_url}${src}?v=${version}`, local_jaaJBT.config[target_path]+src.substring(src.lastIndexOf("/")+1), def);
}
function UpdateConfig(results){
    results.forEach(({ key, version })=> local_jaaJBT.scripts[key]= `~${version}`);
    saveConfig();
    return results;
}

function get(url){ return new Promise(function(resolve, reject){ https.get(url, { agent: false },response=> response.on("data", resolve)).on("error", reject); }); }
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

function saveConfig(){ fs.writeFileSync(config_local, JSON.stringify(package_json, null, "    ")); }
function arrayToConsole(cmd, type, color){ return arr=> toConsole(cmd, type, arr.map(v=> spaces.repeat(2)+color+v).join("\n")); }
function toConsole(cmd, type, out_mixed){ const color= colors[type.charAt(0)]||""; return console.log(`${spaces}${cmd}: ${toConsolePreDefined(color, out_mixed)||"\n"+color+out_mixed}${colors.R}`); }
function toConsolePreDefined(color, out_mixed){ return ({
    _info: `${color}
    Author: <${"zc.murtnec@naj.elrdna".split("").reverse().join("")}>
    `,
    _help: `
        - check: Connect to remote repository to check new versions of scripts.
        - pull: Connect to remote repository to download all new versions of scripts.`,
    _no_local: `${color}
        There is not registered any local version of any ${config_key_name} script!`,
    _no_connection: `${color}
        Cannot connect to remote ${config_key_name} repository!`
})[out_mixed]; }