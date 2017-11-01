let ConfBase = {
    hostName: '',
    hostUrl: '',
    api: (apiPath) => {
        if(window.location.hostname === 'localhost') {
            return `http://localhost:3100${apiPath}`;
        } else {
            return `${window.location.origin}${apiPath}`;
        }
    },
    wd: {
        authDomain: "10knet.wilddog.com",
        syncURL: "https://10knet.wilddogio.com",
        videoAppId: 'wd7304438320qqjfhg',
    },
    regx: {
        phone: /^1\d{10}$/,
        phoneCode: /^\d{6}$/,
        pw: /^[\S]{6,32}$/,
        nick: /^[\S]{1,16}$/,
        assetUrl: /^https?:\/\//,
        assetTitle: /^.{0,64}/,
        assetDesc: /^[\s\S]{0,256}/,
        imgFile: /^.+(?:.[pP][nN][gG]|.[jJ][pP][eE]?[gG]|.[gG][iI][fF])$/,
        videoFile: /^.+(?:.[mM][pP]4)$/,
        postText: /^.{0,64}/,
        postUrl: /^https?:\/\//,
    },
    assetTypes: {
        link: {
            id: 'link',
            name: '链接',
            icon: 'link',
        },
        image: {
            id: 'image',
            name: '图片',
            icon: 'file-photo-o',
        },
        file: {
            id: 'file',
            name: '文件',
            icon: 'file-zip-o',
        },
        video: {
            id: 'video',
            name: '视频',
            icon: 'file-video-o',
        },
    }
};



//需要拼接的设定
const Conf = Object.assign(ConfBase, {
    defaultIcon: ConfBase.hostUrl + '/imgs/img.png',
});




export default Conf;
