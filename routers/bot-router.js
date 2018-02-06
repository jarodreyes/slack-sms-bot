var _ = require('underscore');
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var User = require('../models/user');
var s = require('underscore.string');
var slackBot = require('../lib/slack-bot');
var util = require('util');

var botRouter = express.Router();

botRouter.post('/outgoing', function (req,res,next) {
  var body = req.body.Body.toLowerCase(),
    rawBody = req.body.Body,
    numMedia = req.body.NumMedia,
    userPhone = req.body.From,
    message = '',
    media = '';
  res.type('text/xml');
  console.log("STATUS CALLBACK URL FROM TWILIO MESSAGING SERVICE ----------------------------->")
  console.log(util.inspect(req.headers, {showHidden: false, depth: null}));
  console.log(util.inspect(req.body, {showHidden: false, depth: null}));
});

botRouter.post('/incoming', function (req,res,next) {
  var body = req.body.Body.toLowerCase(),
    rawBody = req.body.Body,
    fromCountry = req.body.FromCountry,
    numMedia = req.body.NumMedia,
    userPhone = req.body.From,
    message = '',
    media = '';
  
  // Set Headers
  res.type('text/xml');

  // Pipe body to slack
  var query = {phone: userPhone},
    update = { expire: new Date()},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(query, update, options)
    .then(function (user) {

      // Save country to new user
      if (user.messages.length == 0 && fromCountry) {
        user.country = fromCountry;
        user.save();
      } else if (user.messages.length == 0) {
        user.country = 'US';
        user.save();
      }

      // Let's add this message to the user, so that we can later lookup message owner
      user.messages.push({
        body: rawBody
      });

      user.save();

      // Let's send this message to slack
      slackBot.incoming(rawBody, user);

      // console.log(`saved user message: ${user.messages}. Sending to Slack now...`);
      res.status(200).send('User Message sent to slack');
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send('Could not find a user with this phone number.');
    });

});

module.exports = botRouter;
