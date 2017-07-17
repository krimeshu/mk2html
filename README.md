# mk2html
Transform your markdown into html for sharing or archiving. From your script, cli or shortcut.

## Install

Install from npm.

```bash
npm install mk2html
```

Install from git.

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
mk2html test/test.md -i     # Parse image into inline dataUri string
```

## Shortcut

In Windows, you can create a `DROP-MD-HERE.bat` on desktop, with it's content:

```bash
@echo off
mk2html -t -i %* && pause 
```
Then just drop your `*.md` files on it, and see what will happen.

## API

```javascript
var mk2html = require('mk2html');

mk2html(__dirname + '/test/test.md', {
    toc: true,              // Generate toc
    inlineImage: true       // Parse image into inline dataUri string
});
```