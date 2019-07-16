# 简介

此项目为一个实验目的模板引擎，可以将模板字符串编译成一个渲染函数，语法和 EJS 相同，本项目实现了语法解析，创建渲染函数时则参考了 EJS 的内部实现。

## 示例

假设模板内容如下：

```html
<h1>User Information</h1><%
    /**
     * 获取当前时间
     *
     * @returns {number} 返回当前时间
     */
    function time() {
        // 返回当前时间
        return +new Date();
    }
%>
<% if (user.name) { %>
    <div>Name: <%= user.name %></div>
<% } else { %>
    <div>Name: (none)</div>
<% } %>
<ul>
<% for (var i = 0, l = user.skills.length; i < l; i += 1) { %>
    <li><%= user.skills[i] %></li>
<% } %>
</ul>
<div>Timestamp: <%= time() %></div>
```

使用以下代码即可编译：

```js
var fs = require('fs');
var path = require('path');
var tpl = fs.readFileSync(path.resolve(__dirname, 'template.tpl')).toString();
var compile = require('../compile');

// 编译模板
var render = compile(tpl);
var text = render({
    user: {
        name: 'John',
        skills: ['HTML', 'CSS', 'JavaScript']
    }
});

console.log(text);
```

输出内容如下：

```html
<h1>User Information</h1>

    <div>Name: John</div>

<ul>

    <li>HTML</li>

    <li>CSS</li>

    <li>JavaScript</li>

</ul>
<div>Timestamp: 1563197905258</div>
```
