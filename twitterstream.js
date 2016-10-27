// Description:
//  Watch Twitter streams
//
// Commands:
//   hubot twitterstream watch <tag>   - Start watching a tag
//   hubot twitterstream unwatch <tag> - Stop  watching a tag
//   hubot twitterstream list          - Get the watched tags list in current room
//   hubot twitterstream clear         - Stop watching all in current room
//
// Configuration:
//
// The following environment variables are required. You will need to create an application at https://dev.twitter.com
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

var BRAIN_TAGS = 'twitterstreamtags';
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
  robot.respond(/twitterstream unwatch (.*)$/i, unwatch);
  robot.respond(/twitterstream watch (.*)$/i, watch);

  robot.brain.on('loaded', function(data) {
    if (loaded) {
      // this loaded event is sent on each robot.brain.set, skip it
      return;
    }
    loaded = true;

    if (process.env.HUBOT_TWITTERSTREAM_CLEAN_SUBSCRIPTIONS) {
      robot.brain.data[BRAIN_TAGS] = [];
      return;
    }

    restoreSubscriptions();
  });


  function clear(msg) {
    var tag = msg.match[1];

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

    _.remove(robot.brain.data[BRAIN_TAGS], match);

    msg.send('Unsubscribed from all');
  }

  function createStreamForTag(tag, room) {
    var stream = twit.stream('statuses/filter', {track: tag});

    stream.on('tweet', function(tweet) {
      robot.messageRoom(room, '@' + tweet.user.screen_name + " (" + tweet.user.name + ") - " + tweet.text + '\n');
    });

    robot.messageRoom(room, 'I started to watch tweets #' + tag);

    saveTagStream(tag, room, stream);
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

    msg.send('No subscriptions. Hint: Type \'twitterstream watch XXX\' to listen to XXX related tweets in current room');
  }

  function restoreSubscriptions() {
    var tags = robot.brain.data[BRAIN_TAGS];

    if (!tags || !tags.length) {
      return robot.brain.data[BRAIN_TAGS] = [];
    }

    tags.forEach(restoreTagSubscription);
  }

  function restoreTagSubscription(subscription) {
    if (!subscription || !subscription.tag || !subscription.room) {
      return robot.logger.error('Can not restore subscription', subscription);
    }

    createStreamForTag(subscription.tag, subscription.room);
  }

  function saveTagStream(tag, room, stream) {
    streams.push({stream: stream, tag: tag, room: room});
    var found = _.find(robot.brain.data[BRAIN_TAGS], function(subscription) {
      return subscription.tag === tag && subscription.room === room;
    });

    if (!found) {
      robot.brain.data[BRAIN_TAGS].push({tag: tag, room: room});
    }
  }

  function unwatch(msg) {
    var tag = msg.match[1];
    var room = msg.message.room;

    function match(subscription) {
      return subscription.room === msg.message.room && subscription.tag === tag;
    }

    var toRemove = _.remove(streams, match);
    if (!toRemove.length) {
      return msg.send('I do not listen to tweets with tag #' + tag);
    }

    toRemove.forEach(function(subscription) {
      subscription.stream.stop();
    });

    _.remove(robot.brain.data[BRAIN_TAGS], match);

    msg.send('I stopped to watch #' + tag);
  }

  function watch(msg) {
    createStreamForTag(msg.match[1], msg.message.room);
  }
};
