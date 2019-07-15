var fs = require('fs');
var path = require('path');
var tpl = fs.readFileSync(path.resolve(__dirname, 'template.tpl')).toString();
var compile = require('../compile');
var render = compile(tpl);
var text = render({
    user: {
        name: 'John',
        skills: ['HTML', 'CSS', 'JavaScript']
    }
});

console.log(text);
