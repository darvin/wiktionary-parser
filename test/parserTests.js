
var assert = require('chai').assert;
var expect = require('chai').expect;
var etymolator = require('../');
var path = require('path');
var fs = require('fs');

describe('etymolator', function() {
  describe('parser', function () {
    it('should parse wiki', function () {
    	var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "test.wiki"), {encoding:'utf8'});

      var result = etymolator.parseWiki(wikitext);
      expect(result).to.be.ok;
    });
  });
});
