const express = require('express');
const router = express.Router();
const {
  predictYield,
  diagnoseDisease,
  getAgriWeather,
} = require('../controllers/aiController');

router.post('/predict-yield', predictYield);
router.post('/diagnose-disease', diagnoseDisease);
router.get('/weather', getAgriWeather);

module.exports = router;
