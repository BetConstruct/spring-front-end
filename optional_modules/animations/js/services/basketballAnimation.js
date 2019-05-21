VBET5.service('basketballAnimation',['animConstants','$rootScope','Translator', function (animConstants,$rootScope,Translator) {
    'use strict';
    var c, q, ctx, xx, yy, src, grd, img, img_2, img_3, img_4, img_bg, img_6, img_ball, sett, rSett, s_font, d_font, v_font;
    var animCodes = animConstants.basketball;

    //Translator.get\(['|"](.+)['|"]\)**
    //(Translator.get("\L$1")**,

    this.startAnimate = function () {
        c = document.getElementById("basketball-canvas");
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
        grd = ctx.createRadialGradient(200,100,100,90,60,xx);
        img = new Image();
        img_2 = new Image();
        img_3 = new Image();
        img_4 = new Image();
        img_bg = new Image();
        img_6 = new Image();
        img_ball = new Image();
        s_font = '24px RobotoBold';
        v_font = '18px RobotoLight';
        d_font = '16px RobotoLight';
        src = 'images/animation/feedconstruct/basketball/';
        img_bg.src = 'images/animation/feedconstruct/basketball/background.png';
        img_bg.onload = function() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            $rootScope.$emit('lastAnim',true);
        };
        loadFonts();
    };
    this.animate = function(evCode, team1, team2, score1, score2, cords, info) {
        var team1 = team1 || '';
        var team2 = team2 || '';
        var score1 = score1 || '';
        var score2 = score2 || '';
        var cords = cords || '';
        var info = info || '';

        !!animCodes[evCode] && angular.isFunction(this[animCodes[evCode]]) && this[animCodes[evCode]](team1, team2, score1, score2, cords, info);
    };
    var content = function () {
        img_bg.src = 'images/animation/feedconstruct/basketball/background.png';
        img_bg.onload = function() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
        };
    };
    var loadFonts = function () {
        ctx.beginPath();
        ctx.font = s_font;
        ctx.fillText('', 0, 0);
        ctx.font = v_font;
        ctx.fillText('', 0, 0);
        ctx.font = d_font;
        ctx.fillText('', 0, 0);
        ctx.font = '18px RobotoRegular';
        ctx.fillText('', 0, 0);
        ctx.font = '13px RobotoMedium';
        ctx.fillText('', 0, 0);
        ctx.stroke();
    };
    var clearIntervals = function () {
        window.cancelAnimationFrame(rSett);
        window.clearInterval(sett);
    };
    this.timeoutStart = function (a,b,team) {
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
            img.src = src + 'timeout.png';
            img.onload = function() {};
            ctx.drawImage(img, 210, q-25);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText("TIMEOUT " + name, 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.timeoutStop = function () {
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
            img.src = src + 'timeoutOver.png';
            img.onload = function() {};
            ctx.drawImage(img, 210, q-25);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Timeout over"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
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
            img.onload = function() {};
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Time start"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
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
            img.onload = function() {};
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Time stop"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.overtime = function () {
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
            img.src = src + 'overtime.png';
            img.onload = function() {};
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Overtime"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.overtimeStarted = function () {
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
            img.src = src + 'overtime.png';
            img.onload = function() {};
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Overtime started"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
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
            img.src = src + 'overtime.png';
            img.onload = function() {};
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Overtime ended"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
        this.statistic(counts);
    };
    this.ballPossession = function (teamName,a,team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var i = 0, q = 0;
        if(team == 1){
            var poss = function() {
                content();
                ctx.save();
                img_4.src = src + 'transparent.png';
                img_4.onload = function() {
                    ctx.save();
                    ctx.globalAlpha = i;
                    ctx.drawImage(img_4, 11, 10);
                    ctx.restore();
                    //Text
                    ctx.font = s_font;
                    ctx.textAlign = "start";
                    ctx.fillStyle = "white";
                    ctx.fillText(Translator.get("Ball"), 160, 110);
                    ctx.fillText(Translator.get("Possession"), 70, 135);
                    ctx.font = d_font;
                    ctx.textAlign="right";
                    ctx.fillText(Translator.get("Teamname"), 215, 160, 190);
                };
                if(q == 0){i += 0.01; if(i > 1){q = 1;}}
                if(q == 1){i -= 0.01; if(i < 0.3){q = 0;}}
            }
        }else{
            var poss = function() {
                content();
                ctx.save();
                img_4.src = src + 'transparent.png';
                img_4.onload = function() {
                    ctx.save();
                    ctx.globalAlpha = i;
                    ctx.drawImage(img_4, 236, 10);
                    ctx.restore();
                    //Text
                    ctx.font = s_font;
                    ctx.textAlign = "start";
                    ctx.fillStyle = "white";
                    ctx.fillText(Translator.get("Ball"), 250, 110);
                    ctx.fillText(Translator.get("Possession"), 250, 135);
                    ctx.font = d_font;
                    ctx.textAlign="start";
                    ctx.fillText(teamName, 250, 160, 190);
                };
                if(q == 0){i += 0.01; if(i > 1){q = 1;}}
                if(q == 1){i -= 0.01; if(i < 0.3){q = 0;}}
            }
        }

        sett = setInterval(poss,20);
        ctx.stroke();
    };
    this.foul = function (teamName,b,team,counts) {
        var fCount = counts['1~816'] || 0;
        if( team == 2 ){
            fCount = counts['2~816'] || 0;
        }
        console.log('counts = ', fCount);
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
            img.src = src + 'foul.png';
            img.onload = function() {};
            ctx.drawImage(img, 185, q-10);
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(teamName, 235, 275 - q, 220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Foul"), 260, q+7);
            ctx.fillStyle = "#ce7455";
            ctx.fillRect(225, 235 - q,20,20);
            ctx.font = d_font;
            ctx.fillStyle = "#fff";
            ctx.fillText(fCount, 235, 250 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.techFoul = function (teamName) {
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
            img.src = src + 'foul.png';
            img.onload = function() {};
            ctx.drawImage(img, 150, q-10);
            ctx.font = d_font;
            ctx.textAlign="center";
            ctx.fillText(teamName, 235, 275 - q, 220);
            ctx.font = s_font;
            ctx.fillText(Translator.get("Technical"), 255, q+7);
            ctx.fillText(Translator.get("Foul"), 235, q+28);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.point_1 = function () {
        clearIntervals();
        content();
        ctx.beginPath();
       var cornImg = function() {
            var q = 1, c = 1, i = 1;
           var imgBall = function() {
                ctx.drawImage(img_2, 384, 98);
                /*ctx.save();
                 ctx.translate(412, 125 + i);
                 ctx.rotate(i*10*Math.PI/180);
                 ctx.drawImage(img_ball, -22, -15);
                 ctx.restore();*/
                ctx.drawImage(img_ball, 412, 125 + i);
                ctx.drawImage(img_3, 404, 145);
                i += 0.4;
                if(i > 20){i = 1;}
            }
           var cornShow = function() {
                if(q > 110){
                    clearInterval(sett);
                    sett = setInterval(imgBall,20);
                }
                ctx.drawImage(img_bg, 0, 0, xx, yy);
                //Transparent Rectangle
                if(c > 59){c = 60};
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/basketball/rectangle.png';
                img_4.onload = function() {};
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                img.src = 'images/animation/feedconstruct/basketball/transparentTeo.png';
                img_2.src = 'images/animation/feedconstruct/basketball/basket.png';
                img_ball.src = 'images/animation/feedconstruct/basketball/ball.png';
                img_3.src = 'images/animation/feedconstruct/basketball/bs.png';
                img.onload = function() {};
                ctx.drawImage(img, 236, 11);
                ctx.drawImage(img_2, 384, 98);
                ctx.drawImage(img_ball, 412, 130 + i);
                ctx.drawImage(img_3, 404, 145);
                ctx.font = d_font;
                ctx.textAlign="center";
                ctx.fillText(Translator.get("Chicago bulls"), 235, 270 - q);
                ctx.fillStyle = '#fff04b';
                ctx.font = '34px RobotoBold';
                ctx.fillText(Translator.get("One point"), 235, q+7);
                q += 2;
                c++;
            }
            sett = setInterval(cornShow,7);
        }
        cornImg();
        ctx.stroke();
    };
    this.point_2 = function (teamName,a,team,counts) {
        if(team == 1){
            clearIntervals();
            content();
            ctx.beginPath();
           var cornImg = function() {
                var q = 1, c = 1, i = 1;
               var imgBall = function() {
                    ctx.drawImage(img_2, 384, 98);
                    /*ctx.save();
                     ctx.translate(412, 125 + i);
                     ctx.rotate(i*10*Math.PI/180);
                     ctx.drawImage(img_ball, -22, -15);
                     ctx.restore();*/
                    ctx.drawImage(img_ball, 412, 125 + i);
                    ctx.drawImage(img_3, 404, 145);
                    i += 0.4;
                    if(i > 20){i = 1;}
                }
               var cornShow = function() {
                    if(q > 110){
                        clearInterval(sett);
                        sett = setInterval(imgBall,20);
                    }
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    //Transparent Rectangle
                    if(c > 59){c = 60}
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/basketball/rectangle.png';
                    img_4.onload = function() {};
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    img.src = 'images/animation/feedconstruct/basketball/transparentTeo.png';
                    img_2.src = 'images/animation/feedconstruct/basketball/basket.png';
                    img_ball.src = 'images/animation/feedconstruct/basketball/ball.png';
                    img_3.src = 'images/animation/feedconstruct/basketball/bs.png';
                    img.onload = function() {};
                    ctx.drawImage(img, 236, 11);
                    ctx.drawImage(img_2, 384, 98);
                    ctx.drawImage(img_ball, 412, 130 + i);
                    ctx.drawImage(img_3, 404, 145);
                    ctx.font = d_font;
                    ctx.textAlign="center";
                    ctx.fillText(teamName, 235, 250 - q, 220);
                    ctx.font = '18px RobotoBold';
                    ctx.fillText((counts['1~1073']  || 0) + ' - ' + (counts['2~1073'] || 0) , 235, 270 - q, 220);
                    ctx.fillStyle = '#fff04b';
                    ctx.font = '34px RobotoBold';
                    ctx.fillText(Translator.get("2 point"), 235, q+7);
                    q += 2;
                    c++;
                }
                sett = setInterval(cornShow,7);
            }
            cornImg();
            ctx.stroke();
        }
        else{
            clearIntervals();
            content();
            ctx.beginPath();
           var cornImg = function() {
                var q = 1, c = 1, i = 1;
               var imgBall = function() {
                    ctx.drawImage(img_2, 11, 98);
                    ctx.drawImage(img_ball, 39, 125 + i);
                    ctx.drawImage(img_3, 31, 145);
                    i += 0.4;
                    if(i > 20){i = 1;}
                }
               var cornShow = function() {
                    if(q > 110){
                        clearInterval(sett);
                        sett = setInterval(imgBall,20);
                    }
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    //Transparent Rectangle
                    if(c > 59){c = 60}
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/basketball/rectangle.png';
                    img_4.onload = function() {};
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    img.src = 'images/animation/feedconstruct/basketball/transparentTeo.png';
                    img_2.src = 'images/animation/feedconstruct/basketball/basket.png';
                    img_ball.src = 'images/animation/feedconstruct/basketball/ball.png';
                    img_3.src = 'images/animation/feedconstruct/basketball/bs.png';
                    img.onload = function() {};
                    ctx.drawImage(img, 12, 11);
                    ctx.drawImage(img_2, 11, 98);
                    ctx.drawImage(img_ball, 39, 130 + i);
                    ctx.drawImage(img_3, 31, 145);
                    ctx.font = d_font;
                    ctx.textAlign="center";
                    ctx.fillText(teamName, 235, 250 - q, 220);
                    ctx.font = '18px RobotoBold';
                    ctx.fillText((counts['1~1073']  || 0) + ' - ' + (counts['2~1073'] || 0) , 235, 270 - q, 220);
                    ctx.fillStyle = '#fff04b';
                    ctx.font = '34px RobotoBold';
                    ctx.fillText(Translator.get("2 POINT"), 235, q+7);
                    q += 2;
                    c++;
                }
                sett = setInterval(cornShow,7);
            }
            cornImg();
            ctx.stroke();
        }
    };
    this.point_3 = function (teamName,a,team,counts) {
        if(team == 1){
            clearIntervals();
            content();
            ctx.beginPath();
           var cornImg = function() {
                var q = 1, c = 1, i = 1;
               var imgBall = function() {
                    ctx.drawImage(img_2, 384, 98);
                    /*ctx.save();
                     ctx.translate(412, 125 + i);
                     ctx.rotate(i*10*Math.PI/180);
                     ctx.drawImage(img_ball, -22, -15);
                     ctx.restore();*/
                    ctx.drawImage(img_ball, 412, 125 + i);
                    ctx.drawImage(img_3, 404, 145);
                    i += 0.4;
                    if(i > 20){i = 1;}
                }
               var cornShow = function() {
                    if(q > 110){
                        clearInterval(sett);
                        sett = setInterval(imgBall,20);
                    }
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    //Transparent Rectangle
                    if(c > 59){c = 60};
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/basketball/rectangle.png';
                    img_4.onload = function() {};
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    img.src = 'images/animation/feedconstruct/basketball/transparentTeo.png';
                    img_2.src = 'images/animation/feedconstruct/basketball/basket.png';
                    img_ball.src = 'images/animation/feedconstruct/basketball/ball.png';
                    img_3.src = 'images/animation/feedconstruct/basketball/bs.png';
                    img.onload = function() {};
                    ctx.drawImage(img, 236, 11);
                    ctx.drawImage(img_2, 384, 98);
                    ctx.drawImage(img_ball, 412, 130 + i);
                    ctx.drawImage(img_3, 404, 145);
                    ctx.font = d_font;
                    ctx.textAlign="center";
                    ctx.fillText(teamName, 235, 250 - q, 220);
                    ctx.font = '18px RobotoBold';
                    ctx.fillText((counts['1~1073']  || 0) + ' - ' + (counts['2~1073'] || 0) , 235, 270 - q, 220);
                    ctx.fillStyle = '#fff04b';
                    ctx.font = '34px RobotoBold';
                    ctx.fillText(Translator.get("3 point"), 235, q+7);
                    q += 2;
                    c++;
                }
                sett = setInterval(cornShow,7);
            }
            cornImg();
            ctx.stroke();
        }
        else{
            clearIntervals();
            content();
            ctx.beginPath();
           var cornImg = function() {
                var q = 1, c = 1, i = 1;
               var imgBall = function() {
                    ctx.drawImage(img_2, 11, 98);
                    ctx.drawImage(img_ball, 39, 125 + i);
                    ctx.drawImage(img_3, 31, 145);
                    i += 0.4;
                    if(i > 20){i = 1;}
                }
               var cornShow = function() {
                    if(q > 110){
                        clearInterval(sett);
                        sett = setInterval(imgBall,20);
                    }
                    ctx.drawImage(img_bg, 0, 0, xx, yy);
                    //Transparent Rectangle
                    if(c > 59){c = 60};
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/basketball/rectangle.png';
                    img_4.onload = function() {};
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    img.src = 'images/animation/feedconstruct/basketball/transparentTeo.png';
                    img_2.src = 'images/animation/feedconstruct/basketball/basket.png';
                    img_ball.src = 'images/animation/feedconstruct/basketball/ball.png';
                    img_3.src = 'images/animation/feedconstruct/basketball/bs.png';
                    img.onload = function() {};
                    ctx.drawImage(img, 12, 11);
                    ctx.drawImage(img_2, 11, 98);
                    ctx.drawImage(img_ball, 39, 130 + i);
                    ctx.drawImage(img_3, 31, 145);
                    ctx.font = d_font;
                    ctx.textAlign="center";
                    ctx.fillText(teamName, 235, 250 - q, 220);
                    ctx.font = '18px RobotoBold';
                    ctx.fillText((counts['1~1073']  || 0) + ' - ' + (counts['2~1073'] || 0) , 235, 270 - q, 220);
                    ctx.fillStyle = '#fff04b';
                    ctx.font = '34px RobotoBold';
                    ctx.fillText(Translator.get("3 point"), 235, q+7);
                    q += 2;
                    c++;
                }
                sett = setInterval(cornShow,7);
            }
            cornImg();
            ctx.stroke();
        }
    };
    this.quarterEnd = function (a,b,c,counts,value) {
        var quarter = '';
        switch(value) {
            case '1':
                quarter = 'FIRST';
                break;
            case '2':
                quarter = 'SECOND';
                break;
            case '3':
                quarter = 'THIRD';
                break;
            case '4':
                quarter = 'FOURTH';
                break;
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
            img.src = src + 'quarterEnd.png';
            img.onload = function() {};
            ctx.drawImage(img, 212, q-25);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(quarter + " QUARTER ENDED", 235, 270 - q,220);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
        this.statistic(counts);
    };
    this.quarterStart = function (a,b,c,d,value) {
        var quarter = '';
        switch(value) {
            case '1':
                quarter = 'FIRST';
                break;
            case '2':
                quarter = 'SECOND';
                break;
            case '3':
                quarter = 'THIRD';
                break;
            case '4':
                quarter = 'FOURTH';
                break;
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
            img.src = src + 'quarterStart.png';
            img.onload = function() {};
            ctx.drawImage(img, 212, q-25);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(quarter + " QUARTER STARTED", 235, 270 - q,220);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.endGame = function () {
        clearIntervals();
        content();
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
    };
    this.notStarted = function () {
        clearIntervals();
        content();
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
    this.betStart = function () {
        clearIntervals();
        content();
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
    this.betStop = function () {
        clearIntervals();
        content();
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
            ctx.drawImage(img, 216, q-28);
            ctx.font = v_font;
            ctx.textAlign="center";
            ctx.fillText(Translator.get("Match cancelled"), 235, 270 - q);
            q += 4;
            rSett = window.requestAnimFrame(loop);
            if(q > 115) cancelAnimationFrame(rSett);
        })();
        ctx.stroke();
    };
    this.matchStart = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_4.src = src + 'rectangle.png';
        img_4.onload = function() {
            ctx.drawImage(img_4, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Match"), 235, 115);
            ctx.fillText(Translator.get("Started"), 235, 160);
        };
        ctx.stroke();
    };
    this.freeThrows = function (teamName,b,team,d,value) {
        clearIntervals();
        content();
       var trImg = function() {
            img_6.src = src + 'trImg.png';
            img_6.onload = function() {
                ctx.drawImage(img_6, 0, yy - 65);
                ctx.font = '22px RobotoBold';
                ctx.textAlign = "start";
                ctx.fillStyle = "white";
                ctx.fillText(value + " FREE THROWS", 30, 225);
                ctx.font = v_font;
                ctx.textAlign = "right";
                ctx.fillText(teamName, 440, 225, 220);
            };
        }
        ctx.beginPath();
        var i = 0, q = 0;
        if(team == 2){
           var poss = function() {
                content();
                trImg();
                ctx.globalAlpha = 1;
                img_4.src = src + 'tr.png';
                img_2.src = src + 'line.png';
                img_ball.src = src + 'ball.png';
                img_4.onload = function() {
                    ctx.drawImage(img_4, 30, 60);
                    ctx.drawImage(img_ball, 90, 115);
                    ctx.save();
                    ctx.translate(90, 132);
                    ctx.rotate(180*Math.PI/180);
                    ctx.save();
                    ctx.globalAlpha = i;
                    ctx.drawImage(img_2, 0, 0);
                    ctx.restore();
                    ctx.restore();
                };
                if(q == 0){i += 0.01; if(i > 1){q = 1;}}
                if(q == 1){i -= 0.01; if(i < 0.3){q = 0;}}
            }
        }else{
           var poss = function() {
                content();
                trImg();
                ctx.globalAlpha = 1;
                img_4.src = src + 'tr.png';
                img_2.src = src + 'line.png';
                img_ball.src = src + 'ball.png';
                img_4.onload = function() {
                    ctx.drawImage(img_4, 300, 60);
                    ctx.drawImage(img_ball, 360, 115);
                    ctx.save();
                    ctx.globalAlpha = i;
                    ctx.drawImage(img_2, 375, 117);
                    ctx.restore();
                };
                if(q == 0){i += 0.01; if(i > 1){q = 1;}}
                if(q == 1){i -= 0.01; if(i < 0.3){q = 0;}}
            }
        }
        sett = setInterval(poss,20);
        ctx.stroke();
    };
    this.rebound = function (teamName,b,team) {
        window.cancelAnimationFrame(rSett);
        window.clearInterval(sett);
        content();
       var trImg = function() {
            img_6.src = src + 'trImg.png';
            img_6.onload = function() {
                ctx.drawImage(img_6, 0, yy - 65);
                ctx.font = '22px RobotoBold';
                ctx.textAlign = "start";
                ctx.fillStyle = "white";
                ctx.fillText(Translator.get("Rebound"), 30, 225);
                ctx.font = v_font;
                ctx.textAlign = "right";
                ctx.fillText(teamName, 440, 225, 220);
            };
        }
        ctx.beginPath();
        var i = 0, q = 0;
        if(team == 2){
           var poss = function() {
                content();
                trImg();
                ctx.save();
                ctx.globalAlpha = 1;
                img_2.src = src + 'hand1.png';
                img_4.src = src + 'hand2.png';
                img_ball.src = src + 'bigBall.png';
                img_4.onload = function() {
                    ctx.save();
                    ctx.globalAlpha = i;
                    ctx.drawImage(img_4, 420, 100);
                    ctx.drawImage(img_ball, 390, 95);
                    ctx.drawImage(img_2, 390, 107);
                    ctx.restore();
                };
                if(q == 0){i += 0.01; if(i > 1){q = 1;}}
                if(q == 1){i -= 0.01; if(i < 0.3){q = 0;}}
            }
        }else{
           var poss = function() {
                content();
                trImg();
                ctx.save();
                ctx.globalAlpha = 1;
                img_2.src = src + 'handH1.png';
                img_4.src = src + 'handH2.png';
                img_ball.src = src + 'bigBall.png';
                img_4.onload = function() {
                    ctx.save();
                    ctx.globalAlpha = i;
                    ctx.drawImage(img_4, 29, 100);
                    ctx.drawImage(img_ball, 45, 95);
                    ctx.drawImage(img_2, 47, 107);
                    ctx.restore();
                };
                if(q == 0){i += 0.01; if(i > 1){q = 1;}}
                if(q == 1){i -= 0.01; if(i < 0.3){q = 0;}}
            }
        }

        sett = setInterval(poss,20);
        ctx.stroke();
    };
    this.FTScored = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        var i = 1;
        ctx.globalAlpha = 1;
        img_4.src = src + 'rectangle.png';
        img.src = src + 'ftscored.png';
        img_ball.src = src + 'ball.png';
       var imgBall = function() {
            ctx.drawImage(img_bg, 0, 0, xx, yy);
            ctx.drawImage(img_4, 120, 60);
            // ctx.drawImage(img_ball, 225, 85);
            ctx.save();
            ctx.translate(225, 70 + i);
            ctx.rotate(i*10*Math.PI/180);
            ctx.drawImage(img_ball, -22, -15);
            ctx.restore();
            ctx.drawImage(img, 215, 100);
            //Text
            ctx.font = v_font;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(Translator.get("Free throw scored"), 235, 170);
            i += 0.4;
            if(i > 21){i = 1;}
        }
        sett = setInterval(imgBall,20);
        ctx.stroke();
    };
    this.FTMissed = function () {
        clearIntervals();
        ctx.beginPath();
        ctx.drawImage(img_bg, 0, 0, xx, yy);
        ctx.globalAlpha = 1;
        img_6.src = src + 'freeThrowMissedNew.png';
        img_6.onload = function() {
            ctx.drawImage(img_6, 120, 60, 231,130);
            ctx.font = v_font;
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Free throw missed"), 235, 170);
        };
        ctx.stroke();
    };
    this.undo = function (teamName,b,c,d,value,evName) {
        clearIntervals();
        ctx.beginPath();
        q = 1;
        if(value == 268 || value == 10536 || value ==  11536 || value == 12536 || value == 13536 ||
            value == 14536 || value == 15536 || value == 16536 || value == 17536 || value == 18536){
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
        }else {
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
                ctx.fillText(teamName, 235, 275 - q, 220);
                ctx.font = '22px RobotoBold';
                ctx.fillText(evName.toUpperCase(), 235, q+7, 220);
                q += 4;
                rSett = window.requestAnimFrame(loop);
                if(q > 115) cancelAnimationFrame(rSett);
            })();
            ctx.stroke();
        }
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
    this.statistic = function (counts) {
        setTimeout(stat,5000);
       var stat = function() {
            clearIntervals();
            content();
            //Transparent Rectangle
            ctx.beginPath();
            img_2.src = src + 'st.png';
            img_4.src = src + 'rectangle.png';
            img_4.onload = function () {
                ctx.drawImage(img_4, 64, 15, 343, 220);
                ctx.drawImage(img_2, 64, 15, 343, 40);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = '14px RobotoBold';

                ctx.font = '14px RobotoRegular';
                ctx.textAlign="right";
                ctx.fillText(Translator.get("Points"), 155, 90);
                ctx.fillText(Translator.get("Fouls"), 155, 145);
                ctx.fillText(Translator.get("Timeouts"), 155, 200);

                ctx.textAlign="start";
                ctx.font = '12px RobotoLight';
                ctx.fillText(Translator.get("Tot"), 167, 40);
                ctx.fillText(Translator.get("1st"), 210, 40);
                ctx.fillText(Translator.get("2nd"), 250, 40);
                ctx.fillText(Translator.get("3rd"), 290, 40);
                ctx.fillText(Translator.get("4th"), 330, 40);
                ctx.fillText(Translator.get("Ot"), 370, 40);

                ctx.textAlign="center";
                ctx.fillStyle = '#f4eb4b';
                ctx.font = '16px RobotoMedium';

                //points
                ctx.save();
                ctx.translate(-10,10);
                    ctx.fillText(   counts['1~1073'] || 0, 188, 70);
                    ctx.fillText(counts['h1~1~1073'] || 0, 228, 70);
                    ctx.fillText(counts['h2~1~1073'] || 0, 268, 70);
                    ctx.fillText(counts['h3~1~1073'] || 0, 308, 70);
                    ctx.fillText(counts['h4~1~1073'] || 0, 348, 70);
                    ctx.fillText(counts['to~1~1073'] || 0, 388, 70);

                    ctx.fillText(   counts['2~1073'] || 0, 188, 95);
                    ctx.fillText(counts['h1~2~1073'] || 0, 228, 95);
                    ctx.fillText(counts['h2~2~1073'] || 0, 268, 95);
                    ctx.fillText(counts['h3~2~1073'] || 0, 308, 95);
                    ctx.fillText(counts['h4~2~1073'] || 0, 348, 95);
                    ctx.fillText(counts['to~2~1073'] || 0, 388, 95);

                    ctx.strokeStyle = "white";
                    ctx.lineWidth = .2;
                    ctx.moveTo(74, 105);
                    ctx.lineTo(417, 105);
                    ctx.stroke();

                ctx.save();
                ctx.translate(0,-10);
                //fouls
                    ctx.fillText(   counts['1~816'] || 0, 188, 135);
                    ctx.fillText(counts['h1~1~816'] || 0, 228, 135);
                    ctx.fillText(counts['h2~1~816'] || 0, 268, 135);
                    ctx.fillText(counts['h3~1~816'] || 0, 308, 135);
                    ctx.fillText(counts['h4~1~816'] || 0, 348, 135);
                    ctx.fillText(counts['to~1~816'] || 0, 388, 135);

                    ctx.fillText(   counts['2~816'] || 0, 188, 160);
                    ctx.fillText(counts['h1~2~816'] || 0, 228, 160);
                    ctx.fillText(counts['h2~2~816'] || 0, 268, 160);
                    ctx.fillText(counts['h3~2~816'] || 0, 308, 160);
                    ctx.fillText(counts['h4~2~816'] || 0, 348, 160);
                    ctx.fillText(counts['to~2~816'] || 0, 388, 160);
                ctx.restore();

                ctx.moveTo(74, 160);
                ctx.lineTo(417, 160);
                ctx.stroke();

                ctx.save();
                ctx.translate(0,-20);
                    //timeouts
                    ctx.fillText(   counts['1~911'] || 0, 188, 200);
                    ctx.fillText(counts['h1~1~911'] || 0, 228, 200);
                    ctx.fillText(counts['h2~1~911'] || 0, 268, 200);
                    ctx.fillText(counts['h3~1~911'] || 0, 308, 200);
                    ctx.fillText(counts['h4~1~911'] || 0, 348, 200);
                    ctx.fillText(counts['to~1~911'] || 0, 388, 200);

                    ctx.fillText(   counts['2~911'] || 0, 188, 225);
                    ctx.fillText(counts['h1~2~911'] || 0, 228, 225);
                    ctx.fillText(counts['h2~2~911'] || 0, 268, 225);
                    ctx.fillText(counts['h3~2~911'] || 0, 308, 225);
                    ctx.fillText(counts['h4~2~911'] || 0, 348, 225);
                    ctx.fillText(counts['to~2~911'] || 0, 388, 225);
                ctx.restore();

                ctx.restore();


            };
            ctx.stroke();
        }
    };
}]);
