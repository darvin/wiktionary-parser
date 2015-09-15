
var fs = require('fs');
var path = require('path');


var parser = null;

function ensureParser() {
	if (parser!=null) {
		return;
	}
	var Parser = require("jison").Parser;

	var grammar = fs.readFileSync(path.join(__dirname, "parser_grammar.jison"), "utf8");

	var parser = new Parser(grammar);

}

exports.parseWiki = function(wiki) {
	ensureParser();


	var result = {};
	result = parser.parse(wiki);
	return result;
}