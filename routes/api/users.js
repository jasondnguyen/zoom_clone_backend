const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
});

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      var docClient = new AWS.DynamoDB.DocumentClient();
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const id = uuidv4();

      var emailParams = {
        TableName: `${process.env.EMAIL_TABLE}`,
        Item: {
          email: email,
          id: id,
        },
        ConditionExpression: 'attribute_not_exists(email)',
      };

      docClient.put(emailParams, async function (err, data) {
        if (err) {
          return res.status(400).json({
            errors: [{ msg: 'Account with that email already exists' }],
          });
        } else {
          const meetingId = Math.floor(Math.random() * 1000000000);

          var params = {
            TableName: `${process.env.USER_TABLE}`,
            Item: {
              id: id,
              email: email,
              name: name,
              password: encryptedPassword,
              meeting_id: meetingId,
            },
            ConditionExpression: 'attribute_not_exists(id)',
          };

          await docClient.put(params).promise();
          const payload = {
            user: {
              id: id,
            },
          };

          const secret = `${process.env.JWT_SECRET}`;

          jwt.sign(payload, secret, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
          });
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }

    //Add avatar to req body later
  }
);

module.exports = router;
