// superagent to make HTTP requests
var superagent = require('superagent');

// variables
// The ID for a simple find query
var id = "3C66A6";
// TODO:
// misschien leuk om een array te populaten met ids en daar random ids uit te
// pakken?

//var n = 200
var collection = "";

/*testSimpleFind(500);
setTimeout(function () {
  testGeoNear(500);
}, 30000);
setTimeout(function () {
  testAuditTrail(500);
}, 60000);
setTimeout(function () {
  testOlderThan(500);
}, 90000);
setTimeout(function () {
  testMostRecent(500);
}, 120000);
setTimeout(function () {
  testTrack(500);
}, 150000);
setTimeout(function () {
  testLargeInsert(5000);
}, 200000);
*/
testHeavyLoad(4000, 1000)

function testSimpleFind(n) {
  for (i=0;i<n;i++) {
    console.log(i);
    superagent.get('http://localhost:3000/collections/planes4mei/find/'+id)
    .end(function(err, res){
    });
  }
}

function testGeoNear(n) {
  for (i=0;i<n;i++) {
    // we want coordinates to be within 60-40, 0-15
    var lat = (Math.random()*20+40)
    var lng = Math.random()*15
    console.log("i: "+i+" "+lat +" : "+lng );
    // make sure to select a collection that has 2d indexes enabled
    superagent.get('http://localhost:3000/collections/planes/geonear?lng='+lng+"&lat="+lat)
    .end(function(err, res){
    });
  }
}

function testAuditTrail(n) {
  for (i=0;i<n;i++) {
    console.log(i);
    superagent.get('http://localhost:3000/collections/planes4mei/audittrail/'+id)
    .end(function(err, res){
    });
  }
}

function testOlderThan(n) {
  for (i=0;i<n;i++) {
    console.log(i);
    superagent.get('http://localhost:3000/collections/planes4mei/24h?identifier='+id)
    .end(function(err, res){
    });
  }
}

function testMostRecent(n) {
  for (i=0;i<n;i++) {
    console.log(i);
    superagent.get('http://localhost:3000/collections/planes4mei/mostRecent?identifier='+id)
    .end(function(err, res){
    });
  }
}

// Woe is the nomenclature!
function testTrack(n) {
  for (i=0;i<n;i++) {
    console.log(i);
    superagent.get('http://localhost:3000/collections/planes4mei/track?identifier='+id)
    .end(function(err, res){
    });
  }
}

//inserts n items
function testLargeInsert(n) {
  for (i=0;i<n;i++) {
    console.log("insert: "+ i);
    superagent.post('http://localhost:3000/collections/planesSpamDump')
      .send({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                16.7371,
                51.9227
              ]
            },
            "properties": {
              "id": "3C66AC",
              "FeatureTypeId": "plane",
              "Altitude": 35975,
              "Track": 256,
              "Speed": 471,
              "Squawk": "6257",
              "PlaneType": "A320",
              "Active": "true",
              "Time": 1428480473026,
              "IsSpam": "true"
            }
    }).end(function(err, res){
    });
  }
}


// In the words of the two wise LLama's.. Carl, this kills the server.
function testHeavyLoad(n, m) {
  setInterval(function () {
    testLargeInsert(n);
    testSimpleFind(n);
  }, m);
}

// because of journal concerns (journal might not be commited yet) execute a
// a find query in the shell and in the shell only to look for the execution speed.
// The joys of async code and stacks.

/* example query:
db.system.profile.aggregate([
  { $match: {
      ns : "planes.planes4mei"}

      },
      {$group : { _id :"$op",
  count:{$sum:1},
  "max response time":{$max:"$millis"},
  "avg response time":{$avg:"$millis"},
  "min response time":{$min:"$millis"},
  "total response time": {$sum: "$millis"}
  }
}
]) */


// To empty and re-enable the profiler:
/*
db.setProfilingLevel(0)
db.system.profile.drop()
db.createCollection("system.profile", {capped: true, size: 40000000})
db.setProfilingLevel(2)
*/
