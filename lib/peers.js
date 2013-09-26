var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var Peers = function() {
  this.list = [] 
}

inherits(Peers, EventEmitter)

Peers.prototype.push = function(ip, peer) {
  var add = function() {
    this.list.push(ip)
    this.emit('connect', ip)
    peer.removeListener('data', add)
  }.bind(this)
  
  peer.on('data', add)

  peer.on('error', function(error) {
    peer.destroy()
  })

  peer.on('close', function(failed) {
    if (!failed) {
      this.remove(ip)
    }
  }.bind(this))
}

Peers.prototype.remove = function(ip) {
  this.list = this.list.filter(function(item) {
    return item !== ip
  })
  this.emit('disconnect', ip)
}

module.exports = Peers
