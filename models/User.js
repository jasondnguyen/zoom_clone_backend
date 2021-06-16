const crypto = require('crypto');
var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
});

const makeUser = (email, name, password, res) => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  const hash = crypto.createHash('sha256', email).digest('hex');

  var params = {
    TableName: 'zoom_users',
    Item: {
      email: email,
      id: hash,
      password: password,
      name: name,
    },
    ConditionExpression:
      'attribute_not_exists(email) AND attribute_not_exists(id)',
  };

  docClient.put(params, function (err, data) {
    if (err) {
      res.status(400).json({ errors: [{ msg: 'Unable to add item' }] });
    } else {
      res.send('Added item');
    }
  });
};

module.exports = makeUser;
