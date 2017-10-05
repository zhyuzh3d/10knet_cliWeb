let ConfBase = {
    hostName: '',
    hostUrl: '',
    api: (apiPath) => {},
    wd: {
        authDomain: "10knet.wilddog.com",
        syncURL: "https://10knet.wilddogio.com"
    },
    regx: {
        phone: /^1\d{10}$/,
        phoneCode: /^\d{6}$/,
        pw: /^[\S]{6,32}$/,
        nick: /^[\S]{1,16}$/,
        assetUrl: /^https?:\/\//,
        assetTitle: /^.{3,64}/,
        assetDesc: /^[\s\S]{0,512}/,
    },
};

//需要拼接的设定
const Conf = Object.assign(ConfBase, {
    defaultIcon: ConfBase.hostUrl + '/imgs/img.png',
});




export default Conf;
