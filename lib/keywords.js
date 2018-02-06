var _ = require('underscore');
var s = require('underscore.string');
var keys = require('../keys.json');
var User = require('../models/user');

function generic(req, res) {
  var body = req.body.Body.toLowerCase(),
    rawBody = req.body.Body,
    msg = keys[s.slugify(body)],
    userPhone = req.body.From;

  // If not for hackpack or wit let's send to slack.
  var query = {phone: userPhone},
    update = { expire: new Date()},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(query, update, options)
    .then(function (user) {
      // Let's add this message to the user, so that we can later lookup message owner
      user.sendMessage(`${msg}`);
      res.status(200).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send('Could not find a user with this phone number.');
    });
}

exports.generic = generic;