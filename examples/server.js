/*eslint-disable no-console, no-var */
var LocalStrategy = require('passport-local')
var WebpackConfig = require('./webpack.config')
var bodyParser = require('body-parser')
var express = require('express')
var passport = require('passport')
var rewrite = require('express-urlrewrite')
var session = require('express-session')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')

var app = express()

passport.use(new LocalStrategy(function (username, password, done) {
  if (username !== 'foo') return done(null, false, { message: 'User does not exist' })
  if (password !== 'bar') return done(null, false, { message: 'Password incorrect' })
  done(null, { username: username, roles: [ 'ROLE_USER' ] })
}))

passport.serializeUser(function (user, done) {
  done(null, user.username)
})

passport.deserializeUser(function (username, done) {
  done(null, { username: username, roles: [ 'ROLE_USER' ] })
})

app.use(webpackDevMiddleware(webpack(WebpackConfig), {
  publicPath: '/__build__/',
  stats: {
    colors: true,
  },
}))

var fs = require('fs')
var path = require('path')

fs.readdirSync(__dirname).forEach(function (file) {
  if (fs.statSync(path.join(__dirname, file)).isDirectory())
    app.use(rewrite('/' + file + '/*', '/' + file + '/index.html'))
})

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(session({ secret: 'foobar', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.post('/auth/login', passport.authenticate('local'), function (req, res) {
  res.json(req.user)
})

app.get('/auth/logout', function (req, res) {
  req.logout()
  res.sendStatus(200)
})

app.get('/auth/user', function (req, res) {
  if (!req.isAuthenticated()) res.sendStatus(403)
  res.json(req.user)
})

app.listen(8080, function () {
  console.log('Server listening on http://localhost:8080, Ctrl+C to stop')
})
