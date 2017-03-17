'use strict';
module.change_code = 1;
function recipeHelper(obj){
	this.currentStep = -1;
	this.currentIngre = -1;
	this.ingredients = [];
	this.steps = [];
	for(var prop in obj) this[prop]  = obj[prop];
}

recipeHelper.prototype.complete = function(){
	return this.currentStep >= (this.steps.length - 1);
};
recipeHelper.prototype.completeIngre = function(){
	return this.currentIngre >= (this.ingredients.length - 1);
};
recipeHelper.prototype.getStep = function(){
	return this.steps[this.currentStep];
};
recipeHelper.prototype.setSteps = function(stps){
	return this.steps = stps;
};
recipeHelper.prototype.setCurrentStep =function(index){
	this.currentStep = index;
};
recipeHelper.prototype.setIngres =function(ingres){
	var i = 0;
	var res =[];
	var j = 0;
	while(i<ingres.length){
		if(ingres[i].trim()!=""){
			res[j] = ingres[i];
			j++;
		}
		i++;
	}
	this.ingredients = res;
};
recipeHelper.prototype.setCurrentIngre = function(index){
	this.currentIngre = index;
};
module.exports = recipeHelper;