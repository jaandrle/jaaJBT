/* jshint esversion: 6,-W097, -W040, node: true, expr: true, undef: true */
module.exports= {
    fileToURLEncode: function(word){ return word.split("/").map(encodeURIComponent).join("/"); }
};