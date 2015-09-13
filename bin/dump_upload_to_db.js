#!/usr/bin/env node --harmony

var argv = require('yargs').argv;

var fs        = require('fs')
var path      = require('path')
var XmlStream = require('xml-stream')
var wikipedia= require("wtf_wikipedia")
var etymolator= require("../");
var prettyjson = require('prettyjson');

var skipSmall = argv.skip_small;
var skip = argv.skip;
var limit = argv.limit;
var show = argv.show;
var verbose = argv.verbose;
var justCount = argv.just_count;
var file= argv._[0] ||  "../DumpData/enwiktionary-20150901-pages-articles-multistream.xml";
var stream = fs.createReadStream(path.join(__dirname, file));
var lang="en"

var count = 0;

var co = require("co");
var comongo = require('co-mongo');

co(function *() {
  var db = yield comongo.get();
  var collection = db.wiktionaryDump;
  yield collection.ensureIndex({title:1, namespace:1}, {unique:true});

  var xml = new XmlStream(stream);
  xml._preserveAll=true //keep newlines
  // xml.preserve('text');

  xml.on('endElement: page', function(page) { 
    co(function *() {
      try {
        var namespaceName = null;
        var title = page.title;
        if (page.ns!="0") {
          namespaceName = page.title.split("/")[0];
          title = page.title.split("/")[1];
        }

        if(namespaceName==null ||
          etymolator.getSpecialNamespaces().hasOwnProperty(namespaceName)
          ){
          count ++;
          if (verbose) {
            console.log("input article #", count, title);

          }
          if (count>=skip+limit) {
            process.exit();
          } else if (count<skip) {

          } else if (justCount) {
            if (count%1000==0) {
              console.log("Counting: ",count);
            }

          } else {
            var script=page.revision.text["$text"] || '';
            var ns = etymolator.getLangCodeForNamespace(namespaceName)||null;
            if (script.length<3000&&skipSmall) {
              return;
            }
            
            var doc = {
              title:title,
              text:script,
              namespace:ns
            }

            // console.log("doc", doc);
            if (count%1000==0) {
              console.log("Writting to db: ",count);
            }
            var r = yield collection.insert(doc);
            if (verbose) {
              // console.log("Written to db: ", prettyjson.render(r));

            }
            
          }
        } else if (namespaceName) {
          if (verbose) {
            // console.log("Article from ignored namespace: ", namespaceName);
          }
        }
      } catch (err) {
        console.log(page.title, "error:", err);

      }
    });
  });

  xml.on('error', function*(message) {
    console.log('Parsing as ' + (encoding || 'auto') + ' failed: ' + message);
    yield db.close();
  });

  xml.on('end', function(message) {
    console.log('=================done========')
    setTimeout(function*(){ //let the remaining async writes finish up
      yield db.close();
    },3000)
  });
}).catch(onerror);

function onerror(err) {
  // log any uncaught errors
  // co will not throw any errors you do not handle!!!
  // HANDLE ALL YOUR ERRORS!!!
  console.error(err.stack);
}


  