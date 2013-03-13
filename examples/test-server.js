#!/usr/bin/env node
var server = require('http').createServer(function (req, res) {
  var maxDelayMs = 500;
  var delay = Math.round(Math.random()*maxDelayMs) + 1000;
  setTimeout(function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(delay+'\n');
    res.end();
  }, delay);
});

server.listen(9000, function(){
    console.log('Server running at http://127.0.0.1:9000/');
});

function killServer(){
    console.log('Shutting down server on http://127.0.0.1:9000/');
    try {
        server.close();
    } catch(e){

    }
    process.exit();
}

process.on('SIGINT', killServer);
process.on('SIGTERM', killServer);
