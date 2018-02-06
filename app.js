var express = require('express')
var app = express()
var twilio = require('twilio')
var bodyParser = require('body-parser')
var botRouter = require('./routers/bot-router')
var slackBot = require('./lib/slack-bot')

// Start dotenv
require('dotenv').config()

var mongoose = require('mongoose');
var config = require('./config');

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended: false}));
app;

app
  .get('/', function(req, res){
    res.send('200 OK.');
  })
  .use(botRouter)

slackBot.start();

app.listen(app.get('port'), function () {
  console.log('Example app listening on port' + app.get('port') + '!')
})

mongoose.connect(config.dbConnection);
mongoose.Promise = require('bluebird');


// HELP: TwilioSIGNALAlerts: Help at support@twilio.com or 888-849-6231. Msg&data rates may apply. 2 msgs/week. Reply STOP to cancel.
// STOP: You are unsubscribed from TwilioSIGNALAlerts. No more messages will be sent. Help at support@twilio.com or 888-849-6231
