/*
共用白板、编辑器界面
props:{
    roomInfo:{
        roomid,房间ID
        chairMan,主持人uid
    },
}
*/

import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';

import LiveCoder from '../../Units/Live/LiveCoder';


const style = theme => ({
    codersBox: {
        margin: 0,
        padding: 0,
    },
});

//元件
class com extends Component {
    state = {

    };

    componentWillMount = async function() {};

    setContentSize = () => {};

    componentDidMount = async function() {};

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        let roomInfo = that.props.roomInfo;

        let cman = roomInfo.chairMan;
        let onChair = (cman && cman === global.$wd.auth().currentUser.uid) ? true : false;

        let roomId = roomInfo.roomId;
        let coderRef = roomId ? `icoder/${roomId}` : undefined;

        return h(Grid, {
            container: true,
            className: css.codersBox,
        }, [
            h(LiveCoder, {
                wdRef: coderRef,
                onChair: onChair,
            }),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
