db.planes4mei.aggregate([
  { $match:
    {
      'properties.id': "3C66A6"
    }
  },
  {$group:
    { '_id': '$properties.id',
      'type': { $first: "$type" },
      "gtype": { $first: "$geometry.type" },
      'coordinates': { $push: '$geometry.coordinates'},
      'Altitude': {$push: '$properties.Altitude'},
      'Track': {$push: '$properties.Track'},
      'Speed': {$push: '$properties.Speed'},
      'Squawk': {$first: '$properties.Squawk'},
      'Time': {$push: '$properties.Time'},
      'FeatureTypeId': {$first: '$properties.FeatureTypeID'},
      'PlaneType': {$first: '$properties.planeType'},
      'Active': {$push: "$properties.Active"}
    }
  },
  {$project:
    {
      "_id": 1,
      "type": 1,
      "geometry": {
          "type": "$gtype",
          "coordinates": "$coordinates"
      },
      "properties": {
        "_id": "$_id",
        "FeatureTypeId": "$FeatureTypeId",
        "Altitude": "$Altitude",
        "Track": "$Track",
        "Speed": "$Speed",
        "Squawk": "$Squawk",
        "PlaneType": "$PlaneType",
        "Active": "$Active",
        "Time": "$Time"
      }
    }
  }
])
