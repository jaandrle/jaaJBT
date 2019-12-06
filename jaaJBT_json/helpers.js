/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
module.exports= {
    toStructure: function(data){
        const spaces= "    ";
        return data.map(function({ script_name, version, file, root_path, description }){
            return [
                `"${script_name}": {`,
                `${spaces.repeat(3)}"version": "${version}",`,
                `${spaces.repeat(3)}"src": "${file}",`,
                !description ?
                    "" :
                    `${spaces.repeat(3)}"description": "${Array.isArray(description) ? description[0]+"…" : description}",`,
                `${spaces.repeat(3)}"target_path": "${root_path}"`,
                `${spaces.repeat(2)}}`
            ].filter(Boolean).join("\n");
        }).join(",\n"+spaces.repeat(2));
    }
};