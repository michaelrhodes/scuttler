# scuttler
scuttler a module, built on top of [scuttlebutt](https://github.com/dominictarr/scuttlebutt), that helps you write distributed network applications that automatically connect their users. It’s designed to be cross-platform, although I’ve only been able to test it on OS X so far.

## Install
```
npm install scuttler
```

## API
``` js
// Specify a port for the internal TCP server. 
var scuttler = new Scuttler(port)

// Send a message to all peers.
// String, Number, Object, and Array
// objects are all acceptable.
scuttler.write(message)

// Read the latest data from a given user.
// Note: The user argument is an IP address.
scuttler.read(user)

// Listen for messages from all peers.
scuttler.on('message', function(message, user) {})

// Listen for peer connection/disconnection.
scuttler.on('connect', function(user) {})
scuttler.on('disconnect', function(user) {})
```

### Example
This is a really basic (read: shitty) chat application, taken from the project’s example directory. Any computer on the network that runs the program will be automatically connected with everybody else. They’ll also be presented with the most recent messages of all of their peers.

``` js
var Scuttler = require('scuttler')
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
```

### No tests?
I love tests, but I’m not really sure *how* to write them for this module, seeing as it relies on communication with other computers. If you have any ideas, please [get in touch](mailto:spam+scuttler@michaelrhod.es). But for what it’s worth, all the major dependencies have tests.

### License
[MIT](http://opensource.org/licenses/MIT)
