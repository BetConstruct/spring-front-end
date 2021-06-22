angular.module('liveChat', ['ng']).service('liveChat', ['$window', '$location', '$rootScope', '$timeout', 'Config', 'Script', function ($window, $location, $rootScope, $timeout, Config, Script) {
    'use strict';
    var sfChatConfig;

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
            var _this = this;

            if (!allowLiveChat()) {
                return;
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

                var codePlan = !isNaN(config.codePlan) ? parseInt(config.codePlan, 10) : config.codePlan;

                comm100_chatButton.code_plan = codePlan;
                comm100_chatButton.div_id = config.comm100ButtonId ||'live-chat-button1';

                if (config.comm100ButtonId) {
                    // checks if a button has been added to the DOM, then create it dynamically and add to it
                    if (!document.getElementById(config.comm100ButtonId)) {
                        var chatButton = document.createElement("div");
                        chatButton.id = config.comm100ButtonId;

                        var bodyTag = document.getElementsByTagName('body')[0];
                        bodyTag.insertBefore(chatButton, bodyTag.childNodes[bodyTag.childNodes.length - 1]);
                    }
                }

                $window.Comm100API.chat_buttons.push(comm100_chatButton);

                $window.Comm100API.site_id = !isNaN(config.siteId) ? parseInt(config.siteId, 10) : config.siteId;

                $window.Comm100API.main_code_plan = codePlan;

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

                $window.startLiveChat = function () {$window.Comm100API.open_chat_window(null, codePlan); };

            } else if (config.liveChatLicense) {
                $window.__lc = {};
                $window.__lc.license = config.liveChatLicense;
                $window.__lc.chat_between_groups = false;
                (function(n, t, c) {
                    function i(n) {
                        return e._h ? e._h.apply(null, n) : e._q.push(n)
                    }
                    var e = {
                        _q: [],
                        _h: null,
                        _v: "2.0",
                        on: function() {
                            i(["on", c.call(arguments)])
                        },
                        once: function() {
                            i(["once", c.call(arguments)])
                        },
                        off: function() {
                            i(["off", c.call(arguments)])
                        },
                        get: function() {
                            if (!e._h)
                                throw new Error("[LiveChatWidget] You can't use getters before load.");
                            return i(["get", c.call(arguments)])
                        },
                        call: function() {
                            i(["call", c.call(arguments)])
                        },
                        init: function() {
                            var n = t.createElement("script");
                            n.async = !0,
                                n.type = "text/javascript",
                                n.src = "https://cdn.livechatinc.com/tracking.js",
                                t.head.appendChild(n)
                        }
                    };
                    !n.__lc.asyncInit && e.init(),
                        n.LiveChatWidget = n.LiveChatWidget || e
                }(window, document, [].slice))
            } else if (config.tawk && config.tawk.src) { //---------------------------------------------- Tawk livechat
                var Tawk_API = Tawk_API || {},
                    Tawk_LoadStart = new Date();
                (function () {
                    var s1 = document.createElement("script"),
                        s0 = document.getElementsByTagName("script")[0];
                    s1.async = true;
                    s1.src = config.tawk.src;
                    s1.charset = 'UTF-8';
                    s1.setAttribute('crossorigin', '*');
                    s0.parentNode.insertBefore(s1, s0);
                })();
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
            function  liveAgentButtonListener() {
                $rootScope.broadcast("openedLiveAgent");
            }
            var chat = Config.main.liveChat && (Config.main.liveChat[Config.env.lang] || Config.main.liveChat), _this = this;
            if (chat) {
                switch (chat.liveAgentVersion) {
                    case 2:
                        (function(d, src, c) { var t=d.scripts[d.scripts.length - 1],s=d.createElement('script');s.id='la_x2s6df8d';s.async=true;s.src=src;s.onload=s.onreadystatechange=function(){var rs=this.readyState;if(rs&&(rs!='complete')&&(rs!='loaded')){return;}c(this);};t.parentElement.insertBefore(s,t.nextSibling);})(document,
                            chat.liveAgentScript || '//cs.betconstruct.com/liveagent/scripts/track.js',
                            function(e){
                                _this.liveAgentButton = LiveAgent.createButton(chat.liveAgentLangsID && chat.liveAgentLangsID[Config.env.lang] ? chat.liveAgentLangsID[Config.env.lang] : chat.liveAgentID, e);
                                _this.liveAgentButton.buttonDiv && _this.liveAgentButton.buttonDiv.addEventListener("click", liveAgentButtonListener);
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
                                    _this.liveAgentButton.buttonDiv && _this.liveAgentButton.buttonDiv.addEventListener("click", liveAgentButtonListener);

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
                };



            }
        }
    };
}]);
