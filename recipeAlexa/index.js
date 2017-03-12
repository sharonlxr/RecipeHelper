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
	helper.setCurrentStep(0);
	// recipeHelper.currentStep=0;
	helper.setCurrentIngre(0);
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


skillService.intent('queryIntent', {

	'slot':{"recipeName":"listOfRecipes"},
	'utterances':["I'd like to make a {recipeName}"]


	},function(request,response){
	


	
	var recname = request.slot("recipeName");
	databaseHelper.readRecipeData(recname).then(function(result){
		if(result === undefined){
			console.log("result is empty");
			return null;
		}else{
		console.log("JSON.parse(result)");
		console.log(result);
		// result = result.replace(/\\n/g, "\\n")  
        //        .replace(/\\'/g, "\\'")
        //        .replace(/\\"/g, '\\"')
        //        .replace(/\\&/g, "\\&")
        //        .replace(/\\r/g, "\\r")
        //        .replace(/\\t/g, "\\t")
        //        .replace(/\\b/g, "\\b")
        //        .replace(/\\f/g, "\\f");
		// result = toString(result);
		// console.log(result);
	    // console.log(JSON.parse(result));
        // return JSON.parse(result);
		return result
		}

	}).then(function(data){
		var currentstg = getStageHelperFromRequest(request);
		if(currentstg == WAIT||currentstg == INGREDIENT||currentstg == DIRECTION){
			console.log("can not query because we are in a recipe now");
			var reply = "you should quit current recipe first";
			response.say(reply);
			response.session(STAGE_KEY,currentstg);
			response.shouldEndSession(false);
			response.session(SESSION_KEY,getRecipeHelperFromRequest(request));
			response.send();


		}else{
		
			if(data===null){
				console.log("can not find the recipe and back to start");
				var msg= "Can not find the recipe";
				response.say(msg);
				response.session(STAGE_KEY,START);
				response.shouldEndSession(false);
				response.session(SESSION_KEY,resetHelper());
				response.send();
				
			}else{
				console.log("we load another recipe ");
				var newHelper = buildNewHelperWithData(data,request,response);
				response.say("I have successfully found recipe of "+ data["RecipeName"]);
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
    'utterances': ['next step','read recipe']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=DIRECTION&&stg!=WAIT&&stg!=INGREDIENT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		recipe_helper.currentIngre =0;
		if(recipe_helper.complete()){
			msg = " . you have finished this recipe. please restart or quit.";
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

		}else{
			msg = recipe_helper.steps[recipe_helper.currentStep];
			recipe_helper.currentStep++;
			if(recipe_helper.complete()){
			msg += ". you have finished this recipe. please restart or quit.";
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
    'utterances': ['last step']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=DIRECTION&&stg!=WAIT&&stg!=INGREDIENT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		recipe_helper.currentIngre =0;
		var msg = "";
		recipe_helper.currentStep = recipe_helper.steps.length-1;
		msg = recipe_helper.steps[recipe_helper.currentStep]+". you are done with this recipe. please start over or quit";
		recipe_helper.currentStep++;
		response.session(SESSION_KEY,recipe_helper);
		response.session(STAGE_KEY,DIRECTION);
		response.say(msg);
		response.shouldEndSession(false);
		response.send();
		
	}
  }
);
skillService.intent('lastIngreIntent', {
    'utterances': ['last INGREDIENT']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=INGREDIENT&&stg !=WAIT&&stg!=DIRECTION){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);

		var msg = "";
		recipe_helper.currentIngre = recipe_helper.ingredients.length-1;
		msg = recipe_helper.ingredients[recipe_helper.currentIngre];
		msg+=". you are now done with ingredientss. Move on to recipe direction. "
		recipe_helper.currentIngre++;
		recipe_helper.currentStep=0;
		recipe_helper.currentIngre = 0;
		response.session(SESSION_KEY,recipe_helper);
		response.session(STAGE_KEY,DIRECTION);
		response.say(msg);
		response.shouldEndSession(false);
		response.send();
		
	}
  }
);

skillService.intent('advanceIngreIntent', {
    'utterances': ['next INGREDIENT','ingredient']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
  	// console.log("I FOUND STAGE IN ADVANCEINGRE : "+stg);
	if(stg !=INGREDIENT&&stg !=WAIT&&stg!=DIRECTION){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		recipe_helper.currentStep=0;
		var msg = "";
		if(recipe_helper.completeIngre()){
			msg = " . you have got all the ingredients of  this recipe. Move on to recipe";
			recipe_helper.currentStep = 0;
			recipe_helper.currentIngre = 0;
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

		}else{
			msg = recipe_helper.ingredients[recipe_helper.currentIngre];
			recipe_helper.currentIngre++;
			if(recipe_helper.completeIngre()){
			msg += ". you have got all the ingredients of  this recipe. Move on to recipe";
			recipe_helper.currentStep = 0;
			recipe_helper.currentIngre = 0;
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
	'utterances':['quit','exit','main menu']
		},
	function(request,response){

		var stg =START;
		var msg = " . you are done with this recipe."
		if(getStageHelperFromRequest(request)==START){
			msg = " . you are in the main dialog now. no need to quit.";
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
	'utterances':['start again']
		},
	function(request,response){

		var stg =getStageHelperFromRequest(request);
		var msg ;
		var recipe_helper = getRecipeHelperFromRequest(request);
		if(stg==INGREDIENT){
			recipe_helper.currentIngre = 0;
			recipe_helper.currentStep = 0;
			if(recipe_helper.completeIngre()){
				msg = ". you are done with ingredients. Move on to recipe direction";
				recipe_helper.currentStep = 0;

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
				recipe_helper.currentStep = 0;
				recipe_helper.currentIngre =0;
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
			recipe_helper.currentStep = 0 ;
			recipe_helper.currentIngre =0 ;
			if(recipe_helper.complete()){
				msg = ". you are done with this recipe. please start over or quit.";
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
						msg += ". you are done with this recipe. please start over or quit ";
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
module.exports = skillService;
// console.log(skillService.utterances());
// console.log(skillService.schema());