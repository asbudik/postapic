var OAuth = require("oauth"),
  twitterAPI = require('node-twitter-api'),
  fs = require('fs'),
  request = require('request'),
  stream = require('stream'),
  http = require('http');

var twitter = new twitterAPI({
    consumerKey: '79D40sYF18Sa1Itv4CaorUMx4',
    consumerSecret: 'xKQ0UaikVNUsAHJpSvSgOlkkooBVStuSjM23g6DLPiXabtNVKH',
    callback: 'http://127.0.0.1:3000'
  });
  
  // path where to save image
  // var photoPath = './photos/' + req.body.photoID;

// var readable = new stream.Readable({encoding: "base64"});
  var url = "http://pbs.twimg.com/profile_images/496174748674445312/nYCP89mX_400x400.png"
  var mediaThing = fs.createReadStream(url);
 // readable.end();
  // create write stream to write image to path
  // request.get(req.body.photo).pipe(fs.createWriteStream(photoPath));

// console.log(mediaThing.constructor)

  request(url, function(err, mediaFile) {
    // var taco = stream.read(mediaFile);
    twitter.statuses("update_with_media", {
      status: "#PostaPic26",
      media: [request(ur)]
      },
      '799205365-ggDczjzJM81LAbSXKONyeoqvMxx9treuxMVcT41r',
      'khQSCHr16bL0RAZaMubwUPkCd1YvTPm50qJCbIiAsA3jT',
      function(error, data, response) {
        if (error) {
          console.log("error", error)
        } else {
          console.log(data);
        }
        // dummyURL = 'https://api.twitter.com/1/statuses/oembed.json?id=133640144317198338'
        // embedURL = 'https://api.twitter.com/1/statuses/oembed.json?id=' + data.id;

        // oauth.get(embedURL, null, null, function(e, d, res) {
        //   console.log(embedURL)
        //   console.log(dummyURL)
        //   var tweets = JSON.parse(d)
        //   console.log(tweets)
        // })
      // } 
    // );
    
  });


