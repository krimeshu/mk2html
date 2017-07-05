# 动漫运营活动常用对话框上手指南

## 一、什么是 EventDialog 和 PileDialog

`EventDialog` 是针对活动的，可以**修改定制各种背景图、内容间距、字体颜色**等样式的`活动对话框`。

`PileDialog` 是使用方法类似于 `EventDialog`，但**不需要修改**，**也不依赖样式**文件，只要引入 `js` 脚本就可以直接使用的通用对话框。

## 二、常用对话框：alert 与 confirm

两者常用调用方式都是：`alert ` 和 `confirm` 两个快捷方法，两个快捷方法都通过返回 `Promise` 对象来处理回调。

>  注意: 
>
>  以下两者都简称为 `Dialog`。实际项目中可以通过 `window.Dialog = EventDialog;` 或 `window.Dialog = PileDialog;` 进行修改。

### 1. `Dialog.alert(content[, title, btnText])`

呼出一个按键的消息对话框。

* `content` String/HTMLElement/Array - 对话框内容
* `title` String - 对话框标题（可缺省）
* `btnText` String - 对话框按键文本（可缺省）

```javascript
// 简单消息
Dialog.alert('你好啊！');

// 指定对话框标题和按键文本
Dialog.alert('你好啊！', '问候', '好的');

// 对话框内容是多段文本
Dialog.alert(['你好啊！', '最近在忙什么呢？'], '问候');

// 对话框内容是页面元素
Dialog.alert($('.rule-list')[0], '活动规则', '了解');
```

### 2. `Dilaog.confirm(content[, title, btnConfirmText, btnCancelText])`

呼出两个按键的询问对话框，相比 `Dialog.alert`，可以多配置一个取消按键的文本。

> 按键顺序以 iOS 习惯为准，右侧确定，左侧取消。

* `content` String/HTMLElement/Array - 对话框内容
* `title` String - 对话框标题（可缺省）
* `btnConfirmText` String - 确定键文本（可缺省）
* `btnCancelText` String - 取消键文本（可缺省）

```javascript
// 示例
Dialog.confirm(['时间不早了，', '早点去休息吧！'], '提示');
```

### 3. `p.then(onFulfilled[, onRejected])`

`Dialog.alert` 和 `Dialog.confirm` 的回调函数处理方式（更具体的说明，可自行查阅 `Promise` 标准）。

* `onFulfilled` Function - 用户接受/确认时的正常处理（满足条件时）
* `onRejected` Function - 用户拒绝/取消时的异常处理（不满足条件时）

```javascript
// 简单消息
Dialog.alert('你好啊！').then(function () {
  Dialog.alert('哈哈，慢走！');
});

// 询问消息
Dialog.confirm(['时间不早了，', '早点去休息吧！'], '提示').then(function () {
  // 用户点击确定时
  Dialog.alert('嗯嗯，早点休息！');
}, function () {
  // 用户点击取消/关闭时
  Dialog.alert(['好吧……', '别熬夜太晚啊！']);
});

// 需要区分用户点击了关闭键还是取消键时，可以通过事件对象判断
Dialog.confirm(['时间不早了，', '早点去休息吧！'], '提示').then(function () {
  // 用户点击确定时
  Dialog.alert('嗯嗯，早点休息！');
}, function (e) {
  if(!$(e.target).closest('.close').length) {
    // 用户点击关闭时
  } else {
    // 用户点击取消时
    Dialog.alert(['好吧……', '别<em>熬夜</em>太晚啊！']);
  }
});
```

## 三、自定义对话框

### 1. 定制 EventDialog 样式

活动对话框可以根据不同活动设计稿，自己修改对话框样式。

具体参考活动模板内 `css/lib/_event-dialog.scss` 顶部的各种配置项目，这里说一下大致的修改方式。

#### (1) 修改对话框背景

对话框背景在 `$dialog-bg` 变量内就可以配置了。

每一组背景配置都由 `<图片URL/背景色>`, `<元素宽度>`, `<元素宽度>`[, `<背景宽度>`, `<背景高度>`] 组成，其中 `<背景宽度>` 和 `<背景高度>` 可省略，缺省时默认与 `<元素宽度>`, `<元素宽度>` 保持一致。

`$dialog-bg` 可配置一组或三组背景配置，一般定高对话框只需要一组，内容高度自适应（拉伸）的对话框需要三组。

```scss
// 高度固定的对话框
$dialog-bg: ( 
    ('#include(~/images/dialog-bg.png)', 750, 360)
);
// 内容高度适应（拉伸）的对话框
$dialog-bg: ( 
    ('#include(~/images/dialog-head.png)', 750, 160), 
    ('#include(~/images/dialog-body.png)', 750, auto, 750, 100%), 
    ('#include(~/images/dialog-foot.png)', 750, 35)
);
```

PC 端页面不一定能使用 `background-size` 进行拉伸，所以 PC 版活动模板内稍有变化，背景配置内容是  `<图片URL/背景色>`, `<元素宽度>`, `<元素宽度>`[, `<平铺方式>`] 组成。

```scss
// 内容高度适应（平铺）的对话框
$dialog-bg: ( 
    ('~/images/dialog-head.png', 660, 150), 
    ('~/images/dialog-body.png', 660, auto, repeat-y), 
    ('~/images/dialog-foot.png', 660, 20)
);
```

#### (2) 修改关闭键位置

对话框的关闭键配置主要是由**关闭键坐标** `$dialog-btn-close-pos` 与**关闭键背景** `$dialog-btn-close-bg` 组成。

可以在 `Chrome` 浏览器中调整预览样式，达到设计稿效果后回来修改这两个变量即可。

```scss
// 关闭键相对于对话框右上角的坐标 (top, right)
$dialog-btn-close-pos: (100, 6);
// 关闭键的背景配置
$dialog-btn-close-bg: ('#include(~/images/dialog-btn-close.png)', 64, 64);

// 背景图在对话框背景图内，不需要指定背景图的情况
$dialog-btn-close-bg: (null, 64, 64);
```

#### (3) 修改内容区域布局与文本样式

对话框内容一般离背景图片边界会有一定距离，这个距离同样可以浏览器中调整完毕后，修改变量固定下来。

其中的文本样式也可以快速指定。

```scss
// 对话框内容宽高、边距
$dialog-content-size: (auto, auto);
$dialog-content-margin: (0 10 10 10);

// 文本对齐方式
$dialog-content-text-align: center;
// 文本样式
//     格式: (<font-size>, <color>, <font-style>, <font-weight>)
$dialog-text-style: (14, black, normal, normal);
$dialog-text-style-em: (14, #4cc658, normal, normal);
$dialog-text-style-strong: (14, #ff5a59, normal, strong);
```

#### (4) 修改 alert 与 confirm 的按键背景

默认确认键和取消键是由背景色和边框实现的，如果需要改为背景图也是可以的。

```scss
// 对话框默认按键样式
//   格式参考上面的背景配置格式，可为 null、色值和图片url
$dialog-btn-bg: (#4cc658, 190, 44);
$dialog-btn-border: (black 3px solid);

// 背景是图片的情况，记得去掉边框
$dialog-btn-bg: ('#include(~/images/dialog-btn-bg.png)', 190, 44);
$dialog-btn-border: (0 none);

// 对话框默认按键文本样式
$dialog-btn-text-style: (18, black, normal, normal);


// 取消键样式配置，格式同上
$dialog-btn2-bg: (#fff, 190, 44);
$dialog-btn2-border: (black 3px solid);

// 取消键文本样式
$dialog-btn2-text-style: (18, black, normal, normal);
```

### 2. 创建特殊对话框

当对话框不需要底部按键，或者按键布局较特殊时，可以通过自己在页面上定义对话框内容，实例化新的对话框来实现。

```html
<div class="rule-list-box">
  <ul class="rule-list">
    <li class="list-item">规则1</li>
    <li class="list-item">
      <img class="rule-img" alt="规则配图" src="images/rule-img.png"/>
    </li>
  </ul>
  <button class="button close-rule-list">我了解了</button>
  <a class="link" href="fill-table.html">填写意愿表</a>
</div>

<button class="button show-rule">查看规则</button>
```

```javascript
// 实例化规则对话框
var ruleDialog = new EventDialog({
  content: $('.rule-list-box')[0]
});

// 显示规则对话框
$('.button.show-rule').on('click', function () {
  ruleDialog.show();
});

// 关闭规则对话框
$('.button.close-rule-list').on('click', function () {
  ruleDialog.close();
});
```

具体效果，建议自己尝试修改代码后体验。



