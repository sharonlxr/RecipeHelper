'use strict';
module.change_code = 1;
var _ = require('lodash');
var CAKEBAKER_DATA_TABLE_NAME = 'cakeBakerData';
// var dynasty = require('dynasty')({});
// var url = 'http://localhost:4000';
var url = "http://dynamodb.us-east-1.amazonaws.com";
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'AKIAJ2LZ2SJHUCYEMFEQ',
  secretAccessKey: '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'
};
var localDynasty = require('dynasty')(localCredentials, url);
var dynasty = localDynasty;

function CakeBakerHelper() {}
var cakeBakerTable = function() {
  return dynasty.table(CAKEBAKER_DATA_TABLE_NAME);
};

CakeBakerHelper.prototype.createCakeBakerTable = function() {
  return dynasty.describe(CAKEBAKER_DATA_TABLE_NAME)
    .catch(function(error) {
      return dynasty.create(CAKEBAKER_DATA_TABLE_NAME, {
        key_schema: {
          hash: ['userId', 'string']
        }
      });
    });
};

CakeBakerHelper.prototype.storeCakeBakerData = function(userId, cakeBakerData) {
  return cakeBakerTable().insert({
    userId: userId,
    data: cakeBakerData
  }).catch(function(error) {
    console.log("IN database_helper.js !error!")
    console.log(error);
  });
};

CakeBakerHelper.prototype.readCakeBakerData = function(userId) {
  return cakeBakerTable().find(userId)
    .then(function(result) {
      console.log("Good result")
      return result;
    })
    .catch(function(error) {
      console.log("!error!")
      console.log(error);
    });
};

module.exports = CakeBakerHelper;