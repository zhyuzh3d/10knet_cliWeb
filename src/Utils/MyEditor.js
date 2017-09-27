import React from 'react';
import Request from 'superagent';
import { Component } from 'react';
import h from 'react-hyperscript';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/monokai.css';

import CodeMirror from 'react-codemirror2';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';

var $fn = {};
const _style = theme => ({

});

class MyComponent extends Component {
    state = {
        reactVersion: React.version, //去除unuse警告
        code: 'var a=1;\nfunction a(){console.log("hello world!")\n}',
    };

    setFontSize = (editor, size) => {
        editor.getWrapperElement().style["font-size"] = size + "px";
        editor.refresh();
    };

    render() {
        let that = this;
        let css = that.props.classes;

        let options = that.props.options || {};
        let optionsDefault = {
            mode: 'javascript',
            theme: that.props == 'dark' ? 'monokai' : 'default',
            lineNumbers: true,
            fontSize: 14,
        };
        options = Object.assign(optionsDefault, options);
        console.log(options);

        return h(CodeMirror, {
            value: this.state.code,
            options: options,
            onChange: (editor, metadata, value) => {},
            editorDidMount: (editor) => {
                that.setFontSize(editor, options.fontSize);
            }
        });
    }
}

MyComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};
MyComponent = withStyles(_style)(MyComponent);
MyComponent.fn = $fn;


export default MyComponent;
