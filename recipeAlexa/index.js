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
var DONE = "DONE";

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
	argument = {};
	var helper = recipeHelper(argument);
	var stps = data["steps"].split("\n");
	var ingres = data["ingredients"].split("\n");
	helper.currentStep=0;
	helper.currentIngre =0 ;
	helper.steps = stps;
	helper.ingredients = ingres;
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
var welcomeMsg = "Welcome to recipe helper! What do you want to make today";

skillService.launch(function(request,response){

	response.say(welcomeMsg).shouldEndSession(false);
	response.session(STAGE_KEY,START);
	response.session(SESSION_KEY,getStageHelperFromRequest(request));
	response.send();
});


skillService.intent('queryIntent', {
	'slot':{"recipeName":"listOfRecipes"},
	'utterances':['I want to make a {recipeName}']

	},function(request,response){
	var recname = request.slot("recipeName");
	databaseHelper.readRecipeData(recname).then(function(result){
		if(result === undefined){
			console.log("result is empty");
			return null;
		}else{
		console.log("JSON.parse(result['data'])");
        console.log(JSON.parse(result['data']));
        return JSON.parse(result['data']);
		}

	}).then(function(data){
		if(data!=null){
			var newHelper = buildNewHelperWithData(data,request,response);
			response.say("I have successfully found recipe of "+recname);
			response.session(STAGE_KEY,WAIT);
			response.shouldEndSession(false);
			response.session(SESSION_KEY,newHelper);
			response.send();
		}else{
			var msg= "Can not find the recipe";
			response.say(msg);
			response.session(STAGE_KEY,START);
			response.shouldEndSession(false);
			response.session(SESSION_KEY,resetHelper());
			response.send();
		}

	});


}

);
skillService.intent('advanceStepIntent', {
    'utterances': ['next step']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=DIRECTION||stg!=WAIT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		if(recipe_helper.complete()){
			msg = " you have finished this recipe. please restart or quit.";
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DONE);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

		}else{
			msg = recipe_helper.steps[recipe_helper.currentStep];
			recipe_helper.currentStep++;
			response.session(SESSION_KEY,recipe_helper);
			response.session(STAGE_KEY,DIRECTION);
			response.say(msg);
			response.shouldEndSession(false);
			response.send();
		}
	}
  }
);
skillService.intent('lastStepIntent', {
    'utterances': ['last step']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=DIRECTION||stg!=WAIT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		recipe_helper.currentStep = recipe_helper.steps.length-1;
		msg = recipe_helper.steps[recipe_helper.currentStep];
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
	if(stg !=INGREDIENT||stg !=WAIT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		recipe_helper.currentIngre = recipe_helper.ingedient.length-1;
		msg = recipe_helper.ingedient[recipe_helper.currentIngre];
		recipe_helper.currentIngre++;
		response.session(SESSION_KEY,recipe_helper);
		response.session(STAGE_KEY,DIRECTION);
		response.say(msg);
		response.shouldEndSession(false);
		response.send();
		
	}
  }
);

skillService.intent('advanceIngreIntent', {
    'utterances': ['next INGREDIENT','ingedient']
  },
  function(request, response) {
  	var stg = getStageHelperFromRequest(request);
	if(stg !=INGREDIENT||stg !=WAIT){
		handleInvalidCommand(request,response);
	}else{
		var recipe_helper = getRecipeHelperFromRequest(request);
		var msg = "";
		if(recipe_helper.completeIngre()){
			msg = " you have got all the ingredients of  this recipe. Move on to recipe";
			recipe_helper.currentStep = 0;
			response.say(msg);
			response.shouldEndSession(false);
			response.session(STAGE_KEY,DIRECTION);
			response.session(SESSION_KEY,recipe_helper);
			response.send();

		}else{
			msg = recipe_helper.ingedient[recipe_helper.currentIngre];
			recipe_helper.currentIngre++;
			response.session(SESSION_KEY,recipe_helper);
			response.session(STAGE_KEY,INGREDIENT);
			response.say(msg);
			response.shouldEndSession(false);
			response.send();
		}
	}
  }
);
skillService.intent('backToMainIntent',{
	'utterances':['quit','exit','main menu']
		},
	function(request,response){

		var stg =START;
		var msg = " you are done with this recipe."
		if(getStageHelperFromRequest(request)==START){
			msg = " you are in the main dialog now. no need to quit.";
		}
		var recipe_helper = resetHelper();
		response.say(msg);
		response.shouldEndSession(false);
		response.session(STAGE_KEY,stg);
		response.session(SESSION_KEY,recipe_helper);
		response.send();
		}
	);
