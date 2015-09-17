
var fs = require('fs');
var path = require('path');

var parser = require('./_generated_parser');
var lexer = require('./_generated_lexer');

exports.parseWiki = function(wiki) {
	var result = parser.parse(wiki);
	return result;
}
exports.parser = parser;
exports.lexer = lexer;