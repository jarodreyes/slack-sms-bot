'use strict';

var mongoose = require('mongoose');
var config = require('../config');
var twilioShortcodeClient = require('twilio')(config.shortCodeSid, config.shortCodeToken);
var _ = require('underscore');
var util = require('util');

var Message = new mongoose.Schema({
  uid: String,
  thread: String, 
  body: String
});

var User = new mongoose.Schema({
  name: String,
  email: String,
  titoId: String,
  phone: String,
  zipcode: String,
  threadId: String,
  hackId: String,
  consent: {type: Boolean, default: true},
  country: String,
  lastMessage: { type: Date, default: Date.now },
  messages: [Message]
});

User.methods.sendDelayedMessage = function(msg, media) {
  var self = this;
  var delays = [100, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600, 3900, 4200, 4500, 4800];
  var options = {
    to: self.phone,
    messagingServiceSid: config.shortcodeServiceSid,
    body: msg
  }

  if (media) options.mediaUrl = media;

  setTimeout(function() {
    twilioShortcodeClient.sendMessage(options, function(err, response) {
      console.log(util.inspect(err, {showHidden: false, depth: null}));
    });
  }, _.sample(delays));
  
  console.log(`Twilio Message Sent: ${msg}`);
};

// Send a text message via twilio to this user
User.methods.sendMessage = function(msg, media) {
  var self = this;
  // If UK number send from UK number
  var options = {
    to: self.phone,
    messagingServiceSid: config.shortcodeServiceSid,
    body: msg
  }

  if (media) options.mediaUrl = media;
  twilioShortcodeClient.sendMessage(options, function(err, response) {
    console.log(util.inspect(err, {showHidden: false, depth: null}));
  });
  
  console.log(`Twilio Message Sent: ${msg}`);
};

module.exports = mongoose.model('User', User);