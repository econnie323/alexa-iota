/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

var AWS = require('aws-sdk');
AWS.config.update({region: "eu-west-1"});

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    
    var speechOutput = "Deposit 100 IOTA to this address.";

    if(supportsAPL(handlerInput)) {

    return handlerInput.responseBuilder
      .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          token: "Splash",
          document: require('./splash.json'),
          datasources: {
            "bodyTemplate1Data": {
              "type": "object",
              "objectId": "btsplash",
              "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://example.com/iota.png",
                        "size": "small",
                        "widthPixels": 0,
                        "heightPixels": 0
                    },
                    {
                        "url": "https://example.com/iota.png",
                        "size": "large",
                        "widthPixels": 0,
                        "heightPixels": 0
                    }
                ]
              },
              "title": " ",
              "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": ""
                }
              },
              "logoUrl": ""
            }
          }
      })
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .withShouldEndSession(true)
      .getResponse();

    } else {
      
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .withSimpleCard(SKILL_NAME, speechOutput)
        .withShouldEndSession(true)
        .getResponse();
        
    }
  },
};


const GetDomoticsHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'GetDomoticsIntent';
  },
  //async handle(handlerInput) {
  handle(handlerInput) {  
    var speechOutput = "Help: Alexa, open Payment System";

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('System Error')
      .reprompt('System Error')
      .getResponse();
  },
};

const SKILL_NAME = 'Payment System';
const HELP_MESSAGE = 'Help: Alexa, open Payment System';
const HELP_REPROMPT = '';
const STOP_MESSAGE = 'Bye!';

const skillBuilder = Alexa.SkillBuilders.standard();

function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetDomoticsHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
