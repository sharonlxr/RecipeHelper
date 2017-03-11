'use strict';
module.change_code = 1;
var _ = require('lodash');
var Skill = require('alexa-app');

var SESSION_KEY = 'recipe';
var STAGE_KEY ='stage';
var START  = "Start";
var WAIT = "WAIT";
var

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

var getRecipeHelperFromRequest = function(request){
	var recipe_helper = request.session(SESSION_KEY);
	return getRecipeHelper(recipe_helper);
};

var getStageHelperFromRequest = function(request){
	var stage = request.session(STAGE_KEY);
	return stage;
};
var welcomeMsg = "Welcome to recipe helper! What do you want to make today";

skillService.launch(function(request,response){

	response.say(welcomeMsg).shouldEndSession(false);
	response.session(STAGE_KEY,START);
	response.session(SESSION_KEY,getStageHelperFromRequest(request));
	response.send();
});
