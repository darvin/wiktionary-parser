
var assert = require('chai').assert;
var expect = require('chai').expect;
var etymolator = require('../');
var path = require('path');
var fs = require('fs');

describe('etymolator parser', function() {
  describe('parser', function () {
  	var r = null;
  	before(function() {
			var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "test.wiki"), {encoding:'utf8'});

      r = etymolator.parseWiki(wikitext);	  
    });

    it('should parse wiki', function () {
      expect(r).to.be.ok;
    });

    
  });
});
