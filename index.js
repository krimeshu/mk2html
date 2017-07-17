var fs = require('fs'),
    path = require('path');

var marked = require('marked'),
    JSDOM = require('jsdom').JSDOM,
    jquery = require('jquery');

var templateHelper = require('./lib/template-helper'),
    tocHelper = require('./lib/toc-helper'),
    imageHelper = require('./lib/image-helper');

module.exports = function (filePath, options) {
    options = options || {};
    var dirname = path.dirname(filePath),
        extname = path.extname(filePath),
        basename = path.basename(filePath, extname);
    templateHelper.getTemplate(function (templateString) {
        var resultString = templateString,
            resultPath = path.resolve(dirname, basename + '.html');

        console.log('Start reading: ', filePath);
        fs.readFile(filePath, function (err, data) {
            if (err) {
                console.error('File open failed:', filePath);
                throw err;
            }
            console.log('Markdown file content loaded, start parsing...');
            var markdownString = String(data && data.toString()),
                content = marked(markdownString);

            // 提取标题
            var title = getFirstTitle(content) || basename;

            // 附加样式
            var style = !options.style ? '' :
                '<style type="text/css">' + options.style + '</style>';

            resultString = resultString.replace(/\$\{title\}/g, title);
            resultString = resultString.replace(/\$\{style\}/g, style);
            resultString = resultString.replace(/\$\{content\}/g, content);

            var dom = new JSDOM(resultString),
                window = dom.window,
                $ = jquery(window);

            if (options.toc) {
                var $toc = tocHelper.generateToc($);
                $('body').prepend($toc).removeClass('without-toc').addClass('with-toc');
            }

            (options.inlineImage ?
                imageHelper.inlineImage($, dirname) :
                new Promise(function (res, rej) { res(); })
            ).then(done).catch(function (err) {
                console.error('Error occured when processing inline image:');
                console.error(err.stack);
                done();
            });

            function done() {
                resultString = dom.serialize();
                resultString = resultString.replace(/^<!DOCTYPE[^>]*>/, '<!DOCTYPE html>\n');
                fs.writeFile(resultPath, resultString, function () {
                    console.log('Finish parsing: ', filePath);
                    console.log('Generated: ', resultPath);
                });
            }
        });
    });
};

function getFirstTitle(content) {
    var window = new JSDOM(content).window,
        $ = jquery(window);

    // 提取标题
    return $('h1').eq(0).text();
}
