require('babel-core/polyfill');

var YamahaAPI = require('yamaha-nodejs');
var receiver = new YamahaAPI('192.168.1.222');
var restify = require('restify');
var fs = require("fs");

let server = restify.createServer({
  name: 'yamamahahamamahahamanamanamnamna',
  version: '1.0.0'
});

function setVolume(req, res, next) {
  let {body: {direction}} = req;
  direction = direction.toLowerCase();

  switch (direction.toLowerCase()) {
    case "up": {
      console.log("going up");
      receiver.volumeUp(50);
      break;
    }
    case "down": {
      console.log("going down");
      receiver.volumeDown(50);
    }
  }

  res.send(200);
  return next();
}


function setInput(req, res, next) {
  let {body: {input, number}} = req;

  console.log(input, number);
  res.send(200);
  return next();
}


server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post("/volume", setVolume);
server.post("/input", setInput);

server.listen(8081, () => console.log("Listening..."));
