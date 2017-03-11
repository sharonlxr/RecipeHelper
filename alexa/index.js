var AWS = require("aws-sdk");
// var fs = require('fs');
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://cp8h9t2lqh.execute-api.us-east-1.amazonaws.com/prod/rewshandler"
});



var docClient = new AWS.DynamoDB.DocumentClient();
var recipeTable = "Recipes";
var constants = {
        "RECIPES": {"apple pie" : "Buy it from Safeway"},
        "SKILL_NAME": "Recipe",
        "WELCOME_MESSAGE": "Recipe assistant, what recipe would you like to make? ",
        "WELCOME_REPROMPT": "You can ask a question like, find apple pie or I\'d like to make apple pie ... Now, what can I help you with.",
        "DISPLAY_CARD_TITLE": "Recipe for ",
        "HELP_MESSAGE": "You can ask questions such as, find recipe or I\'d like to make recipe ...Now, what can I help you with?",
        "HELP_REPROMPT": "You can say things like, find recipe or I\'d like to make recipe ...Now, what can I help you with?",
        "STOP_MESSAGE": "Goodbye!",
        "RECIPE_REPEAT_MESSAGE": "Try saying repeat.",
        "RECIPE_NOT_FOUND_MESSAGE": "I\'m sorry, I currently do not know ",
        "RECIPE_NOT_FOUND_WITH_ITEM_NAME": "the recipe for %s. ",
        "RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME": "that recipe. ",
        "RECIPE_NOT_FOUND_REPROMPT": "What else can I help with?"
};

var welcomeMsg = "recipe assistant, what recipe would you like to make?";
var inmiddleofsteps = " you are in the middle of recipe, quit before you want something else";
var norecipe = "I can not find the recipe of ";

function buildparam(name){
	var par = {

	 	TableName: recipeTable,
	    Key:{
	        "name": name,
	        // "title": title
	    }
	};

	return par;
}
function queryRecipe(rename){
	var para = buildparam(rename);
	var docClient = new AWS.DynamoDB.DocumentClient();
	docClient.get(para, function(err, data) {
    
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        return null;
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        return data;
    }
	});

}


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.dynamoDBTableName = recipes;
    alexa.registerHandlers(newSessionHandlers, WaitingHandlers, RecipeHandlers, IngreHandlers);
    alexa.execute();
};

var states ={
	STARTMODE:"start",
	WAITMODE:"WAITING",
	RECIPEMODE:"reading recipes",
	INGREDIENTMODE:"ingre"


};
var newSessionHandlers = {
   'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['step'] = -1;
            this.attributes['ingre']=-1;
            
            this.attributes['stepnum']=0;
      		this.attributes['ingrenum']= 0;
            // this.attributes['gamesPlayed'] = 0;
        }
        this.handler.state = states.STARTMODE;
        this.emit(':ask', welcomeMsg);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = constants["HELP_MESSAGE"];
        this.attributes['repromptSpeech'] = constants["HELP_REPROMPT"];
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'queryIntent': function() {
      var recname = this.event.request.intent.slots.recipeName.value;
      this.enit(':tell', recname);
      // var data = queryRecipe(recname);
      // if(data !==null){
      //   var name = data['name'];
      //   var steps = data['steps'].split('\n');
      //   var ingredients = data['ingredients'].split('\n');
      //   var stepsnum = steps.length;
      //   var ingrenum = ingredients.length;
      //   var msg = " I have found the recipe of "+name;
      //   msg+=". what do you want to do next?";
      //   this.attributes['steps']=steps;
      //   this.attributes['ingredients']= ingredients;
      //   this.attributes['stepnum']=stepnum;
      //   this.attributes['ingrenum']= ingrenum;
      //   this.attributes['step'] = 0;
      //   this.attributes['ingre']= 0;
      //   this.handler.state=states.WAITMODE;
      //   this.emit(":ask",msg);
      // }else{
      //   this.attributes['stepnum']=0;
      //   this.attributes['ingrenum']= 0;
      //   this.attributes['step'] = -1;
      //   this.attributes['ingre']=-1;
      //   msg = norecipe+recname;
      //   this.emit(":tell",msg);

      // }

    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }
};
var StartHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    // 'whatToDoIntent':function(){
    // 	var msg = "You can respond with";
    // }
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = constants["HELP_MESSAGE"];
        this.attributes['repromptSpeech'] = constants["HELP_REPROMPT"];
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'queryIntent': function() {
      var recname = this.event.request.intent.slots.recipeName.value;
      var data = queryRecipe(recname);
      var msg;
      if(data !==null){
      	var name = data['name'];
      	var steps = data['steps'].split('\n');
      	var ingredients = data['ingredients'].split('\n');
      	var stepsnum = steps.length;
      	var ingrenum = ingredients.length;
      	msg = " I have found the recipe of "+name;
      	msg+=". what do you want to do next?";
      	this.attributes['steps']=steps;
      	this.attributes['ingredients']= ingredients;
      	this.attributes['stepnum']=stepnum;
      	this.attributes['ingrenum']= ingrenum;
      	this.attributes['step'] = 0;
        this.attributes['ingre']= 0;
        this.attributes['name'] = recname;
      	this.handler.state=states.WAITMODE;
      	this.emit(":ask",msg);
      }else{
      	this.attributes['stepnum']=0;
      	this.attributes['ingrenum']= 0;
      	this.attributes['step'] = -1;
        this.attributes['ingre']=-1;
        this.attributes['name'] = null;
        this.attributes['steps'] = null;
        this.attributes['ingredients']=null;
        msg = norecipe+recname;
        this.emit(":tell",msg);

      }

    },
    // 'AMAZON.YesIntent': function() {
    //     this.attributes["guessNumber"] = Math.floor(Math.random() * 100);
    //     this.handler.state = states.GUESSMODE;
    //     this.emit(':ask', 'Great! ' + 'Try saying a number to start the game.', 'Try saying a number.');
    // },
    // 'AMAZON.NoIntent': function() {
    //     console.log("NOINTENT");
    //     this.emit(':tell', 'Ok, see you next time!');
    // },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say a recipe for search';
        this.emit(':tell', message, message);
    }
});
var WaitingHandlers = Alexa.CreateStateHandler(states.WAITMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'StartRecipeIntent': function() {
      this.attributes['step']=0;
      this.attributes['ingre']=0;
      var msg ="";
      
      	var stepindex = 0;
      	if(this.attributes['stepnum']==0){
      		msg="there is no steps available";
      		this.emit(":tell",msg);

      	}else{
	      	var stepw= this.attributes['steps'][stepindex];
	      	msg = stepw;
	      	stepw = stepw.trim();
	      	if(stepw == ""||stepw==''||stepindex+1>=this.attributes['stepnum'])
	      		{	msg = "there is no step available for this recipe.";
	      			this.attributes['step'] = 0;
	      			this.emit(":tell",msg);
	      		}else{
			      	this.attributes['step'] = stepindex+1;
			      	this.handler.state = states.RECIPEMODE;
			      	this.emit(":tell",msg);
			      }
      	}

    },
    'ingredientsIntent':function(){
    	var msg ="";
      	var ingres = this.attributes['ingredients'];
      	var total = this.attributes['ingrenum'];
      	if(0>=totalStep){
      		msg = "there is no ingredients available";
      		msg+=" . You have reached the last ingredients. ";
  			msg+="We will begin recipe direction. Say start if you are ready.";
      			
  			this.handler.state = states.RECIPEMODE;
  			this.attributes['step']=0;
 
      		this.emit(':tell',msg,msg);
      	}else{
      		msg = ingres[total-1];
      		this.attributes['ingre'] = index+1;
      		this.handler.state = states.INGREDIENTMODE;
      		if(total==1){
	  			msg+=" . You have reached the last ingredients. ";
	  			msg+="We will begin recipe direction. Say start if you are ready.";
	      		this.attributes['ingre']=0;	
	  			this.handler.state = states.RECIPEMODE;
	  			this.attributes['step']=0;
  			}
      		this.emit(':tell',msg);
      	}

    },
    'quitIntent':function(){
      console.log("CANCELINTENT");
      this.handler.state = states.STARTMODE;
      this.attributes['step'] = -1;
      this.attributes['ingre']=-1;
      
      this.attributes['stepnum']=0;
      this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },
    // 'AMAZON.YesIntent': function() {
    //     this.attributes["guessNumber"] = Math.floor(Math.random() * 100);
    //     this.handler.state = states.GUESSMODE;
    //     this.emit(':ask', 'Great! ' + 'Try saying a number to start the game.', 'Try saying a number.');
    // },
    // 'AMAZON.NoIntent': function() {
    //     console.log("NOINTENT");
    //     this.emit(':tell', 'Ok, see you next time!');
    // },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Instruction is not valid';
        this.emit(':tell', message, message);
    }
});

var RecipeHandlers = Alexa.CreateStateHandler(states.RECIPEMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
   	'nextIntent':function(){
   		 var msg ="";
      	var stepindex = this.attributes['step'];
      	var totalStep = this.attributes['stepnum'];
      	if(stepindex>=totalStep){
      		msg = "you have reached the end of the steps";
      		this.attributes['step']=0;
      		this.handler.state = states.WAITMODE;
      		this.emit(':tell',msg,msg);
      	}else{
      		var msg = this.attributes['steps'][stepindex];
      		this.attributes['step'] = stepindex+1;
      		if(stepindex+1 == totalStep){
      			this.attributes['step']=0;
      			msg+=" . You have reached the last step.";
      			this.handler.state = states.WAITMODE;

      		}

      		this.emit(':tell',msg);
      	}


   	},
 
   	'lastStepIntent':function(){
   		var msg ="";
      	var steps = this.attributes['steps'];
      	var totalStep = this.attributes['stepnum'];
      	if(0>=totalStep){
      		msg = "there is no direction available";
      		this.handler.state = states.WAITMODE;
      		this.emit(':tell',msg,msg);
      	}else{
      		msg = steps[totalStep-1];
      		this.attributes['step'] = 0 ;
      		
  			msg+=" . You have reached the last step.";
  			this.handler.state = states.WAITMODE;

      		
      		this.emit(':tell',msg);
      	}
   	},
   	'startAgain':function(){
   		var msg ="";
      	var stepindex = 0;
      	var totalStep = this.attributes['stepnum'];
      	if(stepindex>=totalStep){
      		msg = "you have reached the end of the steps";
      		this.emit(':tell',msg,msg);
      		this.handler.state = states.WAITMODE;
      	}else{
      		var msg = this.attributes['steps'][stepindex];
      		this.attributes['step'] = stepindex+1;
      		if(stepindex+1 == totalStep){
      			msg+=" . You have reached the last step.";
      			this.handler.state = states.WAITMODE;

      		}
      		this.emit(':tell',msg);
      	}
   	},
    'quitIntent':function(){
      console.log("CANCELINTENT");
      this.handler.state = states.STARTMODE;
      this.attributes['step'] = -1;
    this.attributes['ingre']=-1;
    
    this.attributes['stepnum']=0;
    this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.handler.state = states.STARTMODE;
      this.attributes['step'] = -1;
    this.attributes['ingre']=-1;
    
    this.attributes['stepnum']=0;
		this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.handler.state = states.STARTMODE;
      this.attributes['step'] = -1;
    this.attributes['ingre']=-1;
    
    this.attributes['stepnum']=0;
		this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Invalid respond';
        this.emit(':ask', message, message);
    }
});
var IngreHandlers = Alexa.CreateStateHandler(states.INGREDIENTMODE, {
  
   	'nextIntent':function(){
   		 var msg ="";
      	var index = this.attributes['ingre'];
      	var total= this.attributes['ingrenum'];
      	var ingres = this.attributes['ingredients'];
      	if(index>=total){
      		msg="You have reached the end of the ingredients. We will begin recipe direction. Say start or next if you are ready.";
      			this.emit(':tell',msg,msg);
	      		this.handler.state = states.RECIPEMODE;
	      		this.attributes['ingre']=0;
	      		this.attributes['step']=0;
	      	
	      		this.emit(':tell',msg);


      	}else{
      		var msg = ingres[index];
      		if(index+1 == total){
      			msg+=" . You have reached the end of the ingredients. We will begin recipe direction. Say start or next if you are ready.";
      			
	      		this.handler.state = states.RECIPEMODE;
	      		this.attributes['ingre']=0;
	      		this.attributes['step']=0;
	      	
	      		this.emit(':tell',msg);

      		}else{
      			this.attributes['ingre']=index+1;
      			this.emit(':tell',msg);
      		}
      	}


   	},
   	'lastIngreIntent':function(){
   		var msg ="";
      	var ingres = this.attributes['ingredients'];
      	var total = this.attributes['ingrenum'];
      	if(0>=totalStep){
      		msg+=" . You have reached the end of the ingredients. We will begin recipe direction. Say start or next if you are ready.";
      			
      		this.handler.state = states.RECIPEMODE;
      		this.attributes['ingre']=0;
      		this.attributes['step']=0;
      	
      		this.emit(':tell',msg);
      	}else{
      		msg = ingres[total-1];
      		this.attributes['ingre'] = index+1;
      	
  			msg+=" . You have reached the last ingredients. ";
  			msg+="We will begin recipe direction. Say start if you are ready.";
      			
  			this.handler.state = states.RECIPEMODE;
  			this.attributes['step']=0;
      		this.emit(':tell',msg);
      	}
   	},
   	'startAgain':function(){
   		var msg ="";
      	var ingres = this.attributes['ingredients'];
      	var total = this.attributes['ingrenum'];
      	var index = 0;
      	if(index>=totalStep){

      		msg+=" . You have reached the end of the ingredients. We will begin recipe direction. Say start or next if you are ready.";
      			
      		this.handler.state = states.RECIPEMODE;
      		this.attributes['ingre']=0;
      		this.attributes['step']=0;
      	
      		this.emit(':tell',msg);
      	}else{
      		var msg = ingres[index];
      		this.attributes['ingre'] = index+1;
      		if(index+1 == totalStep){
      			msg+=" . You have reached the last ingredients. ";
  				msg+="We will begin recipe direction. Say start if you are ready.";
      			this.handler.state = states.RECIPEMODE;
      			this.attributes['step']=0;
      			this.attributes['ingre']=0;

      		}
      		this.emit(':tell',msg);
      	}
   	},
     'quitIntent':function(){
      console.log("CANCELINTENT");
      this.handler.state = states.STARTMODE;
      this.attributes['step'] = -1;
    this.attributes['ingre']=-1;
    
    this.attributes['stepnum']=0;
    this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },

    "AMAZON.StopIntent": function() {
	      console.log("STOPINTENT");
	      this.handler.state = states.STARTMODE;
	      this.attributes['step'] = -1;
    	this.attributes['ingre']=-1;
    
    	this.attributes['stepnum']=0;
		this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.handler.state = states.STARTMODE;
      this.attributes['step'] = -1;
    this.attributes['ingre']=-1;
    
    this.attributes['stepnum']=0;
		this.attributes['ingrenum']= 0;

      this.emit(':tell', "You are done with this recipe!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Invalid respond';
        this.emit(':ask', message, message);
    }
});
