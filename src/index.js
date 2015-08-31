require('babel-core/polyfill');

var YamahaAPI = require('yamaha-nodejs');
var receiver = new YamahaAPI('192.168.1.222');
var restify = require('restify');

let server = restify.createServer({
  name: 'yamamahahamamahahamanamanamnamna',
  version: '1.0.0'
});

function setVolume(req, res, next) {
  let {body: {direction}} = req;

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

function sanitizeInput(input, number) {
  return `${input.replace(/\.|\s/g, '').toUpperCase()}${number}`
}

function setInput(req, res, next) {
  let {body: {input, number}} = req;
  let sanitized = sanitizeInput(input, number);
  let validInputs = receiver.getAvailableInputs();

  validInputs.done(inputs => {
    if (inputs.indexOf(sanitized) !== -1) {
      console.log(`Switching input to ${sanitized}`);
      receiver.setMainInputTo(sanitized)
        .then(() => res.send(200))
        .catch(err => res.send(400))
        .done(next);
    } else {
      console.log(`Input ${sanitized} not found...``);
      res.send(400);
      next();
    }
  });
}

function setState(req, res, next) {
  let {body: {state}} = req;

  console.log('Turning server ' + state);

  if (state === "on")
    receiver.powerOn();
  else if (state === "off")
    receiver.powerOff();

  res.send(200);
  return next();
}


server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post("/volume", setVolume);
server.post("/input", setInput);
server.post("/state", setState);

server.listen(8081, () => console.log("Listening..."));
