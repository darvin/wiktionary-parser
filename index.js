var path=require('path');
var comongo = require('co-mongo');
 
comongo.configure({
    host: '127.0.0.1',
    port: 27017,
    name: 'etymolator',
    pool: 10,
    collections: ['wiktionaryDump', 'words']
});

exports.parseText = function *(title, text) {
  return {};
}