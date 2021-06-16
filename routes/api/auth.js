const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const makeUser = require('../../models/User');

// @route   GET api/auth
// @desc    Login
// @access  Public
router.get('/', (req, res) => res.send('Auth route'));

// @route   POST api/auth
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 1 or more characters'
    ).isLength({ min: 1 }),
  ],

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, name } = req.body;
    makeUser(email, password, name, res);
    //Add avatar to req body later
  }
);

module.exports = router;
