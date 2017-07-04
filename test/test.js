var mk2html = require('../');

mk2html(__dirname + '/test.md', {
    toc: true,
    inlineImage: true,
    style: null
});