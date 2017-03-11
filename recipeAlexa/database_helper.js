'use strict';
// module.change_code = 1;
var _ = require('lodash');
var table_name = "Recipes";
// var url = "https://cp8h9t2lqh.execute-api.us-east-1.amazonaws.com/prod/rewshandler";
var url = "http://dynamodb.us-east-1.amazonaws.com"
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'AKIAJ2LZ2SJHUCYEMFEQ',
  secretAccessKey: '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'
};
var localDB = require('dynasty')(localCredentials, url);
var db = localDB;
function recipeHelper(){};
var recipeTable = function() {
	// var table = db.table(table_name);
	// var msg = table.find("Bacon and Eggs");
	return db.table(table_name);
};

recipeHelper.prototype.readRecipeData = function(RecipeName){
	// var bb = recipeTable().find(RecipeName);
	// console.log(bb);
	// var aa = recipeTable().find(RecipeName).then(function(result){
	// 	console.log("get recipe for "+RecipeName)
	// 	return result;
	// }).catch(function(error){
	// 	console.log("error! load data")
	// 	console.log(error);
	// 	return error;
	// });
	// console.log(aa);
    console.log(RecipeName);
	return recipeTable().findAll(RecipeName).then(function(result){
		console.log("get recipe for "+RecipeName)
		console.log(result[0]);
		return result[0];
	})
	.catch(function(error){
		console.log("error! load data")
		console.log(error);
		return error;
	});
};

module.exports = recipeHelper;