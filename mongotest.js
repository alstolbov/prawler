var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://geoworks:Informatica21@ds043324.mongolab.com:43324/gisweb-develop';

var count = 0;

var findRestaurants = function(db, callback) {
  var cursor =db.collection('complaints').find(); // {"featureId": "fa3d0df1-f509-4742-9835-71190a6d6bff"});
  console.log('get items, parse data...', new Date());
  // console.log(cursor);
  // callback();
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      // console.dir(doc);
      count++;
    } else {
      callback();
    }
  });
};
console.log('START connect', new Date());
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  findRestaurants(db, function() {
    console.log('count:', count);
    console.log('END connect', new Date());
    db.close();
  });
});
