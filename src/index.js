import 'babel-core/polyfill';
import YamahaAPI from 'yamaha-nodejs';
import restify from 'restify';
import {Client} from 'node-ssdp';
import {mappings} from './utterances';

var server = restify.createServer({
  name: 'yams',
  version: '0.1.0'
});

var receiver;
var PORT = process.env.PORT || 8081;
var errMsg = "I'm sorry, something went wrong";

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

var errMsg = "I'm sorry, something went wrong";

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
  let {body: {direction, modifier}} = req;
  let upResp = "Turning it up"
  let downResp = "Turning it down"

  if (modifier === "a lot" || modifier === "a bunch") {
    var amount = 100;
    upResp += ` ${modifier}`;
    downResp += ` ${modifier}`;
  } else if (modifier === "way") {
    var amount = 100;
    upResp = "Turning it way up";
    downResp = "Turning it way down";
  } else {
    var amount = 50;
  }

  if (direction && direction.length > 0) {
    switch (direction.toLowerCase()) {
      case "up": {
        console.log("going up");
        receiver.volumeUp(amount)
          .then(success(res, upResp))
          .catch(err(res, errMsg))
          .done(next);
        break;
      }
      case "down": {
        console.log("going down");
        receiver.volumeDown(amount)
          .then(success(res, downResp))
          .catch(err(res, errMsg))
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
  if (input) {
    return `${input.replace(/\.|\s/g, '').toUpperCase()}${number}`;
  }
}

function setInput(req, res, next) {
  let {body: {input, number}} = req;
  let originalIn = input;
  let mapped = mappings[input];
  let validInputs = receiver.getAvailableInputs();

  if (!mapped) {
    input = sanitizeInput(input, number);
  } else {
    input = mapped;
  }

  if (input) {
    validInputs.done(inputs => {
      if (inputs.indexOf(input) !== -1) {
        var output;
        if (mapped) {
          output = `Switching input to ${originalIn} (${input})`;
        } else {
          output = `Switching input to ${input}`;
        }

        receiver.setMainInputTo(input)
          .then(success(res, output))
          .catch(err(res, errMsg))
          .done(next);
      } else {
        let output = `Input ${input} not found`;
        err(output);
        return next();
      }
    });
  } else {
    let msg = "I didn't catch that input";
    console.log(msg);
    res.send(400, msg);
    return next();
  }
}

function setState(req, res, next) {
  let {body: {state}} = req;

  console.log('Turning server ' + state);

  switch (state) {
    case 'on': {
      receiver.powerOn()
        .then(success(res, "Powering on"))
        .catch(err(res, errMsg))
        .done(next)
      break;
    }
    case 'off': {
      receiver.powerOff()
        .then(success(res, "Powering off"))
        .catch(err(res, errMsg))
        .done(next);
      break;
    }
    default: {
      err(res, errMsg);
      return next();
    }
  }
}

function whatsTheYams(req, res, next) {
  let msg = "The yams is the power that be! You can smell it when I'm walking down the street.";
  console.log(msg);
  res.send(200, msg);
  return next();
}

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post("/volume", setVolume);
server.post("/input", setInput);
server.post("/state", setState);
server.post("/whatstheyams", whatsTheYams);

var listening = true;
var ssdpClient = new Client();
var search = 'urn:schemas-upnp-org:service:AVTransport:1';

ssdpClient.on('response', (headers, statusCode, rinfo) => {
  if (listening && headers.USN.endsWith(search)) {
    receiver = new YamahaAPI(rinfo.address);
    listening = false;
    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}, controlling ${rinfo.address}`)
    });
  }
});

ssdpClient.search(search);
