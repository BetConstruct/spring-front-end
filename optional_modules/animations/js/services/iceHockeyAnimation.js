VBET5.service('iceHockeyAnimation',['animConstants','$rootScope','Translator', function (animConstants,$rootScope,Translator) {
    'use strict';
    var c, q, ctx, xx, yy, src, img, img_2, img_3, img_4, img_5, img_bg, img_6, img_ball, img_hockey, sett, rSett, s_font, d_font, v_font;
    var animCodes = animConstants.hockey;

    this.startAnimate = function () {
        c = document.getElementById("hockey-canvas");
        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 10000 / 600);
                };
        })();
        window.cancelAnimationFrame = (function () {
            return window.cancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.msCancelAnimationFrame ||
                window.oCancelAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 10000 / 600);
                };
        })();
        ctx = c.getContext("2d");
        xx = c.width;
        yy = c.height;
        img = new Image();
        img_2 = new Image();
        img_3 = new Image();
        img_4 = new Image();
        img_5 = new Image();
        img_bg = new Image();
        img_6 = new Image();
        img_ball = new Image();
        img_hockey = new Image();
        s_font = '24px RobotoBold';
        v_font = '18px RobotoRegular';
        d_font = '16px RobotoLight';
        src = 'images/animation/feedconstruct/iceHockey/';
        img_bg.src = src + 'background.png';
        img_bg.onload = function() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            $rootScope.$emit('lastAnim',true);
        };
        loadFonts();
    };
    this.animate = function(evCode, teamName, team, evValue, counts, additional, evName) {
        var teamName = teamName || '';
        var team = team || '';
        var evValue = evValue || '';
        var counts = counts || '';
        var additional = additional || '';
        var evName = evName || '';

        !!animCodes[evCode] && angular.isFunction(this[animCodes[evCode]]) && this[animCodes[evCode]](teamName, team, evValue, counts, additional, evName);
    };
    var content = function () {
        img_bg.src = src + 'background.png';
        img_bg.onload = function() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
        };
    };
    var loadFonts = function () {
        ctx.beginPath();
        ctx.font = s_font;
        ctx.fillText('',0,0);
        ctx.font = v_font;
        ctx.fillText('',0,0);
        ctx.font = d_font;
        ctx.fillText('',0,0);
        ctx.font = '18px RobotoRegular';
        ctx.fillText('', 0, 0);
        ctx.font = '13px RobotoMedium';
        ctx.fillText('', 0, 0);
        ctx.stroke();
    };
    var clearIntervals = function () {
        window.clearInterval(sett);
        cancelAnimationFrame(rSett);
    };

    this.betStart = function(){
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_4.src = src + 'betStart.png';
        img_4.onload = function() {
            ctx.drawImage(img_4, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Bet start"), 150, 135);
        };
        ctx.stroke();
    };
    this.betStop = function(){
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_4.src = src + 'betStop.png';
        img_4.onload = function() {
            ctx.drawImage(img_4, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Bet stop"), 160, 135);
        };
        ctx.stroke();
    };
    this.injuryBreak = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'apt.png';
            ctx.drawImage(img, 208, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Injury break"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.commercialBreak = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'comBreak.png';
            ctx.drawImage(img, 210, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Commercial break"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.timeStart = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'timeStart.png';
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Time start"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.timeStop = function () {
        clearIntervals();
        ctx.beginPath();
            q = 1;
            (function loop() {
                ctx.drawImage(img_bg, 0, 0, xx, yy);
                //Transparent Rectangle
                ctx.beginPath();
                img_4.src = src + 'rectangle.png';
                img_4.onload = function() {};
                ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                img.src = src + 'timeStop.png';
                ctx.drawImage(img, 216, q-28);
                ctx.font = v_font;
                ctx.textAlign="center";
                ctx.fillText(Translator.get("Time stop"), 235, 270 - q);
                q += 4;
                rSett = window.requestAnimFrame(loop);
                if(q > 110) cancelAnimationFrame(rSett);
            })();
        ctx.stroke();
    };
    this.emptyNet = function (teameName,team) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            img_2.src = src + 'tr1.png';
            img_3.src = src + 'tr2.png';
            img_6.src = src + 'tr3.png';
            img_hockey.src = src + 'tr4.png';
            if(team == 1){
                ctx.drawImage(img_2, 325, 0);
                ctx.drawImage(img_3, 403, 90);
                ctx.drawImage(img_6, 412, 99);
                ctx.drawImage(img_hockey, 422, 108);
            }else {
                ctx.save();
                ctx.translate(472,250);
                ctx.rotate(180*Math.PI/180);
                ctx.drawImage(img_2, 325, 0);
                ctx.drawImage(img_3, 403, 90);
                ctx.drawImage(img_6, 412, 99);
                ctx.drawImage(img_hockey, 422, 108);
                ctx.restore();
            }
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'net.png';
            img.onload = function() {};
            ctx.drawImage(img, 145, q-14);
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(teameName, 235, 270 - q,220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Empty net"), 260, q+7);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.endGame = function (a,b,c) {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_4.src = src + 'rectangle.png';
        img_4.onload = function() {
            ctx.drawImage(img_4, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("End game"), 150, 135);
        };
        ctx.stroke();
        // this.statistic(counts);
    };
    this.notStarted = function () {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_4.src = src + 'rectangle.png';
        img_4.onload = function() {
            ctx.drawImage(img_4, 120, 60);
            //Text
            ctx.font = '30px RobotoBold';
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Not started"), 235, 135);
        };
        ctx.stroke();
    };
    this.matchStart  = function () {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_4.src = src + 'rectangle.png';
        img_4.onload = function() {
            ctx.drawImage(img_4, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Match"), 175, 115);
            ctx.fillText(Translator.get("Started"), 164, 160);
        };
        ctx.stroke();
    };
    this.cancell = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'cancell.png';
            img.onload = function() {};
            ctx.drawImage(img, 213, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Match cancelled"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();


    };
    this.overtime = function () {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
       var cornImg = function() {
            var q = 1, c = 1;
           var cornShow = function() {
                if(q > 110){
                    clearInterval(sett);
                }
                ctx.drawImage(img_bg, 0, 0, xx, yy);
                //Transparent Rectangle
                if(c > 59){c = 60};
                ctx.beginPath();
                img_4.src = src + 'rectangle.png';
                img_4.onload = function() {};
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                img.src = src + 'overtime.png';
                img.onload = function() {};
                ctx.drawImage(img, 216, q-28);
                ctx.font = v_font;
                ctx.textAlign="center";
                ctx.fillText(Translator.get("Overtime"), 235, 270 - q);
                q += 2;
                c++;
            }
            sett = setInterval(cornShow,7)
        }
        cornImg();
        ctx.stroke();
    };
    this.goal = function (teamName,team) {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
       var cornImg = function() {
            var q = 1, c = 1, i = 0, d = 0;
           var cornShow = function() {
                if(q > 110){
                    clearInterval(sett);
                    sett = team == 1 ? setInterval(ic,15) : setInterval(icTwo,15);
                }
               var ic = function() {
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    ic_2();
                    ctx.save();
                    ctx.globalAlpha = i;
                    img_2.src = src + 'trg1.png';
                    ctx.drawImage(img_2, 325, 0);
                    img_3.src = src + 'trg2.png';
                    ctx.drawImage(img_3, 403, 90);
                    img_6.src = src + 'trg3.png';
                    ctx.drawImage(img_6, 412, 99);
                    img_5.src = src + 'trg4.png';
                    ctx.drawImage(img_5, 422, 108);
                    ctx.restore();
                    img_hockey.src = src + 'hockey.png';
                    ctx.drawImage(img_hockey, 424, 113);
                    if(d == 0){i += 0.01; if(i > 1.1){d = 1;}}
                    if(d == 1){i -= 0.01; if(i < 0.3){d = 0;}}
                }
               var icTwo = function() {
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    ic_2();
                    ctx.save();
                    ctx.translate(472,250);
                    ctx.rotate(180*Math.PI/180);
                    ctx.globalAlpha = i;
                    img_2.src = src + 'trg1.png';
                    ctx.drawImage(img_2, 325, 0);
                    img_3.src = src + 'trg2.png';
                    ctx.drawImage(img_3, 403, 90);
                    img_6.src = src + 'trg3.png';
                    ctx.drawImage(img_6, 412, 99);
                    img_5.src = src + 'trg4.png';
                    ctx.drawImage(img_5, 422, 108);
                    ctx.restore();
                    img_hockey.src = src + 'hockey.png';
                    ctx.drawImage(img_hockey, 22, 113);
                    if(d == 0){i += 0.01; if(i > 1.1){d = 1;}}
                    if(d == 1){i -= 0.01; if(i < 0.3){d = 0;}}
                }
               var ic_2 = function() {
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    //Transparent Rectangle
                    if(c > 59){c = 60}
                    ctx.beginPath();
                    img_4.src = src + 'rectangle.png';
                    img_4.onload = function() {};
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.textAlign="center";
                    ctx.fillStyle = '#94dd40';
                    ctx.font = '42px RobotoBold';
                    ctx.fillText(Translator.get("Goal!"), 235, q+15);
                    ctx.fillStyle = 'white';
                    ctx.font = v_font;
                    ctx.fillText(teamName, 235, 270 - q, 220);
                }
                ic_2();
                q += 2;
                c++;
            }
            sett = setInterval(cornShow,7)
        }
        cornImg();
        ctx.stroke();
    };
    this.ballPossesion = function (teamName,team,value) {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
        var i;
        switch (team.toString()){
            case '1':
                i = value == 1 ? -180 : -270;
                sett = value == 1 ? setInterval(defHome,5) : setInterval(attHome,5);
                break;
            case '2':
                i = value == 1 ? -180 : -270;
                sett = value == 1 ? setInterval(defAway,5) : setInterval(attAway,5);
                break;
        }
       var defHome = function() {
            if (i > -1) {
                clearIntervals(sett);
            }
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.globalAlpha = 1;
            img_4.src = src + 'defending.png';
            img_2.src = src + 'defLine.png';
            img_4.onload = function () {};
                ctx.drawImage(img_4, i, 0);
                ctx.drawImage(img_2, i + 195, -5);
                //Text
                ctx.font = s_font;
                ctx.textAlign = "start";
                ctx.fillStyle = "white";
                ctx.fillText(Translator.get("Defending"), i + 35, 100);
                ctx.fillText(Translator.get("Possession"), i + 18, 130);
                ctx.font = d_font;
                ctx.textAlign = "right";
                ctx.fillText(teamName, i + 165, 160, 150);
                i += 2;

        }
       var defAway = function() {
            if(i > -1){clearIntervals(sett);}
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.globalAlpha = 1;
            img_4.src = src + 'defending.png';
            img_2.src = src + 'defLine.png';
            img_4.onload = function () {};
                ctx.save();
                ctx.translate(470-i,250);
                ctx.rotate(180*Math.PI/180);
                ctx.drawImage(img_4, 0, 0);
                ctx.drawImage(img_2, 195, -5);
                ctx.restore();
                //Text
                ctx.font = s_font;
                ctx.textAlign = "start";
                ctx.fillStyle = "white";
                ctx.fillText(Translator.get("Defending"), 310-i, 100);
                ctx.fillText(Translator.get("Possession"), 310-i, 130);
                ctx.font = d_font;
                ctx.fillText(teamName, 311-i, 160, 150);
                i+=2;
        }
       var attHome = function() {
            if (i > -1) {
                clearIntervals(sett);
            }
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.globalAlpha = 1;
            img_4.src = src + 'attacking.png';
            img_2.src = src + 'atLine.png';
            img_4.onload = function () {};
                ctx.drawImage(img_4, i, 0);
                ctx.drawImage(img_2, i + 281, -5);
                //Text
                ctx.font = s_font;
                ctx.textAlign = "start";
                ctx.fillStyle = "white";
                ctx.fillText(Translator.get("Attacking"), i + 135, 100);
                ctx.fillText(Translator.get("Possession"), i + 118, 130);
                ctx.font = d_font;
                ctx.textAlign = "right";
                ctx.fillText(teamName, i + 265, 160);
                i += 3;
        }
       var attAway = function() {
            if(i > -1){clearIntervals(sett);}
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.globalAlpha = 1;
            img_4.src = src + 'attacking.png';
            img_2.src = src + 'atLine.png';
            img_4.onload = function () {};
                ctx.save();
                ctx.translate(470-i,250);
                ctx.rotate(180*Math.PI/180);
                ctx.drawImage(img_4, 0, 0);
                ctx.drawImage(img_2, 281, -5);
                ctx.restore();
                //Text
                ctx.font = s_font;
                ctx.textAlign = "start";
                ctx.fillStyle = "white";
                ctx.fillText(Translator.get("Attacking"), 210-i, 100);
                ctx.fillText(Translator.get("Possession"), 210-i, 130);
                ctx.font = d_font;
                ctx.fillText(teamName, 211-i, 160);
                i+=3;
        }
        ctx.stroke();
    };
    this.periodEnd = function (a,b,value,counts) {
        var period = '';
        switch(value) {
            case '1': period = 'FIRST';  break;
            case '2': period = 'SECOND'; break;
            case '3': period = 'THIRD';  break;
        }
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'quarter.png';
            img_2.src = src + 'stop.png';
            img_3.src = src + 'stopTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 212, q-25);
            ctx.drawImage(img_2, 249, q+2);
            ctx.drawImage(img_3, 256, q+9);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(period + " PERIOD ENDED", 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
        this.statistic(counts);
    };
    this.periodStart = function (a,b,value) {
        var period = '';
        switch(value) {
            case '1': period = 'FIRST';  break;
            case '2': period = 'SECOND'; break;
            case '3': period = 'THIRD';  break;
        }
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'quarter.png';
            img_2.src = src + 'play.png';
            img_3.src = src + 'playTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 212, q-25);
            ctx.drawImage(img_2, 249, q+2);
            ctx.drawImage(img_3, 256, q+8);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(period + " PERIOD STARTED", 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.overtimeEnd = function (a,b,c,counts) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'quarter.png';
            img_2.src = src + 'stop.png';
            img_3.src = src + 'stopTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 212, q-25);
            ctx.drawImage(img_2, 249, q+2);
            ctx.drawImage(img_3, 256, q+9);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Overtime ended"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();

        this.statistic(counts);
    };
    this.overtimeStart = function (a,b,c,d,addi) {
        var ad = addi != '' ? JSON.parse(addi).duration  + ' MINUTES' : '';
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'quarter.png';
            img_2.src = src + 'play.png';
            img_3.src = src + 'playTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 212, q-25);
            ctx.drawImage(img_2, 249, q+2);
            ctx.drawImage(img_3, 256, q+8);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Overtime " + ad + " started"), 235, 270 - q,220);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.undo = function (teamName,b,c,d,value,evName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.font = '20px RobotoBold';
            ctx.fillText(evName.toUpperCase(), 235, q+20, 220);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
            ctx.stroke();
    };
    this.shot = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'shot.png';
            img.onload = function() {};
            ctx.drawImage(img, 160, q-25);
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Nomad"), 235, 270 - q);
            ctx.font = '34px RobotoBold';
            ctx.fillText(Translator.get("Shot"), 260, q+15);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.penalties = function (teamName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            // ctx.fillText(teamName, 235, 260 - q,220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Penalty"), 235, q+25);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.possible = function (a,b,c,d,e,evName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.textAlign="center";
            ctx.font = '18px RobotoBold';
            ctx.fillText(evName.toUpperCase(), 235, q+25);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.penaltiesStarted = function (teamName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(teamName, 235, 260 - q,220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Penalty started"), 235, q+10);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.penaltyScored = function (teamName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(teamName, 235, 260 - q,220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Penalty scored"), 235, q+10);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.penaltyMissed = function (teamName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(teamName, 235, 260 - q,220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Penalty missed"), 235, q+10);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.cancelGoal = function (teamName) {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
       var cornImg = function() {
            var q = 1, c = 1;
           var cornShow = function() {
                if(q > 110){
                    clearInterval(sett);
                }
                ctx.drawImage(img_bg, 0, 0, xx, yy);
                //Transparent Rectangle
                if(c > 59){c = 60}
                ctx.beginPath();
                img_4.src = src + 'rectangle.png';
                img_4.onload = function() {};
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = d_font;
                ctx.textAlign="center";
                ctx.fillText(teamName, 235, 260 - q,220);
                ctx.font = s_font;
                ctx.fillText(Translator.get("Cancel goal"), 235, q+10);
                q += 2;
                c++;
            }
            sett = setInterval(cornShow,7)
        }
        cornImg();
        ctx.stroke();
    };
    this.hockey = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        img_ball.src = src + 'hockey.png';
        img_ball.onload = function() {
            ctx.drawImage(img_ball, 223, 114);
        };
        ctx.stroke();
    };
    this.faceOff = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'face.png';
            img.onload = function() {};
            ctx.drawImage(img, 207, q-17);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Face off"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.shootout = function (teamName,team) {
        if(team == 1){
            clearIntervals();
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.beginPath();
           var cornImg = function() {
                var q = 1, c = 0, i = 0, d = 0;
               var cornShow = function() {
                    if(q > 110){
                        clearInterval(sett);
                        sett = setInterval(ic,15)
                    }
                   var ic = function() {
                        ctx.drawImage(img_bg, 0, 0, xx, yy);
                        ic_2();
                        ctx.save();
                        ctx.globalAlpha = i;
                        img_2.src = src+ 'trForBall.png';
                        ctx.drawImage(img_2, 215, 50);
                        img_3.src = src + 'line.png';
                        ctx.drawImage(img_3, 300, 117);
                        ctx.restore();
                        img_hockey.src = src + 'hockey.png';
                        ctx.drawImage(img_hockey, 275, 113);
                        if(d == 0){i += 0.01; if(i > 1.1){d = 1;}}
                        if(d == 1){i -= 0.01; if(i < 0.3){d = 0;}}
                    }
                   var ic_2 = function() {
                        ctx.drawImage(img_bg, 0, 0, xx, yy);
                        //Transparent Rectangle
                        if(c > 59){c = 60}
                        ctx.beginPath();
                        img_4.src = src + 'trShoot.png';
                        img_4.onload = function() {};
                        ctx.drawImage(img_4, 0, 185);
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.textAlign="center";
                        ctx.fillStyle = 'white';
                        ctx.font = '22px RobotoBold';
                        ctx.fillText(Translator.get("Shootout"), 90, 225);
                        ctx.textAlign="right";
                        ctx.font = v_font;
                        ctx.fillText(teamName, 435, 225, 220);
                    }
                    ic_2();
                    q += 2;
                    c++;
                }
                sett = setInterval(cornShow,7)
            }
            cornImg();
            ctx.stroke();
        }else{
            clearIntervals();
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.beginPath();
           var cornImg = function() {
                var q = 1, c = 0, i = 0, d = 0;
               var cornShow = function() {
                    if(q > 110){
                        clearInterval(sett);
                        sett = setInterval(ic,15)
                    }
                   var ic = function() {
                        ctx.drawImage(img_bg, 0, 0, xx, yy);
                        ic_2();
                        ctx.save();
                        ctx.globalAlpha = i;
                        img_2.src = src + 'trForBall.png';
                        ctx.drawImage(img_2, 115, 50);
                        ctx.save();
                        ctx.translate(170, 132);
                        ctx.rotate(180*Math.PI/180);
                        img_3.src = src + 'line.png';
                        ctx.drawImage(img_3, 0, 0);
                        ctx.restore();
                        ctx.restore();
                        img_hockey.src = src + 'hockey.png';
                        ctx.drawImage(img_hockey, 170, 113);
                        if(d == 0){i += 0.01; if(i > 1.1){d = 1;}}
                        if(d == 1){i -= 0.01; if(i < 0.3){d = 0;}}
                    }
                   var ic_2 = function() {
                        ctx.drawImage(img_bg, 0, 0, xx, yy);
                        //Transparent Rectangle
                        if(c > 59){c = 60}
                        ctx.beginPath();
                        img_4.src = src + 'trShoot.png';
                        img_4.onload = function() {};
                        ctx.drawImage(img_4, 0, 185);
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.textAlign="center";
                        ctx.fillStyle = 'white';
                        ctx.font = '22px RobotoBold';
                        ctx.fillText(Translator.get("Shootout"), 90, 225);
                        ctx.textAlign="right";
                        ctx.font = v_font;
                        ctx.fillText(teamName, 435, 225);
                    }
                    ic_2();
                    q += 2;
                    c++;
                }
                sett = setInterval(cornShow,7)
            }
            cornImg();
            ctx.stroke();
        }
    };
    this.shootoutMissed = function (teamName) {
        clearIntervals();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.beginPath();
       var cornImg = function() {
            var q = 1, c = 1;
           var cornShow = function() {
                if(q > 110){
                    clearInterval(sett);
                }
                ctx.drawImage(img_bg, 0, 0, xx, yy);
                //Transparent Rectangle
                if(c > 59){c = 60}
                ctx.beginPath();
                img_4.src = src + 'rectangle.png';
                img_4.onload = function() {};
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = d_font;
                ctx.textAlign="center";
                ctx.fillText(teamName, 235, 260 - q, 220);
                ctx.font = s_font;
                ctx.fillText(Translator.get("Shootout missed"), 235, q+10);
                q += 2;
                c++;
            }
            sett = setInterval(cornShow,7)
        }
        cornImg();
        ctx.stroke();
    };
    this.suspensionTotal = function (a,b,value) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(value.toUpperCase(), 235, 260 - q);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Players count"), 235, q+10);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.suspension = function (teamName,a,value) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'sus.png';
            img_2.src = src + 'susTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 190, q-40);
            ctx.drawImage(img_2, 253, q-8);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Suspension"), 235, 255 - q);
            ctx.font = d_font;
            ctx.fillText(teamName, 235, 282 - q, 220);
            ctx.fillText(value, 263, q+9);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.delayedSuspension = function (teamName,a,value) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'sus.png';
            img_2.src = src + 'susTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 190, q-40);
            ctx.drawImage(img_2, 253, q-8);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Delayed suspension"), 235, 255 - q);
            ctx.font = d_font;
            ctx.fillText(teamName, 235, 282 - q, 220);
            ctx.fillText(value, 263, q+9);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.suspensionOver = function (teamName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'sus.png';
            img_2.src = src + 'stop.png';
            img_3.src = src + 'stopTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 190, q-25);
            ctx.drawImage(img_2, 253, q+7);
            ctx.drawImage(img_3, 260, q+14);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Suspension over"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.timerChange = function (a,b,c,d,e,evName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.font = '20px RobotoBold';
            ctx.fillText(evName.toUpperCase(), 235, q+20);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.susTimerChange = function (a,b,value,d,e,evName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(value.toUpperCase()/1000, 235, 260 - q);
            ctx.font = '16px RobotoBold';
            ctx.fillText(evName.toUpperCase(), 235, q+10);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.comBreak = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'comBreak.png';
            img.onload = function() {};
            ctx.drawImage(img, 210, q-30);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Commercial break"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.videoReferee = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'video.png';
            img.onload = function() {};
            ctx.drawImage(img, 210, q-20);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Video referee"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.timeout = function (a,team) {
        var name = '';
        if(team == 1){
            name = 'HOME';
        }else if(team == 2){
            name = 'AWAY'
        }
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'hand.png';
            img_2.src = src + 'play.png';
            img_3.src = src + 'playTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 210, q-25);
            ctx.drawImage(img_2, 250, q);
            ctx.drawImage(img_3, 257, q+6);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText("TIMEOUT " + name, 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.timeoutOver = function () {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        (function loop() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'rectangle.png';
            img_4.onload = function() {};
            ctx.drawImage(img_4, 120, 120 - q/2, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = src + 'hand.png';
            img_2.src = src + 'stop.png';
            img_3.src = src + 'stopTwo.png';
            img.onload = function() {};
            ctx.drawImage(img, 210, q-25);
            ctx.drawImage(img_2, 250, q);
            ctx.drawImage(img_3, 257, q+7);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Timeout over"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 110) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.statistic = function (counts) {
        setTimeout(stat,5000);
       var stat = function() {
            clearIntervals();
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = src + 'stat.png';
            img_4.onload = function () {
                ctx.drawImage(img_4, 64, 15, 340, 220);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = '14px RobotoRegular';
                ctx.textAlign="right";
                ctx.fillText(Translator.get("Goals"), 165, 90);
                ctx.fillText(Translator.get("Suspen."), 165, 150);
                ctx.fillText(Translator.get("Shootout"), 165, 205);

                ctx.save();
                ctx.translate(20,0);
                    ctx.textAlign="start";
                    ctx.font = '12px RobotoLight';
                    ctx.fillText(Translator.get("Tot"), 175, 40);
                    ctx.fillText(Translator.get("1st"), 215, 40);
                    ctx.fillText(Translator.get("2st"), 255, 40);
                    ctx.fillText(Translator.get("3st"), 295, 40);
                    ctx.fillText(Translator.get("Ot"), 340, 40);

                    ctx.textAlign = "center";
                    ctx.fillStyle = '#f4eb4b';
                    ctx.font = '16px RobotoMedium';

                    //goals
                    ctx.fillText( counts['1~177']    || 0, 188, 80 );
                    ctx.fillText( counts['h1~1~177'] || 0, 228, 80 );
                    ctx.fillText( counts['h2~1~177'] || 0, 268, 80 );
                    ctx.fillText( counts['h3~1~177'] || 0, 308, 80 );
                    ctx.fillText( counts['to~1~177'] || 0, 348, 80 );

                    ctx.fillText( counts['2~177']    || 0, 188, 100 );
                    ctx.fillText( counts['h1~2~177'] || 0, 228, 100 );
                    ctx.fillText( counts['h2~2~177'] || 0, 268, 100 );
                    ctx.fillText( counts['h3~2~177'] || 0, 308, 100 );
                    ctx.fillText( counts['to~2~177'] || 0, 348, 100 );

                    //suspensions
                    ctx.fillText( counts['1~927']    || 0, 188, 140 );
                    ctx.fillText( counts['h1~1~927'] || 0, 228, 140 );
                    ctx.fillText( counts['h2~1~927'] || 0, 268, 140 );
                    ctx.fillText( counts['h3~1~927'] || 0, 308, 140 );
                    ctx.fillText( counts['to~1~927'] || 0, 348, 140 );

                    ctx.fillText( counts['2~927']    || 0, 188, 160 );
                    ctx.fillText( counts['h1~2~927'] || 0, 228, 160 );
                    ctx.fillText( counts['h2~2~927'] || 0, 268, 160 );
                    ctx.fillText( counts['h3~2~927'] || 0, 308, 160 );
                    ctx.fillText( counts['to~2~927'] || 0, 348, 160 );

                    //shootouts
                    ctx.fillText( counts['1~162']    || 0, 188, 200 );
                    ctx.fillText( counts['h1~1~162'] || 0, 228, 200 );
                    ctx.fillText( counts['h2~1~162'] || 0, 268, 200 );
                    ctx.fillText( counts['h3~1~162'] || 0, 308, 200 );
                    ctx.fillText( counts['to~1~162'] || 0, 348, 200 );

                    ctx.fillText( counts['2~162']    || 0, 188, 220 );
                    ctx.fillText( counts['h1~2~162'] || 0, 228, 220 );
                    ctx.fillText( counts['h2~2~162'] || 0, 268, 220 );
                    ctx.fillText( counts['h3~2~162'] || 0, 308, 220 );
                    ctx.fillText( counts['to~2~162'] || 0, 348, 220 );
                ctx.restore();

            };
            ctx.stroke();
        }
    }
}]);