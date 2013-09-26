var Scuttler = require('../')
var scuttler = new Scuttler(process.argv[2])

process.stdin.on('data', function(data) {
  scuttler.write(data.toString())
})

scuttler.on('message', function(message, user) {
  if (user !== this.user)
    process.stdout.write(user + ': ' + message)
})

scuttler.on('connect', function(user) {
  process.stdout.write('-- ' + user + ' connected --\n')
})

scuttler.on('disconnect', function(user) {
  process.stdout.write('-- ' + user + ' disconnected --\n')
})
