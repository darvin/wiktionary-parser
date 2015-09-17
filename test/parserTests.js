
var assert = require('chai').assert;
var expect = require('chai').expect;
var wiktParser = require('../');
var path = require('path');
var fs = require('fs');

describe.only('wiktionary lexer', function() {
  var l = null;
  before(function(){

    l = wiktParser.Parser.lexer;
    console.log("lexer",wiktParser.Parser.lexer);
    console.log("parser",wiktParser.Parser);
    console.log(wiktParser);
  })
  it('lexes simple stuff', function() {
    l.setInput("asdfasfd");
    expect(l.lex()).equal("a");
  })
});

describe('wiktionary parser', function() {
  describe('parses "test"', function () {
  	var r = null;
  	before(function() {
			var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "test.wiki"), {encoding:'utf8'});

      r = wiktParser.parseWiki(wikitext);	  
    });

    it('should parse wiki', function () {
      expect(r).to.be.ok;
    });
    it('should have multiple languages');
    describe('parsed english word', function() {
    	var w = null;
    	before(function() {
    		w = r["eng"];
    	});
    	it('should have 2 meanings');
    	describe('meaning 1', function() {
    		it('should have etymology');
    		it('should have noun role');
    		it('should have verb role');
    	});
    	describe('meaning 2', function() {
    		it('should have etymology');
    		it('should have noun role');
    		it('should have verb role');
    	});



    })
  });

  describe('parses "sample"', function () {
  	var r = null;
  	before(function() {
			var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "sample.wiki"), {encoding:'utf8'});

      r = wiktParser.parseWiki(wikitext);	  
    });

    it('should parse wiki', function () {
      expect(r).to.be.ok;
    });
    describe('parsed english word', function() {
    	var w = null;
    	before(function() {
    		w = r["eng"];
    	});
    	it('should have 1 meaning');
    	describe('meaning 1', function() {
    		it('should have noun role');
    	});
    

    })
  });
});
