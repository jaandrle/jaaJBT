/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
module.exports= {
    toStructure: function(data){
        const spaces= "    ";
        return data.map(function({ script_name, version, file, root_path }){
            return [
                `"${script_name}": {`,
                `${spaces.repeat(3)}"version": "${version}",`,
                `${spaces.repeat(3)}"src": "bin/${file.substring(file.lastIndexOf("/")+1)}",`,
                `${spaces.repeat(3)}"target_path": "${root_path}"`,
                `${spaces.repeat(2)}}`
            ].join("\n");
        }).join(",\n"+spaces.repeat(2));
    }
};