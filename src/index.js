require('dotenv').config()
const debug = require('debug')('starter:index')
const path = require('path')
const express = require('express')
const functions = require('firebase-functions')

var app = express()
app.set('env', process.env.NODE_ENV)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// AWS status endpoint
app.get('/status', function (req, res, next) {
  res.send('ok')
})

// Static server
app.use(express.static(path.join(__dirname, 'public')))

// Render index.pug
app.get('/', function (req, res, next) {
  res.render('index')
})

// Not found handler
app.use(function (req, res, next) {
  res.sendStatus(404)
})

// Error handler
app.use(function (err, req, res, next) {
  debug(err)
  res.status(500)
  if (app.get('env') === 'development') {
    res.type('text/plain')
    return res.send(err.stack)
  }
  res.end()
})

exports.testserver = functions.https.onRequest(app)
