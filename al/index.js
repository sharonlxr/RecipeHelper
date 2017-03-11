'use strict';
var Alexa = require("alexa-sdk");
// var appId = 'amzn1.ask.skill.e5755462-d42d-44bc-83ab-5978b66728fa'; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // alexa.dynamoDBTableName = 'highLowGuessUsers';
    alexa.registerHandlers(newSessionHandlers);
    alexa.execute();
};

var newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
            this.attributes['gamesPlayed'] = 0;
        }
        this.emit(":tell","welcome","welcome");
        // this.handler.state = states.STARTMODE;
        // this.emit(':ask', 'Welcome to High Low guessing game. You have played '
        //     + this.attributes['gamesPlayed'].toString() + ' times. would you like to play?',
        //     'Say yes to start the game or no to quit.');
    },
    'hiIntent':function(){
    	this.emit(':tell', "hello","hello");  
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
}