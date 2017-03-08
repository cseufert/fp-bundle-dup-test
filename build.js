"use strict";

var fsbx = require('fuse-box');
var FuseBox = fsbx.FuseBox;
var fs = require('fs');

var plugins = ['alpha', 'beta'];

var DONE = false;

Promise.all(plugins.map(function (plugin) {
  return new Promise(function (res) {
    var fuse = FuseBox.init({
      outFile: 'dist/plug/' + plugin + '.js',
      sourcemaps: true,
      cache: false,
    });
    fuse.bundle('[plugin/' + plugin + '/index.ts]', res);
  })
})).then(function () {
  console.log("initial bundles created");
  var usePlugins = ['alpha', 'beta'];
  fs.writeFileSync('dist/src.js',
    usePlugins.map(function (p) {
      return "require('./plug/" + p + "')()";
    }).join("\n") + "\n"
  );
  return Promise.all([
  new Promise(function (res) {
    FuseBox.init({
      outFile: "dist/frontend.js",
      sourcemaps: true,
      cache: false,
    }).bundle("> [dist/src.js]", res);
  }),
    new Promise(function (res) {
      FuseBox.init({
        outFile: "dist/frontend-libs.js",
        sourcemaps: true,
        cache: false,
      }).bundle("~ dist/src.js", res)
    })
  ])
  ;
}).then(function () {
  var finalBundle = fs.readFileSync('dist/frontend.js').toString();
  var findAppName = /My Duplicate Test App/g;
  var matchCount = 0;
    while(null != findAppName.exec(finalBundle))
    matchCount++;
  debugger;
  console.log("Lib count should be 1 but is " + matchCount)
});
