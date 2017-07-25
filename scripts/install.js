#!/usr/bin/env node

var download = require('download');
var rimraf = require('rimraf');
var semver = require('semver');
// var createBar = require('multimeter')(process);
var path = require('path');
var fs = require('fs');
// var merge = require('merge');
var urlModule = require('url');
var Decompress = require('decompress');
// var fileExists = require('file-exists');
var chalk = require('chalk');
var request = require('request');

//var buildType = process.env.npm_config_nwjs_build_type || process.env.NWJS_BUILD_TYPE || 'normal';
var v = semver.parse(require('../package.json').version);
// var version = `${v.major}.${v.minor}.${v.patch}`;
var isPrerelease = v.prerelease.length > 0;

const repos = {
  "release": `http://central.maven.org/maven2/io/swagger/swagger-codegen-cli/${v.version}/swagger-codegen-cli-${v.version}.jar`,
  "snapshot": `https://oss.sonatype.org/service/local/repositories/snapshots/content/io/swagger/swagger-codegen-cli/${v.version}`
}

var dest = path.resolve(__dirname, '..', 'vendor');
rimraf.sync(dest);

function logError(e) {
  console.error(chalk.bold.red((typeof e === 'string') ? e : e.message));
  // process.exit(1);
}

var downloadOptions = {
  filename: 'swagger-codegen-cli.jar'
}
if (isPrerelease) {
  request.get({ url: repos.snapshot, json: true }, (err, response, body) => {
    if (err) { logError(err); }
    else {
      var list = body.data.filter(item => item.text.match(/\.jar$/)).filter(item => item.text.indexOf('-javadoc.jar') < 0 && item.text.indexOf('-sources.jar') < 0).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      var current = list[0];
      download(current.resourceURI, dest, downloadOptions).then(() => console.log('done')).catch(logError);
    }
  });
} else {
  download(repos.release, dest, downloadOptions).then(() => console.log('done')).catch(logError);
}
