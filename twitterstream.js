// Description:
//  Watch Twitter streams
//
// Commands:
//   hubot twitterstream watch <tag>   - Start watching a tag
//   hubot twitterstream unwatch <tag> - Stop  watching a tag
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
  "consumer_key" : "",
  "consumer_secret" : "",
  "access_token_key" : "",
  "access_token_secret" : ""
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
    msg.send('I start watching ' + tag);
  });

  robot.respond(/twitterstream unwatch (.*)$/i, function(msg) {
    var tag = msg.match[1]
    var stream = _.find(streams, function(s) {
      return (s.key == tag);
    });
    if (stream != undefined) {
      stream.fn.destroy();
      streams = _.without(streams, _findWhere(streams, stream));
      msg.send('I stopped watching ' + tag);
    } else {
      msg.send('I do not known such tag.');
    }
  });

  robot.respond(/twitterstream list/i, function(msg) {
    if (streams.length > 0) {
      _.each(streams, function(s) {
        msg.send(s.key);
      });
    } else {
      msg.send('I have no tags.');
    }
  });

  robot.respond(/twitterstream clear/i, function(msg) {
    if (streams.length > 0) {
      _.each(streams, function(s) {
        s.fn.destroy();
        streams = _.without(streams, _.findWhere(streams, s));
      });
    } else {
      msg.send('I have no tags.');
    }
  });
}
