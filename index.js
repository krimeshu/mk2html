var fs = require('fs'),
    path = require('path');

var marked = require('marked'),
    JSDOM = require('jsdom').JSDOM,
    jquery = require('jquery');

var templateString = null;

module.exports = function (filePath, options) {
    options = options || {};
    var dirname = path.dirname(filePath),
        extname = path.extname(filePath),
        basename = path.basename(filePath, extname);
    getTemplate(function (templateString) {
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

            if (options.toc) {
                var dom = new JSDOM(resultString),
                    window = dom.window,
                    $ = jquery(window),
                    $toc = generateToc($);
                $('body').prepend($toc).removeClass('without-toc').addClass('with-toc');
                resultString = dom.serialize();
                resultString = resultString.replace(/^<!DOCTYPE[^>]*>/, '<!DOCTYPE html>\n');
            }

            fs.writeFile(resultPath, resultString, function () {
                console.log('Finish parsing: ', filePath);
                console.log('Generated: ', resultPath);
            });
        });
    });
};

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
    var dirname = path.resolve(__dirname, 'template'),
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

function getFirstTitle(content) {
    var window = new JSDOM(content).window,
        $ = jquery(window);

    // 提取标题
    return $('h1').eq(0).text();
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

function generateToc($) {
    var tocAreaTpl = $('#tpl_tocArea').text(),
        tocListTpl = $('#tpl_tocList').text(),
        tocItemTpl = $('#tpl_tocItem').text();
    var $toc = $(tocAreaTpl),
        $curList = $(tocListTpl),
        curLevel = 1,
        exitsId = {};
    $toc.find('.toc-inner').append($curList);
    $('h1,h2,h3,h4,h5,h6').each(function () {
        var $this = $(this),
            text = $this.text(),
            id = $this.prop('id'),
            tagName = $this.prop('tagName');
        // 检测 id 冲突
        if(exitsId[id]) {
            
        }
        exitsId[id] = true;
        // 创建目录链接
        var $item = $(tocItemTpl).text(text).attr('href', '#' + id);
        // console.log('tagName:', tagName);
        var level = Number(tagName.replace(/^h/i, ''));
        // console.log('level:', level, '~', curLevel);
        while (level < curLevel) {
            // 返回上一级
            $curList = $curList.parent();
            curLevel--;
            if (!$curList.length) {
                // 异常容错
                $curList = $list;
                break;
            }
        }
        while (level > curLevel) {
            // 进入下一级
            var $list = $(tocListTpl);
            $curList.append($list);
            $curList = $list;
            curLevel++;
        }
        $curList.append($item);
    });
    return $toc;
}