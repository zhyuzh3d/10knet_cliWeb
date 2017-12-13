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

import Button from 'material-ui/Button';
import FontA from 'react-fa';


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

    //接收到sliderId
    componentWillReceiveProps = async function() {
        let that = this;
        if(that.props.sliderId) {
            that.getSlider(that.props.sliderId);
            that.props.public.sliderId = that.props.sliderId;
        };
    };

    //获取slider，对page根据index排序
    getSlider = (id) => {
        let that = this;
        if(!id) return;
        global.$wd.sync().ref(`slider/${id}`).on('value', (shot) => {
            let data = shot.val();
            let newData = data;

            if(data && data.pages) {
                newData.pages = global.$fn.sortObjByKey(data.pages, 'pos');
            };
            that.setState({
                slider: newData,
            });
        });
    };

    //创建空的slider，保存到public和slider
    newSlider = () => {
        let that = this;

        let cuser = global.$wd.auth().currentUser;
        if(!cuser) {
            global.$alert.fn.show('您还没有注册和登录', '请在右侧面板登录或注册');
            global.$app.toggleMainPart(true);
            return;
        };

        global.$wd.sync().ref(`slider`).push({
            author: cuser.uid,
            title: '',
            text: '',
        }).then((res) => {
            let key = res.key();

            console.log('>>>newsilder', key);
            if(that.props.public) {
                that.props.public.sliderId = key
            };
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
    nouse = {};
    createPageByImg = (file) => {
        let that = this;
        let sid = that.props.sliderId || that.props.public.sliderId;
        if(!sid) return;
        let ref = global.$wd.sync().ref(`slider/${sid}/pages/`);

        //计算slider已有页面数量
        let baseN = 0;
        if(that.state.slider && that.state.slider.pages) {
            for(let key in that.state.slider.pages) {
                baseN++;
                that.nouse.a = key;
            }
        };

        ref.push({
            pos: baseN + Number(file.index),
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
            let arr = global.$fn.sortObjByKey(data, 'pos');
            let newData = {};
            arr.forEach((item, index) => {
                item.pos = index;
                newData[item.key] = item;
            });
            global.$wd.sync().ref(`slider/${sid}/pages/`).update(newData || {});
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
        let slider = that.state.slider;
        let sid = that.props.sliderId || that.props.public.sliderId;
        console.log('>>slider render', sid);

        let pageElArr = [];
        if(slider && slider.pages) {
            slider.pages.forEach((page, index) => {
                pageElArr.push(h(SliderPage, {
                    pageId: page.key,
                    wdRef: `slider/${sid}/pages/${page.key}`,
                    data: page,
                    mode: 'edit',
                }));
            });
        };

        return h('div', {
            className: css.sliderBox,
        }, !sid ? [
            h(Button, {
                color: 'accent',
                raised: true,
                style: { padding: '8px 16px' },
                onClick: () => {
                    that.newSlider();
                },
            }, [
                h(FontA, {
                    name: 'caret-square-o-right',
                    style: { marginRight: 8 }
                }),
                h('span', '创建演示'),
            ])
        ] : [
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
