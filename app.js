

/////////////// localStorageDB ///////////////
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./db');
    window = global;
    require('./bower_components/localStorageDB/localstoragedb');
}

//////////////////////////////////////////////

var libs = require('./libs/common');
libs.isServer = true;

var socketPort = libs.socketURL.split(':');
libs.io = require('socket.io')(socketPort[socketPort.length - 1]);
libs.io.on('connection', function(socket){
    console.log("socket connect:",socket.id);

    socket.on('reconnect', function () {
        console.log("socket reconnect");
    });
    socket.on('disconnect', function () {
        console.log("socket disconnect");
    });
});




var html = require('fs').readFileSync('index.html');
var qs = require('qs');
require('http').createServer(function (req, res) {
    var header = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Method": "GET,POST",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    var token = req.url.split('?');
    var paths = token[0].split('/');
    if (typeof(libs[paths[paths.length - 1]]) === "function" && libs.hasOwnProperty(paths[paths.length - 1]) && req.method==='POST') {

        header["Content-Type"] = "application/json";
        res.writeHead(200, header);
        
        var query = {};
        if(token.length > 1){
            query = qs.parse(token[1]);
        }
               
        
        var body = ""; 

        req.on('data', function(data) {
            body += data.toString(); 
        });

        req.on('end', function() {
            res.end(JSON.stringify(libs[paths[paths.length - 1]](JSON.parse(body))));
        });
        
    } else {
        header["Content-Type"] = "text/html";
        res.writeHead(200, header);
        res.end(html);
    }

}).listen(3000);

console.log("App Server Started at http://localhost:3000");