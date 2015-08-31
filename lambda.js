var http = require('http');
var querystring = require('querystring');

exports.handler = function (event, context) {

  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    /**
     * Uncomment this if statement and populate with your skill's application ID to
     * prevent someone else from configuring a skill that sends requests to this function.
     */
    /*
      if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
      context.fail("Invalid Application ID");
      }
    */

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
    default: throw 'Invalid intent';
  }
}

function setPowerState(intent, session, callback) {
  var cardTitle = intent.name;
  var stateSlot = intent.slots.State.value;

  var speechOutput = "Powering receiver " + stateSlot;
  var postData = JSON.stringify({
    state: stateSlot
  });

  postToServer("/state", postData, intent.name, speechOutput, '', callback);
}

function setInput(intent, session, callback) {
  var cardTitle = intent.name;
  var inputSlot = intent.slots.Input.value;
  var numberSlot = intent.slots.Number.value;

  var speechOutput = "Setting input to " + inputSlot;

  if (numberSlot) speechOutput += " " + numberSlot;

  var postData = JSON.stringify({
    input: inputSlot,
    number: numberSlot
  });

  postToServer("/input", postData, intent.name, speechOutput, '', callback);
}

function setVolume(intent, session, callback) {
  var cardTitle = intent.name;
  var directionSlot = intent.slots.Direction.value;

  var speechOutput = "Turning volume " + directionSlot;
  var postData = JSON.stringify({
    direction: directionSlot
  });

  postToServer("/volume", postData, intent.name, speechOutput, '', callback);
}

function postToServer(path, data, cardTitle, speechOutput, repromptText, callback) {
  var opts = {
    "hostname": "<YOUR HOST HERE>",
    "port": 8081,
    "method": "POST",
    "path": path,
    "headers": {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  var req = http.request(opts, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });

    res.on('end', function() {
      callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText));
    });
  });

  req.on('error', function(err) {
    console.log(err);
  });

  console.log(data);
  req.write(data);

  req.end();
}

function buildSpeechletResponse(title, output, repromptText) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: "SessionSpeechlet - " + title,
      content: "SessionSpeechlet - " + output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
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
