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
	return this.currentStep === (this.steps.length - 1);
};
recipeHelper.prototype.getStep = function(){
	return this.steps[this.currentStep];
};
recipeHelper.prototype.setCurrentStep =function(index){
	this.currentStep = index;
};
recipeHelper.prototype.setCurrentIngre = function(index){
	this.currentIngre = index;
};
