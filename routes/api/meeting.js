const express = require('express');
const router = express.Router();
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

router.get('/', (req, res, next) => {
  try {
    const twilioAccountSid = process.env.ACCOUNT_SID;
    const twilioApiKey = process.env.API_KEY;
    const twilioApiSecret = process.env.API_SECRET;
    const identity = req.identity;

    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );

    const videoGrant = new VideoGrant();
    token.addGrant(videoGrant);

    res.json({ token });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
