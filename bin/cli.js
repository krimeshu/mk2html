#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var version = require('../package.json').version;
var mk2html = require('../');

program
    .version(version)
    .usage('[options] <file ...>')
    .option('-t, --toc', 'Generate Table of Content.')
    .option('-i, --inline-image', 'Parse image into inline dataURI string.')
    .option('-s, --style', 'Inject extra stylesheets.')
    .parse(process.argv);

var files = program.args;

files.forEach(function (file) {
    mk2html(file, {
        toc: program.toc,
        inlineImage: program.inlineImage,
        style: program.style
    });
});