import 'babel-core/polyfill';
import YamahaAPI from 'yamaha-nodejs';
import restify from 'restify';
import {Client} from 'node-ssdp';

var server = restify.createServer({
  name: 'yams',
  version: '0.1.0'
});

var reciever;
var PORT = process.env.PORT || 8081;
var err_msg = "I'm sorry, something went wrong";

function err(res, text) {
  return (err) => {
    if (err) {
      console.error(err.stack);
      res.send(400, text);
    }
  }
}

function success(res, text) {
  return () => {
    console.log(text);
    res.send(200, text);
  }
}

var err_msg = "I'm sorry, something went wrong";

function err(res, text) {
  return (err) => {
    if (err) {
      console.error(err.stack);
      res.send(400, text);
    }
  }
}

function success(res, text) {
  return () => {
    console.log(text);
    res.send(200, text);
  }
}

function setVolume(req, res, next) {
  let {body: {direction}} = req;

  if (direction && direction.length > 0) {
    switch (direction.toLowerCase()) {
      case "up": {
        console.log("going up");
        receiver.volumeUp(50)
          .then(success(res, "Going up"))
          .catch(err(res, err_msg))
          .done(next);
        break;
      }
      case "down": {
        console.log("going down");
        receiver.volumeDown(50)
          .then(success(res, "Going down"))
          .catch(err(res, err_msg))
          .done(next);
        break;
      }
      default: {
        err("Not sure about the direction of volume adjustment");
        return next();

      }
    }
  }
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
      let output = `Switching input to ${sanitized}`;
      console.log(output);
      receiver.setMainInputTo(sanitized)
        .then(success(res, output))
        .catch(err(res, err_msg))
        .done(next);
    } else {
      let output = `Input ${sanitized} not found`;
      err(output);
      return next();
    }
  });
}

function setState(req, res, next) {
  let {body: {state}} = req;

  console.log('Turning server ' + state);

  switch (state) {
    case 'on': {
      receiver.powerOn()
        .then(success(res, "Powering on"))
        .catch(err(res, err_msg))
        .done(next)
      break;
    }
    case 'off': {
      receiver.powerOff()
        .then(success(res, "Powering off"))
        .catch(err(res, err_msg))
        .done(next);
      break;
    }
    default: {
      err(res, err_msg);
      return next();
    }
  }
}

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post("/volume", setVolume);
server.post("/input", setInput);
server.post("/state", setState);

var listening = true;
var ssdpClient = new Client();
var search = 'urn:schemas-upnp-org:service:AVTransport:1';

ssdpClient.on('response', (headers, statusCode, rinfo) => {
  if (listening && headers.USN.endsWith(search)) {
    reciever = rinfo.address;
    listening = false;
    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}, controlling reciever ${reciever}`)
    });
  }
});

ssdpClient.search(search);
