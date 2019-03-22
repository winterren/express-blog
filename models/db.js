var settings = require('../settings');

var MongoClient = require('mongodb').MongoClient;
MongoClient.url = 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db;

// MongoClient.connect(MongoClient.url, { useNewUrlParser: true }, function(err, db) {
//   if (err) throw err;
//   console.log("数据库已创建!");
//   db.close();
// });


        
module.exports = MongoClient;