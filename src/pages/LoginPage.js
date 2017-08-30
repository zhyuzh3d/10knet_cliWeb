import { Component } from 'react';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import h from 'react-hyperscript';

class com extends Component {
    render() {
        return h('div', [
            h(Button, 'btn'),
            h(Icon, 'face'),
        ]);
    }
};

export default com;
