'use strict';

var debug          = require('debug')('fundation');
var debugMiddleware = require('debug')('fundation:middleware');
var app            = require('express')();
var glob           = require('glob');
var path           = require('path');
var async          = require('asyncawait/async');
var await          = require('asyncawait/await');
var pjson          = require('./package.json');

function Fundation () {

  console.log("Fundation: v" + pjson.version);

  // Container for all of the models
  this.model = {};

}

Fundation.prototype.init = function (plugins) {

  debug('Starting Fundation: ' + app.get('env'));

  var self = this;
  app.once('mount', function onmount(parent) {

    // Remove sacrificial express app (krakenjs)
    parent._router.stack.pop();

    // Fundation root path
    parent.fundationRoot = __dirname;

    // Config
    require('./lib/config.js')(parent);

    // Database / Storage
    var promises = [];
    promises.push(require('./lib/mysql.js')(parent));
    promises.push(require('./lib/mongodb.js')(parent));
    promises.push(require('./lib/redis.js')(parent));
    promises.push(require('./lib/memcached.js')(parent));

    // Once the DB connections are connected
    // Then we can setup all of the middleware
    Promise.all(promises)
    .then(async (function(){
      // Middleware
      require('./middleware/logging.js')(parent);
      require('./middleware/plugins.js')(parent, plugins, self);
      require('./middleware/statics.js')(parent, self);
      require('./middleware/basic-auth.js')(parent);
      require('./middleware/models.js')(parent, self);
      require('./middleware/preload.js')(parent, self);
      require('./middleware/authentication.js')(parent, self);
      require('./middleware/middleware.js')(parent);
      require('./middleware/vue.js')(parent, self);
      require('./middleware/views.js')(parent, self);
      require('./middleware/health.js')(parent);
      require('./middleware/controllers.js')(parent, self);
      console.log("Fundation: started");
    }));

  });

  return app;

};

module.exports = new Fundation();
