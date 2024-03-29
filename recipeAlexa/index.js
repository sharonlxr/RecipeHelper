'use strict';
module.change_code = 1;
var _ = require('lodash');
var Skill = require('alexa-app');

var SESSION_KEY = 'recipe';
var STAGE_KEY ='stage';
var START  = "Start";
var WAIT = "WAIT";
var	DIRECTION ="DIRECTION";
var INGREDIENT ="INGREDIENT";
// var DONE = "DONE";

var skillService = new Skill.app('cakebaker');
var recipeHelper = require('./recipe_helper');
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();

var getRecipeHelper = function(argument) {
	if( argument === undefined){
		argument = {};
	}
	return new recipeHelper(argument);
};
var resetHelper = function(){
	var argument = {};
	
	return new recipeHelper(argument);
};
var buildNewHelperWithData = function(data){
	var argument = {};
	var helper = getRecipeHelper(argument);
	var stps = data["Directions"].split("\n");
	var ingres = data["Ingredients"].split("\n");

	helper.setCurrentStep(-1);
	// recipeHelper.currentStep=0;
	helper.setCurrentIngre(-1);
	// helper.currentIngre =0 ;
	helper.setSteps(stps);
	// helper.steps = stps;
	helper.setIngres(ingres);
	// helper.ingredients = ingres;
	return helper;

}

var getRecipeHelperFromRequest = function(request){
	var recipe_helper = request.session(SESSION_KEY);
	return getRecipeHelper(recipe_helper);
};

var getStageHelperFromRequest = function(request){
	var stage = request.session(STAGE_KEY);
	return stage;
};
var handleInvalidCommand = function(request,response){
	var recipe_helper = getRecipeHelperFromRequest(request);
	var stg = getStageHelperFromRequest(request);
	var msg = " you gave invalid command.";
	response.say(msg);
	response.shouldEndSession(false);
	response.session(STAGE_KEY,stg);
	response.session(SESSION_KEY,recipe_helper);
	response.send();
};
var welcomeMsg = "Welcome to recipe helper! What do you want to make today?";

skillService.launch(function(request,response){

	response.say(welcomeMsg).shouldEndSession(false);
	response.session(STAGE_KEY,START);
	response.session(SESSION_KEY,getStageHelperFromRequest(request));
	response.send();
});
skillService.sessionEnded(function(request,response){

		var stg =START;
		var msg = " . you are done with this recipe."
		if(getStageHelperFromRequest(request)==START){
			msg = " . you are in the main dialog now. No need to quit.";
		}
		if(getStageHelperFromRequest(request)==WAIT||
			getStageHelperFromRequest(request)==INGREDIENT
			||getStageHelperFromRequest(request)==DIRECTION)
		var recipe_helper = resetHelper();
		response.say(msg);
		response.shouldEndSession(false);
		response.session(STAGE_KEY,START);
		response.session(SESSION_KEY,recipe_helper);
		response.send();
		

});

// skillService.onSessionEnd
skillService.intent('queryIntent', {

	'slots':{"recipeName":"listOfRecipes"},
	'utterances':["{I'd | I} {like to | want to} make {a|} {-|recipeName}", "recipe for {-|recipeName}"]


	},function(request,response){
	


	
	var recname = request.slot("recipeName");
	databaseHelper.readRecipeData(recname).then(function(result){
		if(result === undefined){
			console.log("result is empty");
			return null;
		}else{
		console.log("JSON.parse(result)");
		console.log(result);
		return result
		}

	}).then(function(data){
		var currentstg = getStageHelperFromRequest(request);
		if(currentstg == WAIT||currentstg == INGREDIENT||currentstg == DIRECTION){
			console.log("can not query because we are in a recipe now");
			var reply = "You should quit the current recipe first.";
			response.say(reply);
			response.session(STAGE_KEY,currentstg);
			response.shouldEndSession(false);
			response.session(SESSION_KEY,getRecipeHelperFromRequest(request));
			response.send();


		}else{
		
			if(data===null){
				console.log("can not find the recipe and back to start");
				var msg= "I cannot find the recipe. Try a different recipe.";
				response.say(msg);
				response.session(STAGE_KEY,START);
				response.shouldEndSession(false);
				response.session(SESSION_KEY,resetHelper());
				response.send();
				
			}else{
				console.log("we load another recipe ");
				var newHelper = buildNewHelperWithData(data,request,response);
				response.say("I have successfully found the recipe of "+ data["RecipeName"] + '. You can say ingredient to read the next ingredient in the list. Or say step to read the next step in the list.' );
				response.session(STAGE_KEY,WAIT);
				response.shouldEndSession(false);
				response.session(SESSION_KEY,newHelper);
				response.send();
			}
		}
		

	});
	return false;

}

);
skillService.intent('advanceStepIntent', {
    'utterances': ['next step','read recipe', 'step']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=DIRECTION&&stg!=WAIT&&stg!=INGREDIENT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		recipe_helper.currentIngre = -1;
		if(recipe_helper.complete()){
			msg = " . you have finished this recipe. Please restart or quit.";
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

		}else{
			recipe_helper.currentStep++;
			msg = recipe_helper.steps[recipe_helper.currentStep];
			if(recipe_helper.complete()){
			msg += ". you have finished this recipe. Please restart or quit.";
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

			}else{
				response.session(SESSION_KEY,recipe_helper);
				response.session(STAGE_KEY,DIRECTION);
				response.say(msg);
				response.shouldEndSession(false);
				response.send();
			}
		}
	}
  }
);
skillService.intent('lastStepIntent', {
    'utterances': ['last step', 'previous step']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	// if(stg !=DIRECTION&&stg!=WAIT){
	// 	handleInvalidCommand(request,response);
	// }else{
		var recipe_helper = getRecipeHelperFromRequest(request);
			var msg = "";
		if(recipe_helper.currentStep<=0){
			msg = " you have no previous step to retrieve. you have not started the first step."
			response.session(SESSION_KEY,recipe_helper);
			response.session(STAGE_KEY,DIRECTION);
			response.say(msg);
			response.shouldEndSession(false);
			response.send();
		}else{
		if (recipe_helper.currentStep >= recipe_helper.steps.length) {
			recipe_helper.currentStep = recipe_helper.steps.length - 1;
			// msg = "decreased step to " + recipe_helper.currentStep;
		}
		recipe_helper.currentIngre = -1;
		recipe_helper.currentStep = recipe_helper.currentStep - 1;
		msg = recipe_helper.steps[recipe_helper.currentStep];
		if(recipe_helper.complete()){
			msg =". you are now finished with this recipe.";
		}
		// recipe_helper.currentStep++;
		response.session(SESSION_KEY,recipe_helper);
		response.session(STAGE_KEY,DIRECTION);
		response.say(msg);
		response.shouldEndSession(false);
		response.send();
	// }
		
	}
  }
);
skillService.intent('lastIngreIntent', {
    'utterances': ['last ingredient', 'previous ingredient']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	// if(stg !=INGREDIENT&&stg !=WAIT){
	// 	handleInvalidCommand(request,response);
	// }else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		if(recipe_helper.currentIngre<=0){
			msg = " You have no previous ingredient to retrieve."
			response.session(SESSION_KEY,recipe_helper);
			response.session(STAGE_KEY,INGREDIENT);
			response.say(msg);
			response.shouldEndSession(false);
			response.send();
		}else{
		if (recipe_helper.currentIngre >= recipe_helper.ingredients.length) {
			recipe_helper.currentIngre = recipe_helper.ingredients.length - 1;
		}
		recipe_helper.currentIngre = recipe_helper.currentIngre-1;
		msg = recipe_helper.ingredients[recipe_helper.currentIngre];
		// recipe_helper.currentIngre++;
		recipe_helper.currentStep=-1;
		
		response.session(SESSION_KEY,recipe_helper);
		response.session(STAGE_KEY,DIRECTION);
		response.say(msg);
		response.shouldEndSession(false);
		response.send();
		}
		
	// }
  }
);

skillService.intent('advanceIngreIntent', {
    'utterances': ['next ingredient','ingredient', 'read ingredient']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
  	// console.log("I FOUND STAGE IN ADVANCEINGRE : "+stg);
	if(stg !=INGREDIENT&&stg !=WAIT&&stg!=DIRECTION){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		recipe_helper.currentStep= -1;
		var msg = "";
		if(recipe_helper.completeIngre()){
			msg = " . You have all the ingredients of this recipe. Move on to recipe steps by saying step.";
			recipe_helper.currentStep = -1;
			// recipe_helper.currentIngre = -1;
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

		}else{
			recipe_helper.currentIngre++;
			msg = recipe_helper.ingredients[recipe_helper.currentIngre];
			if(recipe_helper.completeIngre()){
			msg += ". You have got all the ingredients of this recipe. Move on to recipe steps by saying step.";
			recipe_helper.currentStep = -1;
			// recipe_helper.currentIngre = -1;
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

			}else{
			response.session(SESSION_KEY,recipe_helper);
			response.session(STAGE_KEY,INGREDIENT);
			response.say(msg);
			response.shouldEndSession(false);
			response.send();
			}
		}
	}
  }
);
skillService.intent('backToMainIntent',{
	'utterances':['quit', 'exit', 'main menu', 'return to main menu', 'go back to main menu', 'go back']
		},
	function(request,response){

		var stg =START;
		var msg = " . You are done with this recipe."
		if(getStageHelperFromRequest(request)==START){
			msg = " . You are in the main dialog now. No need to quit.";
		}
		var recipe_helper = resetHelper();
		response.say(msg);
		response.shouldEndSession(false);
		response.session(STAGE_KEY,START);
		response.session(SESSION_KEY,recipe_helper);
		response.send();
		}
	);
skillService.intent('startOverIntent',{
	'utterances':['start again', 'restart', 'start over', 'start']
		},
	function(request,response){

		var stg =getStageHelperFromRequest(request);
		var msg ;
		var recipe_helper = getRecipeHelperFromRequest(request);
		if(stg==INGREDIENT){
			recipe_helper.currentIngre = -1;
			recipe_helper.currentStep = -1;
			if(recipe_helper.completeIngre()){
				msg = ". You are done with ingredients. Move on to recipe steps by saying step.";
				recipe_helper.currentStep = -1;

				response.say(msg);
				response.shouldEndSession(false);
				response.session(STAGE_KEY,DIRECTION);
				response.session(SESSION_KEY,recipe_helper);
				response.send();
			}else{
				msg = recipe_helper.ingredients[0];
				recipe_helper.currentIngre++;
				if(recipe_helper.completeIngre()){
				msg = ". you are done with ingredients. Move on to recipe direction.";
				recipe_helper.currentStep = -1;
				recipe_helper.currentIngre =-1;
				response.say(msg);
				response.shouldEndSession(false);
				response.session(STAGE_KEY,DIRECTION);
				response.session(SESSION_KEY,recipe_helper);
				response.send();
				}else{
					response.say(msg);
					response.shouldEndSession(false);
					response.session(STAGE_KEY,INGREDIENT);
					response.session(SESSION_KEY,recipe_helper);
					response.send();
				}
			}


		}else if (stg == DIRECTION){
			recipe_helper.currentStep = -1 ;
			recipe_helper.currentIngre = -1 ;
			if(recipe_helper.complete()){
				msg = ". You are done with this recipe. Please start over or quit.";
				// recipe_helper.currentStep = 0;
				response.say(msg);
				response.shouldEndSession(false);
				response.session(STAGE_KEY,DIRECTION);
				response.session(SESSION_KEY,recipe_helper);
				response.send();
			}else{
				msg = recipe_helper.steps[0];
				recipe_helper.currentStep++;
				
					if(recipe_helper.complete()){
						msg += ". You are done with this recipe. Please start over or quit ";
						// recipe_helper.currentStep = 0;
						response.say(msg);
						response.shouldEndSession(false);
						response.session(STAGE_KEY,DIRECTION);
						response.session(SESSION_KEY,recipe_helper);
						response.send();
					}else{
						// }else{

						response.say(msg);
						response.shouldEndSession(false);
						response.session(STAGE_KEY,DIRECTION);
						response.session(SESSION_KEY,recipe_helper);
						response.send();
					}

				}
			}
		else{
			handleInvalidCommand(request,response);
		}
		}
	);
skillService.intent('helpIntent',{
	'utterances':['help', "what can i say", "what are the commands"]
		},
	function(request,response){
		var msg = "You can say I want to make apple pie. Then ask for next ingredient. After ingredients, ask for next step. You can always restart the process or quit. What do you want to make today?"
		response.say(msg);
		response.shouldEndSession(false);
		// response.session(STAGE_KEY,INGREDIENT);
		// response.session(SESSION_KEY,recipe_helper);
		response.send();
	
	});




module.exports = skillService;
console.log(skillService.utterances());
console.log(skillService.schema());