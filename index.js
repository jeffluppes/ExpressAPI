var express = require('express'),
  mongoskin = require('mongoskin'),
  bodyParser = require('body-parser'),
  logger = require('morgan')

var app = express()

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(logger())

var db = mongoskin.db('mongodb://@localhost:27017/planes', {safe:true, profile:2})
var id = mongoskin.helper.toObjectID

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

app.get('/', function(req, res, next) {
  res.send('Select a collection, e.g., /collections/messages')
})


// --------------- find (<10) -------------------
app.get('/collections/:collectionName', function(req, res, next) {
  req.collection.find({}, {limit: 10, sort: [['_id', -1]]})
    .toArray(function(e, results){
      if (e) return next(e)
      res.send(results)
    }
  )
})


// --------------- Insert -------------------
app.post('/collections/:collectionName', function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e)
    res.send(results)
  })
})


// ----------- AGGREGATION FUNCTIONS ----------------------
// Geonear: retrieves all points near a specified point
// ASSUMES THAT THERE IS A 2D INDEX AVAILABLE! This has to be entered
// manually, be advised.
//TODO: Add params for distance, limit etc to query
app.get('/collections/:collectionName/geonear', function(req, res) {
  var lng = parseFloat(req.query.lng),
      lat = parseFloat(req.query.lat),
      distance = parseInt(req.query.distance);
      req.collection.aggregate([
      {
            "$geoNear": {
                "near": [lng, lat],
                 "distanceField": "distance",
                 "limit": 3
             }
        }
      ],
     function(err, docs) {
      //console.log(docs);
          res.json(docs);
     });
 });

//24h: returns all points older than 24h of the given identifier
//TODO: should this take a limit as a param?
app.get('/collections/:collectionName/24h', function(req, res) {
  var identifier = req.query.identifier;
  req.collection.aggregate([
    {
      "$match": {
        'properties.id': identifier,
        'properties.Time': {
          "$lt": (new Date() - 1000*60*60)
        }
      }
    },
    {
      "$limit": 100
    }
  ],
  function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

// Returns the most recent entry of <x>
app.get('/collections/:collectionName/mostRecent', function(req, res) {
  var identifier = req.query.identifier;
  req.collection.aggregate([
    {
      "$match": {
        'properties.id': identifier
      }
    },
    {
      "$sort": {
        'properties.Time': -1
      }
    },
    {
      "$limit": 1
    }
  ],
  function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

// Returns all points of <x>, the so-called track function.
// Most recent goes first
app.get('/collections/:collectionName/track', function(req, res) {
  var identifier = req.query.identifier;
  req.collection.aggregate([
    {
      "$match": {
        'properties.id': identifier
      }
    },
    {
      "$sort": {
        'properties.Time': -1
      }
    }
  ],
  function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

// Finds a single item, by its properties.id - which may or may not be indexed
// Thus, this might be slower than the indexed _id.
// I'm also wondering what the difference is between this and findOne().
// Okay, so this is actually twice as slow as a simple findOne().
// Commenting code for now.
/**app.get('/collections/:collectionName/find/:id', function(req, res, next) {
  req.collection.aggregate([
  {
      "$match": {
        'properties.id' : id(req.params.id)
         }
    },
    {
      "$limit": 1
    }
  ],
 function(err, docs) {
  //console.log(docs);
      res.json(docs);
 });
});*/

// TODO: Returns all points as defined by the criteria given in a filter query.
// Probaby the hardest to actually implement, because I'm not sure we can give
// fields as params. Mongo will just assume parameters to be literal, e.g. a
// "field" var containing "speed" will just be interpreted as "field".

// --------- END OF AGGREGATION ----------

// Finds a single item, by _id. Lightning fast.
app.get('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.findOne({_id: id(req.params.id)}, function(e, result){
    if (e) return next(e)
    res.send(result)
  })
})

// Finds a single item, by _id. Lightning fast.
app.get('/collections/:collectionName/find/:id', function(req, res, next) {
  req.collection.findOne({'properties.id': id(req.params.id)}, function(e, result){
    if (e) return next(e)
    res.send(result)
  })
})

app.put('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.update({_id: id(req.params.id)},
    {$set: req.body},
    {safe: true, multi: false}, function(e, result){
    if (e) return next(e)
    res.send((result === 1) ? {msg:'success'} : {msg:'error'})
  })
})

app.del('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.remove({_id: id(req.params.id)}, function(e, result){
    if (e) return next(e)
    res.send((result === 1) ? {msg:'success'} : {msg:'error'})
  })
})

app.listen(3000, function(){
  console.log ('Server is running')
})
