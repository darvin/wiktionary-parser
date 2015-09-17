var path=require('path');




var langs = null;
function ensureLangs() {
	if (langs!=null) {
		return;
	}

	var languages = require("./lib/languages");
	var langsForNamespace = {};

	for (var code in languages) {
	  if (languages.hasOwnProperty(code)) {
	    var language = languages[code];
	    if (language.type!="regular"){
	    	var ns = "Appendix:"+language.canonicalName;
	    	langsForNamespace[ns] = code;
	    }
	  }
	}
	langs = {
		langsForNamespace:langsForNamespace
	}

}

exports.getSpecialNamespaces = function(namespace) {
	ensureLangs();
	return langs.langsForNamespace;
}


exports.getLangCodeForNamespace = function(namespace) {
	ensureLangs();
	return langs.langsForNamespace[namespace];
}

exports.Parser = require('./lib/parser');


