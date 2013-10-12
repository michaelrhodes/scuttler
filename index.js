var net = require('net')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var arp = require('arp-table')()
var parse = require('arp-parse')()
var localip = require('my-local-ip')()
var Model = require('scuttlebutt/model')
var Peers = require('./lib/peers')

var model = new Model
var peers = new Peers

var data = function() {
  var stream = model.createStream()
  stream.on('error', function(error) {
    stream.destroy()
  })
  return stream
}

var Scuttler = function(port) {
  EventEmitter.call(this)

  this.user = localip

  peers.on('connect', function(data, user) {
    this.emit('connect', data, user)
  }.bind(this))

  peers.on('disconnect', function(data, user) {
    this.emit('disconnect', data, user)
  }.bind(this))

  model.on('update', function(data, timestamp, source) {
    this.emit('message', data[1], data[0]) 
  }.bind(this))

  // Find all computers on network
  arp.stdout  
    .pipe(parse)
  
  parse.on('data', function(user) {
    // Filter out ARP entries that
    // don’t have a MAC address.
    if (!user.mac) {
      return
    }
    // Attempt connection
    var connection = net.connect({
      host: user.ip,
      port: port
    })
    peers.push(user.ip, connection)
    connection.pipe(data()).pipe(connection)
  })

  // Make yourself available
  net.createServer(function(connection) {
    peers.push(connection.remoteAddress, connection)
    connection.pipe(data()).pipe(connection)
  }).listen(port)

}

inherits(Scuttler, EventEmitter)

Scuttler.prototype.write = function(data) {
  model.set(this.user, data)
}

Scuttler.prototype.read = function(user) {
  user = user || this.user
  return (
    model.store[user] ?
      model.store[user][0][1] :
      null
  )
}

module.exports = Scuttler
