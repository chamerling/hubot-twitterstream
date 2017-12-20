# hubot-twitterstream

A [Hubot](http://hubot.github.com) script using the Twitter streaming API to track tweets from keywords/users and will publish them in realtime in the room subscription has been created.

## Install

- Install via npm

```
npm install hubot-twitterstream --save
```
- Add the following code in your external-scripts.json file.

```
["hubot-twitterstream"]
```

- Create an application on https://dev.twitter.com
- Set the following environment variables before running hubot

```
export HUBOT_TWITTERSTREAM_CONSUMER_KEY=XXXXXXXXXXXXXXX
export HUBOT_TWITTERSTREAM_CONSUMER_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export HUBOT_TWITTERSTREAM_ACCESS_TOKEN_KEY=XXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export HUBOT_TWITTERSTREAM_ACCESS_TOKEN_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- Run hubot

```
bin/hubot
```

## Usage

Assuming you're using this script wity hubot-auth, so first you need to assign proper role to your username to access twitterbot commands

	<your_bot_name> <your_user_name> has twitterbot role

Subscribe to keywords (launch command multiple times for multiple keywords):

    <your_bot_name> twitterstream track github

Unsubscribe to keywords:

    <your_bot_name> twitterstream untrack github

Subscribe to someone tweets:

    <your_bot_name> twitterstream follow nodejs
    // will listen to tweets from @nodejs

Unsubscribe from someone tweets:

    <your_bot_name> twitterstream unfollow nodejs

List subscriptions in current room:

    <your_bot_name> twitterstream list

Clear subscriptions in current room:

    <your_bot_name> twitterstream clear

Note: The subscriptions are persisted in hubot brain so they will be restored on restart.

# Donate

I'm working on this script to keep it update and functional as much as I can,
<br/>
So feel free to buy me a cup of coffee :)

ETH: 0x69756376573a4edcae8c25fc6571dafa5c791838
