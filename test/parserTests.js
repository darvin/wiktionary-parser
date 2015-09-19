
var assert = require('chai').assert;
var expect = require('chai').expect;
var wiktParser = require('../');
var path = require('path');
var fs = require('fs');


function p(txt) {
  return wiktParser.Parser.parser.parse(txt);
}
describe('wiktionary parser', function() {
  xdescribe('parses simple chunks like', function() {
    it('header', function(){
      expect(p('===HeaderThree===\n')).deep.eql(null);
    });
  });
  xdescribe('parses "test"', function () {
  	var r = null;
  	before(function() {
			var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "test.wiki"), {encoding:'utf8'});

      r = wiktParser.Parser.parser.parse(wikitext);	  
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

      r = wiktParser.Parser.parser.parse(wikitext);   
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
