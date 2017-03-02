var mycoords = require('./mycoords.json');
var request = require('request');

var makeRequest = function(thej) {
    console.log(thej);
    var options = {
      uri: 'http://localhost:4141/api/v1/pins',
      method: 'POST',
      json: thej
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body);
      }
    });
};

for (var i = 0; i < mycoords.length; i++) {
     makeRequest(mycoords[i]);
}
