var Datastore = require('nedb');
var path=require('path');
var MongoClient = require('mongodb').MongoClient



exports.getDumpCollection = function(callback){
	var url = 'mongodb://localhost:27017/etymolator';

	MongoClient.connect(url, function(err, db) {
	  if(err){console.log(err)}
	  var collection = db.collection('wiktionaryDump');
	  collection.ensureIndex({title:1}, {unique:true}, function(err, indexName) {
	  	if(err){console.log(err)}
	  	callback(err, collection, db);
	  });
	});
}