'use strict';

var request = require('request');
var twilio = require('twilio');
var _ = require('underscore');
var s = require('underscore.string');
var config = require('../config');
var User = require('../models/user');
var fs = require('fs');
var admins = require('../admins.json').admins;
var request = require('request');

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var bot_token = config.botToken;

var rtm = new RtmClient(bot_token);

var channel = config.slackChannel;
var connected = false;

var job = {};

var slackBot = function() {}

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  connected = true;
  console.log('connected to rtn websocket.');
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log(message);
  var isAdmin = _.contains(admins, message.user);
  console.log(`Administrator: ${isAdmin}`);
  if (message.thread_ts) {
    if (s.include(message.text, '*note')) {
      console.log('do nothing');
    } else {
      sendMessageToThread(message).then((message) => {
        console.log('Message Sent to user.');
      });
    }
    return;
  }

  if (message.subtype == 'message_changed' || message.subtype == 'message_replied') {
    console.log("Nothing to see here!");
  } else if (~message.text.indexOf('<@U5CDHP0CR>') && isAdmin) {
    processCommands(message);
  }
});

function processCommands(message) {
  if (s.include(message.text, 'broadcast')) {
    broadcastAll(message);
  } else if (s.include(message.text, 'abort')) {
    clearBroadcast();
  } 
}

function cleanMessage (message) {
  var phone = s.strLeft(message, ":");
  var body = s.strRight(message, ": ");
  return {
    phone: phone,
    body: body
  }
}

function alertAttendees(body) {
  User.find({})
    .then(function(users) {
      for (var i = users.length - 1; i >= 0; i--) {
        console.log(`Contacting: ${users[i].phone}.`);
        users[i].sendDelayedMessage(body);
      }
      rtm.sendMessage('Broadcast sent.', channel);
    })
    .catch(function(err) {
      console.log(err);
    });
}

function clearBroadcast() {
  console.log('aborting');
  rtm.sendMessage('Broadcast aborted.', channel);
  clearTimeout(job);
}

function broadcastAll (message) {
  var body = s.strRight(message.text, "broadcast: ");
  rtm.send({
    "type": "message",
    "channel": channel,
    "text": `Will broadcast '${body}' to all SIGNAL attendees in 30 seconds. To cancel type: 'abort'.`
  })
  job = setTimeout(function() {
    alertAttendees(body);
  }, 30000);
  console.log(`Broadcasting: ${body}`);
}

function sendMessageToThread (message) {
  console.log('Sending message to thread now!:', message.text)
  return new Promise(function (resolve, reject) {
    var thread = message.thread_ts;

    User.findOne({threadId: thread})
      .then(function(user) {
        user.sendMessage(message.text);
        console.log(message.text);
      })
      .catch(function (err) {
        console.log(err);
      });
  })
}


slackBot.prototype.incoming = function (message, user) {
  console.log('/incoming invoked with:', message);
  var msg = {
    "type": "message",
    "channel": channel
  };
  return new Promise(function (resolve, reject) {
    if (user.threadId) {
      console.log('User is in a thread already');
      msg.thread_ts = user.threadId;
      if (user.name) {
        msg.text = `${user.name}: ${message}`;
      } else {
        msg.text = message;
      }
      rtm.send(msg);
    } else {
      msg.text = `${user.phone}: ${message}`;
      rtm.send(msg)
        .then(function(response) {
          user.threadId = response.ts;
          user.save();
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  })
}



slackBot.prototype.start = function() {
  rtm.start();
}

module.exports = new slackBot();