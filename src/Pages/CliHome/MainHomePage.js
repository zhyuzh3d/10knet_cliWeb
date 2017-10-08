import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import style from './_style';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
//import Toolbar from 'material-ui/Toolbar';
//import IconButton from 'material-ui/IconButton';
//import FontA from 'react-fa';
//import Tooltip from 'material-ui/Tooltip';
//import Typography from 'material-ui/Typography';
//import Menu, { MenuItem } from 'material-ui/Menu';
//import Avatar from 'material-ui/Avatar';

import MainAppBar from '../../Units/MainAppBar/MainAppBar';

//元件
class com extends Component {
    state = {
        snackbarText: '..tip..',
        snackbarOpen: false,
        title: '资源管理中心',
        contentHeight: window.innerHeight - 48,
    };

    componentDidMount = async function() {
        window.addEventListener('resize', this.setContentSize);
    };

    setContentSize = () => {
        this.setState({ contentHeight: window.innerHeight });
    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.setContentSize);
    };

    //渲染实现
    render() {
        document.getElementsByTagName('title')[0].innerHTML = '控制台';
        let that = this;
        //const css = this.props.classes;

        //内容区
        let content = h(Grid, {
            container: true,
            style: { height: that.state.contentHeight, overflow: 'auto' },
        }, [
            h(Grid, { item: true }, [
                h(Button, {
                    raised: true,
                    color: 'primary',
                    onClick: () => {
                        global.$router.changePage('AssetListPage');
                    },
                }, '我的资源列表'),
            ]),
        ]);

        //最终拼合
        return h(Grid, { container: true }, [
            h(MainAppBar, { title: that.state.title }),
            h(Grid, { container: true, style: { height: 80 } }),
            content,
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
