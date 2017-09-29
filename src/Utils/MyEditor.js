/*
基于codemirror的代码编辑器
props:{
    value,//待编辑的代码字符串
    fontSize://显示文字大小，可动态调整
    options:{//编辑器设置项，参照codemirror官方文档
        mode, //编码模式，可选以下htmlmixed,javascript,text/jsx,text/css,text/html,text/html,text/x-go,text/x-csrc,text/x-c++src,text/x-java,text/x-objectivec,text/x-swift,python,markdown
        lineWrapping,//是否换行
        lineNumbers,//是否显示左侧行数字
    },
    onChange(editor, metadata, value),//value文字变化事件回调函数
}
*/

import React from 'react';
import Request from 'superagent';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import CodeMirror from 'codemirror';
import ReactCodeMirror from 'react-codemirror2';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/addon/hint/show-hint.css';

import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/go/go.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/swift/swift.js';
import 'codemirror/mode/jsx/jsx.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/markdown/markdown.js';

import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/addon/hint/xml-hint.js';
import 'codemirror/addon/hint/html-hint.js';
import 'codemirror/addon/hint/css-hint.js';
import 'codemirror/addon/hint/anyword-hint.js';

import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/edit/matchtags.js';
import 'codemirror/addon/edit/closetag.js';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

var $fn = {};
const _style = theme => ({

});

class MyComponent extends Component {
    state = {
        reactVersion: React.version, //去除unuse警告
        editor: undefined,
        editorDom: undefined,
        optionsDefault: { //编辑器预设
            mode: 'javascript',
            theme: 'default',
            lineNumbers: true,
            lineWrapping: true,
            lineNumbers: true,
            matchBrackets: true, //addon,自动高亮对应的括号
            autoCloseBrackets: true, //addon,自动输入封闭的括号
            matchTags: true, //addon,高亮对应的tag，仅在text／html模式有效
            autoCloseTags: true, //addon,自动输入封闭的tag
            extraKeys: { "Ctrl-Space": "autocomplete" },
        },
        fontSize: 14, //字体大小
        hintMaps: {
            'javascript': 'javascript',
            'text/jsx': 'javascript',
            'text/css': 'css',
            'text/html': 'html',
            'htmlmixed': 'html',
            'text/xml': 'xml',
        }
    };

    //自动完成提示
    autoHint = (editor, event) => {
        let that = this;
        let char = String.fromCharCode(event.keyCode);
        let keyValid = /[0-9A-Za-z\.\¾]/.test(char) && !event.altKey && !event.ctrlKey;

        if(!editor.state.completionActive && keyValid) {
            let options = that.props.options || {};
            options = Object.assign(that.state.optionsDefault, options);
            CodeMirror.showHint(editor, (edtr, opts) => {
                let hintMod = that.state.hintMaps[options.mode];
                let hint = CodeMirror.hint[hintMod];
                let res = hint ? hint(edtr, opts) : undefined;

                res = CodeMirror.hint.anyword(edtr, {
                    list: (res && res.list) ? res.list : []
                });
                return res;
            }, {
                completeSingle: false
            });
        }
    };


    //提前生成editorDom，不重复生产
    componentWillMount() {
        let that = this;
        let options = that.props.options || {};
        options = Object.assign(that.state.optionsDefault, options);
        let editorDom = that.state.editorDom = h(ReactCodeMirror, {
            value: that.props.value ? that.props.value : '',
            options: options,
            optionChange: (editor, str) => {},
            onChange: (editor, metadata, value) => {
                that.props.onChange && that.props.onChange(editor, metadata, value);
            },
            onKeyUp: (editor, evt) => {
                that.autoHint(editor, evt);
                that.props.onKeyUp && that.props.onChange(editor, evt);
            },
            editorDidMount: (editor) => {
                that.setState({ editor: editor });
            },
        });
    };


    //渲染每次都刷新全部options
    render() {
        let that = this;
        let options = that.props.options || {};
        let fontSize = that.props.fontSize || that.state.fontSize;
        options = Object.assign(that.state.optionsDefault, options);
        let editor = that.state.editor;
        if(editor) {
            for(var attr in options) {
                editor.setOption(attr, options[attr]);
            };
            editor.getWrapperElement().style["font-size"] = fontSize + "px";
            editor.refresh();
        };
        return that.state.editorDom;
    }
}

MyComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};
MyComponent = withStyles(_style)(MyComponent);
MyComponent.fn = $fn;


export default MyComponent;
