import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import ButtonBase from 'material-ui/ButtonBase';

import NavBar from '../../Units/MainAppBar/NavBar';
import AssetList from '../../Units/Asset/AssetList';
import style from './_style';

//元件
class com extends Component {
    state = {
        assets: null,
    };

    //界面生成之前，读取数据
    componentWillMount = async function() {};

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {};

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        var userId = global.$store('AssetListPage', 'userId');

        //最终拼合
        return h(Grid, { container: true, className: css.page }, [
            h(NavBar, {
                title: '素材列表',
            }),
            h('div', { style: { height: 48 } }),
            h(Grid, { container: true, justify: 'center' }, [
                h(Grid, { item: true, xs: 12, md: 10, lg: 8 }, h(AssetList, {
                    uid: userId,
                })),
            ]),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
