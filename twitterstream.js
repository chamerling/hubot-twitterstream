// Description:
//  Subscribe to tweets matching keywords
//
// Commands:
//   hubot twitterstream track <keyword>   - Start watching a keyword
//   hubot twitterstream untrack <keyword> - Stop  watching a keyword
//   hubot twitterstream list          - Get the watched keywords list in current room
//   hubot twitterstream clear         - Stop watching all keywords in current room
//
// Configuration:
//
// The following environment variables are required. You will need to create an application at https://dev.twitter.com
//
// HUBOT_TWITTERSTREAM_CONSUMER_KEY
// HUBOT_TWITTERSTREAM_CONSUMER_SECRET
// HUBOT_TWITTERSTREAM_ACCESS_TOKEN_KEY
// HUBOT_TWITTERSTREAM_ACCESS_TOKEN_SECRET
//
// HUBOT_TWITTERSTREAM_CLEAN_SUBSCRIPTIONS: Clear all subscriptions at boot time.
//
// Examples:
//   hubot twitterstream watch github
//
// Author:
//   Christophe Hamerling

var BRAIN_TWITTER_STREAMS = 'twitterstreams';
var Twit = require('twit');
var _ = require('lodash');

var auth = {
  consumer_key: process.env.HUBOT_TWITTERSTREAM_CONSUMER_KEY,
  consumer_secret: process.env.HUBOT_TWITTERSTREAM_CONSUMER_SECRET,
  access_token: process.env.HUBOT_TWITTERSTREAM_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.HUBOT_TWITTERSTREAM_ACCESS_TOKEN_SECRET
}

var loaded = false;
var streams = [];
var twit = new Twit(auth);

module.exports = function(robot) {

  robot.respond(/twitterstream clear/i, clear);
  robot.respond(/twitterstream list/i, list);
  robot.respond(/twitterstream untrack (.*)$/i, untrack);
  robot.respond(/twitterstream track (.*)$/i, track);

  robot.brain.on('loaded', function(data) {
    if (loaded) {
      // this loaded event is sent on each robot.brain.set, skip it
      return;
    }
    loaded = true;

    if (process.env.HUBOT_TWITTERSTREAM_CLEAN_SUBSCRIPTIONS) {
      robot.brain.data[BRAIN_TWITTER_STREAMS] = [];
      return;
    }

    restoreSubscriptions();
  });

  function clear(msg) {

    function match(subscription) {
      return subscription.room === msg.message.room;
    }

    var toRemove = _.remove(streams, match);

    if (!toRemove.length) {
      return msg.send('No subscription in this room');
    }

    toRemove.forEach(function(subscription) {
      subscription.stream.stop();
    });

    _.remove(robot.brain.data[BRAIN_TWITTER_STREAMS], match);

    msg.send('Unsubscribed from all');
  }

  function createTrackStream(word, room) {
    var stream = twit.stream('statuses/filter', {track: word});

    stream.on('tweet', function(tweet) {
      robot.messageRoom(room, '@' + tweet.user.screen_name + " (" + tweet.user.name + ") - " + tweet.text + '\n');
    });

    robot.messageRoom(room, 'I started to watch tweets "' + word + '"');

    saveTrackStream(word, room, stream);
  }

  function list(msg) {
    msg.send('I am listening to tweets:');

    var currentRoomTags = streams.filter(function(subscription) {
      return subscription.room === msg.message.room;
    }).map(function(subscription) {
      if (subscription.room === msg.message.room) {
        return '- ' + subscription.tag;
      }
    });

    if (currentRoomTags.length) {
      return msg.send(currentRoomTags.join('\n'));
    }

    msg.send('No subscriptions. Hint: Type \'twitterstream track XXX\' to listen to XXX related tweets in current room');
  }

  function restoreSubscriptions() {
    var subscriptions = robot.brain.data[BRAIN_TWITTER_STREAMS];

    if (!subscriptions || !subscriptions.length) {
      return robot.brain.data[BRAIN_TWITTER_STREAMS] = [];
    }

    subscriptions.forEach(restoreTrackSubscription);
  }

  function restoreTrackSubscription(subscription) {
    if (!subscription || !subscription.tag || !subscription.room) {
      return robot.logger.error('Can not restore subscription', subscription);
    }

    createTrackStream(subscription.tag, subscription.room);
  }

  function saveTrackStream(word, room, stream) {
    streams.push({stream: stream, tag: word, room: room, type: 'track'});
    var found = _.find(robot.brain.data[BRAIN_TWITTER_STREAMS], function(subscription) {
      return subscription.tag === word && subscription.room === room && subscription.type === 'track';
    });

    if (!found) {
      robot.brain.data[BRAIN_TWITTER_STREAMS].push({tag: word, room: room, type: 'track'});
    }
  }

  function untrack(msg) {
    var word = msg.match[1];
    var room = msg.message.room;

    function match(subscription) {
      return subscription.room === msg.message.room && subscription.tag === word && subscription.type === 'track';
    }

    var toRemove = _.remove(streams, match);
    if (!toRemove.length) {
      return msg.send('I do not listen to tweets with word "' + word + '"');
    }

    toRemove.forEach(function(subscription) {
      subscription.stream.stop();
    });

    _.remove(robot.brain.data[BRAIN_TWITTER_STREAMS], match);

    msg.send('I stopped to watch "' + word + '"');
  }

  function track(msg) {
    createTrackStream(msg.match[1], msg.message.room);
  }
};
