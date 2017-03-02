var fs = require('fs');
var coords = require('./coords.json');
for (var i = 0; i < coords.length; i++) {
    var coord = coords[i];
    var mycoords = {
        "location": {
            "type": "Point",
            "coordinates": [
                coord.Latitude,
                coord.Longitude
            ]
        },
        "deals": [{
            "title": coord.Title,
            "discount": coord.Discount,
        }],
    };
    fs.appendFile('mycoords.json', JSON.stringify(mycoords, null, 4), function(err) {
        if (err) {
            throw err;
        }
        console.log(mycoords);
    });
    console.log(mycoords);
}
