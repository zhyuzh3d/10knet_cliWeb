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
        pw: /^.{6,32}$/,
    },
};

//需要拼接的设定
const Conf = Object.assign(ConfBase, {
    defaultIcon: ConfBase.hostUrl + '/imgs/img.png',
});




export default Conf;
