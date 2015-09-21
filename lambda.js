var http = require('http');
var querystring = require('querystring');

exports.handler = function (event, context) {

  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    // if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.amzn1.echo-sdk-ams.app.<applicationId>") {
    //  context.fail("Invalid Application ID");
    // }


    if (event.request.type === "LaunchRequest") {
    }  else if (event.request.type === "IntentRequest") {
      onIntent(event.request,
               event.session,
               function callback(sessionAttributes, speechletResponse) {
                 context.succeed(buildResponse(sessionAttributes, speechletResponse));
               }
              );
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

function onIntent(intentRequest, session, callback) {
  var intent = intentRequest.intent,
  intentName = intentRequest.intent.name;


  switch (intentName) {
    case "SetVolume": return setVolume(intent, session, callback);
    case "SetInput": return setInput(intent, session, callback);
    case "SetPowerState": return setPowerState(intent, session, callback);
    case "WhatsTheYams": return whatsTheYams(intent, session, callback);
    default: throw 'Invalid intent';
  }
}

function whatsTheYams(intent, session, callback) {
  postToServer("/whatstheyams", "", intent.name, callback);
}

function setPowerState(intent, session, callback) {
  var cardTitle = intent.name;
  var stateSlot = intent.slots.State.value;

  var speechOutput = "Powering receiver " + stateSlot;
  var postData = JSON.stringify({
    state: stateSlot
  });

  postToServer("/state", postData, intent.name, callback);
}

function setInput(intent, session, callback) {
  console.log(JSON.stringify(intent));
  var cardTitle = intent.name;
  var inputSlot = intent.slots.Input.value;
  var numberSlot = intent.slots.Number.value;

  var postData = JSON.stringify({
    input: inputSlot,
    number: numberSlot
  });

  postToServer("/input", postData, intent.name, callback);
}

function setVolume(intent, session, callback) {
  var cardTitle = intent.name;
  var directionSlot = intent.slots.Direction.value;
  var modifierSlot = intent.slots.Modifier.value;

  var postData = JSON.stringify({
    direction: directionSlot,
    modifier: modifierSlot
  });

  postToServer("/volume", postData, intent.name, callback);
}

function postToServer(path, data, cardTitle, callback) {
  var opts = {
    "hostname": "",
    "port": 8081,
    "method": "POST",
    "path": path,
    "headers": {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Accept': 'text/plain'
    }
  };

  var output = "";

  var req = http.request(opts, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      output += chunk
    });

    res.on('end', function() {
      callback({}, buildSpeechletResponse(cardTitle, output));
    });
  });

  req.on('error', function(err) {
    console.log(err);
  });

  console.log(data);
  req.write(data);

  req.end();
}

function buildSpeechletResponse(title, output) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: "Yams - " + title,
      content: "Yams - " + output
    },
    shouldEndSession: true
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}
