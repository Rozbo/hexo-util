'use strict';

var hljs = require('highlight.js/lib/highlight');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
var alias = require('../highlight_alias.json');

hljs.configure({
    classPrefix: ''
});

function highlightUtil(str, options) {
    if (typeof str !== 'string') throw new TypeError('str must be a string!');
    options = options || {};

    var gutter = options.hasOwnProperty('gutter') ? options.gutter : true;
    var wrap = options.hasOwnProperty('wrap') ? options.wrap : true;
    var firstLine = options.hasOwnProperty('firstLine') ? +options.firstLine : 1;
    var caption = options.caption;
    var tab = options.tab;
    var data = highlight(str, options);

    if (!wrap) return data.value;

    var lines = data.value.split('\n');
    var numbers = '';
    var content = '';
    var result = '';
    var line;

    for (var i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        if (tab) line = replaceTabs(line, `    `);
        numbers += '<div class="line">' + (firstLine + i) + '</div>';
        content += '<div class="line">' + line + '</div>';
    }

    result += '<figure class="highlight' + (data.language ? ' ' + data.language : '') + '">';


    result += '<figcaption>' + '<div class="ctrl-left">';
    result += '<i style="color:red" class="fa fa-fw fa-times-circle"></i>';
    result += '<i style="color:#ecc261" class="fa fa-fw  fa-minus-circle"></i>';
    result += '<i style="color:#43ca5a" class="fa fa-fw fa-plus-circle"></i></div>';
    if (caption) {
        result += '<div class="ctrl-title">' + caption + '</div>';
    }
    result += '<div class="ctrl-right">' + '<i class="fa fa-fw fa-code"></i>';
    result += '</div>' + '</figcaption>';
    result += '<table><tr>';

    if (gutter) {
        result += '<td class="gutter"><pre>' + numbers + '</pre></td>';
    }

    result += '<td class="code"><pre>' + content + '</pre></td>';
    result += '</tr></table></figure>';

    return result;
}

function encodePlainString(str) {
    return entities.encode(str);
}

function replaceTabs(str, tab) {
    return str.replace(/^\t+/, function(match) {
        var result = '';

        for (var i = 0, len = match.length; i < len; i++) {
            result += tab;
        }

        return result;
    });
}

function loadLanguage(lang) {
    hljs.registerLanguage(lang, require('highlight.js/lib/languages/' + lang));
}

function tryLanguage(lang) {
    if (hljs.getLanguage(lang)) return true;
    if (!alias.aliases[lang]) return false;

    loadLanguage(alias.aliases[lang]);
    return true;
}

function loadAllLanguages() {
    alias.languages.filter(function(lang) {
        return !hljs.getLanguage(lang);
    }).forEach(loadLanguage);
}

function highlight(str, options) {
    var lang = options.lang;
    var autoDetect = options.hasOwnProperty('autoDetect') ? options.autoDetect : false;

    if (!lang) {
        if (autoDetect) {
            loadAllLanguages();
            return hljs.highlightAuto(str);
        }

        lang = 'plain';
    }

    var result = {
        value: encodePlainString(str),
        language: lang.toLowerCase()
    };

    if (result.language === 'plain') {
        return result;
    }

    if (!tryLanguage(result.language)) {
        result.language = 'plain';
        return result;
    }

    return tryHighlight(str, result.language) || result;
}

function tryHighlight(str, lang) {
    try {
        return hljs.highlight(lang, str);
    } catch (err) {
        return;
    }
}

module.exports = highlightUtil;
