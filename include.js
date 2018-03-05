var why = require('./')

process.on('SIGUSR1', function() { why() })
