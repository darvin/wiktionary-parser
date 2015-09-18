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

  it('templates with spaces', function() {
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

  it('templates inside templates', function() {
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

  it("complex quote", function() {
    expect(lexAll(
"#* {{quote-magazine|year=2013|month=May-June|author=[http://www.americanscientist.org/authors/detail/charles-t-ambrose Charles T. Ambrose]\n"+
"|title=[http://www.americanscientist.org/issues/feature/2013/3/alzheimerrsquos-disease-the-great-morbidity-of-the-21st-century Alzheimer’s Disease]\n"+
"|volume=101|issue=3|page=200|magazine={{w|American Scientist}}\n"+
"|passage=Similar studies of rats have employed four different intracranial resorbable, slow sustained release systems&mdash;&nbsp;[&hellip;]. Such a slow-release device containing angiogenic factors could be placed on the pia mater covering the cerebral cortex and '''tested''' in persons with senile dementia in long term studies.}}\n"+
"# {{context|copulative|lang=en}} To be shown to be by test.\n"+
"#: {{usex|He '''tested''' positive for cancer.|lang=en}}\n"+
"# {{context|chemistry|lang=en}} To examine or try, as by the use of some [[reagent]].")).deep.eql(
  [ 'LISTNUMBERED',
  'LISTBULLET',
  'OPENTEMPLATE',
  'TEXT:quote-magazine',
  'PIPE',
  'ATTRIBUTE:year',
  'EQUALS',
  'TEXT:2013',
  'PIPE',
  'ATTRIBUTE:month',
  'EQUALS',
  'TEXT:May-June',
  'PIPE',
  'ATTRIBUTE:author',
  'EQUALS',
  'OPENSQBR',
  'TEXT:http://www.americanscientist.org/authors/detail/charles-t-ambrose Charles T. Ambrose',
  'CLOSESQBR',
  'NEWLINE',
  'PIPE',
  'ATTRIBUTE:title',
  'EQUALS',
  'OPENSQBR',
  'TEXT:http://www.americanscientist.org/issues/feature/2013/3/alzheimerrsquos-disease-the-great-morbidity-of-the-21st-century Alzheimer’s Disease',
  'CLOSESQBR',
  'NEWLINE',
  'PIPE',
  'ATTRIBUTE:volume',
  'EQUALS',
  'TEXT:101',
  'PIPE',
  'ATTRIBUTE:issue',
  'EQUALS',
  'TEXT:3',
  'PIPE',
  'ATTRIBUTE:page',
  'EQUALS',
  'TEXT:200',
  'PIPE',
  'ATTRIBUTE:magazine',
  'EQUALS',
  'OPENTEMPLATE',
  'TEXT:w',
  'PIPE',
  'TEXT:American Scientist',
  'CLOSETEMPLATE',
  'NEWLINE',
  'PIPE',
  'ATTRIBUTE:passage',
  'EQUALS',
  'TEXT:Similar studies of rats have employed four different intracranial resorbable, slow sustained release systems&mdash;&nbsp;[&hellip;]. Such a slow-release device containing angiogenic factors could be placed on the pia mater covering the cerebral cortex and \'\'\'tested\'\'\' in persons with senile dementia in long term studies.',
  'CLOSETEMPLATE',
  'NEWLINE',
  'LISTNUMBERED',
  'OPENTEMPLATE',
  'TEXT:context',
  'PIPE',
  'TEXT:copulative',
  'PIPE',
  'ATTRIBUTE:lang',
  'EQUALS',
  'TEXT:en',
  'CLOSETEMPLATE',
  'PRELINE',
  'TEXT:To be shown to be by test.',
  'NEWLINE',
  'LISTNUMBERED',
  'LISTIDENT',
  'OPENTEMPLATE',
  'TEXT:usex',
  'PIPE',
  'TEXT:He \'\'\'tested\'\'\' positive for cancer.',
  'PIPE',
  'ATTRIBUTE:lang',
  'EQUALS',
  'TEXT:en',
  'CLOSETEMPLATE',
  'NEWLINE',
  'LISTNUMBERED',
  'OPENTEMPLATE',
  'TEXT:context',
  'PIPE',
  'TEXT:chemistry',
  'PIPE',
  'ATTRIBUTE:lang',
  'EQUALS',
  'TEXT:en',
  'CLOSETEMPLATE',
  'PRELINE',
  'TEXT:To examine or try, as by the use of some ',
  'OPENDBLSQBR',
  'TEXT:reagent',
  'CLOSEDBLSQBR',
  'TEXT:.' ]
 );
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