require('dotenv').config()

const debug = require('debug')('fb:index')
debug.log = console.info.bind(console) // rebind to console.info for firebase functions

const path = require('path')
const express = require('express')
const functions = require('firebase-functions')
const pug = require('pug')

const getTemplate = name => path.join(__dirname, 'views', name + '.pug')
const eventualData = (input) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(input), Math.floor(Math.random() * 4000))
  }).then(data => {
    debug(data)
    return data
  })
}
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

app.get('/rp', function (req, res, next) {
  debug('🤖')
  res.set('Content-Type', 'text/html; charset=utf-8')
  const write = chunk => {
    return new Promise((resolve, reject) => {
      res.write(chunk, 'utf-8', err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  // const pugPromise = (template, data) => {
  //   return new Promise((resolve, reject) => {
  //     res.render(template, data, (err, html) => {
  //       if (err) return reject(err)
  //       resolve(html)
  //     })
  //   })
  // }

  const data = [
    [getTemplate('header'), Promise.resolve({})],
    [getTemplate('middle'), eventualData({ text: 'DATA_TWO' })],
    [getTemplate('middle'), eventualData({ text: 'DATA_THREE' })],
    [getTemplate('middle'), eventualData({ text: 'DATA_4' })],
    [getTemplate('middle'), eventualData({ text: 'DATA_5' })],
    [getTemplate('footer'), Promise.resolve({})]
  ]

  data.reduce((previous, [template, dataPromise]) => {
    return previous.then(result => {
      if (result !== '__RENDER_START__') {
        write(result)
      }
      return dataPromise.then(data => {
        return pug.renderFile(template, data)
      })
    })
  }, Promise.resolve('__RENDER_START__'))
    .then(write).then(() => {
      debug('got to res.end')
      res.status(200)
      res.end()
    }).catch(next)
})

// app.get('/', function (req, res, next) {
//   res.render('header', (err, string) => {
//     if (err) next(err)
//     res.write(string)
//     // Add dynamic content
//     res.write('<a href="/pants">click here to go to pants</a>')
//     res.render('footer', (err, html) => {
//       if (err) next(err)
//       res.end(html)
//     })
//   })
// })

// Not found handler
app.use(function (req, res, next) {
  res.sendStatus(404)
})

// Error handler
app.use(function (err, req, res, next) {
  debug('global error handler')
  debug(err)
  if (!res.headersSent) {
    res.status(500)
    if (app.get('env') === 'development') {
      res.type('text/plain')
      return res.send(err.stack)
    }
  }
  res.end()
})

exports.testserver = functions.https.onRequest(app)
