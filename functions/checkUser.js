const crypto = require('crypto');
const bcrypt = require('bcryptjs');

var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
});

const checkUser = async (email, res) => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  const hash = crypto.createHash('sha256', email).digest('hex');

  var params = {
    TableName: `${process.env.USER_TABLE}`,
    Key: {
      email: email,
      id: hash,
    },
    ProjectionExpression: 'password',
  };

  await docClient
    .get(params)
    .promise()
    .then(data => res.send(data.Item))
    .catch(err => console.log('Error', err));
};

module.exports = checkUser;
