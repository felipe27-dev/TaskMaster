const express = require('express');
const router = express.Router();
const ViewController = require('../controllers/ViewController');

router.get('/', ViewController.getIndex);

module.exports = router;
