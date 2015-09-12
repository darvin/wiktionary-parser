var etymolator = require("../");
var prettyjson = require('prettyjson');

var word= process.argv[2];

etymolator.getDumpCollection(function(err, collection, db) {


	if (!word){
		collection.count({}, function (err, count) {
			if (err) {
				console.log(err);
			}
		  console.log("Total words in database: ", count);
		  db.close();
		});
	} else {
		collection.findOne({ title: word }, function (err, doc) {
			if (err) {
				console.log(err);
			}
		  console.log("Word '"+word+"'");
		  var options = {
			  noColor: false
			};
			console.log(prettyjson.render(doc, options));
		  db.close();

		});

	}

});