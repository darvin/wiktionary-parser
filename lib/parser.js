
var fs = require('fs');
var path = require('path');


var parser = null;

function ensureParser() {
	if (parser!=null) {
		return;
	}
	// var Parser = require("jison").Parser;

	// var grammar = fs.readFileSync(path.join(__dirname, "parser_grammar.jison"), "utf8");

	// console.log("GRAMMMMAR:", grammar);
	// parser = new Parser(grammar);

	parser = require('./_generated_parser');

}

exports.parseWiki = function(wiki) {
	ensureParser();


	var result = {};
	console.log(wiki);
	result = parser.parse(wiki);
	return result;
}