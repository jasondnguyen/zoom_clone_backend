const express = require('express');
const router = express.Router();
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

router.post('/', (req, res, next) => {
  try {
    console.log(req.body);
    const twilioAccountSid = process.env.ACCOUNT_SID;
    const twilioApiKey = process.env.API_KEY;
    const twilioApiSecret = process.env.API_SECRET;
    const identity = req.body.identity;

    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );

    const videoGrant = new VideoGrant();
    token.addGrant(videoGrant);

    res.send({
      token: token.toJwt(),
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
