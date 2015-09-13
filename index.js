var path=require('path');
var comongo = require('co-mongo');
 
comongo.configure({
    host: '127.0.0.1',
    port: 27017,
    name: 'etymolator',
    pool: 10,
    collections: ['wiktionaryDump', 'words']
});

exports.parseText = function *(title, text) {
  return {};
}



var langs = null;
function ensureLangs() {
	if (langs!=null) {
		return;
	}

	var languages = require("./lib/languages");
	var namespaces = new Set();
	var langsForNamespace = {};

	for (var code in languages) {
	  if (languages.hasOwnProperty(code)) {
	    var language = languages[code];
	    if (language.type!="regular"){
	    	var ns = "Appendix:"+language.canonicalName;
	    	langsForNamespace[ns] = code;
	    	namespaces.add(ns);
	    }
	  }
	}
	langs = {
		specialNamespaces:namespaces,
		langsForNamespace:langsForNamespace
	}

}


exports.getLangCodeForNamespace = function(namespace) {
	ensureLangs();
	return langs.langsForNamespace[namespace];
}

exports.getSpecialLanguagesNamespaces = function () {
	ensureLangs();
	return langs.specialNamespaces;
}
