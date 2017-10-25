/*
直播面板，创建直播间或加入直播间
props:{
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import FontA from 'react-fa';

const style = theme => ({
    panelBox: {
        height: '100%',
        padding: 0,
        margin: 0,
        width: '100%',
    },
    btnGrp: {
        width: 128,
        flexGrow: 'initial',
        padding: 0,
        margin: 0,
    },
    videoGrp: {
        background: '#98c4ba',
        flexGrow: 1,
        padding: 0,
        margin: 0,
    },
    addBtn: {
        width: '100%',
        height: '50%',
        margin: 0,
        borderBottom: '1px solid #EEE',
    }
});

//元件
class com extends Component {
    state = {};

    componentDidMount = async function() {};

    componentWillUnmount = () => {};


    //创建直播房间
    createRoom = () => {
        console.log();
    };

    render() {
        let that = this;
        const css = that.props.classes;

        let btnGrp = h(Grid, {
            item: true,
            className: css.btnGrp,
            style: { padding: 0 },
        }, [
           h(Button, {
                className: css.addBtn,
                onClick: () => {
                    that.createRoom();
                },
            }, [
               h(FontA, {
                    name: 'plus',
                    style: { marginRight: 4 },
                }),
               h('span', '创建房间')
            ]),
             h(Button, {
                className: css.addBtn,
                onClick: () => {

                },
            }, [
               h(FontA, {
                    name: 'user-plus',
                    style: { marginRight: 4 },
                }),
               h('span', '邀请好友')
            ]),
        ])

        let videoGrp = h(Grid, {
            item: true,
            className: css.videoGrp,
        }, 'hello')

        return h(Grid, {
            container: true,
            className: css.panelBox,
        }, [
            btnGrp,
            videoGrp,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
