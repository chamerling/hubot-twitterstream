// Description:
//  Watch Twitter streams
//
// Commands:
//   hubot twitterstream watch <tag>   - Start watching a tag
//   hubot twitterstream unwatch <tag> - Stop  watching a tag
//   hubot twitterstream list          - Get the watched tags list
//   hubot twitterstream clear         - Kill them all!
//
// Configuration:
//
// The following environment variables are required. You will need to create an application at https://dev.twitter.com
// TWITTER_CONSUMER_KEY
// TWITTER_CONSUMER_SECRET
// TWITTER_ACCESS_TOKEN_KEY
// TWITTER_ACCESS_TOKEN_SECRET
//
// Examples:
//   hubot twitterstream watch github
//
// Author:
//   Christophe Hamerling

var Twit = require('twit');

var auth = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

var streams = {};
var twit = new Twit(auth);

module.exports = function(robot) {

  robot.respond(/twitterstream watch (.*)$/i, function(msg) {
    var tag = msg.match[1];

    var stream = T.stream('statuses/filter', {track: tag});
    streams[tag] = stream;

    stream.on('tweet', function(tweet) {
      msg.send('@' + tweet.user.screen_name + " (" + tweet.user.name + ") - " + tweet.text + '\n');
    });

    stream.on('destroy', function(data) {
      msg.send('I do not watch #' + tag + ' anymore...')
    });

    msg.send('I started to watch #' + tag);
  });

  robot.respond(/twitterstream unwatch (.*)$/i, function(msg) {
    var tag = msg.match[1]
    var stream = streams[tag];
    if (!stream) {
      return msg.send('I do not listen to tweets with tag #' + tag);
    }

    stream.destroy();
    delete streams[tag];
    msg.send('I stopped to watch #' + tag);
  });

  robot.respond(/twitterstream list/i, function(msg) {

    msg.send('I listen to tweets:');
    for (var key in streams) {
      if (streams.hasOwnProperty(key)) {
        msg.send('- ' + key);
      }
    }
    msg.send('Hint: Type \'twitterstream watch XXX\' to listen to XXX tweets');
  });

  robot.respond(/twitterstream clear/i, function(msg) {
    for (var key in streams) {
      if (streams.hasOwnProperty(key)) {
        var stream = streams[key];
        if (stream) {
          stream.destroy();
        }
      }
    }
  });
};
