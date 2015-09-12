
var fs        = require('fs')
var path      = require('path')
var XmlStream = require('xml-stream')
var wikipedia= require("wtf_wikipedia")
var etymolator= require("../");
// Create a file stream and pass it to XmlStream
var file= process.argv[2] ||  "../DumpData/enwiktionary-20150901-pages-articles-multistream.xml";
var stream = fs.createReadStream(path.join(__dirname, file));
var lang="en"


etymolator.getDumpCollection(function(err, collection, db) {

  var xml = new XmlStream(stream);
  xml._preserveAll=true //keep newlines
  // xml.preserve('text');

  xml.on('endElement: page', function(page) {
    try {
      if(page.ns=="0"){
        var script=page.revision.text["$text"] || '';
        var data=wikipedia.parse(script)
        data.title=page.title
        // console.log(data.title)
        collection.insert(data, function(err, r){
          if(err){console.log(err)}
        })
      }
    } catch (err) {
      console.log(page.title, "error:", err);

    }
  });

  xml.on('error', function(message) {
    console.log('Parsing as ' + (encoding || 'auto') + ' failed: ' + message);
    db.close();
  });

  xml.on('end', function(message) {
    console.log('=================done========')
    setTimeout(function(){ //let the remaining async writes finish up
      db.close();
    },3000)
  });
});