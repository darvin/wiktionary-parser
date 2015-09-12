var etymolator = require("../");
var prettyjson = require('prettyjson');
var co = require("co");
var word= process.argv[2];
var comongo = require('co-mongo');

co(function *() {
  var db = yield comongo.get();

  var collection = db.wiktionaryDump;

  if (!word){
		var count = yield collection.count();

		console.log("Total words in database: ", count);
		var lastIndex = 0;
		for (var i=0; i<10; i++) {
			var lastIndex = Math.random() * (count-lastIndex);
			var sampleWordDoc = (yield collection.find().limit(-1).skip(lastIndex).toArray())[0];
			console.log(sampleWordDoc.title);
		}
		yield  db.close();
	} else {
		var doc = yield collection.findOne({ title: word });

	  console.log("Word '"+word+"'");
	  var options = {
		  noColor: false
		};
		console.log(prettyjson.render(doc, options));
	  yield db.close();

		
	}
}).catch(onerror);

function onerror(err) {
  // log any uncaught errors
  // co will not throw any errors you do not handle!!!
  // HANDLE ALL YOUR ERRORS!!!
  console.error(err.stack);
}


	

