'use strict';

var config = {};

config.dbConnection = process.env.MONGOLAB_URI || process.env.MONGO_STAGE_URL || process.env.MONGO_PORT_27017_TCP_ADDR;
// config.dbConnection = process.env.MONGOLAB_URI || process.env.MONGO_SHORTCODE_URL || process.env.MONGO_PORT_27017_TCP_ADDR;

// STAGE
// config.authToken = process.env.TWILIO_AUTH_TOKEN;
// config.accountSid = process.env.TWILIO_ACCOUNT_SID;
// config.twilioNumber = process.env.TWILIO_STAGE_NUMBER;
// config.twilioUKNumber = process.env.TWILIO_UK_NUMBER;

// Slack Config
config.botToken = process.env.CONFERENCE_BOT_TOKEN || '';
config.slackChannel = process.env.SLACK_CHANNEL || '';

// PROD
config.twilioNumber = process.env.TWILIO_NUMBER || '+445555554911';
config.authToken = process.env.SIGNAL_SHORTCODE_AUTH_TOKEN;
config.accountSid = process.env.SIGNAL_SHORTCODE_SID;
config.twilioUKNumber = process.env.TWILIO_UK_NUMBER;
config.shortCodeSid = process.env.SIGNAL_UK_SID;
config.shortCodeToken = process.env.SIGNAL_UK_AUTH_TOKEN;
config.shortcodeServiceSid = process.env.SIGNAL_UK_SERVICE_SID;

module.exports = config;
