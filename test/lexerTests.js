var assert = require('chai').assert;
var expect = require('chai').expect;
var wiktParser = require('../');
var fs = require('fs');
var path = require('path');
/*todo important
{{IPA|/tɛst/|lang=en}}
{{audio|En-uk-a test.ogg|Audio (UK)|lang=en}}


*/
describe.only('wiktionary lexer lexes', function() {
  var MAX_SIZE = null;
  var l = null;
  var lexAll = function(txt) {
    l.setInput(txt);
    var result = [];
    var last = null;
    do {
      last = l.lex();
      if (last!=l.EOF)
        if (last=='TEXT') {
          result.push({txt:l.yytext});
        } else {
          if (l.yy.value){
            result.push({
              v:l.yy.value,
              t:last
            });

          } else if (last=='ATTRIBUTE'){
            result.push({
              txt:l.yytext,
              t:last
            });

          } else {
            result.push(last);

          }
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
    expect(lexAll("<!-- something -->")).deep.eql([ 'BEGINCOMMENT', { txt: ' something ' }, 'ENDCOMMENT' ]);
    expect(lexAll("<!---->")).deep.eql([ 'BEGINCOMMENT', 'ENDCOMMENT' ]);
    // expect(lexAll("<!-- <!-- <!-- -->")).deep.eql([ 'BEGINCOMMENT', { txt: ' <!-- <!-- ' }, 'ENDCOMMENT' ]);

  });

  it('text', function() {
    expect(lexAll("bla bla bla")).deep.eql([{txt: 'bla bla bla' }]);
    expect(lexAll("bla bl\nbla")).deep.eql([ { txt: 'bla bl' }, 'NEWLINE', { txt: 'bla' } ]);
    expect(lexAll("\n bla bla\n bla\n\n")).deep.eql(
        [ 'NEWLINE',
          'PRELINE',
          { txt: 'bla bla' },
          'NEWLINE',
          'PRELINE',
          { txt: 'bla' },
          'NEWLINE',
          'NEWLINE' ]);

  });

  it('header', function() {
    expect(lexAll("=Header one=\n")).deep.eql(
      [ { v: 1, t: 'HEADING' },{ txt: 'Header one' },{ v: 1, t: 'ENDHEADING' } ]);
    expect(lexAll("==Header two==\n")).deep.eql(
      [ { v: 2, t: 'HEADING' },{ txt: 'Header two' },{ v: 2, t: 'ENDHEADING' } ]);
    expect(lexAll("==Header two==\nsomething \n===Header three=== \n=")).deep.eql(
      [ { v: 2, t: 'HEADING' },
        { txt: 'Header two' },
        { v: 2, t: 'ENDHEADING' },
        { txt: 'something ' },
        'NEWLINE',
        { v: 3, t: 'HEADING' },
        { txt: 'Header three' },
        { v: 3, t: 'ENDHEADING' },
        { v: 1, t: 'HEADING' } ]);
    expect(lexAll("=Header one= \n")).deep.eql(
      [ { v: 1, t: 'HEADING' },{ txt: 'Header one' },{ v: 1, t: 'ENDHEADING' } ]);
    // expect(lexAll("=Header=one= \n")).deep.eql(
    //   [ { v: 1, t: 'HEADING' },{ txt: 'Header=one' },{ v: 1, t: 'ENDHEADING' } ]);

  });

  it('template', function() {
    expect(lexAll("{{en-noun}}")).deep.eql(
      [ 'OPENTEMPLATE',
        { txt: 'en-noun', t: 'ATTRIBUTE' },
        'CLOSETEMPLATE' ]
      );
    expect(lexAll("{{etyl|enm|en}} ")).deep.eql(
      [ 'OPENTEMPLATE',
        { txt: 'etyl', t: 'ATTRIBUTE' },
        'PIPE',
        { txt: 'enm', t: 'ATTRIBUTE' },
        'PIPE',
        { txt: 'en', t: 'ATTRIBUTE' },
        'CLOSETEMPLATE',
        'PRELINE' ]);
    var exp1 = [ 'OPENTEMPLATE',
        { txt: 'etyl', t: 'ATTRIBUTE' },
        'PIPE',
        { txt: 'lang', t: 'ATTRIBUTE' },
        'EQUALS',
        { txt: 'enm' },
        'PIPE',
        { txt: 'langAnother', t: 'ATTRIBUTE' },
        'EQUALS',
        { txt: 'en' },
        'CLOSETEMPLATE',
        'PRELINE' ];
    expect(lexAll("{{etyl|lang=enm|langAnother=en}} ")).deep.eql(exp1);
    // expect(lexAll("{{etyl|lang=enm| langAnother= en}} ")).deep.eql(exp1);
    // expect(lexAll("{{etyl|lang=enm| langAnother= en}} ")).deep.eql(exp1);
    // expect(lexAll("{{ etyl |lang=enm| langAnother= en}} ")).deep.eql(exp1);
    expect(lexAll("{{etyl|lang=\"enm\"|langAnother=en}} ")).deep.eql([ 'OPENTEMPLATE',
      { txt: 'etyl', t: 'ATTRIBUTE' },
      'PIPE',
      { txt: 'lang', t: 'ATTRIBUTE' },
      'EQUALS',
      'ATTRQ',
      { txt: 'enm' },
      'ATTRQ',
      'PIPE',
      { txt: 'langAnother', t: 'ATTRIBUTE' },
      'EQUALS',
      { txt: 'en' },
      'CLOSETEMPLATE',
      'PRELINE' ]);

  });

  it('links', function() {
    expect(lexAll("[[lt:test]]")).deep.eql([ 'OPENDBLSQBR', { txt: 'lt:test' }, 'CLOSEDBLSQBR' ]);
  });

  it("'test' word article", function() {
    var wikitext = fs.readFileSync(path.join(__dirname,"fixtures", "test.wiki"), {encoding:'utf8'});
    var result = lexAll(wikitext);
    var resstr = JSON.stringify(result, null, 2);
    fs.writeFileSync(path.join(__dirname,"fixtures","test.wiki.output.json"), resstr, {encoding:'utf8'});
    expect(result).deep.eql(null);
  });
});