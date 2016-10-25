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
// HUBOT_TWITTERSTREAM_CONSUMER_KEY
// HUBOT_TWITTERSTREAM_CONSUMER_SECRET
// HUBOT_TWITTERSTREAM_ACCESS_TOKEN_KEY
// HUBOT_TWITTERSTREAM_ACCESS_TOKEN_SECRET
//
// Examples:
//   hubot twitterstream watch github
//
// Author:
//   Christophe Hamerling

var Twit = require('twit');

var auth = {
  consumer_key: process.env.HUBOT_TWITTERSTREAM_CONSUMER_KEY,
  consumer_secret: process.env.HUBOT_TWITTERSTREAM_CONSUMER_SECRET,
  access_token: process.env.HUBOT_TWITTERSTREAM_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.HUBOT_TWITTERSTREAM_ACCESS_TOKEN_SECRET
}

var streams = {};
var twit = new Twit(auth);

module.exports = function(robot) {

  robot.respond(/twitterstream clear/i, clear);
  robot.respond(/twitterstream list/i, list);
  robot.respond(/twitterstream unwatch (.*)$/i, unwatch);
  robot.respond(/twitterstream watch (.*)$/i, watch);

  function clear(msg) {
    for (var key in streams) {
      if (streams.hasOwnProperty(key)) {
        var stream = streams[key];
        if (stream) {
          stream.stop();
        }
      }
    }
  }

  function list(msg) {
    msg.send('I am listening to tweets:');
    for (var key in streams) {
      if (streams.hasOwnProperty(key)) {
        msg.send('- ' + key);
      }
    }
    msg.send('Hint: Type \'twitterstream watch XXX\' to listen to XXX tweets');
  }

  function unwatch(msg) {
    var tag = msg.match[1]
    var stream = streams[tag];
    if (!stream) {
      return msg.send('I do not listen to tweets with tag #' + tag);
    }

    stream.stop();
    delete streams[tag];
    msg.send('I stopped to watch #' + tag);
  }

  function watch(msg) {
    var tag = msg.match[1];

    var stream = twit.stream('statuses/filter', {track: tag});
    streams[tag] = stream;

    stream.on('tweet', function(tweet) {
      msg.send('@' + tweet.user.screen_name + " (" + tweet.user.name + ") - " + tweet.text + '\n');
    });

    msg.send('I started to watch #' + tag);
  }
};
