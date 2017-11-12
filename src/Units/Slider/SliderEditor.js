/*
幻灯片编辑器
如果传入的sliderId为空，那么立即创建一个，并把得到的sliderId同步到props.public.sliderId
props:{
    sliderId,幻灯片Id
    public{
        sliderId,新建幻灯片的Id
    }
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import UserButton from '../../Units/User/UserButton';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Menu, { MenuItem } from 'material-ui/Menu';
import FontA from 'react-fa';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';

import MyUpload from '../../Utils/MyUpload';
import SliderPage from '../../Units/Slider/SliderPage';



const style = theme => ({
    sliderBox: {
        marginTop: 32,
    },
    textField: {
        width: '100%',
        marginTop: 8,
        fontSize: 14,
    },
    card: {
        borderRadius: 4,
        boxShadow: '0 4px 8px #CCC',
        padding: 20,
        paddingTop: 0,
    },
    sliderLabel: {
        fontSize: 14,
        margin: '8px 0',
    },
    pageLabel: {
        fontSize: 10,
    },
    sliderLabel2: {
        fontSize: 12,
        fontWeight: 100,
        color: '#AAA',
        marginLeft: 8,
    },
    pageList: {
        width: '100%',
    },
});

//元件
class com extends Component {
    state = {
        slider: null,
    };

    componentDidMount = async function() {
        let that = this;
        if(that.props.sliderId) {
            that.getSlider(that.props.sliderId);
        } else {
            that.newSlider();
        };
    };

    //获取slider
    getSlider = (id) => {
        let that = this;
        if(!id) return;
        global.$wd.sync().ref(`slider/${id}`).on('value', (shot) => {
            that.setState({
                slider: shot.val(),
            });
        });
    };

    //创建空的slider，保存到public和slider
    newSlider = () => {
        let that = this;
        global.$wd.sync().ref(`slider`).push({
            title: '',
            text: '',
        }).then((res) => {
            let key = res.key();
            that.props.public ? that.props.public.sliderId = key : null;
            global.$snackbar.fn.show('创建演示成功', 2000);
            that.getSlider(key);
        });
    };

    //创建单个page页面,页面顺序应提前设定好，这里不会考虑
    addPage = (page) => {
        let that = this;
        let id = that.props.sliderId;
        if(!id) return;
        let ref = global.$wd.sync().ref(`slider/${id}/pages`);
        ref.push(page).then(function(shot) {
            that.setStatePage(page, shot.key());
        }).catch(function(err) {
            global.$snackbar.fn.show('创建演示页面失败', 2000);
        });
    };

    //更新单个page数据，页面顺序应提前设定好，这里不会考虑
    updatePage = (page, id) => {
        let that = this;
        if(!id) {
            that.addPage(page);
            return;
        };
        let ref = global.$wd.sync().ref(`slider/${id}/pages`);
        ref.update({ id: page }).then(function(shot) {
            that.setStatePage(page, id);
        }).catch(function(err) {
            global.$snackbar.fn.show('更新演示页面失败', 2000);
        });
    };

    //更新state中的page
    setStatePage = (page, id) => {
        let that = this;
        if(!that.state.slider) return;
        if(!that.state.slider) that.state.slider.pages = {};
        that.state.slider.pages[id] = page;
        that.setState({ slider: that.state.slider });
    };

    //通过图像添加一个页面
    createPageByImg = (file) => {
        let that = this;
        let sid = that.props.sliderId || that.props.public.sliderId;
        if(!sid) return;
        let ref = global.$wd.sync().ref(`slider/${sid}/pages/`);
        ref.push({
            index: file.index,
        }).then((shot) => {
            file.pageWdRef = `slider/${sid}/pages/${shot.key()}`;
        });
    };

    //自动排序修正index,读取再重新设定
    autoSortPage = () => {
        let that = this;
        let sid = that.props.sliderId || that.props.public.sliderId;
        if(!sid) return;
        let ref = global.$wd.sync().ref(`slider/${sid}/pages/`);
        ref.once('value').then((shot) => {
            let data = shot.val();
            let len = 0;
            for(let key in data) {
                data[key].index = len;
                len++;
            };
            global.$wd.sync().ref(`slider/${sid}/pages/`).update(data || {});
        });
    };

    //上传单个背景图片成功
    uploadImgSuccess = (file) => {
        if(!file.pageWdRef) return;
        let ref = global.$wd.sync().ref(file.pageWdRef);
        ref.update({
            bgUrl: `http://${file.url}`,
        });
    };


    render() {
        let that = this;
        const css = that.props.classes;
        let stream = this.props.wdStream;
        let slider = that.state.slider;
        let sid = that.props.sliderId || that.props.public.sliderId;

        let pageElArr = [];
        if(slider && slider.pages) {
            for(let key in slider.pages) {
                let page = slider.pages[key];
                console.log('>>>>uuuu', page);
                pageElArr.push(h(SliderPage, {
                    wdRef: `slider/${sid}/pages/${key}`,
                    data: page,
                    mode: 'edit',
                }));
            };
        };

        return h('div', {
            className: css.sliderBox,
        }, [
            h('div', {
                className: css.sliderLabel,
            }, [
                h('span', '编辑演示'),
                h('span', {
                    className: css.sliderLabel2,
                }, '以下修改自动保存，无须手动')
            ]),
            h('div', {
                className: css.pageList,
            }, pageElArr),
            h('div', { style: { height: 16 } }),
            h(MyUpload, {
                raised: true,
                color: 'primary',
                label: ' 新增页面图片',
                style: { padding: '8px 16px', display: 'inline-block' },
                multiple: true,
                onChange: that.createPageByImg,
                success: that.uploadImgSuccess,
            }),
            pageElArr.length > 0 ? h(Button, {
                style: { marginLeft: 8 },
                onClick: () => {
                    that.autoSortPage();
                },
            }, '自动排序') : undefined,
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
