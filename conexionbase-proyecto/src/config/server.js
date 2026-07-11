const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');



const app = express();

const { WebhookClient } = require('dialogflow-fulfillment');

app.use(express.json());
app.use('img', express.static(path.join(__dirname, 'img')));
app.use(cors());
app.use(bodyParser.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(function(err, req, res, next) { 
  res.status(err.status || 500);
  res.json({ 'error': {
    message: err.message,
    error: {}
  }});
});

module.exports = app;