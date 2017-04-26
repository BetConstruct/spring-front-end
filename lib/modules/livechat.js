angular.module('liveChat', ['ng']).service('liveChat', ['$window', '$location', '$rootScope', '$timeout', 'Config', 'Script', function ($window, $location, $rootScope, $timeout, Config, Script) {
    'use strict';
    var sfChatConfig;
    var deskChatData = {
        offerAlways: false,
        offerAgentsOnline: true,
        offerRoutingAgentsAvailable: false,
        offerEmailIfChatUnavailable: true
    };

    return {
        init: function init(config) {
            if ($location.path() === '/popup/') {
                return;
            }
            if (config.popup) {
                $window.startLiveChat = function () {$window.open(config.link, "livechatwin", config.popupParams); };
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

                        window.open(url,'zopimChat','height=550,width=415,left=1,top=10,resizable=no,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
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
                        if(config.zopimInHeader || config.zopimInFooter) {
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

                                $window.showZopimChat = function(position) {
                                    $zopim.livechat.window.show();
                                    if (config.zopimAutoPosition) {
                                        $zopim.livechat.window.setPosition(position);
                                    }
                                };

                            });
                        }

                        if (config.zopimLanguages && config.zopimLanguages[Config.env.lang]) {
                            $zopim.livechat.setLanguage(config.zopimLanguages[Config.env.lang]);
                        }

                        if (config.zopimVisitorDepartment && config.zopimVisitorDepartment[Config.env.lang]) {
                            $zopim.livechat.departments.setVisitorDepartment(config.zopimVisitorDepartment[Config.env.lang]);
                        }

                        if (config.zopimShowDefaultButton) {
                            $zopim.livechat.button.show();
                        }

                        $zopim.livechat.setOnUnreadMsgs(function(number){
                            if (number >= 1) {
                                $zopim.livechat.window.show();
                            }
                        });

                        if (config.zopimGreetings && config.zopimGreetings[Config.env.lang] !== true) {
                            $zopim.livechat.prechatForm.setGreetings(config.zopimGreetings[Config.env.lang] || '');
                        }
                    };
                    e.parentNode.insertBefore($, e);
                })(document, 'script');

            } else if (config.siteId && config.codePlan) { //---------------------------------------------- Comm100 livechat
                $window.Comm100API = $window.Comm100API || {};
                $window.Comm100API.chat_buttons = $window.Comm100API.chat_buttons || [];
                var comm100_chatButton1 = {};

                comm100_chatButton1.code_plan = config.codePlan;
                comm100_chatButton1.div_id = 'live-chat-button1';

                $window.Comm100API.chat_buttons.push(comm100_chatButton1);
                $window.Comm100API.site_id = config.siteId;
                $window.Comm100API.main_code_plan = config.codePlan;

                $window.createComm100Chat = function createComm100Chat () {
                    var comm100_lc = $window.document.createElement('script');
                    comm100_lc.type = 'text/javascript';
                    comm100_lc.async = true;
                    comm100_lc.src = config.comm100Src + $window.Comm100API.site_id;
                    var comm100_s = $window.document.getElementsByTagName('script')[0];
                    comm100_s.parentNode.insertBefore(comm100_lc, comm100_s);

                    $timeout(function () {
                        if (!Comm100API.loaded) {
                            $window.createComm100Chat();
                        }
                    }, 5000);
                };

                $window.createComm100Chat();

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

                lzHTML = "<a href=\"javascript:void(window.open('";
                lzHTML += config.liveZillaTrackingServer;
                lzHTML += "/chat.php','','width=590,height=610,left=0,top=0,resizable=yes,menubar=no,location=no,status=yes,scrollbars=yes'))\"><img src='";
                lzHTML += config.liveZillaTrackingServer;
                lzHTML += "/image.php?id=02&type=inlay' width='184' height='192' border='0' alt='LiveZilla Live Help'></a><noscript><img src=\"";
                lzHTML += config.liveZillaTrackingServer;
                lzHTML += "/server.php?request=track&output=nojcrpt\" width='0' height='0' style='visibility:hidden;' alt=''></noscript>";

                lzButton.innerHTML = lzHTML;
                document.body.appendChild(lzButton);

                var lzDiv = document.createElement('div');
                lzDiv.id = 'livezilla_tracking';
                lzDiv.style.display = 'none';
                document.body.appendChild(lzDiv);

                var lzScript = document.createElement("script");
                lzScript.async=true;
                lzScript.type="text/javascript";
                var lzSrc = config.liveZillaTrackingServer + '/server.php?request=track&output=jcrpt&nse='+Math.random();

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
            var chat = Config.main.liveChat && (Config.main.liveChat[Config.env.lang] || Config.main.liveChat);
            if (chat) {
                switch (chat.liveAgentVersion) {
                    case 2:
                        (function(d, src, c) { var t=d.scripts[d.scripts.length - 1],s=d.createElement('script');s.id='la_x2s6df8d';s.async=true;s.src=src;s.onload=s.onreadystatechange=function(){var rs=this.readyState;if(rs&&(rs!='complete')&&(rs!='loaded')){return;}c(this);};t.parentElement.insertBefore(s,t.nextSibling);})(document,
                            chat.liveAgentScript || '//cs.betconstruct.com/liveagent/scripts/track.js',
                            function(e){
                                $rootScope.liveAgentButton = LiveAgent.createButton(chat.liveAgentLangsID && chat.liveAgentLangsID[Config.env.lang] ? chat.liveAgentLangsID[Config.env.lang] : chat.liveAgentID, e);
                            });
                        break;
                    default:
                        (function(d, src, c) { var t=d.scripts[d.scripts.length - 1],s=d.createElement('script');s.id='la_x2s6df8d';s.async=true;s.src=src;s.onload=s.onreadystatechange=function(){var rs=this.readyState;if(rs&&(rs!='complete')&&(rs!='loaded')){return;}c(this);};t.parentElement.insertBefore(s,t.nextSibling);})(document,
                            chat.liveAgentScript || '//cs.betconstruct.com/liveagent/scripts/track.js',
                            function(e){
                                var vb = document.createElement('img');
                                vb.src = '//cs.betconstruct.com/liveagent/scripts/pix.gif';
                                vb.onload = function () {
                                    $rootScope.liveAgentButton = LiveAgent.createVirtualButton(chat.liveAgentLangsID && chat.liveAgentLangsID[Config.env.lang] ? chat.liveAgentLangsID[Config.env.lang] : chat.liveAgentID, vb);
                                };
                            });
                }


                $rootScope.liveAgentProfileUpdate = function liveAgentProfileUpdate() {
                    if ($rootScope.profile &&  window.LiveAgent && window.LiveAgent.setUserDetails) {
                        window.LiveAgent.setUserDetails($rootScope.profile.email || '', $rootScope.profile.first_name || '', $rootScope.profile.last_name || '', $rootScope.profile.phone || $rootScope.profile.phone_number || '');
                        window.LiveAgent.addTicketField('ID', $rootScope.profile.id || '');
                        window.LiveAgent.addContactField('ID', $rootScope.profile.id || '');
                    }
                }

            }
        }
    };
}]);
