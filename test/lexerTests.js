var assert = require('chai').assert;
var expect = require('chai').expect;
var wiktParser = require('../');
var fs = require('fs');
var path = require('path');


describe('wiktionary lexer lexes', function() {
  var MAX_SIZE = null;
  var l = null;
  var lexAll = function(txt) {
    l.setInput(txt);
    var result = [];
    var last = null;
    do {
      last = l.lex();
      if (last!=l.EOF) {
        var str = last;
        if (l.yy.value) {
          str += "%"+l.yy.value;
        }
        if (last=="TEXT"||last=="ATTRIBUTE") {
          str += ":"+l.yytext;
        }
        result.push(str.replace("\n", "\\n"));
      }
        
      if (result.length>MAX_SIZE && MAX_SIZE){
        break;
      }
    } while(last!=l.EOF);
    console.log(result);
    return result;
  }

  before(function(){
    l = wiktParser.Parser.lexer;
  });

  it('comment', function() {
    expect(lexAll("<!-- something -->")).deep.eql([ 'BEGINCOMMENT', 'TEXT: something ', 'ENDCOMMENT' ]);
    expect(lexAll("<!---->")).deep.eql([ 'BEGINCOMMENT', 'ENDCOMMENT' ]);
    // expect(lexAll("<!-- <!-- <!-- -->")).deep.eql([ 'BEGINCOMMENT', 'TEXT: <!-- <!-- ', 'ENDCOMMENT' ]);

  });

  it('text', function() {
    expect(lexAll("bla bla bla")).deep.eql(['TEXT:bla bla bla']);
    expect(lexAll("bla bl\nbla")).deep.eql(['TEXT:bla bl', 'NEWLINE', 'TEXT:bla' ]);
    expect(lexAll("\n bla bla\n bla\n\n")).deep.eql(
        [ 'NEWLINE',
          'PRELINE',
          'TEXT:bla bla',
          'NEWLINE',
          'PRELINE',
          'TEXT:bla',
          'NEWLINE',
          'NEWLINE' ]);

  });

  it('header', function() {
    expect(lexAll("=Header one=\n")).deep.eql(
      [ 'HEADING%1','TEXT:Header one','ENDHEADING%1' ]);
    expect(lexAll("==Header two==\n")).deep.eql(
      [ 'HEADING%2','TEXT:Header two','ENDHEADING%2' ]);
    expect(lexAll("==Header two==\nsomething \n===Header three=== \n=")).deep.eql(
      [ 'HEADING%2',
        'TEXT:Header two',
        'ENDHEADING%2',
        'TEXT:something ',
        'NEWLINE',
        'HEADING%3',
        'TEXT:Header three',
        'ENDHEADING%3',
        'HEADING%1' ]);
    expect(lexAll("=Header one= \n")).deep.eql(
      [ 'HEADING%1','TEXT:Header one','ENDHEADING%1' ]);
    // expect(lexAll("=Header=one= \n")).deep.eql(
    //   [ 'HEADING%1','TEXT:Header=one','ENDHEADING%1' ]);

  });

  it('template', function() {
    expect(lexAll("{{en-noun}}")).deep.eql(
      [ 'OPENTEMPLATE',
        'TEXT:en-noun',
        'CLOSETEMPLATE' ]
      );
    expect(lexAll("{{etyl|enm|en}} ")).deep.eql(
      [ 'OPENTEMPLATE',
        'TEXT:etyl',
        'PIPE',
        'TEXT:enm',
        'PIPE',
        'TEXT:en',
        'CLOSETEMPLATE',
        'PRELINE' ]);
    var exp1 = [ 'OPENTEMPLATE',
        'TEXT:etyl',
        'PIPE',
        'ATTRIBUTE:lang',
        'EQUALS',
        'TEXT:enm',
        'PIPE',
        'ATTRIBUTE:langAnother',
        'EQUALS',
        'TEXT:en',
        'CLOSETEMPLATE',
        'PRELINE' ];
    expect(lexAll("{{etyl|lang=enm|langAnother=en}} ")).deep.eql(exp1);
    // expect(lexAll("{{etyl|lang=enm| langAnother= en}} ")).deep.eql(exp1);
    // expect(lexAll("{{etyl|lang=enm| langAnother= en}} ")).deep.eql(exp1);
    // expect(lexAll("{{ etyl |lang=enm| langAnother= en}} ")).deep.eql(exp1);
    expect(lexAll("{{etyl|lang=\"enm\"|langAnother=en}} ")).deep.eql([ 'OPENTEMPLATE',
      'TEXT:etyl',
      'PIPE',
      'ATTRIBUTE:lang',
      'EQUALS',
      'ATTRQ',
      'TEXT:enm',
      'ATTRQ',
      'PIPE',
      'ATTRIBUTE:langAnother',
      'EQUALS',
      'TEXT:en',
      'CLOSETEMPLATE',
      'PRELINE' ]);
  });

  it('links', function() {
    expect(lexAll("[[lt:test]]")).deep.eql([ 'OPENDBLSQBR', 'TEXT:lt:test', 'CLOSEDBLSQBR' ]);
  });

  it.only('templates with spaces', function() {
    expect(lexAll("{{IPA|/tɛst/|lang=en}}")).deep.eql(
      [ 'OPENTEMPLATE',
        'TEXT:IPA',
        'PIPE',
        'TEXT:/tɛst/',
        'PIPE',
        'ATTRIBUTE:lang',
        'EQUALS',
        'TEXT:en',
        'CLOSETEMPLATE' ]
      );
    expect(lexAll("{{audio|En-uk-a test.ogg|Audio (UK)|lang=en}}")).deep.eql(
      [ 'OPENTEMPLATE',
        'TEXT:audio',
        'PIPE',
        'TEXT:En-uk-a test.ogg',
        'PIPE',
        'TEXT:Audio (UK)',
        'PIPE',
        'ATTRIBUTE:lang',
        'EQUALS',
        'TEXT:en',
        'CLOSETEMPLATE' ]
      );
  });

  it ('templates inside templates', function() {
    expect(lexAll("{{hyp3|title=Hyponyms of ''test''|{{l/en|acid test}}|some}}")).deep.eql([ 'OPENTEMPLATE',
      'TEXT:hyp3',
      'PIPE',
      'ATTRIBUTE:title',
      'EQUALS',
      'TEXT:Hyponyms of \'\'test\'\'',
      'PIPE',
      'OPENTEMPLATE',
      'TEXT:l/en',
      'PIPE',
      'TEXT:acid test',
      'CLOSETEMPLATE',
      'PIPE',
      'TEXT:some',
      'CLOSETEMPLATE' ]);

  });

  it("'test' word article", function() {
    var WRITE_EXPECTED_RESULTS = false;
    var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "test.wiki"), {encoding:'utf8'});
    var result = lexAll(wikitext);
    var resultFilePath = path.join(__dirname,"fixtures","test.wiki.output.txt");
    if (WRITE_EXPECTED_RESULTS) {
      var resultStr = result.join("\n");
      fs.writeFileSync(resultFilePath, resultStr, {encoding:'utf8'});
    } else {
      var expectedResults = fs.readFileSync(resultFilePath, {encoding:'utf8'}).split("\n");
      expect(result).deep.eql(expectedResults);
    }



  });
});