var unified = require('unified');
var markdown = require('remark-parse');
var remark2rehype = require('remark-rehype');
var format = require('rehype-format');
var html = require('rehype-stringify');

const processor = unified()
.use(markdown)
.use(remark2rehype)
.use(format)
.use(html);

export default processor;

