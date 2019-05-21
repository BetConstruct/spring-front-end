VBET5.service('soccerAnimation', ['animConstants', '$rootScope', 'Translator', function (animConstants, $rootScope, Translator) {
    'use strict';

    var c, cBall, ctx, ctxBall, xx, yy, grd, img, img_2, img_3, img_4, img_5, img_6, img_7, img_8, img_ball, sett,
        settBall, s_font, s_font_18, s_font_22, v_font;
    var animCodes = animConstants.soccer;

    this.startAnimate = function () {
        c = document.getElementById("canvas");
        cBall = document.getElementById("canvasBall");
        ctx = c.getContext("2d");
        ctxBall = cBall.getContext("2d");
        xx = c.width;
        yy = c.height;
        grd = ctx.createRadialGradient(240, 50, 0, 300, 250, 300);
        img = new Image();
        img_2 = new Image();
        img_3 = new Image();
        img_4 = new Image();
        img_5 = new Image();
        img_6 = new Image();
        img_7 = new Image();
        img_8 = new Image();
        img_ball = new Image();
        s_font = '24px RobotoBold';
        s_font_18 = '18px RobotoLight';
        s_font_22 = '22px RobotoBold';
        v_font = '16px RobotoLight';

        content();
        loadFonts();
        $rootScope.$emit('lastAnim', true);
    };
    this.animate = function (evCode, teamName, evAddi, evTeam, evValue, evName, teamsNames, counts, penalty) {
        ctxBall.clearRect(0, 0, xx, yy);
        teamName = teamName || '';
        evAddi = evAddi || '{"x":100,"y":0}';
        evTeam = evTeam || '';
        evValue = evValue || '';
        evName = evName || '';
        teamsNames = teamsNames || '';
        counts = counts || '';
        penalty = penalty || '';


        !!animCodes[evCode] && angular.isFunction(this[animCodes[evCode]]) && this[animCodes[evCode]](teamName, evAddi, evTeam, evValue, evName, teamsNames, counts, penalty);

        // if(evCode == 221){
        //         !!animCodes[evCode] && angular.isFunction(this[animCodes[evCode]]) && this[animCodes[evCode]](teamName, evAddi, evTeam, evValue, evName, teamsNames, counts, penalty);
        // }else{
        //     setTimeout(() => {
        //         !!animCodes[evCode] && angular.isFunction(this[animCodes[evCode]]) && this[animCodes[evCode]](teamName, evAddi, evTeam, evValue, evName, teamsNames, counts, penalty);
        //     },1000);
        // }


    };
    var content = function (bool) {
        ctx.beginPath();
//Gradient
        grd.addColorStop(0, "#2E996C");
        grd.addColorStop(1, "#147844");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, xx, yy);
//Arc
        ctx.arc(xx / 2, yy / 2, 45, 0, 2 * Math.PI);
//Line
        ctx.strokeStyle = "white";
        ctx.moveTo(10, 10);
        ctx.lineTo(xx - 10, yy - 240);
        ctx.moveTo(10, 10);
        ctx.lineTo(10, yy - 10);
        ctx.moveTo(xx - 10, 10);
        ctx.lineTo(xx - 10, yy - 10);
        ctx.moveTo(10, yy - 10);
        ctx.lineTo(xx - 10, yy - 10);
        ctx.moveTo(xx - 235, 10);
        ctx.lineTo(xx - 235, yy - 10);
//Left Goal
        ctx.moveTo(10, 55);
        ctx.lineTo(70, 55);
        ctx.moveTo(10, 195);
        ctx.lineTo(70, 195);
        ctx.moveTo(70, 54);
        ctx.lineTo(70, 196);
        ctx.moveTo(10, 85);
        ctx.lineTo(38, 85);
        ctx.moveTo(10, 165);
        ctx.lineTo(38, 165);
        ctx.moveTo(38, 84);
        ctx.lineTo(38, 166);
//Right Goal
        ctx.moveTo(397, 55);
        ctx.lineTo(xx - 10, 55);
        ctx.moveTo(397, 195);
        ctx.lineTo(xx - 10, 195);
        ctx.moveTo(397, 54);
        ctx.lineTo(397, 196);
        ctx.moveTo(432, 80);
        ctx.lineTo(xx - 10, 80);
        ctx.moveTo(432, 170);
        ctx.lineTo(xx - 10, 170);
        ctx.moveTo(432, 80);
        ctx.lineTo(432, 170);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.stroke();
//Corner_1
        if (bool != 1) {
            ctx.beginPath();
            ctx.arc(10, 10, 10, 0, 0.5 * Math.PI);
            ctx.stroke();
        }
//Corner_2
        if (bool != 2) {
            ctx.beginPath();
            ctx.arc(460, 10, 10, 1.5, 1 * Math.PI);
            ctx.stroke();
        }
//Corner_3
        if (bool != 3) {
            ctx.beginPath();
            ctx.arc(460, 240, 10, 3, 1.5 * Math.PI);
            ctx.stroke();
        }
//Corner_4
        if (bool != 4) {
            ctx.beginPath();
            ctx.arc(10, 240, 10, 4.8, 2 * Math.PI);
            ctx.stroke();
        }
//Goal Arc Lefat
        ctx.beginPath();
        ctx.arc(55, yy / 2, 30, -1, 0.32 * Math.PI);
        ctx.stroke();
//Goal Arc Right
        ctx.beginPath();
        ctx.arc(414, yy / 2, 30, 2.2, 1.3 * Math.PI);
        ctx.stroke();
//Circular_1
        ctx.beginPath();
        ctx.arc(235, yy / 2, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
//Circular_Left
        ctx.beginPath();
        ctx.arc(50, yy / 2, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
//Circular_Right
        ctx.beginPath();
        ctx.arc(415, yy / 2, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
    };
    var loadFonts = function () {
        ctx.beginPath();
        ctx.font = s_font;
        ctx.fillText('', 0, 0);
        ctx.font = v_font;
        ctx.fillText('', 0, 0);
        ctx.font = '18px RobotoRegular';
        ctx.fillText('', 0, 0);
        ctx.font = '13px RobotoMedium';
        ctx.fillText('', 0, 0);
        ctx.stroke();
    };
    var clearIntervals = function () {
        ctxBall.clearRect(0, 0, xx, yy);
        window.clearInterval(sett);
        window.clearInterval(settBall);
    };
    this.yellowCard = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/yellowCard.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 140, q - 15);
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Yellow card"), 250, q + 6);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.doubleYellowCard = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img_6.src = 'images/animation/feedconstruct/soccer/yellowCard.png';
            img_7.src = 'images/animation/feedconstruct/soccer/redCard.png';
            img.onload = function () {
            };
            ctx.drawImage(img_6, 160, q - 20);
            ctx.drawImage(img_7, 155, q - 25);
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Red card"), 250, q);
            ctx.font = '12px RobotoLight';
            ctx.fillText(Translator.get("2x yellow card"), 235, q + 16);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.redCard = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/redCard.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 160, q - 15);
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Red card"), 250, q + 6);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.clearBall = function () {
        content();
    };
    this.possible = function (a, b, c, d, EvName) {
        switch (EvName) {
            case 'Possible Yellow card':
                possibleYellowCard();
                break;
            case 'Possible Red card':
                possibleRedCard();
                break;
            case 'Possible Corner':
                possibleCorner();
                break;
            case 'Possible Goal':
                possibleGoal();
                break;
            case 'Possible Penalty awarded':
                possiblePenalty();
                break;
            case 'Possible Free kick':
                possibleFreeKick();
                break;
        }

        var possibleYellowCard = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                img.src = 'images/animation/feedconstruct/soccer/yellowCard.png';
                img.onload = function () {
                };
                ctx.drawImage(img, 160, q - 15);
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Possible"), 250, q + 5);
                ctx.fillText(Translator.get("Yellow card"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var possibleRedCard = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                img.src = 'images/animation/feedconstruct/soccer/redCard.png';
                img.onload = function () {
                };
                ctx.drawImage(img, 160, q - 15);
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Possible"), 250, q + 5);
                ctx.fillText(Translator.get("Red card"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var possibleCorner = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Possible"), 235, q + 5);
                ctx.fillText(Translator.get("Corner"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var possibleGoal = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Possible"), 235, q + 5);
                ctx.fillText(Translator.get("Goal"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var possiblePenalty = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Possible"), 235, q + 5);
                ctx.fillText(Translator.get("Penalty"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var possibleFreeKick = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Possible"), 235, q + 5);
                ctx.fillText(Translator.get("Free kick"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        }
    };
    this.noPossible = function (a, b, c, d, EvName) {
        switch (EvName) {
            case 'No Yellow card':
                noYellowCard();
                break;
            case 'No Red card':
                noRedCard();
                break;
            case 'No Corner':
                noCorner();
                break;
            case 'No Goal':
                noGoal();
                break;
            case 'No Penalty awarded':
                noPenalty();
                break;
            case 'No Free kick':
                noFreeKick();
                break;
        }

        var noYellowCard = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("No"), 235, q + 5);
                ctx.fillText(Translator.get("Yellow card"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var noRedCard = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("No"), 235, q + 5);
                ctx.fillText(Translator.get("Red card"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var noCorner = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("No"), 235, q + 5);
                ctx.fillText(Translator.get("Corner"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var noGoal = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("No"), 235, q + 5);
                ctx.fillText(Translator.get("Goal"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var noPenalty = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("No"), 235, q + 5);
                ctx.fillText(Translator.get("Penalty"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        };

        var noFreeKick = function () {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("No"), 235, q + 5);
                ctx.fillText(Translator.get("Free kick"), 235, 260 - q);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        }
    };
    this.undo = function (team, a, b, value, name) {
        if (name == "Undo: Goal(Offside)" || name == "Undo Goal(Offside)") {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                img.src = 'images/animation/feedconstruct/soccer/offside.png';
                img.onload = function () {
                };
                ctx.drawImage(img, 160, q - 15);
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Offside"), 250, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 260 - q, 220);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        } else {
            if (value == 268 || value == 1022 || value == 10536 || value == 11536 || value == 12536 || value == 13536 ||
                value == 14536 || value == 15536 || value == 16536 || value == 17536 || value == 18536) {
                clearIntervals();
                content();
                ctx.beginPath();
                var q = 1, c = 1;

                var Show = function () {
                    if (q > 110) {
                        clearInterval(sett);
                    }
                    content();
                    //Transparent Rectangle
                    if (c > 59) {
                        c = 60
                    }
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                    img_4.onload = function () {
                    };
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    ctx.textAlign = "center";
                    ctx.font = '16px RobotoBold';
                    ctx.fillText(Translator.get(name), 235, q + 16);
                    q += 2;
                    c++;
                };

                sett = setInterval(Show, 7);
                ctx.stroke();
            } else {
                clearIntervals();
                content();
                ctx.beginPath();
                var q = 1, c = 1;

                var Show = function () {
                    if (q > 110) {
                        clearInterval(sett);
                    }
                    content();
                    //Transparent Rectangle
                    if (c > 59) {
                        c = 60
                    }
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                    img_4.onload = function () {
                    };
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    ctx.textAlign = "center";
                    ctx.font = '18px RobotoBold';
                    ctx.fillText(Translator.get(name), 235, q + 6);
                    ctx.font = v_font;
                    ctx.fillText(team, 235, 260 - q, 220);
                    q += 2;
                    c++;
                };
                sett = setInterval(Show, 7);
                ctx.stroke();
            }
        }
    };
    this.injuryBreak = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/apt.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 208, q - 25);
            ctx.textAlign = "center";
            ctx.font = '18px RobotoRegular';
            ctx.fillText(Translator.get("Injury break"), 235, 275 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.substitution = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1, i = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
                sett = setInterval(sub, 15);

                var sub = function () {
                    ctx.save();
                    ctx.clearRect(0, 0, xx, yy);
                    content();
                    Show();
                    ctx.translate(237, q - 12);
                    ctx.rotate(i * Math.PI / 180);
                    ctx.drawImage(img, -23, -23);
                    ctx.restore();
                    i--;
                };
            }
            content();
            //Transparent Rectangle

            var Show = function () {
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = v_font;
                ctx.fillText(Translator.get("Substitution"), 235, 262 - q);
                ctx.fillText(team, 235, 282 - q, 220);
            };

            Show();

            img.src = 'images/animation/feedconstruct/soccer/sub.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 213, q - 37);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.corner = function (team, a, te, eventValue) {
        if (te == 1) {
            if (eventValue == 1) {
                clearIntervals();
                content();
                var i = 0.1;
                var s = 1;
                ctx.beginPath();

                var cornImg = function () {
                    var q = 1;
                    var c = 1;
                    var swit = 1;

                    var cornShow = function () {
                        if (q > 120) {
                            clearInterval(sett);

                            var showImg = function () {
                                if (s > 100) {
                                    clearInterval(sett);
                                }
                                else {
                                    content(2);

                                    var callCorner = function () {
                                        ctx.globalAlpha = 1;
                                        //Img Corner
                                        img.src = 'images/animation/feedconstruct/soccer/corner_1.png';
                                        img.onload = function () {
                                        };
                                        ctx.drawImage(img, 360, 10, 100, 100);
                                        //Transparent Rectangle
                                        ctx.beginPath();
                                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                                        img_4.onload = function () {
                                        };
                                        ctx.drawImage(img_4, 120, 60, 230, q + 8);
                                        //Text
                                        ctx.globalAlpha = 1;
                                        ctx.fillStyle = 'white';
                                        ctx.font = s_font;
                                        ctx.textAlign = "center";
                                        ctx.fillText(Translator.get("Corner kick"), 235, q - 3);
                                        ctx.font = v_font;
                                        ctx.fillText(team, 235, 270 - q + 2, 220);
                                    };

                                    if (i > 1) {
                                        swit = 0;
                                    }
                                    if (swit == 1) {
                                        callCorner();
                                        i += 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.drawImage(img_2, 400, 25, 40, 70);
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.drawImage(img_3, 370, 0, 100, 100);
                                        ctx.restore();
                                        s++;
                                    } else {
                                        callCorner();
                                        i -= 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.drawImage(img_2, 400, 25, 40, 70);
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.drawImage(img_3, 370, 0, 100, 100);
                                        ctx.restore();
                                        s++;
                                        if (i < 0) {
                                            swit = 1;
                                        }
                                    }
                                }
                            };

                            sett = setInterval(showImg, 70);
                        }
                        content();
                        //Transparent Rectangle
                        if (c > 59) {
                            c = 60
                        }
                        ctx.beginPath();
                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                        img_4.onload = function () {
                        };
                        ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                        ctx.font = s_font;
                        ctx.textAlign = "center";
                        ctx.fillText(Translator.get("Corner kick"), 235, q - 1);
                        ctx.font = v_font;
                        ctx.fillText(team, 235, 270 - q, 220);
                        q += 2;
                        c++;
                    }

                    sett = setInterval(cornShow, 7)
                };

                cornImg();
                ctx.stroke();
            }
            else {
                clearIntervals();
                content();
                var i = 0.1;
                var s = 1;
                ctx.beginPath();

                var cornImg = function () {
                    var q = 1;
                    var c = 1;
                    var swit = 1;

                    var cornShow = function () {
                        if (q > 120) {
                            clearInterval(sett);

                            var showImg = function () {
                                if (s > 100) {
                                    clearInterval(sett);
                                }
                                else {
                                    content(3);

                                    var callCorner = function () {
                                        ctx.globalAlpha = 1;
                                        //Img Corner
                                        img.src = 'images/animation/feedconstruct/soccer/corner_1.png';
                                        img.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.translate(460, 140);
                                        ctx.rotate(90 * Math.PI / 180);
                                        ctx.drawImage(img, 0, 0, 100, 100);
                                        ctx.restore();
                                        //Transparent Rectangle
                                        ctx.beginPath();
                                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                                        img_4.onload = function () {
                                        };
                                        ctx.drawImage(img_4, 120, 60, 230, q + 8);
                                        //Text
                                        ctx.globalAlpha = 1;
                                        ctx.fillStyle = 'white';
                                        ctx.font = s_font;
                                        ctx.textAlign = "center";
                                        ctx.fillText(Translator.get("Corner kick"), 235, q - 3);
                                        ctx.font = v_font;
                                        ctx.fillText(team, 235, 270 - q + 2);
                                    };

                                    if (i > 1) {
                                        swit = 0;
                                    }
                                    if (swit == 1) {
                                        callCorner();
                                        i += 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_left_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.save();
                                        ctx.translate(470, 250);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img_2, 25, 25, 40, 70);
                                        ctx.restore();
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.translate(467, 147);
                                        ctx.rotate(90 * Math.PI / 180);
                                        ctx.drawImage(img_3, 2, -3, 100, 100);
                                        ctx.restore();
                                        s++;
                                    } else {
                                        callCorner();
                                        i -= 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_left_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.save();
                                        ctx.translate(470, 250);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img_2, 25, 25, 40, 70);
                                        ctx.restore();
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.translate(467, 147);
                                        ctx.rotate(90 * Math.PI / 180);
                                        ctx.drawImage(img_3, 2, -3, 100, 100);
                                        ctx.restore();
                                        s++;
                                        if (i < 0) {
                                            swit = 1;
                                        }
                                    }
                                }
                            };

                            sett = setInterval(showImg, 70);
                        }
                        content();
                        //Transparent Rectangle
                        if (c > 59) {
                            c = 60
                        }

                        ctx.beginPath();
                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                        img_4.onload = function () {
                        };
                        ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                        ctx.font = s_font;
                        ctx.textAlign = "center";
                        ctx.fillText(Translator.get("Corner kick"), 235, q - 1);
                        ctx.font = v_font;
                        ctx.fillText(team, 235, 270 - q);
                        q += 2;
                        c++;
                    }

                    sett = setInterval(cornShow, 7)
                };

                cornImg();
                ctx.stroke();
            }
        } else {
            if (eventValue == 2) {
                clearIntervals();
                content();
                var i = 0.1;
                var s = 1;
                ctx.beginPath();

                var cornImg = function () {
                    var q = 1;
                    var c = 1;
                    var swit = 1;

                    var cornShow = function () {
                        if (q > 120) {
                            clearInterval(sett);

                            var showImg = function () {
                                if (s > 100) {
                                    clearInterval(sett);
                                }
                                else {
                                    content(1);

                                    var callCorner = function () {
                                        ctx.globalAlpha = 1;
                                        //Img Corner
                                        img.src = 'images/animation/feedconstruct/soccer/corner_1.png';
                                        img.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.translate(10, 110);
                                        ctx.rotate(270 * Math.PI / 180);
                                        ctx.drawImage(img, 0, 0, 100, 100);
                                        ctx.restore();
                                        //Transparent Rectangle
                                        ctx.beginPath();
                                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                                        img_4.onload = function () {
                                        };
                                        ctx.drawImage(img_4, 120, 60, 230, q + 8);
                                        //Text
                                        ctx.globalAlpha = 1;
                                        ctx.fillStyle = 'white';
                                        ctx.font = s_font;
                                        ctx.textAlign = "center";
                                        ctx.fillText(Translator.get("Corner kick"), 235, q - 3);
                                        ctx.font = v_font;
                                        ctx.fillText(team, 235, 270 - q + 2);
                                    };

                                    if (i > 1) {
                                        swit = 0;
                                    }
                                    if (swit == 1) {
                                        callCorner();
                                        i += 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_left_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.save();
                                        ctx.drawImage(img_2, 25, 25, 40, 70);
                                        ctx.restore();
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.translate(3, 103);
                                        ctx.rotate(270 * Math.PI / 180);
                                        ctx.drawImage(img_3, 2, -3, 100, 100);
                                        ctx.restore();
                                        s++;
                                    } else {
                                        callCorner();
                                        i -= 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_left_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.save();
                                        ctx.drawImage(img_2, 25, 25, 40, 70);
                                        ctx.restore();
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.translate(3, 103);
                                        ctx.rotate(270 * Math.PI / 180);
                                        ctx.drawImage(img_3, 2, -3, 100, 100);
                                        ctx.restore();
                                        s++;
                                        if (i < 0) {
                                            swit = 1;
                                        }
                                    }
                                }
                            };

                            sett = setInterval(showImg, 70);
                        }
                        content();
                        //Transparent Rectangle
                        if (c > 59) {
                            c = 60
                        }

                        ctx.beginPath();
                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                        img_4.onload = function () {
                        };
                        ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                        ctx.font = s_font;
                        ctx.textAlign = "center";
                        ctx.fillText(Translator.get("Corner kick"), 235, q - 1);
                        ctx.font = v_font;
                        ctx.fillText(team, 235, 270 - q);
                        q += 2;
                        c++;
                    };

                    sett = setInterval(cornShow, 7)
                };

                cornImg();
                ctx.stroke();
            }
            else {
                clearIntervals();
                content();
                var i = 0.1;
                var s = 1;
                ctx.beginPath();

                var cornImg = function () {
                    var q = 1;
                    var c = 1;
                    var swit = 1;

                    var cornShow = function () {
                        if (q > 120) {
                            clearInterval(sett);

                            var showImg = function () {
                                if (s > 100) {
                                    clearInterval(sett);
                                }
                                else {
                                    content(4);

                                    var callCorner = function () {
                                        ctx.globalAlpha = 1;
                                        //Img Corner
                                        img.src = 'images/animation/feedconstruct/soccer/corner_1.png';
                                        img.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.translate(110, 240);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img, 0, 0, 100, 100);
                                        ctx.restore();
                                        //Transparent Rectangle
                                        ctx.beginPath();
                                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                                        img_4.onload = function () {
                                        };
                                        ctx.drawImage(img_4, 120, 60, 230, q + 8);
                                        //Text
                                        ctx.globalAlpha = 1;
                                        ctx.fillStyle = 'white';
                                        ctx.font = s_font;
                                        ctx.textAlign = "center";
                                        ctx.fillText(Translator.get("Corner kick"), 235, q - 3);
                                        ctx.font = v_font;
                                        ctx.fillText(team, 235, 270 - q + 2);
                                    };

                                    if (i > 1) {
                                        swit = 0;
                                    }
                                    if (swit == 1) {
                                        callCorner();
                                        i += 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.save();
                                        ctx.translate(90, 250);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img_2, 25, 25, 40, 70);
                                        ctx.restore();
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.translate(103, 247);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img_3, 2, -3, 100, 100);
                                        ctx.restore();
                                        s++;
                                    } else {
                                        callCorner();
                                        i -= 0.05;
                                        img_2.src = 'images/animation/feedconstruct/soccer/corner_2.png';
                                        img_2.onload = function () {
                                        };
                                        ctx.save();
                                        ctx.globalAlpha = 0.1 + i;
                                        ctx.save();
                                        ctx.translate(90, 250);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img_2, 25, 25, 40, 70);
                                        ctx.restore();
                                        img_3.src = 'images/animation/feedconstruct/soccer/corner_3.png';
                                        img_3.onload = function () {
                                        };
                                        ctx.translate(103, 247);
                                        ctx.rotate(180 * Math.PI / 180);
                                        ctx.drawImage(img_3, 2, -3, 100, 100);
                                        ctx.restore();
                                        s++;
                                        if (i < 0) {
                                            swit = 1;
                                        }
                                    }
                                }
                            };

                            sett = setInterval(showImg, 70);
                        }
                        content();
                        //Transparent Rectangle
                        if (c > 59) {
                            c = 60
                        }
                        ctx.beginPath();
                        img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                        img_4.onload = function () {
                        };
                        ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                        ctx.font = s_font;
                        ctx.textAlign = "center";
                        ctx.fillText(Translator.get("Corner kick"), 235, q - 1);
                        ctx.font = v_font;
                        ctx.fillText(team, 235, 270 - q);
                        q += 2;
                        c++;
                    };

                    sett = setInterval(cornShow, 7)
                };

                cornImg();
                ctx.stroke();
            }
        }
    };
    this.throwin = function (team, throwin, te) {
        var throwin = JSON.parse(throwin);
        var x = (xx * throwin.x) / 100;
        var y;
        if (throwin.y == 100) {
            y = 200;
        } else {
            y = -20;
        }
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1, d = 0, i = 0;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
                if (te == 1) {
                    sett = setInterval(ellipse, 15);
                } else {
                    sett = setInterval(ellipseTwo, 15);
                }

            }

            var newImg = function () {
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = s_font;
                ctx.textAlign = "center";
                ctx.fillText(Translator.get("Throw in"), 235, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 265 - q, 220);
                //Img Throw in
                img_ball.src = 'images/animation/feedconstruct/soccer/ball.png';
                img_7.src = 'images/animation/feedconstruct/soccer/throw_in.png';
                img_6.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
                if (throwin.y == 0) {
                    ctx.save();
                    ctx.translate(x + 170, y + 170);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img_7, 100, 100, 120, 40);
                    ctx.restore();
                    ctx.drawImage(img_ball, x, y + 25, 17, 17);
                } else {
                    ctx.drawImage(img_7, x - 50, y, 120, 40);
                    ctx.drawImage(img_ball, x, y + 25, 17, 17);
                }
            };

            q += 2;
            c++;
            newImg();

            var ellipse = function () {
                content();
                newImg();
                ctx.save();
                ctx.globalAlpha = i;
                if (throwin.y == 0) {
                    ctx.save();
                    ctx.translate(x + 17, y + 45);
                    ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(img_6, 0, 0);
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.translate(x, y + 25);
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.drawImage(img_6, 0, 0);
                    ctx.restore();
                }
                ctx.restore();
                if (d == 0) {
                    i += 0.01;
                    if (i > 1.1) {
                        d = 1;
                    }
                }
                if (d == 1) {
                    i -= 0.01;
                    if (i < 0.3) {
                        d = 0;
                    }
                }
            };

            var ellipseTwo = function () {
                content();
                newImg();
                ctx.save();
                ctx.globalAlpha = i;
                if (throwin.y == 0) {
                    ctx.save();
                    ctx.translate(x + 17, y + 45);
                    ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(img_6, 0, 0);
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.translate(x, y + 25);
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.drawImage(img_6, 0, 0);
                    ctx.restore();
                }
                ctx.restore();
                if (d == 0) {
                    i += 0.01;
                    if (i > 1.1) {
                        d = 1;
                    }
                }
                if (d == 1) {
                    i -= 0.01;
                    if (i < 0.3) {
                        d = 0;
                    }
                }
            }
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.freeKick = function (team, additional, te) {
        var additional = JSON.parse(additional);
        var x = (xx * additional.x) / 100;
        var y = (yy * additional.y) / 100;
        var reason = additional.reason.toUpperCase();
        if (te == 1) {
            clearIntervals();
            content();
            var f = 1;
            var s = 1;
            img_3.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
            img_3.onload = function () {
            };
            img.src = 'images/animation/feedconstruct/soccer/ball.png';
            img.onload = function () {
            };


            var freeKickShow = function () {
                if (f > 20) {
                    f = 1;
                }
                if (s > 60) {
                    clearInterval(sett);
                }
                ctx.clearRect(100, 0, 200, 200);

                content();
                ctx.drawImage(img, x, y, 17, 17);
                ctx.drawImage(img_3, x + f, y, 60, 15);

                //Transparent Rectangle
                ctx.beginPath();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#31343d';
                ctx.fillRect(0, 187, xx, 80);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = s_font_22;
                ctx.textAlign = "start";
                ctx.fillText(reason + ' FREE KICK', 40, 223);
                ctx.font = s_font_18;
                ctx.textAlign = "right";
                ctx.fillText(team, 430, 223, 220);
                f += 1;
                s++;
            };

            sett = setInterval(freeKickShow, 30);
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            var f = 1;
            var s = 1;
            img_3.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
            img_3.onload = function () {
            };
            img.src = 'images/animation/feedconstruct/soccer/ball.png';
            img.onload = function () {
            };

            var freeKickShow = function () {
                if (f < -18) {
                    f = 1;
                }
                if (s > 60) {
                    clearInterval(sett);
                }
                ctx.clearRect(100, 0, 200, 200);
                content();
                ctx.drawImage(img, x - 9, y - 9, 17, 17);
                ctx.save();
                ctx.translate(x + f, y + 7);
                ctx.rotate(180 * Math.PI / 180);
                ctx.drawImage(img_3, 0, 0, 60, 15);
                ctx.restore();
                //Transparent Rectangle
                ctx.beginPath();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#31343d';
                ctx.fillRect(0, 187, xx, 80);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = s_font_22;
                ctx.textAlign = "start";
                ctx.fillText(reason + ' FREE KICK', 40, 223);
                ctx.font = s_font_18;
                ctx.textAlign = "right";
                ctx.fillText(team, 430, 223);
                f--;
                s++;
            };

            sett = setInterval(freeKickShow, 30);
            ctx.stroke();
        }
    };
    this.goalKick = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            var f = 1;
            var s = 1;

            var goalShow = function () {
                if (f > 20) {
                    f = 1;
                }
                if (s > 60) {
                    clearInterval(sett);
                }
                img_3.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
                ctx.clearRect(60, 117, 200, 200);
                content();
                img.src = 'images/animation/feedconstruct/soccer/goal_kick_new.png';
                img.onload = function () {
                };
                ctx.drawImage(img, 0, 75);
                img_3.onload = function () {
                };
                ctx.drawImage(img_3, 60 + f, 117, 60, 15);
                //Transparent Rectangle
                ctx.beginPath();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#31343d';
                ctx.fillRect(0, 187, xx, 80);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = s_font_22;
                ctx.textAlign = "start";
                ctx.fillText(Translator.get("Goal kick"), 40, 223);
                ctx.font = s_font_18;
                ctx.textAlign = "right";
                ctx.fillText(team, 430, 223, 220);
                f += 1;
                s++;
            };

            sett = setInterval(goalShow, 30);
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            var f = 1;
            var s = 1;

            var goalShow = function () {
                if (f < -18) {
                    f = 1;
                }
                if (s > 60) {
                    clearInterval(sett);
                }
                img_3.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
                ctx.clearRect(60, 117, 200, 200);
                content();
                img.src = 'images/animation/feedconstruct/soccer/goal_kick_new.png';
                img.onload = function () {
                };
                ctx.drawImage(img, 360, 75);

                img_3.onload = function () {
                };
                ctx.save();
                ctx.translate(400 + f, 132);
                ctx.rotate(180 * Math.PI / 180);
                ctx.drawImage(img_3, 0, 0, 60, 15);
                ctx.restore();

                //Transparent Rectangle
                ctx.beginPath();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#31343d';
                ctx.fillRect(0, 187, xx, 80);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = s_font_22;
                ctx.textAlign = "start";
                ctx.fillText(Translator.get("Goal kick"), 40, 223);
                ctx.font = s_font_18;
                ctx.textAlign = "right";
                ctx.fillText(team, 430, 223);
                f--;
                s++;
            };

            sett = setInterval(goalShow, 30);
            ctx.stroke();
        }
    };
    this.shotOff = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                    imgShow();
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Shot off target"), 235, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 260 - q, 220);
                q += 2;
                c++;

                function imgShow() {
                    img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, 355, 83, 85, 85);
                        img.src = 'images/animation/feedconstruct/soccer/ball.png';
                        img.onload = function () {
                            ctx.drawImage(img, 390, 116, 17, 17);
                        }
                    };
                    img_3.src = 'images/animation/feedconstruct/soccer/shot_1.png';
                    img_3.onload = function () {
                        ctx.drawImage(img_3, 408, 83, 50, 25);
                    };
                    img_5.src = 'images/animation/feedconstruct/soccer/shot_2.png';
                    img_5.onload = function () {
                        ctx.drawImage(img_5, 408, 142, 50, 25);
                    }
                }
            };

            sett = setInterval(Show, 7);
            ctx.stroke();


            /*clearIntervals();
            content();
//Transparent Rectangle
            ctx.beginPath();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#31343d';
            ctx.fillRect(0, 187, xx, 80);
//Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = s_font_22;
            ctx.textAlign="start";
            ctx.fillText(Translator.get("Shot off target"),40,223);
            ctx.font = s_font_18;
            ctx.textAlign = "right";
            ctx.fillText(team,425,223);
            //Img Throw in
            img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
            img_2.onload = function() {
                ctx.drawImage(img_2, 355, 83,85,85);
                img.src = 'images/animation/feedconstruct/soccer/ball.png';
                img.onload = function() {
                    ctx.drawImage(img, 390, 116,17,17);
                }
            }
            img_3.src = 'images/animation/feedconstruct/soccer/shot_1.png';
            img_3.onload = function() {
                ctx.drawImage(img_3, 408, 83,50,25);
            }
            img_4.src = 'images/animation/feedconstruct/soccer/shot_2.png';
            img_4.onload = function() {
                ctx.drawImage(img_4, 408, 142,50,25);
            }
            ctx.stroke();*/
        }
        else {

            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                    imgShow();
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_5.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_5.onload = function () {
                };
                ctx.drawImage(img_5, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Shot off target"), 235, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 260 - q);
                q += 2;
                c++;

                function imgShow() {
                    img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, 25, 83, 85, 85);
                        img.src = 'images/animation/feedconstruct/soccer/ball.png';
                        img.onload = function () {
                            ctx.drawImage(img, 60, 116, 17, 17);
                        }
                    };
                    img_3.src = 'images/animation/feedconstruct/soccer/shot_1.png';
                    img_3.onload = function () {
                        ctx.save();
                        ctx.translate(63, 162);
                        ctx.rotate(180 * Math.PI / 180);
                        ctx.drawImage(img_3, 0, 0, 50, 25);
                        ctx.restore();
                    };
                    img_4.src = 'images/animation/feedconstruct/soccer/shot_2.png';
                    img_4.onload = function () {
                        ctx.save();
                        ctx.translate(63, 113);
                        ctx.rotate(180 * Math.PI / 180);
                        ctx.drawImage(img_4, 0, 0, 50, 25);
                        ctx.restore();
                    }
                }
            };

            sett = setInterval(Show, 7);
            ctx.stroke();


            /*clearIntervals();
            content();
//Transparent Rectangle
            ctx.beginPath();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#31343d';
            ctx.fillRect(0, 187, xx, 80);
//Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = s_font_22;
            ctx.textAlign="start";
            ctx.fillText(Translator.get("Shot off target"),40,223);
            ctx.font = s_font_18;
            ctx.textAlign = "right";
            ctx.fillText(team,425,223);
            //Img Throw in
            img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
            img_2.onload = function() {
                ctx.drawImage(img_2, 25, 83,85,85);
                img.src = 'images/animation/feedconstruct/soccer/ball.png';
                img.onload = function() {
                    ctx.drawImage(img, 60, 116,17,17);
                }
            }
            img_3.src = 'images/animation/feedconstruct/soccer/shot_1.png';
            img_3.onload = function() {
                ctx.save();
                ctx.translate(63,162);
                ctx.rotate(180*Math.PI/180);
                ctx.drawImage(img_3, 0, 0,50,25);
                ctx.restore();
            }
            img_4.src = 'images/animation/feedconstruct/soccer/shot_2.png';
            img_4.onload = function() {
                ctx.save();
                ctx.translate(63,113);
                ctx.rotate(180*Math.PI/180);
                ctx.drawImage(img_4, 0, 0,50,25);
                ctx.restore();
            }
            ctx.stroke();*/
        }
    };
    this.shotOn = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                    imgShow();
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Shot on target"), 235, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 260 - q, 220);
                q += 2;
                c++;

                function imgShow() {
                    img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, 355, 83, 85, 85);
                        img.src = 'images/animation/feedconstruct/soccer/ball.png';
                        img.onload = function () {
                            ctx.drawImage(img, 390, 116, 17, 17);
                        }
                    };
                    img_3.src = 'images/animation/feedconstruct/soccer/shot_on.png';
                    img_3.onload = function () {
                        ctx.drawImage(img_3, 415, 116, 42, 18);
                    }
                }
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
            /*clearIntervals();
            content();
//Transparent Rectangle
            ctx.beginPath();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#31343d';
            ctx.fillRect(0, 187, xx, 80);
//Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = s_font_22;
            ctx.textAlign="start";
            ctx.fillText(Translator.get("Shot on target"),40,223);
            ctx.font = s_font_18;
            ctx.textAlign = "right";
            ctx.fillText(team,425,223);
            //Img Throw in
            img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
            img_2.onload = function() {
                ctx.drawImage(img_2, 355, 83,85,85);
                img.src = 'images/animation/feedconstruct/soccer/ball.png';
                img.onload = function() {
                    ctx.drawImage(img, 390, 116,17,17);
                }
            }
            img_3.src = 'images/animation/feedconstruct/soccer/shot_on.png';
            img_3.onload = function() {
                ctx.drawImage(img_3, 415, 116,42,18);
            }
            ctx.stroke();*/
        }
        else {
            clearIntervals();
            content();
            ctx.beginPath();
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                    imgShow();
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Shot on target"), 235, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 260 - q);
                q += 2;
                c++;

                function imgShow() {
                    img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, 25, 83, 85, 85);
                        img.src = 'images/animation/feedconstruct/soccer/ball.png';
                        img.onload = function () {
                            ctx.drawImage(img, 60, 116, 17, 17);
                        }
                    };
                    img_3.src = 'images/animation/feedconstruct/soccer/shot_on.png';
                    img_3.onload = function () {
                        ctx.save();
                        ctx.translate(55, 133);
                        ctx.rotate(180 * Math.PI / 180);
                        ctx.drawImage(img_3, 0, 0, 45, 18);
                        ctx.restore();
                    }
                }
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
            /*clearIntervals();
            content();
//Transparent Rectangle
            ctx.beginPath();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#31343d';
            ctx.fillRect(0, 187, xx, 80);
//Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = s_font_22;
            ctx.textAlign="start";
            ctx.fillText(Translator.get("Shot on target"),40,223);
            ctx.font = s_font_18;
            ctx.textAlign = "right";
            ctx.fillText(team,425,223);
            //Img Throw in
            img_2.src = 'images/animation/feedconstruct/soccer/free_kick.png';
            img_2.onload = function() {
                ctx.drawImage(img_2, 25, 83,85,85);
                img.src = 'images/animation/feedconstruct/soccer/ball.png';
                img.onload = function() {
                    ctx.drawImage(img, 60, 116,17,17);
                }
            }
            img_3.src = 'images/animation/feedconstruct/soccer/shot_on.png';
            img_3.onload = function() {
                ctx.save();
                ctx.translate(55,133);
                ctx.rotate(180*Math.PI/180);
                ctx.drawImage(img_3, 0, 0,45,18);
                ctx.restore();
            }
            ctx.stroke();*/
        }
    };
    this.ballSafe = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var BallSafeImg = function () {
                if (zz > 218) {
                    clearInterval(sett);

                    var ballSafeTr = function () {
                        if (dd > 60) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.3) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.drawImage(img, zz - 220, 0, 220, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Ball safe"), zz - 170, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 160, 140, 140);
                        } else {
                            ctx.drawImage(img, zz - 220, 0, 220, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Ball safe"), zz - 170, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 160, 140, 140);
                        }
                    };

                    sett = setInterval(ballSafeTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.drawImage(img, zz - 220, 0, 220, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Ball Safe
                    img.src = 'images/animation/feedconstruct/soccer/ball_safe.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Ball safe"), zz - 170, 120);
                    ctx.font = v_font;
                    ctx.fillText(team, zz - 160, 140, 140);
                    img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                    }
                }
            };

            sett = setInterval(BallSafeImg, 10);
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var BallSafeImg = function () {
                if (zz > 218) {
                    clearInterval(sett);

                    var ballSafeTr = function () {
                        if (dd > 60) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.3) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.save();
                            ctx.translate(695 - zz, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 220, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(473, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Ball safe"), 520 - zz, 118);
                            ctx.font = v_font;
                            ctx.fillText(team, 520 - zz, 138, 140);
                        } else {
                            ctx.save();
                            ctx.translate(695 - zz, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 220, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(473, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Ball safe"), 520 - zz, 118);
                            ctx.font = v_font;
                            ctx.fillText(team, 520 - zz, 138, 140);
                        }
                    };

                    sett = setInterval(ballSafeTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.translate(695 - zz, 250);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img, 0, 0, 220, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Ball Safe
                    img.src = 'images/animation/feedconstruct/soccer/ball_safe.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Ball safe"), 520 - zz, 118);
                    ctx.font = v_font;
                    ctx.fillText(team, 520 - zz, 138, 140);
                    img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                    img_2.onload = function () {
                        ctx.save();
                        ctx.translate(507 - zz, 255);
                        ctx.rotate(180 * Math.PI / 180);
                        ctx.drawImage(img_2, 0, 0, 40, yy + 10);
                        ctx.restore();
                    }
                }
            };

            sett = setInterval(BallSafeImg, 10);
            ctx.stroke();
        }
    };
    this.attack = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var goAttackImg = function () {
                if (zz > 300) {
                    clearInterval(sett);

                    var attackTr = function () {
                        if (dd > 70) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.1) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.drawImage(img, zz - 305, 0, 300, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/attack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Attack"), zz - 150, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 152, 140, 140);
                        } else {
                            ctx.drawImage(img, zz - 305, 0, 300, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/attack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Attack"), zz - 150, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 152, 140, 140);
                        }

                    };

                    sett = setInterval(attackTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.drawImage(img, zz - 300, 0, 300, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Corner
                    img.src = 'images/animation/feedconstruct/soccer/attack.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Attack"), zz - 150, 120);
                    ctx.font = v_font;
                    ctx.fillText(team, zz - 152, 140, 140);

                    img_2.src = 'images/animation/feedconstruct/soccer/attack_line.png';
                    img_2.onload = function () {
                    };
                    ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                }
            };

            sett = setInterval(goAttackImg, 10);
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var goAttackImg = function () {
                if (zz > 300) {
                    clearInterval(sett);

                    var attackTr = function () {
                        if (dd > 70) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.1) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.save();
                            ctx.translate(775 - zz, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 300, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/attack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(470, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Attack"), zz - 75, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 77, 140, 140);
                        } else {
                            ctx.save();
                            ctx.translate(775 - zz, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 300, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/attack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(470, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Attack"), zz - 75, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 77, 140, 140);
                        }

                    };

                    sett = setInterval(attackTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.translate(775 - zz, 250);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img, zz - 300, 0, 300, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Corner
                    img.src = 'images/animation/feedconstruct/soccer/attack.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Attack"), 535 - zz, 120);
                    ctx.font = v_font;
                    ctx.fillText(team, 533 - zz, 140, 140);

                    img_2.src = 'images/animation/feedconstruct/soccer/attack_line.png';
                    img_2.onload = function () {
                    };
                    ctx.save();
                    ctx.translate(775 - zz, 255);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img_2, zz - 35, 0, 35, yy + 10);
                    ctx.restore();
                }
            };

            sett = setInterval(goAttackImg, 10);
            ctx.stroke();
        }
    };
    this.dangAttack = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var dAttackImg = function () {
                if (zz > 410) {
                    clearInterval(sett);

                    var dAttackTr = function () {
                        if (dd > 60) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.3) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.drawImage(img, zz - 415, 0, 410, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/dattack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Dangerous attack"), zz - 290, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 200, 140, 140);
                        } else {
                            ctx.drawImage(img, zz - 415, 0, 410, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/dattack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Dangerous attack"), zz - 290, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 200, 140, 140);
                        }
                    };

                    sett = setInterval(dAttackTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.drawImage(img, zz - 410, 0, 410, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Corner
                    img.src = 'images/animation/feedconstruct/soccer/d_attack.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Dangerous attack"), zz - 290, 120);
                    ctx.font = v_font;
                    ctx.fillText(team, zz - 200, 140, 140);
                    img_2.src = 'images/animation/feedconstruct/soccer/dattack_line.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                    }
                }
            };

            sett = setInterval(dAttackImg, 7);
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var dAttackImg = function () {
                if (zz > 410) {
                    clearInterval(sett);

                    var dAttackTr = function () {
                        if (dd > 60) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.3) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.save();
                            ctx.translate(470, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 410, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/dattack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(470, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Dangerous attack"), zz - 290, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 200, 140, 140);
                        } else {
                            ctx.save();
                            ctx.translate(470, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 410, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/dattack_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(470, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 35, -5, 35, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Dangerous attack"), zz - 290, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 200, 140, 140);
                        }
                    };

                    sett = setInterval(dAttackTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.translate(885 - zz, 250);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img, zz - 410, 0, 410, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Corner
                    img.src = 'images/animation/feedconstruct/soccer/d_attack.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Dangerous attack"), 540 - zz, 120);
                    ctx.font = v_font;
                    ctx.fillText(team, 630 - zz, 140, 140);
                    img_2.src = 'images/animation/feedconstruct/soccer/dattack_line.png';
                    img_2.onload = function () {
                        ctx.save();
                        ctx.translate(885 - zz, 255);
                        ctx.rotate(180 * Math.PI / 180);
                        ctx.drawImage(img_2, zz - 35, 0, 35, yy + 10);
                        ctx.restore();
                    }
                }
            };

            sett = setInterval(dAttackImg, 7);
            ctx.stroke();
        }
    };
    this.goal = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            ctx.beginPath();

            var cornImg = function () {
                var q = 1;
                var c = 1;
                var i = 1;

                var cornShow = function () {
                    if (q > 120) {
                        clearInterval(sett);
                        content();
                        ctx.beginPath();
                        //Img Goal
                        img_3.src = 'images/animation/feedconstruct/soccer/goal_2.png';
                        img_3.onload = function () {
                            ctx.drawImage(img_3, 430, 81, 30, 88);
                        };
                        // img_2.src = 'images/animation/feedconstruct/soccer/goal_1.png';
                        // img_2.onload = function() {
                        //    ctx.drawImage(img_2, 425, 76, 35, 99);
                        img_ball.src = 'images/animation/feedconstruct/soccer/ball.png';

                        //}
                        var rotateImg = function () {
                            if (i > 900000) {
                                clearInterval(sett);
                            }
                            else {
                                ctx.save();
                                ctx.translate(445, 125);
                                ctx.rotate(i / 180 / Math.PI);
                                ctx.drawImage(img_ball, -10, -10, 20, 20);
                                //window.requestAnimationFrame(rotateImg);
                                ctx.restore();
                                i += 15;
                            }
                        };

                        sett = setInterval(rotateImg, 1);
                        ctx.stroke();

                    }
                    content();
                    //Transparent Rectangle
                    if (c > 59) {
                        c = 60
                    }
                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                    img_4.onload = function () {
                    };
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    img.src = 'images/animation/feedconstruct/soccer/goal.png';
                    img.onload = function () {
                    };
                    ctx.drawImage(img, 180, q - 30, 115, 30);
                    ctx.font = v_font;
                    ctx.textAlign = "center";
                    ctx.fillText(team, 235, 270 - q, 220);
                    q += 2;
                    c++;
                };

                sett = setInterval(cornShow, 7)
            };

            cornImg();
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            ctx.beginPath();

            var cornImg = function () {
                var q = 1;
                var c = 1;
                var i = 1;

                var cornShow = function () {
                    if (q > 120) {
                        clearInterval(sett);
                        content();
                        ctx.beginPath();
                        ctx.globalAlpha = 1;
                        //Img Goal
                        img_3.src = 'images/animation/feedconstruct/soccer/goal_2.png';
                        img_3.onload = function () {
                            ctx.drawImage(img_3, 10, 83, 30, 85);
                        };
                        //img_2.src = 'images/animation/feedconstruct/soccer/goal_1.png';
                        //img_2.onload = function() {
                        // ctx.drawImage(img_2, 10, 77,35,95);
                        img_ball.src = 'images/animation/feedconstruct/soccer/ball.png';

                        //}
                        var rotateImg = function () {
                            if (i > 900000) {
                                clearInterval(sett);
                            }
                            else {
                                ctx.save();
                                ctx.translate(23, 125);
                                ctx.rotate(i / 180 / Math.PI);
                                ctx.drawImage(img_ball, -10, -10, 20, 20);
                                //window.requestAnimationFrame(rotateImg);
                                ctx.restore();
                                i += 15;
                            }
                        };

                        sett = setInterval(rotateImg, 1);
                        ctx.stroke();
                    }
                    content();
                    //Transparent Rectangle
                    if (c > 59) {
                        c = 60
                    }

                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                    img_4.onload = function () {
                    };
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    img.src = 'images/animation/feedconstruct/soccer/goal.png';
                    img.onload = function () {
                    };
                    ctx.drawImage(img, 180, q - 30, 115, 30);
                    ctx.font = v_font;
                    ctx.textAlign = "center";
                    ctx.fillText(team, 235, 270 - q, 220);
                    q += 2;
                    c++;
                };

                sett = setInterval(cornShow, 7)
            };

            cornImg();
            ctx.stroke();
        }
    };
    this.penAw = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            ctx.beginPath();

            var cornImg = function () {
                var q = 1;
                var c = 1;
                var i = 0.1;
                var s = 1;
                var swit = 1;

                var cornShow = function () {
                    if (q > 120) {
                        clearInterval(sett);
                        content();
                        ctx.beginPath();

                        var penaltyImg = function () {
                            //Img Goal
                            img_4.src = 'images/animation/feedconstruct/soccer/ball.png';
                            img_4.onload = function () {
                            };
                            ctx.drawImage(img_4, 407, 116, 17, 17);
                        };

                        penaltyImg();

                        var penaltyShowImg = function () {
                            img_5.src = 'images/animation/feedconstruct/soccer/transparent.png';
                            img_5.onload = function () {
                            };
                            ctx.drawImage(img_5, 120, 60, 230, 131);
                            //Text
                            ctx.globalAlpha = 1;
                            ctx.fillStyle = 'white';
                            ctx.font = '34px RobotoBold';
                            ctx.textAlign = "center";
                            ctx.fillText(Translator.get("Penalty"), 235, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, 235, 149, 220);

                        };

                        var showBallImg = function () {
                            if (s > 220) {
                                clearInterval(sett);
                            }
                            else {
                                if (i > 1) {
                                    swit = 0;
                                }

                                img.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
                                img.onload = function () {
                                };
                                img_3.src = 'images/animation/feedconstruct/soccer/free_kick.png';
                                img_3.onload = function () {
                                };
                                img_4.src = 'images/animation/feedconstruct/soccer/ball.png';
                                img_4.onload = function () {
                                };
                                img_2.src = 'images/animation/feedconstruct/soccer/penalty_shdow.png';
                                img_2.onload = function () {
                                    ctx.save();
                                    ctx.globalAlpha = 0.1 + i;
                                    ctx.drawImage(img, 415, 116, 45, 18);
                                    ctx.drawImage(img_3, 376, 85, 80, 80);
                                    ctx.drawImage(img_2, 400, 109, 30, 30);
                                    ctx.drawImage(img_4, 407, 116, 17, 17);
                                    ctx.restore();
                                };

                                if (i < 0) {
                                    swit = 1;
                                }
                                if (swit == 1) {
                                    content();
                                    penaltyImg();
                                    penaltyShowImg();
                                    i += 0.05;
                                } else {
                                    content();
                                    penaltyImg();
                                    penaltyShowImg();
                                    i -= 0.05;
                                }
                                s++;
                            }
                        };

                        sett = setInterval(showBallImg, 70);
                        ctx.stroke();
                    }
                    content();
                    //Transparent Rectangle
                    if (c > 59) {
                        c = 60
                    }

                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                    img_4.onload = function () {
                    };
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    ctx.font = '34px RobotoBold';
                    ctx.textAlign = "center";
                    ctx.fillText(Translator.get("Penalty"), 235, q - 1);
                    ctx.font = v_font;
                    ctx.fillText(team, 235, 270 - q, 220);
                    q += 2;
                    c++;
                };

                sett = setInterval(cornShow, 7)
            };

            cornImg();
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            ctx.beginPath();

            var cornImg = function () {
                var q = 1;
                var c = 1;
                var i = 0.1;
                var s = 1;
                var swit = 1;

                var cornShow = function () {
                    if (q > 120) {
                        clearInterval(sett);
                        content();
                        ctx.beginPath();

                        var penaltyShowImg = function () {
                            img_5.src = 'images/animation/feedconstruct/soccer/transparent.png';
                            img_5.onload = function () {
                            };
                            ctx.drawImage(img_5, 120, 60, 230, 131);
                            //Text
                            ctx.globalAlpha = 1;
                            ctx.fillStyle = 'white';
                            ctx.font = '34px RobotoBold';
                            ctx.textAlign = "center";
                            ctx.fillText(Translator.get("Penalty"), 235, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, 235, 149, 220);
                        };

                        var showBallImg = function () {
                            if (s > 220) {
                                clearInterval(sett);
                            }
                            else {
                                if (i > 1) {
                                    swit = 0;
                                }
                                img.src = 'images/animation/feedconstruct/soccer/free_kick_2.png';
                                img.onload = function () {
                                };
                                img_3.src = 'images/animation/feedconstruct/soccer/free_kick.png';
                                img_3.onload = function () {
                                };
                                img_4.src = 'images/animation/feedconstruct/soccer/ball.png';
                                img_4.onload = function () {
                                };
                                img_2.src = 'images/animation/feedconstruct/soccer/penalty_shdow.png';
                                img_2.onload = function () {
                                    ctx.save();
                                    ctx.globalAlpha = 0.1 + i;
                                    ctx.save();
                                    ctx.translate(56, 133);
                                    ctx.rotate(180 * Math.PI / 180);
                                    ctx.drawImage(img, 0, 0, 45, 18);
                                    ctx.restore();
                                    ctx.drawImage(img_3, 14, 85, 80, 80);
                                    ctx.drawImage(img_2, 38, 109, 30, 30);
                                    ctx.restore();
                                    ctx.drawImage(img_4, 45, 116, 17, 17);
                                };

                                if (i < 0) {
                                    swit = 1;
                                }
                                if (swit == 1) {
                                    content();
                                    penaltyShowImg();
                                    i += 0.05;
                                } else {
                                    content();
                                    penaltyShowImg();
                                    i -= 0.05;
                                }
                                s++;
                            }
                        };

                        sett = setInterval(showBallImg, 70);
                        ctx.stroke();
                    }
                    content();
                    //Transparent Rectangle
                    if (c > 59) {
                        c = 60
                    }

                    ctx.beginPath();
                    img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                    img_4.onload = function () {
                    };
                    ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    ctx.font = '34px RobotoBold';
                    ctx.textAlign = "center";
                    ctx.fillText(Translator.get("Penalty"), 235, q - 1);
                    ctx.font = v_font;
                    ctx.fillText(team, 235, 270 - q, 220);
                    q += 2;
                    c++;
                };

                sett = setInterval(cornShow, 7)
            };

            cornImg();
            ctx.stroke();
        }
    };
    this.penalty = function () {
        clearIntervals();
        content();
        ctx.beginPath();

        var cornImg = function () {
            var q = 1;
            var c = 1;

            var cornShow = function () {
                if (q > 120) {
                    clearInterval(sett);
                    content();
                    ctx.beginPath();

                    var penaltyImg = function () {
                        //Img Goal
                        img_4.src = 'images/animation/feedconstruct/soccer/ball.png';
                        img_4.onload = function () {
                        };
                        ctx.drawImage(img_4, 407, 116, 17, 17);
                    };

                    penaltyImg();

                    ctx.stroke();
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }

                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.font = '34px RobotoBold';
                ctx.textAlign = "center";
                ctx.fillText(Translator.get("Penalty"), 235, q + 12);
                q += 2;
                c++;
            };

            sett = setInterval(cornShow, 7)
        };

        cornImg();
        ctx.stroke();
    };
    this.betstart = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_3.src = 'images/animation/feedconstruct/soccer/betStart.png';
        img_3.onload = function () {
            content();
            ctx.drawImage(img_3, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Bet start"), 150, 135);
        };
        ctx.stroke();
    };
    this.betstop = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_3.src = 'images/animation/feedconstruct/soccer/betStop.png';
        img_3.onload = function () {
            content();
            ctx.drawImage(img_3, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Bet stop"), 160, 135);
        };
        clearIntervals();
        ctx.stroke();
    };
    this.benchYellow = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/benchYellow.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 180, q - 15);
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Bench"), 250, q + 6);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.benchRed = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/benchRed.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 180, q - 15);
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Bench"), 250, q + 6);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.coachRed = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/coach.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 180, q - 15);
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Coach"), 250, q + 6);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.OldconOK = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/conSuccess.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 215, q - 15);
            ctx.textAlign = "center";
            ctx.font = v_font;
            ctx.fillText(Translator.get("Connection success"), 235, 270 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.OldconLost = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/conLost.png';
            img_6.src = 'images/animation/feedconstruct/soccer/stop.png';
            img_7.src = 'images/animation/feedconstruct/soccer/x.png';
            img.onload = function () {
            };
            ctx.drawImage(img, 215, q - 15);
            ctx.drawImage(img_6, 247, q + 3);
            ctx.drawImage(img_7, 252, q + 8);
            ctx.textAlign = "center";
            ctx.font = v_font;
            ctx.fillText(Translator.get("Connection lost"), 235, 270 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.drawBall = function (x, y) {
        clearInterval(settBall);
        var i = 1;
        x = (xx * x) / 100;
        y = (yy * y) / 100;
        if (x > xx - 9) {
            x = xx - 9;
        } else if (x < 9) {
            x = 9;
        }
        if (y > yy - 9) {
            y = yy - 9;
        } else if (y < 9) {
            y = 9;
        }
        ctxBall.beginPath();
        ctxBall.clearRect(0, 0, xx, yy);
        ctxBall.globalAlpha = 1;
        img_ball.src = 'images/animation/feedconstruct/soccer/ball.png';
        ctxBall.stroke();

        var ballRotate = function () {
            ctxBall.clearRect(0, 0, xx, yy);
            ctxBall.save();
            ctxBall.translate(x, y);
            ctxBall.rotate(i / Math.PI / 180);
            ctxBall.drawImage(img_ball, -9, -9, 18, 18);
            ctxBall.restore();
            i += 15;
        };

        settBall = setInterval(ballRotate, 5);
    };
    this.second_half = function (a, b, c, value, e, names, counts) {
        var half = '';
        switch (value) {
            case '1':
                half = 'FIRST HALF ENDED';
                break;
            case '2':
                half = 'SECOND HALF ENDED';
                break;
        }
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
                // sett = setInterval(statistic,5000);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            content();
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img_6.src = 'images/animation/feedconstruct/soccer/half.png';
            img_7.src = 'images/animation/feedconstruct/soccer/stop.png';
            img_8.src = 'images/animation/feedconstruct/soccer/half_end.png';
            img.onload = function () {
            };
            ctx.drawImage(img_6, 212, q - 25);
            ctx.drawImage(img_7, 250, q);
            ctx.drawImage(img_8, 257, q + 7);
            ctx.textAlign = "center";
            ctx.font = '18px RobotoRegular';
            ctx.fillText(Translator.get(half), 235, 275 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
        this.statistics(names, counts);
    };
    this.match_start = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Match started"), 235, q + 5);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.end_game = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_3.src = 'images/animation/feedconstruct/soccer/transparent.png';
        img_3.onload = function () {
            content();
            ctx.drawImage(img_3, 120, 60);
            //Text
            ctx.font = '34px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("End game"), 150, 135);
        };
        clearIntervals();
        ctx.stroke();
    };
    this.notStarted = function () {
        clearIntervals();
        content();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_3.src = 'images/animation/feedconstruct/soccer/transparent.png';
        img_3.onload = function () {
            content();
            ctx.drawImage(img_3, 120, 60);
            //Text
            ctx.font = '30px RobotoBold';
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.fillText(Translator.get("Not started"), 235, 135);
        };
        clearIntervals();
        ctx.stroke();
    };
    this.half_time = function (a, b, c, value) {
        var half = '';
        switch (value) {
            case '1':
                half = 'FIRST HALF STARTED';
                break;
            case '2':
                half = 'SECOND HALF STARTED';
                break;
        }
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img_6.src = 'images/animation/feedconstruct/soccer/half.png';
            img_7.src = 'images/animation/feedconstruct/soccer/half_1.png';
            img_8.src = 'images/animation/feedconstruct/soccer/half_2.png';
            ctx.drawImage(img_6, 212, q - 25);
            ctx.drawImage(img_7, 250, q);
            ctx.drawImage(img_8, 257, q + 6);
            ctx.textAlign = "center";
            ctx.font = '18px RobotoRegular';
            ctx.fillText(Translator.get(half), 235, 275 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.injury_time = function (a, b, c, time) {
        clearIntervals();
        content();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        img_3.src = 'images/animation/feedconstruct/soccer/stoppage_time_' + time + '.png';
        img_3.onload = function () {
            content();
            ctx.drawImage(img_3, 140, 60);
            //Text
            ctx.font = '16px RobotoBold';
            ctx.textAlign = "start";
            ctx.fillStyle = "#ea3235";
            ctx.fillText(Translator.get("Stoppage time"), 175, 170);
        };
        clearIntervals();
        ctx.stroke();
    };
    this.kickOff = function (team, a, te) {
        if (te == 1) {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var BallSafeImg = function () {
                if (zz > 218) {
                    clearInterval(sett);

                    var ballSafeTr = function () {
                        if (dd > 60) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.3) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.drawImage(img, zz - 220, 0, 220, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Kick off"), zz - 170, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 160, 140, 220);
                            img_8.src = 'images/animation/feedconstruct/soccer/ball.png';
                            ctx.drawImage(img_8, 224, 117);
                        } else {
                            ctx.drawImage(img, zz - 220, 0, 220, yy);
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Kick off"), zz - 170, 120);
                            ctx.font = v_font;
                            ctx.fillText(team, zz - 160, 140, 220);
                            img_8.src = 'images/animation/feedconstruct/soccer/ball.png';
                            ctx.drawImage(img_8, 224, 117);
                        }
                    };

                    sett = setInterval(ballSafeTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.drawImage(img, zz - 220, 0, 220, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Ball Safe
                    img.src = 'images/animation/feedconstruct/soccer/ball_safe.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Kick off"), zz - 170, 120);
                    ctx.font = v_font;
                    ctx.fillText(team, zz - 160, 140, 220);
                    img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                    img_2.onload = function () {
                        ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                    };
                    img_8.src = 'images/animation/feedconstruct/soccer/ball.png';
                    ctx.drawImage(img_8, 224, 117);
                }
            };

            sett = setInterval(BallSafeImg, 10);
            ctx.stroke();
        }
        else {
            clearIntervals();
            content();
            var zz = 10;
            var d = 1;
            var dd = 1;
            var swit = 1;
            ctx.beginPath();
            ctx.textAlign = "start";

            var BallSafeImg = function () {
                if (zz > 218) {
                    clearInterval(sett);

                    var ballSafeTr = function () {
                        if (dd > 60) {
                            clearInterval(sett);
                        }
                        content();
                        if (d < 0.3) {
                            swit = 0;
                        }
                        if (swit == 1) {
                            ctx.save();
                            ctx.translate(695 - zz, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 220, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d -= 0.05;
                                dd++;
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(473, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Kick off"), 520 - zz, 118);
                            ctx.font = v_font;
                            ctx.fillText(team, 520 - zz, 138, 220);
                            img_8.src = 'images/animation/feedconstruct/soccer/ball.png';
                            ctx.drawImage(img_8, 224, 117);
                        } else {
                            ctx.save();
                            ctx.translate(695 - zz, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, 220, yy);
                            ctx.restore();
                            //Img Ball Safe
                            img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                            img_2.onload = function () {
                                ctx.fillStyle = 'white';
                                d += 0.05;
                                dd++;
                                if (d > 1) {
                                    swit = 1;
                                }
                            };
                            ctx.save();
                            ctx.globalAlpha = d;
                            ctx.translate(473, 250);
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(img_2, zz - 33, -5, 40, yy + 10);
                            ctx.restore();
                            ctx.font = s_font;
                            ctx.fillText(Translator.get("Kick off"), 520 - zz, 118);
                            ctx.font = v_font;
                            ctx.fillText(team, 520 - zz, 138, 220);
                            img_8.src = 'images/animation/feedconstruct/soccer/ball.png';
                            ctx.drawImage(img_8, 224, 117);
                        }
                    };

                    sett = setInterval(ballSafeTr, 70);
                }
                else {
                    content();
                    ctx.save();
                    ctx.translate(695 - zz, 250);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img, 0, 0, 220, yy);
                    ctx.restore();
                    zz += 5;
                    //Img Ball Safe
                    img.src = 'images/animation/feedconstruct/soccer/ball_safe.png';
                    img.onload = function () {
                        //Text
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'white';
                    };
                    ctx.font = s_font;
                    ctx.fillText(Translator.get("Kick off"), 520 - zz, 118);
                    ctx.font = v_font;
                    ctx.fillText(team, 520 - zz, 138, 220);
                    img_2.src = 'images/animation/feedconstruct/soccer/ball_safe_line.png';
                    img_2.onload = function () {
                        ctx.save();
                        ctx.translate(507 - zz, 255);
                        ctx.rotate(180 * Math.PI / 180);
                        ctx.drawImage(img_2, 0, 0, 40, yy + 10);
                        ctx.restore();
                    };
                    img_8.src = 'images/animation/feedconstruct/soccer/ball.png';
                    ctx.drawImage(img_8, 224, 117);
                }
            };

            sett = setInterval(BallSafeImg, 10);
            ctx.stroke();
        }
    };
    this.penScored = function (team, b, c, d, e, names, counts, penalty) {
        clearIntervals();
        content();
        ctx.beginPath();

        if (penalty.status < 8) {
            var q = 1, c = 1;

            var Show = function () {
                if (q > 110) {
                    clearInterval(sett);
                }
                content();
                //Transparent Rectangle
                if (c > 59) {
                    c = 60
                }
                ctx.beginPath();
                img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
                img_4.onload = function () {
                };
                ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
                //Text
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.font = s_font;
                ctx.fillText(Translator.get("Penalty missed"), 235, q + 6);
                ctx.font = v_font;
                ctx.fillText(team, 235, 260 - q, 220);
                q += 2;
                c++;
            };

            sett = setInterval(Show, 7);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.textAlign = "right";
        ctx.font = '15px RobotoBold';
        img_4.src = 'images/animation/feedconstruct/soccer/bgtr.png';
        img.src = 'images/animation/feedconstruct/soccer/penaltyY.png';
        img_2.src = 'images/animation/feedconstruct/soccer/penaltyX.png';
        img_3.src = 'images/animation/feedconstruct/soccer/penaltyZ.png';
        img.onload = function () {
        };
        img_2.onload = function () {
        };
        img_3.onload = function () {
        };
        img_4.onload = function () {
            ctx.drawImage(img_4, 0, 0);
            ctx.fillText(names[0], 175, 100);
            ctx.fillText(names[1], 175, 150);

            ctx.save();
            ctx.translate(150, -20);

            for (var i = 1; i < 6; i++) {
                ctx.drawImage(img_3, 100 * i / 2.2, 100);
                ctx.drawImage(img_3, 100 * i / 2.2, 150);
            }

            var n = Math.max(penalty.team1.length, penalty.team2.length);
            var m = Math.max(n, 5);
            for (var i = 1, j = m - 5; j <= m; i++, j++) {
                if (!!penalty.team1[j]) {
                    if (penalty.team1[j].code == 748) {
                        ctx.drawImage(img, 100 * i / 2.2, 100);
                    } else {
                        ctx.drawImage(img_2, 100 * i / 2.2, 100);
                    }
                }
                if (!!penalty.team2[j]) {
                    if (penalty.team2[j].code == 748) {
                        ctx.drawImage(img, 100 * i / 2.2, 150);
                    } else {
                        ctx.drawImage(img_2, 100 * i / 2.2, 150);
                    }
                }
            }
            ctx.restore();
        };
        ctx.stroke();
    };
    this.penMis = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.font = s_font;
            ctx.fillText(Translator.get("Penalty missed"), 235, q + 6);
            ctx.font = v_font;
            ctx.fillText(team, 235, 260 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.extraTime = function (a, b, c, value) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            content();
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img_6.src = 'images/animation/feedconstruct/soccer/half.png';
            img_7.src = 'images/animation/feedconstruct/soccer/half_1.png';
            img_8.src = 'images/animation/feedconstruct/soccer/plus.png';
            ctx.drawImage(img_6, 212, q - 25);
            ctx.drawImage(img_7, 250, q);
            ctx.drawImage(img_8, 255, q + 5);
            ctx.textAlign = "center";
            ctx.font = '17px RobotoRegular';
            ctx.fillText(Translator.get("Extra time"), 235, 275 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.extraTimeStart = function (a, b, c, value) {
        var half = '';
        switch (value) {
            case '1':
                half = 'E/T FIRST HALF STARTED';
                break;
            case '2':
                half = 'E/T SECOND HALF STARTED';
                break;
        }
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            content();
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img_6.src = 'images/animation/feedconstruct/soccer/half.png';
            img_7.src = 'images/animation/feedconstruct/soccer/half_1.png';
            img_8.src = 'images/animation/feedconstruct/soccer/plus.png';
            ctx.drawImage(img_6, 212, q - 25);
            ctx.drawImage(img_7, 250, q);
            ctx.drawImage(img_8, 255, q + 5);
            ctx.textAlign = "center";
            ctx.font = '17px RobotoRegular';
            ctx.fillText(Translator.get(half), 235, 275 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.extraTimeEnd = function (a, b, c, value, e, names, counts) {
        var half = '';
        switch (value) {
            case '1':
                half = 'E/T FIRST HALF ENDED';
                break;
            case '2':
                half = 'E/T SECOND HALF ENDED';
                break;
        }
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            content();
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img_6.src = 'images/animation/feedconstruct/soccer/half.png';
            img_7.src = 'images/animation/feedconstruct/soccer/stop.png';
            img_8.src = 'images/animation/feedconstruct/soccer/half_end.png';
            ctx.drawImage(img_6, 212, q - 25);
            ctx.drawImage(img_7, 250, q);
            ctx.drawImage(img_8, 257, q + 7);
            ctx.textAlign = "center";
            ctx.font = '18px RobotoRegular';
            ctx.fillText(Translator.get(half), 235, 275 - q);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
        this.statistics(names, counts);
    };
    this.sec_half_end = function (team) {
        clearIntervals();
        content();
        ctx.beginPath();
        var q = 1, c = 1;

        var Show = function () {
            if (q > 110) {
                clearInterval(sett);
                sett = setInterval(statistic, 5000);
            }
            content();
            //Transparent Rectangle
            if (c > 59) {
                c = 60
            }
            content();
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/transparent.png';
            img_4.onload = function () {
            };
            ctx.drawImage(img_4, 120, 120 - c, 230, q + 10);
            //Text
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            img.src = 'images/animation/feedconstruct/soccer/penalties.png';
            img_ball.src = 'images/animation/feedconstruct/soccer/ball.png';
            ctx.drawImage(img, 212, q - 23);
            ctx.drawImage(img_ball, 226, q + 4);
            ctx.textAlign = "center";
            ctx.font = '18px RobotoRegular';
            ctx.fillText(Translator.get("Penalties"), 235, q + 40);
            ctx.font = '16px RobotoLight';
            ctx.fillText(team, 235, 275 - q, 220);
            q += 2;
            c++;
        };

        sett = setInterval(Show, 7);
        ctx.stroke();
    };
    this.statistics = function (names, counts) {
        setTimeout(stat, 5000);

        var stat = function () {
            clearInterval(sett);
            clearIntervals();
            content();
            var i = 0;
            //Transparent Rectangle
            ctx.beginPath();
            img_4.src = 'images/animation/feedconstruct/soccer/statis.png';
            img_4.onload = function () {
                ctx.drawImage(img_4, 64, 15, 340, 220);
                img_3.src = 'images/animation/feedconstruct/soccer/statist.png';
                img_3.onload = function () {
                    ctx.drawImage(img_3, 64, 15, 340, 38);
                    //Text
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'white';
                    ctx.font = '14px RobotoLight';
                    ctx.textAlign = "start";
                    ctx.fillText(names[0], 80, 40, 100);
                    ctx.textAlign = "right";
                    ctx.fillText(names[1], 390, 40, 100);

                    ctx.font = v_font;
                    ctx.textAlign = "center";
                    ctx.fillText(Translator.get("Goals"), 235, 84);
                    ctx.fillText(Translator.get("Penalties"), 235, 109);
                    ctx.fillText(Translator.get("Red cards"), 235, 134);
                    ctx.fillText(Translator.get("Yellow cards"), 235, 159);
                    ctx.fillText(Translator.get("Corners"), 235, 184);
                    ctx.fillText(Translator.get("Subtitutions"), 235, 209);

                    ctx.fillStyle = '#f4eb4b';
                    ctx.font = '16px RobotoMedium';
                    ctx.textAlign = "center";
                    ctx.fillText(counts['1~177'] || 0, 117, 84);
                    ctx.fillText(counts['1~746'] || 0, 117, 109);
                    ctx.fillText(counts['1~187'] || 0, 117, 134);
                    ctx.fillText(counts['1~188'] || 0, 117, 159);
                    ctx.fillText(counts['1~190'] || 0, 117, 184);
                    ctx.fillText(counts['1~189'] || 0, 117, 209);

                    ctx.fillText(counts['2~177'] || 0, 345, 84);
                    ctx.fillText(counts['2~746'] || 0, 345, 109);
                    ctx.fillText(counts['2~187'] || 0, 345, 134);
                    ctx.fillText(counts['2~188'] || 0, 345, 159);
                    ctx.fillText(counts['2~190'] || 0, 345, 184);
                    ctx.fillText(counts['2~189'] || 0, 345, 209);

                }
            };
            ctx.stroke();
        }
    };
    this.clearContent = function () {
        window.clearInterval(sett);
        content();
    }


}]);
