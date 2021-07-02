const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const { S3 } = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
});

const isNotEmpty = string => {
  if (string === '') {
    return false;
  }
  return true;
};

const generateUploadURL = async () => {
  const id = uuidv4();

  var s3 = new AWS.S3();
  const imageName = id;

  const params = {
    Bucket: process.env.S3_Bucket,
    Key: imageName,
    Expires: 60,
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return { id: id, url: uploadURL };
};

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
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, picture, id } = req.body;

    try {
      var docClient = new AWS.DynamoDB.DocumentClient();
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

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
              meeting_id: meetingId,
              email: email,
              name: name,
              password: encryptedPassword,
              picture: picture,
            },
            ConditionExpression: 'attribute_not_exists(id)',
          };

          await docClient.put(params).promise();
          const payload = {
            user: {
              id: id,
              meeting_id: meetingId,
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
  }
);

router.post('/s3url', async (req, res) => {
  const data = await generateUploadURL();

  res.json(data);
});

module.exports = router;
