
var PEG = require("pegjs");
var fs = require('fs');
var path = require('path');


var parser = PEG.buildParser(fs.readFileSync(path.join(__dirname,"pegTokenizer.pegjs"), {encoding:'utf8'}),
	{
		cache: false,
		trackLineAndColumn: false,
		output: "source",
		allowedStartRules: [
			"start",
			"table_start_tag",
			"url",
			"row_syntax_table_args",
			"table_attributes",
			"generic_newline_attributes",
			"tplarg_or_template_or_bust",
		],
		allowedStreamRules: [
			"start_async",
		],
	});

exports.parseWiki = function(wiki) {

	var result = {};
	result = parser.parse(wiki);
	return result;
}