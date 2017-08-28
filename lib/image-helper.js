var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    http = require('http'),
    https = require('https');

module.exports = {
    inlineImage
};

function inlineImage($, dirname) {
    return new Promise(function (res, rej) {
        var totalCount = $('img').length,
            loaded = {},
            loadedCount = 0,
            failedCount = 0;

        $('img').each(function () {
            var img = this,
                src = img.src;
            if (loaded[src]) {
                loadedCount++;
                _check();
                return;
            }
            console.log('- Find image: ' + src);
            var srcUrl = url.parse(src),
                srcProtocol = srcUrl.protocol;
            // console.log(srcProtocol);
            if (!srcProtocol || srcProtocol == 'file:') {
                _loadLocal(path.resolve(dirname, src), _onGot(img, src));
            } else if (srcProtocol == 'http:' || srcProtocol == 'https:') {
                var handler = {
                    'http:': http,
                    'https:': https
                };
                _loadWeb(handler[srcProtocol], src, _onGot(img, src));
            }

            function _onGot(img, src) {
                return function (data) {
                    $(img).attr('src', _formatData(src, data));
                    loaded[src] = true;
                    loadedCount++;
                    _check();
                };
            }
        });

        _check();

        function _check() {
            // console.log('loadedCount:', loadedCount);
            if (loadedCount + failedCount >= totalCount) {
                // console.log('finished');
                res();
            }
        }

        function _loadLocal(filePath, cb) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    console.log('(Inline image failed: open \'%s\'.)', filePath);
                    failedCount++;
                    return;
                }
                cb(data);
            });
        }

        function _loadWeb(handler, url, cb) {
            handler.request(url, function (res) {
                var data = '';

                res.setEncoding('binary');

                res.on('error', function (err) {
                    console.log('(Inline image failed: download \'%s\')', url.format());
                });

                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {
                    cb(data);
                });
            });
        }

        function _formatData(filePath, data) {
            var extname = path.extname(filePath).substr(1),
                head = 'data:image' + (extname ? '/' + extname : '');
            return head + ';base64,' + data.toString('base64');
        }
    });
}
