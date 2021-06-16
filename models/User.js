const crypto = require('crypto');
const bcrypt = require('bcryptjs');

var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
});

const makeUser = async (email, name, password, res) => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  const hash = crypto.createHash('sha256', email).digest('hex');

  const salt = await bcrypt.genSalt(10);
  const encryptPassword = await bcrypt.hash(password, salt);

  var params = {
    TableName: `${process.env.USER_TABLE}`,
    Item: {
      email: email,
      id: hash,
      password: encryptPassword,
      name: name,
    },
    ConditionExpression:
      'attribute_not_exists(email) AND attribute_not_exists(id)',
  };

  docClient.put(params, function (err, data) {
    if (err) {
      res
        .status(400)
        .json({ errors: [{ msg: 'Account with that email already exists' }] });
    } else {
      res.send('Successfully created account');
    }
  });
};

module.exports = makeUser;
