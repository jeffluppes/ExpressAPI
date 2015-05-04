var express = require('express'),
  mongoskin = require('mongoskin'),
  bodyParser = require('body-parser'),
  logger = require('morgan')

var app = express()

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(logger())

var db = mongoskin.db('mongodb://@localhost:27017/planes', {safe:true})
var id = mongoskin.helper.toObjectID

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

app.get('/', function(req, res, next) {
  res.send('Select a collection, e.g., /collections/messages')
})

app.get('/collections/:collectionName', function(req, res, next) {
  req.collection.find({}, {limit: 10, sort: [['_id', -1]]})
    .toArray(function(e, results){

      if (e) return next(e)
      res.send(results)
    }
  )
})

app.post('/collections/:collectionName', function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e)
    res.send(results)
  })
})


// ----------- AGGREGATION FUNCTIONS ----------------------
//Geonear: retrieves all points near a specified point
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

//24h: returns all points older than 24h
//TODO: should this be parameterized?
app.get('/collections/:collectionName/24h', function(req, res) {
  req.collection.aggregate([
    {
      "$match": {
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

//TODO: Returns all points of selected <x> older than 24h

//TODO: Returns the most recent entry of <x>

//TODO: Returns all points of <x>

//TODO: Returns all points as defined by the criteria given in a filter query.
// Probaby the hardest to actually implement.


app.get('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.findOne({_id: id(req.params.id)}, function(e, result){
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
