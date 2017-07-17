var pinyinlite = require('pinyinlite');

module.exports = {
    generateToc
};

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
            tagName = $this.prop('tagName');
        // 生成 id
        var pinyinArr = pinyinlite(text),
            tmp = [];
        pinyinArr.forEach(function (pinyins, idx) {
            var pinyin = pinyins[0];
            if (pinyin) {
                if (tmp.length && text.charCodeAt(idx) >= 128) {
                    tmp.push('-');
                }
                tmp.push(pinyin);
            } else {
                var code = text.charCodeAt(idx);
                if (code == 32) {
                    tmp.push('-');
                } else {
                    tmp.push('-u' + code);
                }
            }
        });
        var id = 'title_' + tmp.join(''),
            idx = 1;
        // 检测 id 冲突
        if (exitsId[id]) {
            var idx = 0,
                newId;
            do {
                idx++;
                newId = id + '-' + idx;
            } while (exitsId[newId]);
            id = newId;
        }
        exitsId[id] = true;
        $this.attr('id', id);
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