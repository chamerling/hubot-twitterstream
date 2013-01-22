// Description:
//  Watch Twitter streams
//
// Commands:
//   hubot twitterstream watch <tag>   - Start watching a tag
//   hubot twitterstream list          - Get the watched tags list
//   hubot twitterstream clear         - Kill them all!
//
// Examples:
//   hubot twitterstream watch github
//
// Author:
//   Christophe Hamerling

var twitter = require('ntwitter')
  , _ = require('underscore');

var auth = {
  "consumer_key" : "kc4lSJpjA35e6Bz8nTtusQ",
  "consumer_secret" : "wf47JJZtHJowxVkuSPzLyy7UcthXqcKUhQxBRhTwX0",
  "access_token_key" : "13024132-yn0bVZiAaW0OrOcTFHL1950ZgXEgh0VJSi1jiH7Ws",
  "access_token_secret" : "o330Uu3oEKhWu3lm1n5O65JlCFOKQZ1TVWPWKpprGQ"
}

var twit = new twitter(auth);
twit.verifyCredentials(function (err, data) {
  if (err) {
    throw new Error(err);
  }
})

var streams = []

module.exports = function(robot) {
  
  robot.respond(/twitterstream watch (.*)$/i, function(msg) {
    var tag = msg.match[1]
    twit.stream('statuses/filter', {'track': tag}, function(stream) {
      streams.push({key : tag, fn : stream});
      
      stream.on('data', function (data) {
        msg.send('@' + data.user.screen_name + " (" + data.user.name + ") - " + data.text + '\n');
      });
      
      stream.on('destroy', function(data) {
        msg.send('I do not watch ' + tag + ' anymore...')
      })
    });
  });
    
  robot.respond(/twitterstream list/i, function(msg) {
    _.each(streams, function(s) {
      msg.send(s.key);
    });
  });
  
  robot.respond(/twitterstream clear/i, function(msg) {
    _.each(streams, function(s) {
      s.fn.destroy();
    });
    // TODO : Clear list once we are sure that all is destroyed (async...)
    // streams = [];
  });
}
