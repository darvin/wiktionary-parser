
var Parser = require("jison").Parser;
var fs = require('fs');
var path = require('path');

var grammar = fs.readFileSync(path.join(__dirname, "parser_grammar.jison"), "utf8");

var parser = new Parser(grammar);


exports.parseWiki = function(wiki) {

	var result = {};
	result = parser.parse(wiki);
	return result;
}