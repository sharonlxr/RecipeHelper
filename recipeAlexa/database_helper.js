'use strict';
// module.change_code = 1;
var _ = require('lodash');
var table_name = "recipes";
var url = "https://cp8h9t2lqh.execute-api.us-east-1.amazonaws.com/prod/rewshandler";
var localCredentials = {
  region: 'us-east-1',
  // accessKeyId: 'AKIAJ2LZ2SJHUCYEMFEQ',
  // secretAccessKey: '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'
};
var localDB = require('dynasty')(localCredentials, url);
var db = localDB;
function recipeHelper(){};
var recipeTable = function() {
	return db.table(table_name);
};

recipeHelper.prototype.readRecipeData = function(name){
	return recipeTable().find(name).then(function(result){
		console.log("get recipe for "+name)
		return result;
	})
	.catch(function(error){
		console.log("error! load data")
		console.log(error);

	});
};

module.exports = recipeHelper;