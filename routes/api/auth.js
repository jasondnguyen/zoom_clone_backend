const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
});

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
      TableName: `${process.env.USER_TABLE}`,
      Key: {
        id: req.user.id,
      },
      ProjectionExpression: 'id, #n, meeting_id',
      ExpressionAttributeNames: { '#n': 'name' },
    };

    const user = await docClient.get(params).promise();
    res.send(user.Item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate User & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      var docClient = new AWS.DynamoDB.DocumentClient();

      var emailParam = {
        TableName: `${process.env.EMAIL_TABLE}`,
        Key: {
          email: email,
        },
      };

      const id = await docClient.get(emailParam).promise();

      if (!Object.keys(id).length) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Credentials' }],
        });
      }

      var params = {
        TableName: `${process.env.USER_TABLE}`,
        Key: {
          id: id.Item.id,
        },
      };

      const user = await docClient.get(params).promise();

      const isMatch = await bcrypt.compare(password, user.Item.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.Item.id,
        },
      };

      const secret = `${process.env.JWT_SECRET}`;

      jwt.sign(payload, secret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
