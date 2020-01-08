/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
module.exports= {
    toStructure: function(data){
        const spaces= "    ", t3= spaces.repeat(3), t2= spaces.repeat(2);
        return data.map(function({ script_name, version, file, root_path, description }){
            return [
                `"${script_name}": {`,
                `${t3}"version": "${version}",`,
                `${t3}"src": "${file}",`,
                !description ?
                    "" :
                    `${t3}"description": "${Array.isArray(description) ? description[0]+"…" : description}",`,
                `${t3}"target_path": "${root_path}"`,
                `${t2}}`
            ].filter(Boolean).join("\n");
        }).join(",\n"+t2);
    }
};