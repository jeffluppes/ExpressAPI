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
      'coordinates': { $push: '$geometry.coordinates'}
    }
  },
  {$project:
    {
      "id": 1,
      "type": 1,
      "geometry": {
          "type": "$gtype",
          "coordinates": "$coordinates"
      }
    }
  }
])
