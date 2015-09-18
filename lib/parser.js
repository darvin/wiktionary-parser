
var fs = require('fs');
var path = require('path');

var Parser = require('./_generated_parser');
var Lexer = require('./_generated_lexer');

Parser.parser.lexer = Lexer.lexer;

exports.parser = Parser.parser;
exports.lexer = Lexer.lexer;