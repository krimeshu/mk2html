var fs = require('fs'),
    path = require('path');

var JSDOM = require('jsdom').JSDOM,
    jquery = require('jquery');

module.exports = {
    getTemplate
};

var templateString = null;

function getTemplate(cb) {
    if (templateString) {
        cb && cb(templateString);
    } else {
        loadTemplate(function (_templateString) {
            templateString = _templateString;
            cb && cb(templateString);
        });
    }
}

function loadTemplate(cb) {
    var dirname = path.resolve(__dirname, '../template'),
        filePath = path.resolve(dirname, 'template.html');
    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.error('Template file open failed:', filePath);
            throw err;
        }
        var templateString = String(data && data.toString());

        // 解析模板
        var dom = new JSDOM(templateString),
            window = dom.window,
            $ = jquery(window);

        try {
            // 替换行内样式和脚本
            replaceInlineSources($,
                'link[rel="stylesheet"][inline][href]',
                'href',
                '<style type="text/css"></style>',
                dirname);
            replaceInlineSources($,
                'script[inline][src]',
                'src',
                '<script type="text/javascript"></script>',
                dirname);
            // 序列化处理后的模板
            templateString = dom.serialize();
        } catch (err) {
            console.error('Template file parsing failed:', filePath);
            throw err;
        }
        cb && cb(templateString);
    });
}

function replaceInlineSources($, selector, attrName, tagTemplate, dirname) {
    // console.log($('body')[0].nodeName);
    var $tags = $(selector);
    // console.log($tags);
    $tags.each(function () {
        var $this = $(this),
            relPath = $this.attr(attrName);

        // 文件相对路径转为可读的绝对路径
        var styleFilePath = path.resolve(dirname, relPath),
            styleFileContent = fs.readFileSync(styleFilePath).toString();

        var $style = $(tagTemplate).text(styleFileContent);

        $this.replaceWith($style);
    });
}
