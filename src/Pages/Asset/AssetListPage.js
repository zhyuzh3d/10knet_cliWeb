/*
篮子内素材的列表
store:{
    userId: 用户ID，读取不同人的篮子列表,
    wdRef: 数据路径`basket/${item.id}`,
    basketId: 篮筐ID,
    appBarTitle: 页面标题,
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import NavBar from '../../Units/MainAppBar/NavBar';
import AssetList from '../../Units/Asset/AssetList';

const style = theme => ({});

//元件
class com extends Component {
    state = {
        appBarTitle: '素材列表',
        assets: null,
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
        let that = this;
        let userId = global.$store('AssetListPage', 'userId');
        let wdRef = global.$store('AssetListPage', 'wdRef');
        let basketId = global.$store('AssetListPage', 'basketId');
        let appBarTitle = global.$store('AssetListPage', 'appBarTitle');

        let content = h(AssetList, {
            uid: userId,
            wdRef: wdRef,
            basketId: basketId,
        });

        return h('div', { style: { height: '100%' } }, [
            h(NavBar, { title: `[ ${appBarTitle||that.state.appBarTitle} ]` }),
            h('div', { style: { margin: 0, height: 'calc(100% - 48px)' } }, content),
        ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
