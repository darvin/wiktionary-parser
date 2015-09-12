
var fs        = require('fs')
var path      = require('path')
var XmlStream = require('xml-stream')
var wikipedia= require("wtf_wikipedia")
var etymolator= require("../");
// Create a file stream and pass it to XmlStream
var file= process.argv[2] ||  "../DumpData/enwiktionary-20150901-pages-articles-multistream.xml";
var stream = fs.createReadStream(path.join(__dirname, file));
var lang="en"



var xml = new XmlStream(stream);
xml._preserveAll=true //keep newlines
// xml.preserve('text');

var count = 0;

xml.on('endElement: page', function(page) {
    if(page.ns=="0"){
      if (count % 1000 ==0) {
          console.log("Counting... ", count);

      }
      count++;
    }
});

xml.on('error', function(message) {
  console.log('Parsing as ' + (encoding || 'auto') + ' failed: ' + message);
});

xml.on('end', function(message) {
  console.log("Total count in dump stream: ", count);
  console.log('=================done========')
});
