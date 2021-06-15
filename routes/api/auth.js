const express = require('express');
const router = express.Router();

// @route   GET api/auth
// @desc    Login
// @access  Public
router.get('/', (req, res) => res.send('Auth route'));

// @route   POST api/auth
// @desc    Register user
// @access  Public
router.post('/', (req, res) => {
  console.log(req.body);
  res.send('Posted');
});

module.exports = router;
