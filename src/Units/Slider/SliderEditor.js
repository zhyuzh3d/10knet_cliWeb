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



const style = theme => ({
    cardsBox: {
        marginTop: 24,
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
    pageLabel: {
        fontSize: 10,
    }
});

//元件
class com extends Component {
    state = {
        slider: null,
    };

    componentDidMount = async function() {
        let that = this;
        if(that.props.sliderId) {
            that.getSlider();
        } else {
            that.newSlider();
        };
    };

    //获取slider
    getSlider = () => {
        let that = this;
        let id = that.props.sliderId;
        if(!id) return;
        global.$wd.sync().ref(`slider/${id}`).once('value').then(function(shot) {
            that.setState({
                slider: shot.val(),
            })
        }).catch(function(err) {
            global.$snackbar.fn.show('读取演示失败', 2000);
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
            that.setState({
                silder: {
                    id: key,
                    title: '',
                    text: '',
                }
            });
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

    //添加一张或多张图片，自动创建多个pages
    addImgs = () => {

    };

    //通过图像添加一个页面
    createPageByImg = (file) => {
        console.log('>>>createPageByImg', file);
    };


    render() {
        let that = this;
        const css = that.props.classes;
        let stream = this.props.wdStream;

        return h('div', {
            className: css.cardsBox,
        }, [
            h(MyUpload, {
                raised: true,
                color: 'primary',
                label: ' 上传页面图片',
                style: { padding: '8px 16px' },
                multiple: true,
                onChange: that.createPageByImg,
            }),
            h('div', {
                className: css.pageLabel,
            }, 'PAGE-1'),
            h('div', {
                className: css.card,
            }, [
                false && h(TextField, {
                    className: css.textField,
                    label: '页面标题',
                    placeholder: '画面顶部显示的标题,32字以内',
                    value: that.state.slider ? that.state.slider.title : '',
                    onChange: (e) => { that.setState({ title: e.target.value }) },
                }),
                false && h(TextField, {
                    className: css.textField,
                    label: '页面文字',
                    multiline: true,
                    placeholder: '画面中间显示的文字,256字以内',
                    value: that.state.slider ? that.state.slider.text : '',
                    onChange: (e) => { that.setState({ text: e.target.value }) },
                }),
            ]),
        ]);
    }
};

com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
