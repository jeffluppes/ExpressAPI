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

//Geonear: retrieves all points near a specified point
//db.planesF.aggregate([ { $geoNear: { near: [16.732269, 51.890169], distanceField: "distance", limit: 3 } } ]);

app.get('/collections/:collectionName/geonear', function(req, res, next) {
      console.log("lng: "+req.query.lng+"lat: "+req.query.lat+"distance: "+req.query.distance);
      req.collection.aggregate([
      {
            "$geoNear": {
                "near": {
                     "type": "Point",
                     "coordinates": [req.query.lng, req.query.lat]
                 },
                 "distanceField": "distance"
                 //"maxDistance": req.query.distance,
             }
        },
        {
             "$sort": {"distance": -1} // Sort the nearest first
        }
    ],
    function(err, docs) {
         res.send(docs);
    });
});


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
