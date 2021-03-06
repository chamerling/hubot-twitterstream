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

Subscribe to keywords (launch command multiple times for multiple keywords):

    hubot twitterstream track github

Unsubscribe to keywords:

    hubot twitterstream untrack github

Subscribe to someone tweets:

    hubot twitterstream follow nodejs
    // will listen to tweets from @nodejs

Unsubscribe from someone tweets:

    hubot twitterstream unfollow nodejs

List subscriptions in current room:

    hubot twitterstream list

Clear subscriptions in current room:

    hubot twitterstream clear

Note: The subscriptions are persisted in hubot brain so they will be restored on restart.

## License

(The MIT License)

Copyright (c) 2013-2016 Christophe Hamerling <christophe.hamerling@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
