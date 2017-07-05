# mk2html
Transform your markdown into html for sharing or archiving. From your script, cli or shortcut.

## Install

```bash
git clone https://github.com/krimeshu/mk2html.git
cd mk2html
npm install
npm link
```

## CLI

```bash
mk2html test/test.md
mk2html test/test.md -t     # Generate toc
```

## API

```javascript
var mk2html = require('mk2html');

mk2html(_dirname + '/test/test.md', {
    toc: true               // Generate toc
});
```