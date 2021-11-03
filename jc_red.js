/*
双十一无门槛红包🧧
ck1助力 作者
其余助力ck1
https://u.jd.com/yIDzgtC
跳转到app 可查看助力情况
cron 0 0,12,18 * * * gua_1111RedEnvelope.js
*/

const $ = new Env('双十一无门槛红包🧧');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
const Faker = $.isNode() ? require('./utils/sign_graphics_validate.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

rebateCode = 'yIDzgtC'
message = ''
newCookie = ''
resMsg = ''
const activeEndTime = '2021/11/12 00:00:00+08:00';//活动结束时间
let nowTime = new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000;
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }
    if (nowTime > new Date(activeEndTime).getTime()) {
        //活动结束后弹窗提醒
        $.msg($.name, '活动已结束', `请删除此脚本\n咱江湖再见`);
        if ($.isNode()) await notify.sendNotify($.name + '活动已结束', `请删除此脚本\n咱江湖再见`);
        return
    }
    $.shareCode = 'Xg2Q3'
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            await getUA(i)
            await run();
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

async function run() {
    try {
        resMsg = ''
        let s = 1
        let t = 1
        do {
            $.flag = 0
            newCookie = ''
            await getUrl()
            if (!$.url1) {
                console.log('获取url1失败')
                t = 0
                break
            }
            await getUrl1()
            if (!$.url2) {
                console.log('获取url2失败')
                t = 0
                break
            }
            $.actId = $.url2.match(/mall\/active\/([^/]+)\/index\.html/) && $.url2.match(/mall\/active\/([^/]+)\/index\.html/)[1] || ''
            if (Faker) {
                let arr = await Faker.getBody($.UA, $.url2)
                await getEid(arr)
            }
            if (!$.eid) {
                $.eid = -1
            }

            await getCoupons('', 1)
            s++
        } while ($.flag == 1 && s < 5)
    } catch (e) {
        console.log(e)
    }
}

function getCoupons(shareId = '', type = 1) {
    let url= `https://api.m.jd.com/api?functionId=getCoupons&appid=u&_=${Date.now()}&loginType=2&body={%22platform%22:4,%22unionActId%22:%2231134%22,%22actId%22:%22${$.actId}%22,%22d%22:%22${rebateCode}%22,%22unionShareId%22:%22${shareId}%22,%22type%22:${type},%22eid%22:%22${$.eid}%22}&client=apple&clientVersion=8.3.6`

    return new Promise(resolve => {
        let opts = {
            url: url,
            headers: {
                "Accept-Language": "zh-cn",
                "Accept-Encoding": "gzip, deflate, br",
                'Cookie': `${cookie} ${newCookie}`,
                "User-Agent": $.UA,
                "referer": $.url2,
            }
        }
        $.get(opts, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.toStr(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    // console.log(data)
                    let res = $.toObj(data, data);
                    if (typeof res == 'object') {
                        if (res.msg) console.log(res.msg)
                        if (res.msg.indexOf('上限') === -1 && res.msg.indexOf('登录') === -1) {
                            $.flag = 1
                        }
                        if (shareId && typeof res.data !== 'undefined' && typeof res.data.joinNum !== 'undefined') {
                            console.log(`当前${res.data.joinSuffix}:${res.data.joinNum}`)
                        }
                        if (res.code == 0 && res.data) {
                            let msg = ''
                            if (res.data.type == 1) {
                                msg = `获得[红包]🧧${res.data.discount}元 使用时间:${$.time('yyyy-MM-dd', res.data.beginTime)} ${$.time('yyyy-MM-dd', res.data.endTime)}`
                            } else if (res.data.type == 3) {
                                msg = `获得[优惠券]🎟️满${res.data.quota}减${res.data.discount} 使用时间:${$.time('yyyy-MM-dd', res.data.beginTime)} ${$.time('yyyy-MM-dd', res.data.endTime)}`
                            } else if (res.data.type == 6) {
                                msg = `获得[打折券]]🎫满${res.data.quota}打${res.data.discount * 10}折 使用时间:${$.time('yyyy-MM-dd', res.data.beginTime)} ${$.time('yyyy-MM-dd', res.data.endTime)}`
                            } else {
                                msg = `获得[未知]🎉${res.data.quota || ''} ${res.data.discount} 使用时间:${$.time('yyyy-MM-dd', res.data.beginTime)} ${$.time('yyyy-MM-dd', res.data.endTime)}`
                                console.log(data)
                            }
                            if (msg) {
                                resMsg += msg + '\n'
                                console.log(msg)
                            }
                        }
                    } else {
                        console.log(data)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function shareUnionCoupon() {
    return new Promise(resolve => {
        let opts = {
            url: `https://api.m.jd.com/api?functionId=shareUnionCoupon&appid=u&_=${Date.now()}&loginType=2&body={%22unionActId%22:%2231134%22,%22actId%22:%22${$.actId}%22,%22platform%22:4,%22unionShareId%22:%22${$.shareCode}%22,%22d%22:%22${rebateCode}%22,%22supportPic%22:2,%22supportLuckyCode%22:0,%22eid%22:%22${$.eid}%22}&client=apple&clientVersion=8.3.6`,
            headers: {
                "Accept-Language": "zh-cn",
                "Accept-Encoding": "gzip, deflate, br",
                'Cookie': `${cookie} ${newCookie}`,
                "User-Agent": $.UA,
            }
        }
        $.get(opts, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.toStr(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    console.log(resp.headers['set-cookie'])
                    let res = $.toObj(data, data);
                    if (typeof res == 'object') {
                        if (res.code == 0 && res.data && res.data.shareUrl) {
                            $.shareCode = res.data.shareUrl.match(/yIDzgtC\?s=([^&]+)/) && res.data.shareUrl.match(/yIDzgtC\?s=([^&]+)/)[1] || ''
                            console.log('分享码:' + $.shareCode)
                            if ($.shareCode) console.log(`以下账号会助力【京东账号${$.index}】${$.nickName || $.UserName}`)
                        }
                    } else {
                        console.log(data)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}


function getUrl1() {
    return new Promise(resolve => {
        const options = {
            url: $.url1,
            followRedirect: false,
            headers: {
                'Cookie': `${cookie} ${newCookie}`,
                "User-Agent": $.UA
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                setActivityCookie(resp)
                $.url2 = resp && resp['headers'] && (resp['headers']['location'] || resp['headers']['Location'] || '') || ''
                $.url2 = decodeURIComponent($.url2)
                $.url2 = $.url2.match(/(https:\/\/prodev[\.m]{0,}\.jd\.com\/mall[^'"]+)/) && $.url2.match(/(https:\/\/prodev[\.m]{0,}\.jd\.com\/mall[^'"]+)/)[1] || ''
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function getUrl() {
    return new Promise(resolve => {
        const options = {
            url: `https://u.jd.com/${rebateCode}?s=${$.shareCode}`,
            followRedirect: false,
            headers: {
                'Cookie': `${cookie} ${newCookie}`,
                "User-Agent": $.UA
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                newCookie += " deviceName=Safari; deviceOS=ios; deviceOSVersion=15.1; deviceVersion=604.1;"
                newCookie += " mba_muid=1447423713;"
                newCookie += " mba_sid=16359050140249425095654128562.3;"
                newCookie += " shshshfp=4b2a83960034dc4a78c63f91b0ccde3d;"
                newCookie += " shshshfpa=49260240-80b1-6488-9713-c00ab7f5e627-1634821968;"
                newCookie += " shshshfpb=yRhjbDbLkCyz8FDhHxOuqXQ%3D%3D;"
                newCookie += " sc_width=390;"
                newCookie += " pwdt_id=" + cookie.split("pt_pin=")[1]
                setActivityCookie(resp)
                $.url1 = data.match(/(https:\/\/u\.jd\.com\/jda[^']+)/) && data.match(/(https:\/\/u\.jd\.com\/jda[^']+)/)[1] || ''
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function setActivityCookie(resp) {
    let setcookies = resp && resp['headers'] && (resp['headers']['set-cookie'] || resp['headers']['Set-Cookie'] || '') || ''
    let setcookie = ''
    if (setcookies) {
        if (typeof setcookies != 'object') {
            setcookie = setcookies.split(',')
        } else setcookie = setcookies
        for (let ck of setcookie) {
            let name = ck.split(";")[0].trim()
            if (name.split("=")[1]) {
                if (newCookie.indexOf(name.split("=")[1]) == -1) newCookie += name.replace(/ /g, '') + '; '
            }
        }
    }
}

function getEid(arr) {
    return new Promise(resolve => {
        const options = {
            url: `https://gia.jd.com/fcf.html?a=${arr.a}`,
            body: `d=${arr.d}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "User-Agent": $.UA
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`fcf: API查询请求失败 ‼️‼️`)
                } else {
                    if (data.indexOf("*_*") > 0) {
                        data = data.split("*_*", 2);
                        data = JSON.parse(data[1]);
                        $.eid = data.eid
                    } else {
                        console.log(`京豆api返回数据为空，请检查自身原因`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function getUA(i) {
    if (i / 2 == 0) {
        $.UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1`
    } else {
        $.UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1`
    }
}

function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}

/**
 * 获取url参数值
 * @param url
 * @param name
 * @returns {string}
 */
function getUrlData(url, name) {
    if (typeof URL !== "undefined") {
        let urls = new URL(url);
        let data = urls.searchParams.get(name);
        return data ? data : '';
    } else {
        const query = url.match(/\?.*/)[0].substring(1)
        const vars = query.split('&')
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=')
            if (pair[0] === name) {
                // return pair[1];
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
}

function decrypt(time, stk, type, url) {
    stk = stk || (url ? getUrlData(url, '_stk') : '')
    if (stk) {
        const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
        let hash1 = '';
        if ($.fingerprint && $.token && $.enCryptMethodJD) {
            hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
        } else {
            const random = '5gkjB6SpmC9s';
            $.token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
            $.fingerprint = 5287160221454703;
            const str = `${$.token}${$.fingerprint}${timestamp}${$.appId}${random}`;
            hash1 = $.CryptoJS.SHA512(str, $.token).toString($.CryptoJS.enc.Hex);
        }
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length -1 ? '' : '&'}`;
        })
        const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
        // console.log(`\nst:${st}`)
        // console.log(`h5st:${["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat($.appId.toString()), "".concat(token), "".concat(hash2)].join(";")}\n`)
        return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
    } else {
        return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
    }
}

// prettier-ignore
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}


