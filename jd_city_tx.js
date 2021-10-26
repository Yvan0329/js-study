/*
城城领现金
活动时间：2021-05-25到2021-06-03
更新时间：2021-05-24 014:55
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
=================================Quantumultx=========================
[task_local]
#城城领现金
0 0-23/1 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_city.js, tag=城城领现金, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
=================================Loon===================================
[Script]
cron "0 0-23/1 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_city.js,tag=城城领现金
===================================Surge================================
城城领现金 = type=cron,cronexp="0 0-23/1 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_city.js
====================================小火箭=============================
城城领现金 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_city.js, cronexpr="0 0-23/1 * * *", timeout=3600, enable=true
 */
const $ = new Env('城城领现金');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//自动抽奖 ，环境变量  JD_CITY_EXCHANGE
let exchangeFlag = $.getdata('jdJxdExchange') || !!0;//是否开启自动抽奖，建议活动快结束开启，默认关闭
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let inviteCodes = ['']
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    await requireConfig();
    if (exchangeFlag) {
        console.log(`脚本自动抽奖`)
    } else {
        console.log(`脚本不会自动抽奖，建议活动快结束开启，默认关闭(在6.2日自动开启抽奖),如需自动抽奖请设置环境变量  JD_CITY_EXCHANGE 为true`);
    }

    let cookiePk = []
    // cookiePk[0] = "pt_key=AAJhcMFXADAuxVRTWBkDCnZNyVQkyRiBzuFM3TfaiT75fkwXIQ3cM9ElfyI9dWiYkYPwoEia5sE;pt_pin=jd_41c107e3616ec;"
    // cookiePk[1] = "pt_key=AAJhb5DZADB2GqerluUEz2TbEjGnQU_Qh67Z9PdKyvL-ZJrxHg-als1eavtF2P1SwjXZ8RSHZHI;pt_pin=jd_7cbc61f1d054a;"
    // cookiePk[2] = "pt_key=AAJhb5CGADClbQNTNCPMeU3iYPIJzYjBjDr7sw6cU8LHEeXKK91-ceP8e3HF0f_ksx9YXuIDs1k;pt_pin=jd_7cd365c530718;"
    // cookiePk[3] = "pt_key=AAJhb48eADBVpL84ti9Obbk8poohqvFqThzDhkQJD7HeAlXJVy8MrRzxzwcWdnFWMtub-L_9rjA;pt_pin=jd_vfWyQymHSmNA;"
    // cookiePk[4] = "pt_key=AAJhb46yADAuRbpoFGmroW9w1KAAmRLbq7EbcB0TiQHk5oNod5Q29z_YM5_x8rRdi5_BYzVGl7Y;pt_pin=jd_wUkcTSUqAhmr;"
    // cookiePk[5] = "pt_key=AAJhb45KADClRsJfxWWpV_J2BaGTt3gyTUQmsrRvTJEuwRksLUA0dqdho6U4mGmqS1_mBDhpDUw;pt_pin=jd_6db358197e139;"
    // cookiePk[6] = "pt_key=AAJhb44LADBkc4VPY31YphWBQbsILZRvGPvYyNQM1AxWzCZ9VEB6Hbhcz9hfIGGstGyY50tJfLI;pt_pin=jd_448d07b990c2a;"
    // cookiePk[7] = "pt_key=AAJhcM-RADBE2hlAQql_0rb1PGqz64wOttv4ZQ8yJBSDD6y6bzYEDdWA5j1BR8K2MxUQW4lAhTo;pt_pin=1808746762-486237;"

    for (let i = 0; i < cookiesArr.length; i++) {
        //查询队伍信息，邀请id，人数
        cookie = cookiesArr[i];
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
        $.index = i + 1;
        $.isLogin = true;
        $.nickName = '';
        $.NextCK = true
        message = '';
        console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
        // 提现
        await getInfo("16", "1332", '', true);
        for (let j = 0; j < 2000; j++) {
            if (!$.NextCK) {
                break
            }
            await tixian()
            await $.wait(50)
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function tixian() {
    let body = {"channel": 1, "code": "071sDOkl2yqxZ74Ut6ll2G2lW53sDOko"}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_withdraw", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                    console.log(data)
                    data = JSON.parse(data);
                    if (data.data.bizCode == -521) {
                        $.NextCK = false
                    }else{
                        $.NextCK = true
                    }
                    // await pkJoinGroup("E7unasWZHpH_u5GbYemand6rCpyyENyoJ4swB9ENd_e8hWNd9UZPxeZGig",data.data.result.secretp);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function chaxunrenshu() {
    let body = {}
    console.log("111")
    return new Promise((resolve) => {
        $.post(taskPostUrl("travel_pk_getHomeData", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        if (data.data.result.groupInfo.memberList.length == 5) {
                            $.memberListLength = 0
                        } else {
                            $.memberListLength = data.data.result.groupInfo.memberList.length
                        }
                        // await pkJoinGroup("E7unasWZHpH_u5GbYemand6rCpyyENyoJ4swB9ENd_e8hWNd9UZPxeZGig",data.data.result.secretp);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function kaishizudui() {
    let body = {}
    console.log("开始组队")
    return new Promise((resolve) => {
        $.post(taskPostUrl("travel_pk_getHomeData", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        data = JSON.parse(data);
                        console.log(data.data.result.groupInfo)
                        $.groupJoinInviteId = data.data.result.groupInfo.groupJoinInviteId
                        $.memberListLength = data.data.result.groupInfo.memberList.length
                        console.log("现在队伍的人数" + data.data.result.groupInfo.memberList.length)
                        // await pkJoinGroup("E7unasWZHpH_u5GbYemand6rCpyyENyoJ4swB9ENd_e8hWNd9UZPxeZGig",data.data.result.secretp);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function dddd() {
    let body = {"inviteId": $.groupJoinInviteId}
    return new Promise((resolve) => {
        $.post(taskPostUrl("travel_pk_getHomeData", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        data = JSON.parse(data);
                        await pkJoinGroup($.groupJoinInviteId, data.data.result.secretp);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function toupiao() {
    let body = {"votFor": "B"}
    return new Promise((resolve) => {
        $.post(taskPostUrl("travel_pk_votFor", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        console.log(data)
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function pkJoinGroup(inviteId, secretp) {
    let body = {
        "inviteId": inviteId,
        "confirmFlag": "1",
        "ss": {"extraData": {"log": "", "sceneid": "HYGJZYh5"}, "secretp": secretp, "random": "92018454"}
    }
    return new Promise((resolve) => {
        $.post(taskPostUrl("travel_pk_joinGroup", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        console.log("助力结果")
                        data = JSON.parse(data);
                        if (data.data.bizCode == 0) {
                            console.log("助力成功")
                            $.memberListLength = $.memberListLength + 1
                        } else {
                            console.log("助力失败，原因，", data.data.bizMsg)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskPostUrl(functionId, body) {
    console.log(body)
    return {
        url: `${JD_API_HOST}`,
        body: `functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&uuid=1b0b5a68d59b6c94b54110b8bbb7b4e0ea9ed637`,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
}

function getInfo(lbsCity, realLbsCity, inviteId, flag = false) {
    let body = {
        "lbsCity": lbsCity,
        "realLbsCity": realLbsCity,
        "inviteId": inviteId,
        "headImg": "",
        "userName": "",
        "taskChannel": "1"
    }
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_getHomeData", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        data = JSON.parse(data);
                        $.inviteId = data.data.result.userActBaseInfo.inviteId
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function receiveCash(roundNum) {
    let body = {"cashType": 1, "roundNum": roundNum}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_receiveCash", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        console.log(`领红包结果${data}`);
                        data = JSON.parse(data);
                        if (data['data']['bizCode'] === 0) {
                            console.log(`获得 ${data.data.result.currentTimeCash} 元，共计 ${data.data.result.totalCash} 元`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}


function getInviteInfo() {
    let body = {}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_masterMainData", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        // console.log(data)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function city_lotteryAward() {
    let body = {}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_lotteryAward", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        console.log(`抽奖结果：${data}`);
                        data = JSON.parse(data);
                        if (data['data']['bizCode'] === 0) {
                            const lotteryNum = data['data']['result']['lotteryNum'];
                            resolve(lotteryNum);
                        }
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

function readShareCode() {
    console.log(`开始`)
    return new Promise(async resolve => {
        $.get({url: ``, 'timeout': 10000}, (err, resp, data) => {
            try {
                if (err) {
                    //console.log(`${JSON.stringify(err)}`)
                    //console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
        await $.wait(10000);
        resolve()
    })
}

//格式化助力码
function shareCodesFormat() {
    return new Promise(async resolve => {
        // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
        $.newShareCodes = [];
        if ($.shareCodesArr[$.index - 1]) {
            $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
        } else {
            console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
            const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
            $.newShareCodes = inviteCodes[tempIndex].split('@');
        }
        // const readShareCodeRes = await readShareCode();
        // if (readShareCodeRes && readShareCodeRes.code === 200) {
        //   $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
        // }
        console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
        resolve();
    })
}

function requireConfig() {
    return new Promise(resolve => {
        console.log(`开始获取${$.name}配置文件\n`);
        //Node.js用户请在jdCookie.js处填写京东ck;
        let shareCodes = [];
        if ($.isNode()) {
            if (process.env.JD_CITY_EXCHANGE) {
                exchangeFlag = process.env.JD_CITY_EXCHANGE || exchangeFlag;
            }
            if (process.env.CITY_SHARECODES) {
                if (process.env.CITY_SHARECODES.indexOf('\n') > -1) {
                    shareCodes = process.env.CITY_SHARECODES.split('\n');
                } else {
                    shareCodes = process.env.CITY_SHARECODES.split('&');
                }
            }
        }
        console.log(`共${cookiesArr.length}个京东账号\n`);
        $.shareCodesArr = [];
        if ($.isNode()) {
            Object.keys(shareCodes).forEach((item) => {
                if (shareCodes[item]) {
                    $.shareCodesArr.push(shareCodes[item])
                }
            })
        }
        console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
        resolve()
    })
}

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data["retcode"] === 13) {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        if (data["retcode"] === 0) {
                            $.nickName = (data["base"] && data["base"].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName;
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
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

function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
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

// prettier-ignore
function Env(t, e) {
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
