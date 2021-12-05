import fs from 'fs';

fs.readdirSync(__dirname + '/').forEach(file => {
  if (file.match(/\.js$/) && file !== 'index.js') {
    let command = require(__dirname + '/' +file);
    module.exports[command.name] = command.command;
  }
})