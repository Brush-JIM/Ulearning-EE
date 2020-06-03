// ==UserScript==
// @name         优学院增强体验脚本
// @namespace    https://greasyfork.org/zh-CN/scripts/383596
// @version      2020.06.03
// @description  自动登录、作业实时自动查重、直播M3U8文件下载、直播流获取、解除Edge兼容性、直播间自动签到、资源增加下载按钮
// @author       Brush-JIM
// @match        *.tongshike.cn/*
// @match        *.ulearning.cn/*
// @match        *://live.polyv.cn/watch/*
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_deleteValue
// @grant        GM.deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @connect      api.polyv.net
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @icon         https://www.ulearning.cn/ulearning/favicon.ico
// @supportURL   https://greasyfork.org/zh-CN/scripts/383596
// @webRequest   [{"selector":"https://hm.baidu.com/*","action":"cancel"}]
// ==/UserScript==

var obj = {
    /*
    如果需要启用相应功能，则将 false 改为 true
    如果需要禁用相应功能，则将 true 改为 false
    */
    Auto_Login: false // true: 启用自动登录，false: 禁用自动登录
    , Pw_Tips: false // true: 跳过弱密码提示，false: 不跳过
    , Work_Check: true // true: 启用作业查重，false: 禁用作业查重
    , Show_M3U8: true // true: 显示直播m3u8文件下载地址，false: 禁用显示
    , Show_Live: true // true: 显示直播流链接，false: 禁用显示
    , Browser_Compatible: false // true: 启用浏览器兼容，false: 禁用浏览器兼容。正常的浏览器无需开启，开启也不会有影响，主要用于Edge浏览器
    , Live_Sign: false // true: 启用直播间自动签到，false: 禁用直播间签到
    , Add_Button: true // true: 启用增加下载按钮，false: 禁用增加按钮；注意！点击“下载”则同时使资源更改为已读状态
}
var Value = {
    userId: '',
    hId: '',
    setItem: null,
    live_url: '',
    chatData: '',
    isLive: '',
    liveStatus: '',
    channelId: '',
    hxml: false
}
var _self = unsafeWindow;
var $ = window.jQuery;
_self.jQuery_ = $;
var func = [function () {
        var cookie = _self.document.cookie
            if (cookie.length > 0) {
                var start = cookie.indexOf(arguments[0] + "=");
                if (start != -1) {
                    start = start + arguments[0].length + 1;
                    var end = cookie.indexOf(";", start);
                    if (end == -1) {
                        end = cookie.length;
                    }
                    return unescape(cookie.substring(start, end).replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent));
                }
            }
            return "";
    }, function () {
        if (typeof GM_getValue === 'function') {
            return new Promise((resolve, reject) => {
                resolve(GM_getValue(arguments[0], arguments[1]));
            })
        } else {
            return GM.getValue(arguments[0], arguments[1]);
        }
    }, function () {
        if (typeof GM_setValue === 'function') {
            GM_setValue(arguments[0], arguments[1]);
        } else {
            GM.setValue(arguments[0], arguments[1]);
        }
    }, function () {
        if (typeof GM_deleteValue === 'function') {
            GM_deleteValue(arguments[0]);
        } else {
            GM.deleteValue(arguments[0]);
        }
    }, function () {
        if (typeof GM_xmlhttpRequest === 'function') {
            GM_xmlhttpRequest(arguments[0]);
        } else {
            GM.xmlHttpRequest(arguments[0]);
        }
    }, function () {
        if (arguments[0] === undefined) {
            func[arguments[1] - 4]('username').then((username) => {
                if (username === undefined) {
                    return func[6].call(window, false, 6);
                } else {
                    return func[arguments[1]].call(window, username, arguments[1])
                }
            })
        } else {
            func[arguments[1] - 4]('password').then((password) => {
                if (password === undefined) {
                    return func[6].call(window, false, 6);
                } else {
                    return func[6].call(window, {
                        'username': arguments[0],
                        'password': password
                    }, 6)
                }
            })
        }
    }, function () {
        if (obj.Auto_Login !== true) {
            return;
        }
        if (arguments[0] === undefined) {
            func[5].call(window, undefined, arguments[1] - 1)
        } else {
            var data = arguments[0];
            if ($('div[class="btn-login"]').length !== 0) {
                if ($('div[class="login-btn-text"]').length !== 0) {
                    if ($("#userLoginModal").length === 0) {
                        $('div[class="login-btn-text"]').click();
                        setTimeout(func[6], 50, data, arguments[1]);
                    } else {
                        if ($("#userLoginModal")[0].style.cssText.search(/display:( |)none/i) !== -1) {
                            $('div[class="login-btn-text"]').click();
                        }
                        if (obj.Auto_Login === true && data !== false) {
                            $('#userLoginName')[0].value = data.username;
                            $('#userPassword')[0].value = data.password;
                            $('button[class="button button-red-solid btn-confirm"]', $('form[id="loginForm"]')).click()
                            setInterval(function () {
                                if ($('div[class="student-tip"]', $('form[id="loginForm"]')).length !== 0) {
                                    if ($('div[class="student-tip"]', $('form[id="loginForm"]'))[0].style.cssText.search(/display:( |)block/i) !== -1) {
                                        func[arguments[0]].call(window, 'username');
                                        func[arguments[0]].call(window, 'password');
                                    }
                                }
                            }, 50, arguments[1] - 3);
                        } else if (obj.Auto_Login === true && data === false) {
                            $('button[class="button button-red-solid btn-confirm"]', $('form[id="loginForm"]')).bind('click', function () {
                                func[2].call(window, 'username', $('#userLoginName')[0].value);
                                func[2].call(window, 'password', $('#userPassword')[0].value);
                            })
                        }
                    }
                } else if ($('.user-control-menu').length !== 0) {
                    $('[data-bind="click: logout, text: publicI18nText.signout"]')[0].innerText = '重新登录';
                    $('[class="user-control-menu"]').append('<a class="user-menu-item" id="resetlogin">重置登录信息</a>');
                    $("[id='resetlogin']").bind('click', function () {
                        func[3].call(window, 'username');
                        func[3].call(window, 'password');
                        alert("重置成功");
                        $('[data-bind="click: logout, text: publicI18nText.signout"]')[0].click();
                    })
                } else {
                    setTimeout(func[6], 50, data, arguments[1]);
                }
            } else {
                setTimeout(func[6], 50, data, arguments[1]);
            }
        }
    }, function () {
        if (obj.Pw_Tips === true) {
            if (window.location.href.indexOf('courseweb.ulearning.cn/ulearning/index.html') !== -1) {
                func[arguments[1] + 1].call(window, '.modal-backdrop {display: none;}');
                func[arguments[1] + 1].call(window, '#bindTip {display: none;}');
            } else if (window.location.href.indexOf('umooc/user/login.do') != -1) {
                window.location.href = 'https://www.ulearning.cn/ulearning/index.html#/index/portal';
            }
        }
    }, function () {
        if (typeof GM_addStyle === 'function') {
            GM_addStyle(arguments[0].replace(/;/g, ' !important;'));
        } else {
            $(function () {
                var head,
                style;
                head = document.getElementsByTagName('head')[0];
                if (head === undefined) {
                    return;
                } else {
                    style = document.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = arguments[0].replace(/;/g, ' !important;');
                    head.appendChild(style);
                }
            })
        }
    }, function () {
        if (obj.Work_Check === true) {
            if ($('textarea').length !== 0 && $('.writing-panel').length !== 0) {
                if (arguments[0] === undefined) {
                    $('button[class="check-duplice"]').attr('style', '');
                    let childNode = document.createElement('div');
                    childNode.setAttribute('class', 'writing-panel-length');
                    childNode.innerHTML = '相似度：<span class="content-size" id ="check_repeat">0</span>%；最后检查时间：<span class="content-size" id="check_endtime">Unknown</span>【Tips：截止提交日期前再次检查，以免其他迟写的同学与自己的相似度大】';
                    $('.writing-panel').append(childNode)
                    arguments[0] = {
                        'old': '',
                        'time': (new Date()).valueOf()
                    };
                    arguments[0].old = $('textarea').attr('placeholder');
                    func[arguments[1] + 1].call(window, arguments[0].old, arguments[1] + 1);
                } else {
                    if ((new Date()).valueOf() - arguments[0].time >= 3000 && arguments[0].old !== $('textarea').attr('placeholder')) {
                        arguments[0].old = $('textarea').attr('placeholder');
                        func[arguments[1] + 1].call(window, arguments[0].old, arguments[1] + 1);
                    }
                }
                setTimeout(func[arguments[1]], 3000, arguments[0], arguments[1]);
            } else if (window.location.hash.indexOf('stuWriting') !== -1) {
                setTimeout(func[arguments[1]], 100, arguments[0], arguments[1]);
            }
        }
    }, function () {
        if (Value.userId === '' || Value.hId === '') {
            if (window.location.hash.match(/#\/stuWriting\/([0-9]*)\/([0-9]*)(\/|)\?([\s\S]*)/i) !== null) {
                Value.userId = window.location.hash.match(/#\/stuWriting\/([0-9]*)\/([0-9]*)(\/|)\?([\s\S]*)/i)[1];
                Value.hId = window.location.hash.match(/#\/stuWriting\/([0-9]*)\/([0-9]*)(\/|)\?([\s\S]*)/i)[2];
                func[arguments[1]].call(window, arguments[0], arguments[1]);
            }
        } else {
            $.ajax({
                type: 'POST',
                url: 'https://homeworkapi.ulearning.cn/stuHomework/getDuplicate',
                data: JSON.stringify({
                    'content': arguments[0],
                    'homeworkID': Value.hId,
                    'userID': Value.userId
                }),
                contentType: "application/json; charset=utf-8",
                success: function () {
                    $('#check_repeat')[0].innerHTML = arguments[0].result;
                    $('#check_endtime')[0].innerHTML = Date().match(/[0-9][0-9][0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)[0];
                }
            })
        }
    }, function () {
        if (window.location.hash.indexOf('stuWriting') !== -1) {
            func[arguments[0] - 2].call(window, undefined, arguments[0] - 2);
        } else {
            setTimeout(func[arguments[0]], 1000, arguments[0]);
        }
    }, function () {
        func[arguments[0] + 5].call(window, arguments[0] + 5)
        func[arguments[0] + 3].call(window, arguments[0] + 3);
        $(function () {
            func[13].call(window, null, undefined, 13);
        });
        func[arguments[0] + 4].call(window, arguments[0] + 4);
    }, function () {
        if (obj.Show_M3U8 !== true) {
            return;
        }
        if (arguments[0] === null) {
            Value.chatData = _self.chatData;
            if (Value.chatData === undefined) {
                return;
            }
            Value.isLive = Value.chatData.isLive;
            Value.liveStatus = Value.chatData.liveStatus;
            if (Value.isLive !== 'end' && Value.liveStatus !== 'end') {
                return;
            }
            Value.channelId = Value.chatData.channelId;
            arguments[0] = 1
                arguments[1] = document.createElement('li');
        }
        var online_url = 'https://api.polyv.net/live/v2/channel/recordFile/' + Value.channelId + '/jsonp/playback-list?callback=jQuery0_1&pageSize=5&_=' + (new Date()).valueOf() + '&page=' + arguments[0];
        if (arguments[0] === 1) {
            arguments[1].innerHTML = '---------- M3U8文件 ----------<br />';
        }
        var li = arguments[1];
        li.className = 'web-flower';
        func[arguments[2] - 9].call(this, {
            method: 'GET',
            url: online_url,
            onload: function (response) {
                var data = response.responseText.match(/jQuery0_1\((.*)\)/);
                if (data === null) {
                    return;
                }
                data = JSON.parse(data[1]);
                if (data.contents.length === 0 && data.pageNumber === 1) {
                    return;
                }
                for (let a = 0; a < data.contents.length; a++) {
                    li.innerHTML += '<a style="color: white" href="' +
                    data.contents[a].url + '">点击下载 M3U8 文件：' + data.contents[a].title + '</a><br />';
                }
                if (data.totalItems > data.pageNumber * data.pageSize) {
                    func[13].call(window, data.pageNumber + 1, li, 13);
                } else {
                    li.innerHTML += '---------- END ----------<br />'
                    $('ul[class="ppt-chat-list"]').append(li);
                    var ele = document.querySelector('#pptMessage');
                    ele.scrollTop = ele.scrollHeight;
                }
            }
        })
    }, function () {
        if ($('span[class="btn-signed"]').length !== 0) {
            var a = $('span[class="btn-signed"]')[0].getBoundingClientRect();
            var clientX = (a.right + a.left) / 2;
            var clientY = (a.bottom + a.top) / 2;
            var ev = document.createEvent('MouseEvents');
            ev.initMouseEvent('click', true, true, unsafeWindow, 1, clientX, clientY + 100, clientX, clientY, false, false, false, false, 0, null);
            $('span[class="btn-signed"]')[0].dispatchEvent(ev);
        }
    }, function () {
        Value.setItem = _self.sessionStorage.setItem;
        _self.sessionStorage.setItem = function () {
            if (arguments[0] === 'errorCode') {
                var li = document.createElement('li');
                li.style = "color: yellow";
                li.className = 'web-flower';
                li.innerHTML = '------------------------------<br />';
                if (Value.live_url !== '' && obj.Show_Live === true) {
                    li.innerHTML += '检测到直播可能错误<br /><font color="red">插件可能影响直播（如IDM插件），可禁用全部插件后，一个一个开启插件，刷新页面测试</font><br />可使用直播流地址变相拯救：<a style="color: white" target="_blank" href="' + Value.live_url + '">直播链接</a><br />或者尝试使用手机端观看直播<br />';
                    li.innerHTML += '------------------------------<br />';
                } else {
                    li.innerHTML += '检测到直播可能错误<br /><font color="red">插件可能影响直播（如IDM插件），可禁用全部插件后，一个一个开启插件，刷新页面测试</font><br />可尝试使用手机端观看<br />';
                    li.innerHTML += '------------------------------<br />';
                }
                $('ul[class="ppt-chat-list"]').append(li);
                var ele = document.querySelector('#pptMessage');
                ele.scrollTop = ele.scrollHeight;
                return;
            } else {
                return Value.setItem.apply(_self, arguments);
            }
        }
        if (_self.sessionStorage.getItem('errorCode') !== '') {
            _self.sessionStorage.clear();
        }
    }, function () {
        if (obj.Live_Sign === true) {
            if ($('div[class="player-signed"]').length !== 0) {
                var ele = $('div[class="player-signed"]')[0];
                var observerOptions = {
                    attributes: true
                }
                var observer = new MutationObserver(func[arguments[0] - 2]);
                observer.observe(ele, observerOptions);
                func[arguments[0] - 2].call(window);
            } else {
                setTimeout(func[arguments[0]], 1000, arguments[0]);
            }
        }
    }, function () {
        _self.fetch_ = _self.fetch;
        _self.fetch = function () {
            if (arguments[0].indexOf('pull-c1.videocc.net') !== -1) {
                Value.live_url = arguments[0];
                var li = document.createElement('li');
                li.innerHTML = '---------- 直播流地址 ----------<br />';
                li.className = 'web-flower';
                li.innerHTML += '<a style="color: white" target="_blank" href="' + arguments[0] + '">直播流地址【右键复制链接地址】</a><br />';
                li.innerHTML += '---------- END ----------<br />';
                $('ul[class="ppt-chat-list"]').append(li);
                var ele = document.querySelector('#pptMessage');
                ele.scrollTop = ele.scrollHeight;
            }
            return _self.fetch_.apply(_self, arguments);
        }
    }, function () {
        if (obj.Browser_Compatible === true) {
            if (_self.navigator.__defineGetter__) {
                _self.navigator.__defineGetter__("userAgent", function () {
                    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
                });
            } else if (_self.Object.defineProperty) {
                _self.Object.defineProperty(_self.navigator, "userAgent", {
                    get: function () {
                        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
                    }
                });
            }
        }
    }, function () {
        if (typeof _self.XMLHttpRequest.prototype.open_ !== 'function') {
            _self.XMLHttpRequest.prototype.open_ = _self.XMLHttpRequest.prototype.open;
        }
        if (_self.XMLHttpRequest.prototype.change !== true) {
            _self.XMLHttpRequest.prototype.change = true;
            _self.XMLHttpRequest.prototype.open = function () {
                this.addEventListener("readystatechange", () => {
                    if (this.readyState >= 4) {
                        try {
                            setTimeout(func[22], 100, JSON.parse(this.responseText), 0, 22);
                        } catch (e) {}
                    }
                }, false);
                _self.XMLHttpRequest.prototype.open_.apply(this, arguments);
            }
        }
    }, function () {
        if (typeof _self.XMLHttpRequest.prototype.open_ === 'function') {
            _self.XMLHttpRequest.prototype.change = false;
            _self.XMLHttpRequest.prototype.open = _self.XMLHttpRequest.prototype.open_;
        }
    }, function () {
        if (obj.Add_Button !== true) {
            return;
        }
        func[arguments[0] - 13].call(window, '.course-resource-page.student-model .table-groups .table-body .title {max-width: 310px;}', arguments[0] - 13);
        func[arguments[0] - 13].call(window, '.course-resource-page.student-model .table-groups .resource-title {width: 388px;}', arguments[0] - 13);
        func[arguments[0] - 13].call(window, '.course-resource-page .table-resource .resource-operate {width: 170px;padding: 0;}', arguments[0] - 13);
        if (window.location.hash.indexOf('course/resource') !== -1) {
            func[arguments[0] - 2].call(window, arguments[0] - 2);
        }
        window.addEventListener('hashchange', () => {
            if (window.location.hash.indexOf('course/resource') !== -1) {
                if (_self.XMLHttpRequest.prototype.change !== true) {
                    func[19].call(window, 19)
                }
            } else {
                func[20].call(window, 20)
            }
        }, false);
    }, function () {
        if (arguments[0].list === undefined) {
            return;
        }
        if ($('li[class="tr clearfix"]').length === arguments[0].list.length) {
            $(arguments[0].list).each(function () {
                if (arguments[1].location !== null && arguments[1].location !== undefined && arguments[1].location !== '') {
                    $('#download', $('div[class="td resource-operate"]', $('li[class="tr clearfix"]')[arguments[0]]).append('<button id="download" class="button button-resource-view button-red-hollow" data-location="' + arguments[1].location + '" data-title="' + arguments[1].title + '" data-id="' + arguments[1].id + '">下载</button>')).on('click', func[23]);
                }
            })
        } else if (arguments[1] <= 3) {
            setTimeout(func[arguments[2]], 500, arguments[0], arguments[1] + 1, arguments[2]);
        }
    }, function () {
        console.log(this);
        var a = $(this).attr('data-id');
        var b = $(this).attr('data-title');
        var c = $(this).attr('data-location');
        $.ajax({
            url: 'https://courseapi.ulearning.cn/course/content/' + a,
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _self.Authorization);
                request.setRequestHeader('Content-Type', 'application/json');
            },
            success: function (response) {
                if (response.type !== undefined) {
                    $.ajax({
                        url: 'https://courseapi.ulearning.cn/course/content/views/' + a + '?type=' + response.type,
                        type: 'PUT',
                        beforeSend: function (request) {
                            request.setRequestHeader('Authorization', _self.Authorization);
                            request.setRequestHeader('Content-Type', 'application/json');
                        }
                    })
                }
            }
        })
        if ($(this).prev().length !== 0) {
            $($(this).prev()[0]).attr('class', 'button button-resource-view button-red-hollow');
        }
        window.open('https://leicloud.ulearning.cn/' + c + '?attname=' + b);
    }
]
if (window.location.href.indexOf('www.ulearning.cn/ulearning/index.html') !== -1) {
    func[6].call(window, undefined, 6)
}
if (window.location.href.search(/(umooc\/user\/login\.do|courseweb\.ulearning\.cn)/i) != -1 && window.location.href.indexOf('ua.ulearning.cn') === -1) {
    func[7].call(window, undefined, 7);
    func[21].call(window, 21);
}
if (window.location.href.indexOf('homework.ulearning.cn') !== -1) {
    func[11].call(window, 11);
}
if (window.location.href.indexOf('live.polyv.cn/watch/') !== -1) {
    func[12].call(window, 12);
}
if (window.location.href.indexOf('ua.ulearning.cn') !== -1) {
    func[18].call(window, 18);
}
