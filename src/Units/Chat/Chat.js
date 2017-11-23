/*
单个聊天组件ListItem
props:{
    data:标准的单条chat数据，author不需要展开
}
*/
import { Component } from 'react';
import h from 'react-hyperscript';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import Moment from 'react-moment';

import UserButton from '../../Units/User/UserButton';

const style = theme => ({
    comBox: {
        padding: 0,
        margin: 0,
        color: '#FFF',
        fontSize: 12,
    },
    infoLine: {
        padding: '4px 16px',
    },
    txtLine: {
        fontSize: '0.9rem',
        color: '#333',
    },
    urlLine: {
        position: 'relative',
    },
    alink: {
        marginLeft: 40,
        cursor: 'pointer',
    },
    img: {
        maxHeight: 64,
        maxWidth: 256,
        border: '1px solid #888',
    },
    link: {
        fontSize: '0.6rem',
        cursor: 'pointer',
        padding: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        textAlign: 'left',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
    },
    linkBtn: {

    },
    time: {
        fontSize: '10px',
        color: '#AAA',
        verticalAlign: 'middle',
        fontWeight: 100,
        marginLeft: 16,
    },
});

//元件
class com extends Component {
    state = {
        data: {},
    };

    componentDidMount = async function() {};

    render() {
        let that = this;
        const css = that.props.classes;
        let data = that.props.data || {};
        let regx = global.$conf.regx.imgFile;

        return h('div', {
            className: css.comBox
        }, [
            h('div', {
                className: css.infoLine,
            }, [
                h(UserButton, {
                    userId: data ? data.author : null,
                    nameStyle: {
                        color: '#CCC',
                        fontWeight: 300,
                    },
                }),
                data.text ? h('span', data.text) : undefined,
                h(Moment, {
                    className: css.time,
                    format: 'hh:mm:ss'
                }, data.ts),
            ]),

            data.url ? h('div', {
                className: css.urlLine,
            }, [
                h('a', {
                    href: data.url,
                    target: '_blank',
                    className: css.alink,
                }, regx.test(data.url) ? h('img', {
                    className: css.img,
                    src: data.url,
                }) : h(Button, {
                    color: 'primary',
                    raised: true,
                    className: css.linkBtn,
                    style: {
                        margin: '4px 0',
                        minHeight: 24,
                        height: 24,
                        padding: 6,
                    },
                }, [
                    h('span', {
                        className: css.link,
                    }, `附件 : ${data.url}`),
                ])),
           ]) : undefined, ]);
    }
};


com.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(com);
