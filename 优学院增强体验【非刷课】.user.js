// ==UserScript==
// @name         优学院增强体验【非刷课】
// @namespace    https://greasyfork.org/zh-CN/scripts/383596
// @version      2020.05.28
// @description  用于优学院自动登录【默认关闭】、作业实时自动查重、资源文件增加下载按钮、直播M3U8文件下载、直播流获取、解除Edge兼容性
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
// @connect      api.polyv.net
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @icon         https://www.ulearning.cn/ulearning/favicon.ico
// @supportURL   https://greasyfork.org/zh-CN/scripts/383596
// @webRequest   [{"selector":"https://hm.baidu.com/*","action":"cancel"}]
// ==/UserScript==

(function() {
    'use strict';
    // 需要自动登录，将下面的 auto_login = 1
    var auto_login = 0;

    if ( window.location.href.indexOf( 'homework.ulearning.cn' ) != -1 ) {
        var userID = '';
        var homeworkID = '';
        var time_ = Date.parse( new Date());
        var text_ = '';
        function wait_ele() {
            if ( document.querySelector('textarea') == null ) {
                setTimeout(wait_ele, 50);
            }
            else {
                if ( window.location.hash.search( /#\/stuWriting\/([0-9]*)\/([0-9]*)\/\?([\s\S]*)/ ) != -1 ) {
                    userID = window.location.hash.match( /#\/stuWriting\/([0-9]*)\/([0-9]*)\/\?([\s\S]*)/ )[ 1 ];
                    homeworkID = window.location.hash.match( /#\/stuWriting\/([0-9]*)\/([0-9]*)\/\?([\s\S]*)/ )[ 2 ];
                }
                else if ( window.location.hash.search( /#\/stuWriting\/([0-9]*)\/([0-9]*)\?([\s\S]*)/ ) != -1 ) {
                    userID = window.location.hash.match( /#\/stuWriting\/([0-9]*)\/([0-9]*)\?([\s\S]*)/ )[ 1 ];
                    homeworkID = window.location.hash.match( /#\/stuWriting\/([0-9]*)\/([0-9]*)\?([\s\S]*)/ )[ 2 ];
                }
                else {
                    setTimeout(wait_ele, 100);
                    return;
                }
                document.body.addEventListener('DOMSubtreeModified', check_repeat, false);
                document.body.addEventListener( 'click', check_repeat, false );
                document.body.addEventListener( 'keyup', check_repeat, false);
            }
        }
        wait_ele()
        function Del_Style () {
            if ( document.querySelector( 'div[class="writing-panel"]' ) != null ) {
                if ( $( 'button[class="check-duplice"]' ).attr( 'style' ) != undefined ) {
                    $( 'button[class="check-duplice"]' ).removeAttr( 'style' );
                }
                let childNode = document.createElement( 'div' );
                childNode.setAttribute( 'class' , 'writing-panel-length' );
                childNode.innerHTML = '相似度：<span class="content-size" id ="check_repeat">0</span>%；最后检查时间：<span class="content-size" id="check_endtime">Unknown</span>【Tips：截止提交日期前再次检查，以免其他迟写的同学与自己的相似度大】';
                document.querySelector( 'div[class="writing-panel"]' ).appendChild( childNode );
            }
            else {
                setTimeout( Del_Style , 100 );
            }
        }
        Del_Style();
        function check_repeat () {
            if (text_ != document.querySelector('textarea').placeholder && Date.parse( new Date() ) - time_ > 2000){
                document.body.removeEventListener('DOMSubtreeModified', check_repeat);
                document.body.removeEventListener( 'click', check_repeat);
                document.body.removeEventListener( 'keyup', check_repeat);
                time_ = Date.parse( new Date() );
                text_ = document.querySelector('textarea').placeholder;
                $.ajax({
                    type: 'POST',
                    url: 'https://homeworkapi.ulearning.cn/stuHomework/getDuplicate',
                    data: JSON.stringify(
                        {
                            'content': text_,
                            'homeworkID': homeworkID,
                            'userID': userID
                        }
                    ),
                    success: function ( data ) {
                        document.querySelector( 'span[id="check_repeat"]' ).innerText = data.result;
                        document.querySelector( 'span[id="check_endtime"]' ).innerText = Date().match(/[0-9][0-9][0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)[0];
                        document.body.addEventListener('DOMSubtreeModified', check_repeat, false);
                        document.body.addEventListener( 'click', check_repeat, false );
                        document.body.addEventListener( 'keyup', check_repeat, false);
                    },
                    error: function (xhr) {
                        document.body.addEventListener('DOMSubtreeModified', check_repeat, false);
                        document.body.addEventListener( 'click', check_repeat, false );
                        document.body.addEventListener( 'keyup', check_repeat, false);
                    },
                    contentType: "application/json; charset=utf-8"
                })
            }
        }
    }
    else if ( window.location.href.indexOf( 'umooc/user/login.do' ) != -1 ) {
        window.location.href = 'https://www.ulearning.cn/ulearning/index.html#/index/portal';
    }
    else if ( window.location.href.indexOf( 'www.ulearning.cn/ulearning/index.html' ) != -1 || window.location.href.indexOf( 'ulearning.cn/organization/index.html' ) != -1 ) {
        if (auto_login == 1)
        {
            let auto_login = function () {
                if ( $( '[class="user-menu-component"]' ).length != 0 ) {
                    if ( $( '[data-bind="click: login, text: publicI18nText.signin"]' ).length != 0 ) {
                        $( '[data-bind="click: login, text: publicI18nText.signin"]' ).click();
                        gm_get( 'username' ).then( ( username ) => {
                            gm_get( 'password' ).then( ( password ) => {
                                if ( username === undefined || password === undefined || username === '' || password === '' || username === null || password === null ) {
                                    let click_bind = function () {
                                        if ( $( '[class="modal modal-up in"]' ).length != 0 ) {
                                            $( 'button[class="button button-red-solid btn-confirm"]' )[0].innerHTML = '自动登录';
                                            $( '#loginForm .btn-confirm' ).bind( 'click' , function () {
                                                gm_set( 'username' , $( 'input[id="userLoginName"]' )[0].value );
                                                gm_set( 'password' , $( 'input[id="userPassword"]' )[0].value );
                                            } )
                                        }
                                        else
                                        {
                                            setTimeout( click_bind , 20 );
                                        }
                                    }
                                    click_bind();
                                }
                                else {
                                    let login = function () {
                                        if ( $( '[class="modal modal-up in"]' ).length != 0 ) {
                                            $( 'input[id="userLoginName"]' )[0].value = username;
                                            $( 'input[id="userPassword"]' )[0].value = password;
                                            $( 'button[class="button button-red-solid btn-confirm"]' )[0].click();
                                        }
                                        else {
                                            setTimeout( login , 20 );
                                        }
                                    }
                                    login();
                                }
                            } )
                        } );
                    }
                    else {
                        gm_get( 'username' ).then( ( username ) => {
                            if ( username === undefined || username === null || username === '' ) {
                                ;
                            }
                            else {
                                $( '[data-bind="click: logout, text: publicI18nText.signout"]' )[0].innerText = '重新登录';
                                $( '[class="user-control-menu"]' ).append('<a class="user-menu-item" id="relogin">重置登录信息</a>');
                                $("[id='relogin']").bind( 'click' , function () {
                                    gm_del( 'username' );
                                    gm_del( 'password' );
                                    alert("重置成功");
                                    $('[data-bind="click: logout, text: publicI18nText.signout"]')[0].click();
                                } )
                            }
                        });
                    }
                }
                else {
                    setTimeout( auto_login , 20 );
                }
            }
            auto_login();
        }
    }
    else if ( window.location.href.indexOf("www.tongshike.cn/ulearning_web/login.do") != -1 ) {
        window.location.href = 'https://www.ulearning.cn/ulearning/index.html#/index/portal';
    }
    else if ( window.location.href.indexOf('ulearning/tip/timeout.html') != -1) {
        window.location.href = 'https://www.ulearning.cn/umooc/home/logout.do'
    }
    else if (window.location.href.indexOf('learnCourse/learnCourse.html') != -1) {
        unsafeWindow.localStorage.removeItem('failureRecord');
        if (unsafeWindow.navigator.__defineGetter__) {
            unsafeWindow.navigator.__defineGetter__("userAgent", function () {
                return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
            });
        } else if (Object.defineProperty) {
            Object.defineProperty(unsafeWindow.navigator, "userAgent", {
                get: function () {
                    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
                }
            });
        }
    }
    else if (window.location.href.indexOf('courseweb.ulearning.cn/ulearning/index.html') != -1){
        if (hash_find('course/resource') != -1) {
            Add_Download_Button('0', ['0']);
            window.addEventListener('hashchange', listen_hash_true, false);
        } else {
            window.addEventListener('hashchange', listen_hash_false, false);
        }
        function listen_hash_false() {
            if (hash_find('course/resource') != -1) {
                window.addEventListener('hashchange', listen_hash_true, false);
                window.removeEventListener('hashchange', listen_hash_false, false);
                Add_Download_Button('0', ['0']);
            }
        }
        function listen_hash_true() {
            if (hash_find('course/resource') == -1) {
                window.addEventListener('hashchange', listen_hash_false, false);
                window.removeEventListener('hashchange', listen_hash_true, false);
            }
        }
        function Add_Download_Button(parentId, old_parentId) {
            var ocid = window.location.hash.match(/courseId=[\d\D]*/i)[0].replace('courseId=', '');
            var Authorization = getCookie('AUTHORIZATION');
            if ($('style[id="add_download_button"]').length == 0) {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.id = 'add_download_button';
                style.innerHTML = '.red-dot {display: none!important;} '
                    + '.course-resource-page.student-model .table-groups .table-body .title {max-width: 310px!important;} '
                    + '.course-resource-page.student-model .table-groups .resource-title {width: 388px!important;}'
                    + '.course-resource-page .table-resource .resource-operate {width: 170px!important;padding: 0!important;}';
                document.getElementsByTagName('head').item(0).appendChild(style);
            }
            if (ocid != null) {
                if (Authorization != '') {
                    $.ajax({
                        url: 'https://courseapi.ulearning.cn/course/student/content?ocId=' + ocid + '&parentId=' + parentId + '&keyword=&pn=1&ps=10&version=2',
                        type: 'GET',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', Authorization)
                        },
                        success: function (result, status, xhr) {
                            if (result.list != null || result.list.length != 0) {
                                Ajax(parentId, old_parentId);
                            }
                        },
                        error: function (xhr, status, error) { ;
                                                             }
                    })
                }
            }
        }
        function Ajax(parentId, old_parentId) {
            var Page = '0';
            Add_Data();
            function Add_Data() {
                var ocid = window.location.hash.match(/courseId=[\d\D]*/i)[0].replace('courseId=', '');
                var Authorization = getCookie('AUTHORIZATION');
                if (hash_find('course/resource') != -1) {
                    if ($('div[class="pagination-wrap pagination-resource-list"] span[class="active"]').length == 1) {
                        $('div[class="pagination-wrap pagination-resource-list"]').off();
                        $('div[class="pagination-wrap pagination-resource-list"]').on('click', function(){
                            if($('div[class="pagination-wrap pagination-resource-list"] span[class="active"]')[0].innerText != Page){
                                Ajax(parentId, old_parentId);
                            }
                            else{
                                setTimeout(function(){
                                    Ajax(parentId, old_parentId);
                                },500)
                            }
                        });
                        if ($('div[class="pagination-wrap pagination-resource-list"] span[class="active"]')[0].innerText != Page) {
                            if ($('span[class="breadcrumb-back"]').length != 0){
                                $('span[class="breadcrumb-back"]').off();
                                $('span[class="breadcrumb-back"]').on('click',function(){
                                    old_parentId.pop();
                                    Add_Download_Button(old_parentId[old_parentId.length - 1], old_parentId);
                                })
                            }
                            $('a[class="breadcrumb-step"]').on('click',function(){
                                Add_Download_Button('0', ['0']);
                            })
                            Page = $('div[class="pagination-wrap pagination-resource-list"] span[class="active"]')[0].innerText;
                            $.ajax({
                                url: 'https://courseapi.ulearning.cn/course/student/content?ocId=' + ocid + '&parentId=' + parentId + '&keyword=&pn=' + Page + '&ps=10&version=2',
                                type: 'GET',
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('Authorization', Authorization)
                                },
                                success: function (result, status, xhr) {
                                    if (result.list != null || result.list.length != 0) {
                                        if (result.list.length == $('li[class="tr clearfix"]').length) {
                                            $(result.list).each(function(index, value){
                                                if (result.list[index]['location'] != null && $('button[id="add_download_button"]', $('li[class="tr clearfix"]')[index]).length == 0){
                                                    $('<button id="add_download_button" class="button button-resource-view button-red-hollow" onclick="javascript: window.open(\'' + 'https://leicloud.ulearning.cn/' + result.list[index]['location'] + '?attname=' + result.list[index]['title'] + '\')">下载</button>').prependTo($('li[class="tr clearfix"] div[class="td resource-operate"]')[index])
                                                }
                                                else if (result.list[index]['type'] == 0 && $('li[class="tr clearfix"] span[class="title"]')[index].id == ''){
                                                    $('li[class="tr clearfix"] span[class="title"]')[index].id = result.list[index]['id'];
                                                    $('li[class="tr clearfix"] span[class="title"]')[index].addEventListener('click', function(){
                                                        old_parentId.push(parentId);
                                                        Add_Download_Button($('li[class="tr clearfix"] span[class="title"]')[index].id, old_parentId);
                                                    }, false);
                                                }
                                                else if (result.list[index]['type'] == 8 && result.list[index]['location'] == null && $('button[id="add_download_button"]', $('li[class="tr clearfix"]')[index]).length == 0){
                                                    $('<button id="add_download_button" class="button button-resource-view button-red-hollow" onclick="javascript: alert(\'该资源无法获取到下载地址，请手动查看、下载\')" title="该资源无法获取到下载地址，请手动查看、下载">无法下载</button>').prependTo($('li[class="tr clearfix"] div[class="td resource-operate"]')[index]);
                                                }
                                            })
                                        } else {
                                            setTimeout(function(){
                                                Ajax(parentId, old_parentId);
                                            }, 10);
                                        }
                                    }
                                },
                                error: function (xhr, status, error) { ;
                                                                     }
                            })
                        }
                    } else {
                        setTimeout(Add_Data, 10);
                    }
                }
            }
        }
    }
    else if (window.location.href.indexOf('live.polyv.cn/watch/') != -1){
        $().ready(function(){
            unsafeWindow.fetch_ = unsafeWindow.fetch;
            unsafeWindow.fetch = function(url ,data){
                if(url.indexOf('pull-c1.videocc.net') != -1){
                    unsafeWindow.live_url=url;
                    let li = document.createElement('li');
                    li.innerHTML = '------------------------------<br />';
                    li.className = 'web-flower';
                    li.innerHTML += '<a style="color: white" target="_blank" href="' + url + '">直播流地址【右键复制链接地址】</a><br />'
                    li.innerHTML += '------------------------------<br />'
                    document.querySelector('ul[class="ppt-chat-list"]').appendChild(li);
                }
                return unsafeWindow.fetch_(url, data);
            }
            unsafeWindow.setItem_ = unsafeWindow.sessionStorage.setItem;
            unsafeWindow.sessionStorage.setItem = function(a,b){
                if(a=='errorCode'){
                    if(unsafeWindow.live_url != undefined && unsafeWindow.live_url != ''){
                        let li = document.createElement('li');
                        li.style="color: yellow";
                        li.className = 'web-flower';
                        li.innerHTML = '------------------------------<br />';
                        li.innerHTML += '检测到直播可能错误<br /><font color="red">插件可能影响直播（如IDM插件），可禁用全部插件后，一个一个开启插件，刷新页面测试</font><br />可使用直播流地址变相拯救：<a style="color: white" target="_blank" href="' + unsafeWindow.live_url + '">直播链接</a><br />或者尝试使用手机端观看直播<br />';
                        // li.innerHTML += '拯救方法：<a style="color: white" target="_blank" href="#">点击查看</a><br />'
                        li.innerHTML += '------------------------------<br />'
                        document.querySelector('ul[class="ppt-chat-list"]').appendChild(li);
                    }
                }
                return unsafeWindow.setItem_(a,b);
            }
            if(unsafeWindow.sessionStorage.getItem('errorCode') != ""){
                unsafeWindow.sessionStorage.clear();
            }
            var chatData = unsafeWindow.chatData;
            var isLive = chatData.isLive,
                liveStatus = chatData.liveStatus;
            var channelId = chatData.channelId;
            var url = 'https://api.polyv.net/live/v2/channel/recordFile/' + channelId +'/jsonp/playback-list?callback=jQuery0_1&pageSize=5&_=' + (new Date()).valueOf() + '&page=';
            if(chatData === undefined){return;}
            if(isLive != 'end' && liveStatus != 'end'){return;}
            get_download_url();
            function get_download_url(page, li){
                page = page || 1
                let first = true;
                if(li != undefined){first=false}
                li = li || document.createElement('li');
                if(first==true){li.innerHTML = '------------------------------<br />'}
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url + page,
                    onload: function(response){
                        var data = response.responseText.match(/jQuery0_1\((.*)\)/);
                        if(data===null){return}
                        data = JSON.parse(data[1])
                        li.className = 'web-flower';
                        for(let a=0; a<data.contents.length; a++){
                            li.innerHTML += '<a style="color: white" href="' +
                                data.contents[a].url + '">点击下载 M3U8 文件：' + data.contents[a].title + '</a>' +
                                '<br />';
                        }
                        if(data.totalItems > data.pageNumber * data.pageSize){
                            get_download_url(data.pageNumber + 1, li);
                        }
                        else{
                            li.innerHTML += '------------------------------<br />'
                            document.querySelector('ul[class="ppt-chat-list"]').appendChild(li);
                            let ele = document.querySelector('#pptMessage');
                            ele.scrollTop = ele.scrollHeight;
                        }
                    }
                })
            }
        })
    }

    // getCookie & setCookie 源自优学院网站源代码
    function getCookie(c_name) {
        if (document.cookie.length > 0) {
            var c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                var c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return unescape(
                    document.cookie
                    .substring(c_start, c_end)
                    .replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)
                );
            }
        }
        return "";
    }
    function setCookie(c_name, value, expiredays, path, domain) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie =
            c_name +
            "=" +
            escape(value) +
            (expiredays == null ? "" : "; expires=" + exdate.toGMTString()) +
            (path == null ? "" : "; path=" + escape(path)) +
            (domain == null ? "" : "; domain=" + escape(domain));
    }
    function hash_find(a) {
        return window.location.hash.indexOf(a)
    }
    function gm_get( name , defaultValue ) {
        if ( typeof GM_getValue === 'function' ) {
            return new Promise ( ( resolve , reject ) => {
                resolve( GM_getValue( name , defaultValue ) );
            } )
        }
        else {
            return GM.getValue( name , defaultValue );
        }
    }
    function gm_set( name , defaultValue ) {
        if ( typeof GM_setValue === 'function' ) {
            GM_setValue( name , defaultValue );
        }
        else {
            GM.setValue( name ,defaultValue );
        }
    }
    function gm_del( name ) {
        if ( typeof GM_deleteValue === 'function' ) {
            GM_deleteValue( name );
        }
        else {
            GM.deleteValue( name );
        }
    }
    function gm_xml( obj ){
        if ( typeof GM_xmlhttpRequest === 'function') {
            GM_xmlhttpRequest(obj);
        }
        else{
            GM.xmlHttpRequest(obj);
        }
    }
})();
