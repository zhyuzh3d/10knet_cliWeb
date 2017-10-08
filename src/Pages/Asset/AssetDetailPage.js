import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';

import NavBar from '../../Units/MainAppBar/NavBar';
import AssetDetail from '../../Units/Asset/AssetDetail';
import PostList from '../../Units/Post/PostList';


import style from './_style';

//元件
class com extends Component {
    state = {
        assets: null,
        contentHeight: window.innerHeight - 48,
    };

    //界面生成之前，读取数据
    componentWillMount = async function() {};

    //界面完成后的初始化函数-退出现有账号
    componentDidMount = async function() {
        let that = this;
        window.addEventListener('resize', () => {
            that.setState({ contentHeight: window.innerHeight });
        });
    };

    //渲染实现
    render() {
        let that = this;
        const css = that.props.classes;
        var assetId = global.$store('AssetDetailPage', 'assetId');

        //最终拼合
        let aa = h(Grid, { container: true }, [
            h(NavBar, {
                title: '素材详情',
            }),
            h('div', { style: { height: 48 } }),
            h(Grid, { container: true, justify: 'center' }, [
                h(Grid, { item: true, xs: 12, md: 10, lg: 8 }, [
                    h(AssetDetail, { assetId: assetId }),
                ]),
                h(Grid, { item: true, xs: 12, md: 10, lg: 8, style: { marginLeft: -30 } }, [
                    h('div', { className: css.postsLabel }, '最近跟帖'),
                    h(PostList, { wdRef: `asset/${assetId}/post` }),
                ]),
            ]),
        ]);

        let content = h(Grid, {
            container: true,
            style: { height: that.state.contentHeight, margin: 16, },
        }, [
            h(Grid, {
                container: true,
                justify: 'center',
                style: {
                    height: that.state.contentHeight,
                    overflowY: 'auto',
                }
            }, [
                h(Grid, { item: true, xs: 12, md: 10, lg: 8 }, [
                    h(AssetDetail, { assetId: assetId }),
                ]),
                h(Grid, { item: true, xs: 12, md: 10, lg: 8 }, [
                    h('div', { className: css.postsLabel }, '最近跟帖'),
                    h(PostList, { wdRef: `asset/${assetId}/post` }),
                ]),
            ]),
        ]);

        //最终拼合
        return h(Grid, { container: true }, [
            h(NavBar, {
                title: '素材详情',
            }),
            h(Grid, { container: true, style: { height: 64 } }),
            content,
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
