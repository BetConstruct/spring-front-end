angular.module('liveChat', ['ng']).service('liveChat', ['$window', '$location', '$rootScope', '$timeout', 'Config', 'Script', function ($window, $location, $rootScope, $timeout, Config, Script) {
    'use strict';
    var sfChatConfig;
    var deskChatData = {
        offerAlways: false,
        offerAgentsOnline: true,
        offerRoutingAgentsAvailable: false,
        offerEmailIfChatUnavailable: true
    };

    function allowLiveChat () {
        var i,
            path = $location.path(),
            paths = Config.main.disableLiveChatPaths;
        if (!path) {
            return true;
        }
        for (i = 0; i < paths.length; i++) {
            if (paths[i] === path.substr(0, paths[i].length)) {
                return false;
            }
        }
        return true;
    }

    return {
        init: function init(config) {
            var _this = this
            if (!allowLiveChat()) {
                return;
            }
            for (var i = 0; i < Config.main.disableLiveChatPaths; i++) {
            }
            if (config.popup) {
                $window.startLiveChat = function () {$window.open(config.link, "livechatwin", config.popupParams); };
            } else if (config.jivositeWidgetId) {
                (function() {
                    var widget_id = config.jivositeWidgetId;
                    var d = document;
                    var w = window;

                    function l() {
                        var s = document.createElement('script');
                        s.type = 'text/javascript';
                        s.async = true;
                        s.src = '//code.jivosite.com/script/widget/' + widget_id;
                        var ss = document.getElementsByTagName('script')[0];
                        ss.parentNode.insertBefore(s, ss);
                    }
                    if (d.readyState == 'complete') {
                        l();
                    } else {
                        if (w.attachEvent) {
                            w.attachEvent('onload', l);
                        } else {
                            w.addEventListener('load', l, false);
                        }
                    }
                })();
            } else if (config.olarkId) {

                window.olark||(function(c){var f=window,d=document,l=f.location.protocol=="https:"?"https:":"http:",z=c.name,r="load";var nt=function(){
                    f[z]=function(){
                        (a.s=a.s||[]).push(arguments)};var a=f[z]._={
                    },q=c.methods.length;while(q--){(function(n){f[z][n]=function(){
                        f[z]("call",n,arguments)}})(c.methods[q])}a.l=c.loader;a.i=nt;a.p={
                        0:+new Date};a.P=function(u){
                        a.p[u]=new Date-a.p[0]};function s(){
                        a.P(r);f[z](r)}f.addEventListener?f.addEventListener(r,s,false):f.attachEvent("on"+r,s);var ld=function(){function p(hd){
                        hd="head";return["<",hd,"></",hd,"><",i,' onl' + 'oad="var d=',g,";d.getElementsByTagName('head')[0].",j,"(d.",h,"('script')).",k,"='",l,"//",a.l,"'",'"',"></",i,">"].join("")}var i="body",m=d[i];if(!m){
                        return setTimeout(ld,100)}a.P(1);var j="appendChild",h="createElement",k="src",n=d[h]("div"),v=n[j](d[h](z)),b=d[h]("iframe"),g="document",e="domain",o;n.style.display="none";m.insertBefore(n,m.firstChild).id=z;b.frameBorder="0";b.id=z+"-loader";if(/MSIE[ ]+6/.test(navigator.userAgent)){
                        b.src="javascript:false"}b.allowTransparency="true";v[j](b);try{
                        b.contentWindow[g].open()}catch(w){
                        c[e]=d[e];o="javascript:var d=" + g + ".open();d.domain='"+d.domain+"';";b[k]=o+"void(0);"}try{
                        var t=b.contentWindow[g];t.write(p());t.close()}catch(x){
                        b[k]=o+'d.write("'+p().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};ld()};nt()})({
                    loader: "static.olark.com/jsclient/loader0.js",name:"olark",methods:["configure","extend","declare","identify"]});
                /* custom configuration goes here (www.olark.com/documentation) */
                olark.identify(config.olarkId);
                if (config.olarkGroups) {
                    angular.forEach(config.olarkGroups, function(olarkGroup){
                        olark.configure('system.group', olarkGroup);
                    });
                }
            } else if (config.isSfChat) { // --------------- SalesForce chat
                Script('https://c.la2w1.salesforceliveagent.com/content/g/js/31.0/deployment.js', 'sfchat');
                Script.ready('sfchat', this.initSFChat);
                $window.startLiveChat = function () {$window.startSFChat(); };
            } else if (config.isZopim) { //---------------------------------------------- Zopim chat

                if(config.zopimSimplePopup) {
                    $window.showZopimChat = function(){
                        var url;
                        if (config.zopimPopupLanguage && config.zopimPopupLanguage[$rootScope.env.lang]) {
                            url = 'https://v2.zopim.com/widget/livechat.html?key=' + config.zopimId + '&lang=' + config.zopimPopupLanguage[$rootScope.env.lang];
                        } else {
                            url = 'https://v2.zopim.com/widget/popout.html?key=' + config.zopimId;
                        }

                        $window.open(url, 'livechatwin', 'toolbar=0,location=0,directories=0,status=1,menubar=0,scrollbars=0,resizable=1,width=600,height=680');
                    };
                    return;
                }

                $window.$zopim || (function (d, s) {
                    var z = $window.$zopim = function (c) {
                        z._.push(c)
                    }, $ = z.s = d.createElement(s), e = d.getElementsByTagName(s)[0];
                    z.set = function (o) {
                        z.set.
                            _.push(o)
                    };
                    z._ = [];
                    z.set._ = [];
                    $.async = !0;
                    $.setAttribute('charset', 'utf-8');
                    $.src = '//v2.zopim.com/?' + config.zopimId;
                    z.t = + new Date;
                    $.type = 'text/javascript';
                    $.onload = function(){
                        if(config.zopimInFooter || config.zopimAsTooltip || config.zopimHideOnClose) {
                            $zopim(function() {
                                $zopim.livechat.hideAll();

                                $zopim.livechat.window.setOffsetVertical(5);
                                $zopim.livechat.window.setOffsetHorizontal(5);

                                if (config.zopimInHeader) {
                                    $zopim.livechat.window.setPosition('tr');
                                } else {
                                    $zopim.livechat.window.setPosition('br');
                                }
                                if (config.zopimPosition) {
                                    $zopim.livechat.window.setPosition(config.zopimPosition);
                                }
                                $zopim.livechat.window.onHide(function(){
                                    $zopim.livechat.hideAll();
                                });
                            });
                        }

                        $window.showZopimChat = function(position) {
                            $zopim.livechat.window.show();
                            if (config.zopimAutoPosition) {
                                $zopim.livechat.window.setPosition(position);
                            }
                        };

                        if (config.zopimLanguages && config.zopimLanguages[Config.env.lang]) {
                            $zopim.livechat.setLanguage(config.zopimLanguages[Config.env.lang]);
                        }

                        if (config.zopimDepartmentLabel && config.zopimDepartmentLabel[Config.env.lang]) {
                            $zopim.livechat.departments.setLabel(config.zopimDepartmentLabel[Config.env.lang]);
                        }

                        if (config.zopimVisitorDepartment && config.zopimVisitorDepartment[Config.env.lang]) {
                            $zopim.livechat.departments.setVisitorDepartment(config.zopimVisitorDepartment[Config.env.lang]);
                        }

                        if (config.zopimShowDefaultButton) {
                            $zopim.livechat.button.show();
                        }

                        if (config.zopimOpened) {
                            $zopim.livechat.window.show();
                        }

                        if ($zopim.livechat && $zopim.livechat.setOnUnreadMsgs) {
                            $zopim.livechat.setOnUnreadMsgs(function (number) {
                                if (number >= 1) {
                                    $zopim.livechat.window.show();
                                }
                            });
                        }

                        if (config.zopimGreetings && config.zopimGreetings[Config.env.lang] !== true) {
                            $zopim.livechat.prechatForm.setGreetings(config.zopimGreetings[Config.env.lang] || '');
                        }

                        _this.zopimProfileUpdate = function (p) {
                            $zopim.livechat.set({
                                full_name: p.full_name,
                                username: p.username,
                                user_id: p.unique_id
                            });
                            $zopim.livechat.setName(p.username || p.full_name || '');
                            $zopim.livechat.setEmail(p.email || '');
                        };

                    };
                    e.parentNode.insertBefore($, e);
                })(document, 'script');

            } else if (config.siteId && config.codePlan) { //---------------------------------------------- Comm100 livechat
                $window.Comm100API = $window.Comm100API || {};
                $window.Comm100API.chat_buttons = $window.Comm100API.chat_buttons || [];
                var comm100_chatButton = {};

                comm100_chatButton.code_plan = config.codePlan;
                comm100_chatButton.div_id = config.comm100ButtonId ||'live-chat-button1';

                $window.Comm100API.chat_buttons.push(comm100_chatButton);
                $window.Comm100API.site_id = config.siteId;
                $window.Comm100API.main_code_plan = config.codePlan;

                $window.createComm100Chat = function createComm100Chat (comm100Src) {
                    var comm100_lc = $window.document.createElement('script');
                    comm100_lc.type = 'text/javascript';
                    comm100_lc.async = true;
                    comm100_lc.src = comm100Src + $window.Comm100API.site_id;
                    var comm100_s = $window.document.getElementsByTagName('script')[0];
                    comm100_s.parentNode.insertBefore(comm100_lc, comm100_s);
                };
                $window.createComm100Chat(config.comm100Src);
                $timeout(function () {
                    if (!Comm100API.loaded) {
                        if (config.comm100Src2) {
                            $window.createComm100Chat(config.comm100Src2);
                        }else{
                            $window.createComm100Chat(config.comm100Src);
                        }
                    }
                }, 5000);

                $window.startLiveChat = function () {$window.Comm100API.open_chat_window(null, config.codePlan); };

            } else if (config.wId) {  //---------------------------------------------------- S-livechat
                var chatScript = $window.document.createElement('script');
                chatScript.type = 'text/javascript';
                chatScript.async = true;
                chatScript.src = '//s-livechat.com/widget/script.js';
                var chatScriptEl = $window.document.getElementsByTagName('script')[0];
                chatScriptEl.parentNode.insertBefore(chatScript, chatScriptEl);
            } else if (config.isDeskChat) {
                deskChatData.url = config.deskChatUrl;
            } else if (config.liveChatLicense) {
                $window.__lc = {};
                $window.__lc.license = config.liveChatLicense;
                $window.__lc.chat_between_groups = false;
                (function() {
                    var lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = true;
                    lc.src = ('https:' === document.location.protocol ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';
                    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
                })();
            }

            // Live Zilla tracking
            if (config.liveZillaTrackingServer) {
                var lzButton = document.createElement('div');
                var lzHTML;

                lzButton.id = 'livezilla_button';

                lzHTML = "<noscript><img src='" +  config.liveZillaImgSrc +  "width='0' height='0' style='visibility:hidden;' alt=''></noscript>";
                lzHTML += "/server.php?a=b915f&rqst=track&output=nojcrpt&fbpos=22&fbml=0&fbmt=0&fbmr=10&fbmb=0&fbw=200&fbh=36\'";
                lzHTML += "width='0' height='0' style='visibility:hidden;' alt=''></noscript>";
                lzHTML = "<a href=";
                lzHTML += config.liveZillaAnchorHref;
                lzHTML += " class='lz_fl'><img id='chat_button_image' src=";
                lzHTML += "'" + config.liveZillaChatButtonImageSrc + "' ";
                lzHTML += "width=\"200\" height=\"36\" style=\"border:0px;\" alt=\"LiveZilla Live Chat Software\"></a>";

                lzButton.innerHTML = lzHTML;
                lzButton.style.display = "none";
                document.body.appendChild(lzButton);

                var lzDiv = document.createElement('div');
                lzDiv.id = 'livezilla_tracking';
                lzDiv.style.display = 'none';
                document.body.appendChild(lzDiv);

                var lzScript = document.createElement("script");
                lzScript.async=true;
                lzScript.type="text/javascript";
                var lzSrc = config.liveZillaTrackingServer + +Math.random();

                setTimeout(function(){
                    lzScript.src=lzSrc;
                    document.getElementById('livezilla_tracking').appendChild(lzScript);
                }, 1);
            }
        },
        initSFChat: function initSFChat() {
            var chatConfigArr = {
                'arb': '573b0000000LAg4',
                'arm': '573b0000000LAf1',
                'eng': '573b0000000LAf6',
                'fa': '573b0000000LAg9',
                'fra': '573b0000000LAfp',
                'geo': '573b0000000LAfG',
                'ger': '573b0000000LAfu',
                'ita': '573b0000000LAfk',
                'rus': '573b0000000LAfV',
                'spa': '573b0000000LAff',
                'tur': '573b0000000LAfz'
            };

            sfChatConfig = chatConfigArr[Config.env.lang];
            window._laq = window._laq || [];
            window._laq.push(function () {
                $window.liveagent.showWhenOnline(sfChatConfig, document.getElementById('liveagent_button_online_' + sfChatConfig));
                $window.liveagent.showWhenOffline(sfChatConfig, document.getElementById('liveagent_button_offline_' + sfChatConfig));
            });

            if (!$rootScope.env.authorized && $window.liveagent !== undefined) {
                $window.liveagent.addCustomDetail("logged", $rootScope.env.authorized);
                $window.liveagent.addCustomDetail("SkinName", Config.main.skin).saveToTranscript('Skin__c');
                $window.liveagent.addCustomDetail("ClientId", "").saveToTranscript('ClientID__c');
                $window.liveagent.addCustomDetail("FirstName", "");
                $window.liveagent.addCustomDetail("LastName", "");
                $window.liveagent.addCustomDetail("Sex", "");
                $window.liveagent.addCustomDetail("Address", "");
                $window.liveagent.addCustomDetail("Email", "");
                $window.liveagent.addCustomDetail("Balance", "");
                $window.liveagent.setName("");
            }
        },
        startSFChat: function startSFChat() {
            $window.liveagent.init('https://d.la2w1.salesforceliveagent.com/chat', '572b0000000LABB', '00Db0000000e1up');
            $timeout(function () {
                $window.liveagent.startChat(sfChatConfig);
                $window.liveagent.disconnect();
            }, 1000);
        },
        startDeskChat: function startDeskChat() {
            $window.open(
                deskChatData.url + "?" +
                    "interaction[email]=" + (deskChatData.email || "") +
                    "&interaction[name]=" + (deskChatData.firstName || "") + " " + (deskChatData.lastName || "") +
                    "&chat[subject]=" + (deskChatData.userId || "") +
                    "&offerAlways=" + (deskChatData.offerAlways ? 'true' : 'false') +
                    "&offerAgentsOnline=" + (deskChatData.offerAgentsOnline ? 'true' : 'false') +
                    "&offerRoutingAgentsAvailable=" + (deskChatData.offerRoutingAgentsAvailable ? 'true' : 'false') +
                    "&offerEmailIfChatUnavailable=" + (deskChatData.offerEmailIfChatUnavailable ? 'true' : 'false'),
                "chat",
                "width=635,height=700,menubar=no,toolbar=no,location=no,scrollbars=no,resizable=yes"
            );
        },
        setChatData: function (data) {
            if (Config.main.liveChat.isDeskChat) {
                deskChatData.userId = data.user_id;
                deskChatData.email = data.email;
                deskChatData.firstName = data.first_name;
                deskChatData.lastName = data.last_name;
            } else if (Config.main.liveChat.siteId && Config.main.liveChat.getUserId) {
                $window.COMM100_USER_ID = data.user_id;
            }
        },
        setSFChatData: function (data) {
            if ($window.liveagent !== undefined) {
                $window.liveagent.addCustomDetail("logged", $rootScope.env.authorized);
                $window.liveagent.addCustomDetail("SkinName", Config.main.skin).saveToTranscript('Skin__c');
                $window.liveagent.addCustomDetail("ClientId", data.user_id).saveToTranscript('ClientID__c');
                $window.liveagent.addCustomDetail("FirstName", data.first_name);
                $window.liveagent.addCustomDetail("LastName", data.sur_name);
                $window.liveagent.addCustomDetail("Sex", data.sex);
                $window.liveagent.addCustomDetail("Address", data.address);
                $window.liveagent.addCustomDetail("Email", data.email);
                $window.liveagent.addCustomDetail("Balance", data.balance);
                $window.liveagent.setName(data.name);
            } else {
                console.warn('window.liveagent not defined :/');
            }
        },
        initLiveAgent: function(){
            if (!allowLiveChat()) {
                return;
            }

            var chat = Config.main.liveChat && (Config.main.liveChat[Config.env.lang] || Config.main.liveChat), _this = this;
            if (chat) {
                switch (chat.liveAgentVersion) {
                    case 2:
                        (function(d, src, c) { var t=d.scripts[d.scripts.length - 1],s=d.createElement('script');s.id='la_x2s6df8d';s.async=true;s.src=src;s.onload=s.onreadystatechange=function(){var rs=this.readyState;if(rs&&(rs!='complete')&&(rs!='loaded')){return;}c(this);};t.parentElement.insertBefore(s,t.nextSibling);})(document,
                            chat.liveAgentScript || '//cs.betconstruct.com/liveagent/scripts/track.js',
                            function(e){
                                _this.liveAgentButton = LiveAgent.createButton(chat.liveAgentLangsID && chat.liveAgentLangsID[Config.env.lang] ? chat.liveAgentLangsID[Config.env.lang] : chat.liveAgentID, e);
                            });
                        break;
                    default:
                        (function(d, src, c) { var t=d.scripts[d.scripts.length - 1],s=d.createElement('script');s.id='la_x2s6df8d';s.async=true;s.src=src;s.onload=s.onreadystatechange=function(){var rs=this.readyState;if(rs&&(rs!='complete')&&(rs!='loaded')){return;}c(this);};t.parentElement.insertBefore(s,t.nextSibling);})(document,
                            chat.liveAgentScript || '//cs.betconstruct.com/liveagent/scripts/track.js',
                            function(e){
                                var vb = document.createElement('img');
                                vb.src = '//cs.betconstruct.com/liveagent/scripts/pix.gif';
                                vb.onload = function () {
                                    _this.liveAgentButton = LiveAgent.createVirtualButton(chat.liveAgentLangsID && chat.liveAgentLangsID[Config.env.lang] ? chat.liveAgentLangsID[Config.env.lang] : chat.liveAgentID, vb);
                                };
                            });
                }

                _this.liveAgentProfileUpdate = function liveAgentProfileUpdate() {
                    if ($rootScope.profile &&  window.LiveAgent && window.LiveAgent.setUserDetails) {
                        window.LiveAgent.setUserDetails($rootScope.profile.email || '', $rootScope.profile.first_name || '', $rootScope.profile.last_name || '', $rootScope.profile.phone || $rootScope.profile.phone_number || '');
                        window.LiveAgent.addTicketField('ID', $rootScope.profile.id || '');
                        window.LiveAgent.addContactField('ID', $rootScope.profile.id || '');
                    }
                };

                _this.liveAgentProfileClear = function () {
                    if (window.LiveAgent && window.LiveAgent.setUserDetails) {
                        window.LiveAgent.setUserDetails(' ', ' ', ' ', ' ');
                        window.LiveAgent.addTicketField('ID', ' ');
                        window.LiveAgent.addContactField('ID', ' ');
                    }
                }

            }
        }
    };
}]);
