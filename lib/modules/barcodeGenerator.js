angular.module('barcodeGenerator', []).directive('barcodeGenerator', [function() {
    var Barcode	= (function () {
        var barcode	= {
            settings: {
                barWidth:		1,
                barHeight:		50,
                moduleSize:		5,
                showHRI:		false,
                addQuietZone:	true,
                marginHRI:		5,
                bgColor:		"#FFFFFF",
                color:			"#000000",
                fontSize:		10,
                posX:			0,
                posY:			0
            },
            intval: function(val) {
                var type	= typeof(val);
                if ( type == 'string' ) {
                    val = val.replace(/[^0-9-.]/g, "");
                    val = parseInt(val * 1, 10);
                    return isNaN(val) || !isFinite(val)? 0: val;
                }
                return type == 'number' && isFinite(val)? Math.floor(val): 0;
            },
            code128: {
                encoding:[
                    "11011001100", "11001101100", "11001100110", "10010011000",
                    "10010001100", "10001001100", "10011001000", "10011000100",
                    "10001100100", "11001001000", "11001000100", "11000100100",
                    "10110011100", "10011011100", "10011001110", "10111001100",
                    "10011101100", "10011100110", "11001110010", "11001011100",
                    "11001001110", "11011100100", "11001110100", "11101101110",
                    "11101001100", "11100101100", "11100100110", "11101100100",
                    "11100110100", "11100110010", "11011011000", "11011000110",
                    "11000110110", "10100011000", "10001011000", "10001000110",
                    "10110001000", "10001101000", "10001100010", "11010001000",
                    "11000101000", "11000100010", "10110111000", "10110001110",
                    "10001101110", "10111011000", "10111000110", "10001110110",
                    "11101110110", "11010001110", "11000101110", "11011101000",
                    "11011100010", "11011101110", "11101011000", "11101000110",
                    "11100010110", "11101101000", "11101100010", "11100011010",
                    "11101111010", "11001000010", "11110001010", "10100110000",
                    "10100001100", "10010110000", "10010000110", "10000101100",
                    "10000100110", "10110010000", "10110000100", "10011010000",
                    "10011000010", "10000110100", "10000110010", "11000010010",
                    "11001010000", "11110111010", "11000010100", "10001111010",
                    "10100111100", "10010111100", "10010011110", "10111100100",
                    "10011110100", "10011110010", "11110100100", "11110010100",
                    "11110010010", "11011011110", "11011110110", "11110110110",
                    "10101111000", "10100011110", "10001011110", "10111101000",
                    "10111100010", "11110101000", "11110100010", "10111011110",
                    "10111101110", "11101011110", "11110101110", "11010000100",
                    "11010010000", "11010011100", "11000111010"
                ],
                getDigit: function(code) {
                    var tableB	= " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
                    var result	= "";
                    var sum		= 0;
                    var isum	= 0;
                    var i		= 0;
                    var j		= 0;
                    var value	= 0;

                    // check each characters
                    for(i=0; i<code.length; i++){
                        if (tableB.indexOf(code.charAt(i)) == -1){
                            return("");
                        }
                    }

                    // check firsts characters : start with C table only if enought numeric
                    var tableCActivated = code.length > 1;
                    var c = '';

                    for (i=0; i<3 && i<code.length; i++) {
                        c = code.charAt(i);
                        tableCActivated &= c >= '0' && c <= '9';
                    }

                    sum	= tableCActivated ? 105 : 104;

                    // start : [105] : C table or [104] : B table
                    result = this.encoding[ sum ];

                    i = 0;
                    while ( i < code.length ) {
                        if ( !tableCActivated) {
                            j = 0;
                            // check next character to activate C table if interresting
                            while ( (i + j < code.length) && (code.charAt(i+j) >= '0') && (code.charAt(i+j) <= '9') ) {
                                j++;
                            }

                            // 6 min everywhere or 4 mini at the end
                            tableCActivated = (j > 5) || ((i + j - 1 == code.length) && (j > 3));

                            if ( tableCActivated ){
                                result += this.encoding[ 99 ]; // C table
                                sum += ++isum * 99;
                            } //		 2 min for table C so need table B
                        } else if ( (i == code.length) || (code.charAt(i) < '0') || (code.charAt(i) > '9') || (code.charAt(i+1) < '0') || (code.charAt(i+1) > '9') ) {
                            tableCActivated = false;
                            result += this.encoding[ 100 ]; // B table
                            sum += ++isum * 100;
                        }

                        if ( tableCActivated ) {
                            value = barcode.intval(code.charAt(i) + code.charAt(i+1)); // Add two characters (numeric)
                            i += 2;
                        } else {
                            value = tableB.indexOf( code.charAt(i) ); // Add one character
                            i += 1;
                        }
                        result	+= this.encoding[ value ];
                        sum += ++isum * value;
                    }

                    result += this.encoding[sum % 103];// Add CRC
                    result += this.encoding[106];// Stop
                    result += "11";// Termination bar

                    return(result);
                }
            },
            bitStringTo2DArray: function( digit) {//convert a bit string to an array of array of bit char
                var d = [];
                d[0] = [];

                for ( var i=0; i<digit.length; i++) {
                    d[0][i] = digit.charAt(i);
                }

                return(d);
            },
            digitToCssRenderer: function( $container, settings, digit, hri, mw, mh, type) {// css barcode renderer
                var lines = digit.length;
                var columns = digit[0].length;
                var content = "";
                var len, current;
                var bar0 = "<div class='w w%s' ></div>";
                var bar1 = "<div class='b b%s' ></div>";

                for ( var y=0, x; y<lines; y++) {
                    len = 0;
                    current = digit[y][0];

                    for ( x=0; x<columns; x++){
                        if ( current == digit[y][x] ) {
                            len++;
                        } else {
                            content += (current == '0'? bar0: bar1).replace("%s", len * mw);
                            current = digit[y][x];
                            len=1;
                        }
                    }
                    if ( len > 0) {
                        content += (current == '0'? bar0: bar1).replace("%s", len * mw);
                    }
                }

                if ( settings.showHRI) {
                    content += "<div style=\"clear:both; width: 100%; background-color: " + settings.bgColor + "; color: " + settings.color + "; text-align: center; font-size: " + settings.fontSize + "px; margin-top: " + settings.marginHRI + "px;\">"+hri+"</div>";
                }

                var div = document.createElement('DIV');
                div.innerHTML = content;
                div.className = 'barcode '+ type +' clearfix-child';
                return div;
            },
            digitToCss: function($container, settings, digit, hri, type) {// css 1D barcode renderer
                var w = barcode.intval(settings.barWidth);
                var h = barcode.intval(settings.barHeight);

                return this.digitToCssRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h, type);
            }
        };

        var generate	= function(datas, type, settings) {
            var
                digit	= "",
                hri		= "",
                code	= "",
                crc		= true,
                rect	= false,
                b2d		= false
                ;

            if ( typeof(datas) == "string") {
                code = datas;
            } else if (typeof(datas) == "object") {
                code	= typeof(datas.code) == "string" ? datas.code : "";
                crc		= typeof(datas.crc) != "undefined" ? datas.crc : true;
                rect	= typeof(datas.rect) != "undefined" ? datas.rect : false;
            }

            if (code == "") {
                return(false);
            }

            if (typeof(settings) == "undefined") {
                settings = [];
            }

            for( var name in barcode.settings) {
                if ( settings[name] == undefined) {
                    settings[name] = barcode.settings[name];
                }
            }

            switch (type) {
                case "std25":
                case "int25": {
                    digit = barcode.i25.getDigit(code, crc, type);
                    hri = barcode.i25.compute(code, crc, type);
                    break;
                }
                case "ean8":
                case "ean13": {
                    digit = barcode.ean.getDigit(code, type);
                    hri = barcode.ean.compute(code, type);
                    break;
                }
                case "upc": {
                    digit = barcode.upc.getDigit(code);
                    hri = barcode.upc.compute(code);
                    break;
                }
                case "code11": {
                    digit	= barcode.code11.getDigit(code);
                    hri	= code;
                    break;
                }
                case "code39": {
                    digit = barcode.code39.getDigit(code);
                    hri = code;
                    break;
                }
                case "code93": {
                    digit = barcode.code93.getDigit(code, crc);
                    hri = code;
                    break;
                }
                case "code128": {
                    digit = barcode.code128.getDigit(code);
                    hri = code;
                    break;
                }
                case "codabar": {
                    digit = barcode.codabar.getDigit(code);
                    hri = code;
                    break;
                }
                case "msi": {
                    digit = barcode.msi.getDigit(code, crc);
                    hri = barcode.msi.compute(code, crc);
                    break;
                }
                case "datamatrix": {
                    digit = barcode.datamatrix.getDigit(code, rect);
                    hri = code;
                    b2d = true;
                    break;
                }
            }

            if ( digit.length == 0) {
                return this;
            }

            if ( !b2d && settings.addQuietZone) {
                digit = "0000000000" + digit + "0000000000";
            }

            var fname = 'digitToCss' + (b2d ? '2D' : '');

            return barcode[fname](this, settings, digit, hri, type);
        };

        return generate;
    }());

    return {
        link: function(scope, element, attrs) {
            attrs.$observe('barcodeGenerator', function(value){
                var code = Barcode(value, "code128",{barWidth:2}),
                    code_wrapper = angular.element("<div class='barcode code128'></div>")

                code_wrapper.append(code);
                angular.element(element).html('').append(code_wrapper);

            });
        }
    }
}]);
