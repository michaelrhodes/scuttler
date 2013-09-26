var net = require('net')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var arp = require('arp-table')()
var split = require('split')()
var parseip = require('parse-ipv4')
var localip = require('my-local-ip')()
var Model = require('scuttlebutt/model')
var Peers = require('./lib/peers')

var Scuttler = function(port) {
  EventEmitter.call(this)

  var model = this.model = new Model
  var user = this.user = localip
  var peers = new Peers

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
    .pipe(parseip)
    .pipe(split)
  
  split.on('data', function(buffer) {
    var ip = buffer.toString()
    if (!ip) {
      return
    }
    // Attempt connection
    var peer = net.connect({
      host: ip,
      port: port
    })
    peers.push(ip, peer)
    peer.pipe(model.createStream()).pipe(peer)
  })

  // Make yourself available
  net.createServer(function(peer) {
    peers.push(peer.remoteAddress, peer)
    peer.pipe(model.createStream()).pipe(peer)
  }).listen(port)

}

inherits(Scuttler, EventEmitter)

Scuttler.prototype.write = function(data) {
  this.model.set(localip, data)
}

Scuttler.prototype.read = function(ip) {
  ip = ip || localip
  return this.model.store[ip] ? this.model.store[ip][0][1]: null
}

module.exports = Scuttler
