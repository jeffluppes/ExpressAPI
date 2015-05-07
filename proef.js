// superagent to make HTTP requests
var superagent = require('superagent');

// variables
// The ID for a simple find query
var id = "3C66A6";
var n = 100
for (i=0;i<n;i++) {
  console.log(i);
  superagent.get('http://localhost:3000/collections/planes4mei/find/'+id)
  .end(function(err, res){
  });
}
// because of journal concerns (journal might not be commited yet) execute a
// a find query in the shell and in the shell only to look for the execution speed.
// The joys of async code and stacks. 
