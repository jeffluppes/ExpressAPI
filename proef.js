// superagent to make HTTP requests
var superagent = require('superagent');

// variables
// The ID for a simple find query
var id = "3C66A6";
var n = 200
/*
for (i=0;i<n;i++) {
  console.log(i);
  superagent.get('http://localhost:3000/collections/planes4mei/find/'+id)
  .end(function(err, res){
  });
}
*/


// we want coordinates to be within 60-40, 0-15
for (i=0;i<n;i++) {
  var lat = (Math.random()*20+40)
  var lng = Math.random()*15
  console.log("i: "+i+" "+lat +" : "+lng );
  superagent.get('http://localhost:3000/collections/planes/geonear?lng='+lng+"&lat="+lat)
  .end(function(err, res){
  });
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
