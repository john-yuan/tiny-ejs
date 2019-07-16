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
