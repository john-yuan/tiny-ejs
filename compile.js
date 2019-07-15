/**
 * Compile the template to a render function.
 *
 * @param {string} template The template string.
 * @returns {(data: any) => string} Returns a function to compile the data to a string.
 */
function compile(template) {
    var ast = parse(template + '', '<%', '%>', function (expr) {
        var first = expr.charAt(0);
        var second = expr.charAt(1);

        if (first !== ' ' && second === ' ') {
            expr = expr.substr(2);
            expr = expr.replace(/^\s+|\s+$/g, '');
            if (first === '=') {
                return { type: 'expression', expr: expr };
            }
        } else {
            expr = expr.replace(/^\s+|\s+$/g, '');
        }

        return { type: 'statement', expr: expr };
    });

    return parseAst(ast);
}

/**
 * Parse the ast.
 *
 * @param {Object.<string, *>[]} The ast array.
 * @returns {(data: any) => string} Returns a function to compile the data to a string.
 */
function parseAst(ast) {
    var i = 0;
    var l = ast.length;
    var line;
    var lines = [];

    lines.push('var __output = []');
    lines.push('with (__source) {');

    for ( ; i < l; i += 1) {
        line = ast[i];

        if (line.type === 'string') {
            lines.push('__output.push(' + JSON.stringify(line.text) + ')');
        } else if (line.type === 'expression') {
            lines.push('__output.push(' + line.expr + ')');
        } else if (line.type === 'statement') {
            lines.push(line.expr);
        }
    }

    lines.push('}');
    lines.push('return __output.join("")');

    return new Function('__source', lines.join('\n'));
}

/**
 * Parse the template.
 *
 * @param {string} template The template to parse.
 * @param {string} startTag The start tag.
 * @param {string} endTag The end tag.
 * @param {(expr: string) => string} parseExpr The function to parse the expression.
 * @returns {string} Return the ast.
 */
function parse(template, startTag, endTag, parseExpr) {
    var i = 0;
    var l = template.length;
    var sl = startTag.length;
    var el = endTag.length;
    var string = [];
    var exprbuffer = [];
    var T_STR = 1;
    var T_EXP = 2;
    var type = T_STR;
    var ast = [];

    /**
     * Get the char in `template` at the given position.
     *
     * @param {numner} [index] The index to read, if it is not set, `i` is used.
     * @returns {string} Returns the char.
     */
    var charAt = function (index) {
        return template.charAt(index || i);
    };

    /**
     * Escape the tag.
     *
     * @param {string} tag The tag to escape.
     * @param {string[]} buffer The buffer to put the char.
     */
    var esc = function (tag, buffer) {
        var c;
        var m = tag.length;
        var s = '\\';

        while (1) {
            c = charAt(i);
            if (c === s) {
                c = charAt(++i);
                if (c === s) {
                    buffer.push(s);
                    ++i;
                } else if (isWord(tag)) {
                    buffer.push(tag);
                    i += m;
                } else {
                    buffer.push(s);
                    break;
                }
            } else {
                break;
            }
        }
    };

    /**
     * Check whether the next input is the word.
     *
     * @param {string} word The word to check.
     * @returns {number} Returns `1` on yes, otherwise `0` is returned.
     */
    var isWord = function (word) {
        var k = 0;
        var j = i;
        var m = word.length;

        while (k < m && j < l) {
            if (word.charAt(k) !== charAt(j)) return 0;
            ++k;
            ++j;
        }

        return 1;
    };

    /**
     * Flush the string to the ast array.
     */
    var flushString = function () {
        if (string.length) {
            ast.push({
                type: 'string',
                text: string.join('')
            });
            string = [];
        }
    };

    /**
     * Flush the expr to the ast and reset the expr buffer.
     */
    var flushExpr = function () {
        flushString();
        ast.push(parseExpr(exprbuffer.join('')));
        exprbuffer = [];
    };

    while (i < l) {
        if (type === T_STR) {
            esc(startTag, string);
            if (isWord(startTag)) {
                type = T_EXP;
                i += sl;
            } else {
                string.push(charAt(i));
                i += 1;
            }
        } else if (type === T_EXP) {
            esc(endTag, exprbuffer);
            if (isWord(endTag)) {
                type = T_STR;
                i += el;
                flushExpr();
            } else {
                exprbuffer.push(charAt(i));
                i += 1;
            }
        }
    }

    if (type === T_EXP) {
        throw new Error('unexpected end');
    }

    flushString();

    return ast;
}

module.exports = compile;
