require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/\.js$/) && file !== 'index.js') {
    let command = require(__dirname + '/' +file);
    module.exports[command.name] = command.command;
  }
});