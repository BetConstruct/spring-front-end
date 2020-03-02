// custom tasks
module.exports = function (grunt) {
    'use strict';
    var CMS_CONFIG_URL = 'https://cmsbetconstruct.com/getJson/generateConfJson?skin_id=';
    var CMS_SASS_URL = 'https://cmsbetconstruct.com/getjson/getSass?skin_id=';
    var CMS_DEPLOY_URL = 'http://cmsbetconstruct.com/getJson/getServerName?skin_id=';
    var CMS_LOGGING_URL = 'https://cmsbetconstruct.com/general/writeApiSkinCreateLog';
    // add-sass --content = 'CssText'  This task will add given css text to all skins skin.scss files
    grunt.registerTask('add-sass', function () {

        var pattern = '../skins/**/sass/skin.scss',
            files = grunt.file.expand(pattern),
            cssText = grunt.option('content');
        files.forEach(function (item) {
            var currentContent = grunt.file.read(item);
            var finalOutput = currentContent + '\n' + cssText;
            grunt.file.write(item, finalOutput);

        });
    });

    grunt.registerTask('load-css-filelist', 'loads css files list for skin', function () {
        var cssFiles = grunt.config.get('angularValue').VBET5.SkinConfig.main.cssFiles  || grunt.config.get('defaultCssFileList');
        grunt.config.set("cssFilesArray", JSON.stringify(cssFiles).replace(/\"/g, "'")); //this stores list in a value to use for generating skin launcher html
        cssFiles = cssFiles.map(function (path) { return path = '../css/' + path; });
        console.log("CSS files:", cssFiles);
        var configObject = {
            files: {
                'main.min.css': cssFiles,
                'skin.min.css': [ '../skins/<%=skin%>/css/main.css', '../skins/<%=skin%>/css/skin.css']
            }
        };
        grunt.file.expand({matchBase: true,  filter: 'isFile'}, ['../skins/' + grunt.option('skin') + '/css/additional/*.css']).forEach(function (file) {
            configObject.files[file] = file;
        });
        grunt.config.set('cssmin', {combine: configObject});
    });


    grunt.registerTask('load-language-filelist', 'loads language files list for skin', function () {
        var files = [];
        var config = grunt.config.get('angularValue');
        if (config.VBET5.SkinConfig.main.availableLanguages === undefined) {
            grunt.fail.fatal("availableLanguages not set in skin config, cannot get language list for skin");
        }
        console.log("language files to be downloaded:");
        Object.keys(config.VBET5.SkinConfig.main.availableLanguages).forEach(function (lang) {
            if (lang[0] === '@') {
                return;
            }
            var url = grunt.config.get('translationsJsonUrl') + grunt.config.get('skinConfig') + '/languages/' + lang + '.json';
            files.push({url: url, dest: 'languages_tmp'});
            console.log(url);
        });
        var noTransUrl = grunt.config.get('translationsJsonUrl') + grunt.config.get('skinConfig') + '/languages/notrans.json';
        files.push({url: noTransUrl, dest: 'languages_tmp'});
        console.log(noTransUrl);
        grunt.config.set('downloadfile', {files: files});
    });

    // generates source list for skin's local html file
    grunt.registerTask('get-src-list', 'test', function () {
        var html = "";
        var conf = grunt.config.get('angularValue');

        // include  skin specific js files
        grunt.file.expand({matchBase: true,  filter: 'isFile'}, ['../skins/' + grunt.option('skin') + '/js/**/*.js']).forEach(function (file) {
            html += "<script src='" + file.replace('../skins', 'skins') + "'></script>\n";
        });
        grunt.config.set('sourceFiles', html);
        console.log("skin js files:\n", html);
        html = "";

        // include optional module js files
        if (conf && conf.VBET5 && conf.VBET5.SkinConfig && conf.VBET5.SkinConfig.additionalModules) {
            conf.VBET5.SkinConfig.additionalModules.map(function (module) {
                console.log(" additional module:" + module + "\n");
                html += "\n<!-- " + module + " module start -->\n";
                grunt.file.expand({matchBase: true,  filter: 'isFile'}, ['../optional_modules/' + module + '/*/**/*.js']).
                sort(function(a){ return a.match("js\/main.js")? -1 : 1 }). //main.js must be loaded first
                forEach(function (file) {
                    html += "<script src='" + file.replace('../optional_modules', 'optional_modules') + "'></script>\n";
                });
                html += "<!-- " + module + " module end -->\n\n";
            });
        }
        grunt.config.set('optionalSourceFiles', html);
        console.log("optional js files:\n", html);
    });

    grunt.registerTask('create-new-skin', 'creates new skin', function () {
        var skin = grunt.option('skin');
        console.log("creating new skin ", skin);
        var fs = require('fs');
        var path = require('path');
        var url = require('url');
        var request = require('sync-request');
        var msg;

        var defaultConfig = JSON.parse(fs.readFileSync('default_skin_config.json'));
        var site_id = grunt.option('site-id') || 13;

        function logToCMS(msg) {
            request('POST', CMS_LOGGING_URL, { json:  {"createSkin": {"skin_id": site_id, "log": msg}}});
        }

        var res = request('GET', CMS_CONFIG_URL + site_id);
        var response = JSON.parse(res.getBody().toString());
        if (response && response.status === 'ok' && response.link) {
            res = request('GET', response.link);
            defaultConfig = JSON.parse(res.getBody().toString());
            skin = defaultConfig.SkinConfig.main.skin;
            console.log("\n\nConfig loaded from CMS\n\n");
        } else {
            console.log("\n\nConfig doesn't exist in CMS (yet)\n\n", response);
            if (!skin) {
                logToCMS("Error: skin not found in CMS");
                grunt.fail.fatal("skin name not specified and cannot be retrieved from CMS, aborting");
            }
        }
        var configFilePath = path.join('..', 'js', 'skins',  skin + '.js');
        var skinFolderPath = path.join('..', 'skins', skin);
        if (fs.existsSync(configFilePath)) {
            msg = "Grunt error:skin config file already exists: " + configFilePath;
            logToCMS(msg);
            grunt.fail.fatal(msg);
        }
        if (fs.existsSync(skinFolderPath)) {
            grunt.fail.fatal("skin folder  already exists: " + skinFolderPath);
        }
        console.log("loading sass config from CMS");
        res = request('GET', CMS_SASS_URL+ site_id);
        response = JSON.parse(res.getBody().toString());
        if (response.status !== "ok") {
            msg = "Grunt error: cannot load sass variables from CMS";
            logToCMS(msg);
            grunt.fail.fatal(msg);
        }
        console.log("sass config loaded from CMS");
        var sassVars = JSON.parse(fs.readFileSync('default_skin_sass.json'));
        for (var k in response) {
            if (response.hasOwnProperty(k) && k !== "status") {
                sassVars[k] = response[k];
            }
        }
        var sassContent = [];
        for (var key in sassVars) {
            sassContent.push(key + " : " + sassVars[key] + ";");
        }
        var configContent = "\nVBET5.constant('SkinConfig', " + JSON.stringify(defaultConfig.SkinConfig, null, 4) + ");" +
                            "\nCMS.constant('SkinWPConfig', " + JSON.stringify(defaultConfig.SkinWPConfig || {}, null, 4)+" );" +
                            "\nCASINO.constant('SkinCConfig', " + JSON.stringify(defaultConfig.SkinCConfig || {}, null, 4) +");";


        fs.writeFileSync(configFilePath, configContent);
        console.log("skin config generated");
        fs.mkdirSync(skinFolderPath);
        fs.mkdirSync(path.join(skinFolderPath, 'css'));
        fs.mkdirSync(path.join(skinFolderPath, 'images'));
        fs.mkdirSync(path.join(skinFolderPath, 'sass'));
        fs.mkdirSync(path.join(skinFolderPath, 'sass', 'functions'));
        console.log("skin folders created");
        fs.writeFileSync(path.join(skinFolderPath, 'sass', 'skin.scss'), "@import '../../../css/mixins'; @import 'functions/colors'; @import '../../../css/createSkin';");
        sassContent = sassContent.map(function(str) { // download images and change url in sass to local path
            var match = str.match(/url\((.+)\)/);
            if (match && match[1] && match[1].toLowerCase().indexOf("http") === 0) {
                res = request('GET', match[1]);
                var fileName = path.basename(url.parse(match[1]).pathname);
                var localImgPath = path.resolve(path.join(skinFolderPath, 'images', fileName));
                console.log("downloaded ", match[1], "to", localImgPath);
                fs.writeFileSync(localImgPath, res.getBody());
                str = str.replace(match[1], "../images/" + fileName);
            }
            return str;
        });
        fs.writeFileSync(path.join(skinFolderPath, 'sass', 'functions', '_colors.scss'), sassContent.join("\n"));
        msg = "Grunt:skin sass generated";
        console.log(msg);
        logToCMS(msg);
        var deployConfig = {"host": "", "key": "ice2014", "path": ""};
        res = request('GET', CMS_DEPLOY_URL + site_id);
        response = JSON.parse(res.getBody().toString());
        if (response.status === "ok" && response.data && response.data.server_name && response.data.release_folder_name) {
            deployConfig.host = response.data.server_name;
            deployConfig.path = response.data.release_folder_name;
        } else {
            msg = "Grunt error:cannot load deployment config from CMS:" + JSON.stringify(response);
            logToCMS(msg);
            grunt.fail.fatal(msg);
        }
        fs.writeFileSync(path.join(skinFolderPath, 'deploy.json'), JSON.stringify(deployConfig));
        fs.writeFileSync("skin_name.tmp", skin);
        grunt.config.set('deployServerPath', deployConfig.path);
        grunt.config.set('deployServerKey',deployConfig.key);
        grunt.config.set('deployServerHost', deployConfig.host);
        grunt.config.set('skin', skin);
        grunt.config.set('skinConfig', skin);
        grunt.option('skinConfig', skin);
        grunt.option('skin', skin);
        logToCMS("Grunt: skin generated, ready to deploy");

        // try {
        //     var currency = (defaultConfig.SkinConfig.main.registration && defaultConfig.SkinConfig.main.registration.defaultCurrency) || "USD";
        //     res = request('GET',"https://casinoapi.betcoapps.com/api.php?action=addManager&partnerId=" + site_id + "&partnerName=" + skin + "&partnerCurr=" + currency);
        //     response = JSON.parse(res.getBody().toString());
        //     if (response.type !== "success") {
        //         // TODO: inform someone that call has failed
        //     } else {
        //         //TODO: do something with response.apiSecretKey
        //     }
        //     console.log("casino request response:", response);
        // } catch(e) {
        //     console.log("casino request failed", e)
        // }

        grunt.task.run('import_angular_value');grunt.task.start(); //load skin config

    });

    grunt.registerTask('create-conf', 'creates conf.json', function () {
        var conf = grunt.config.get('angularValue');

        if (conf.VBET5.SkinConfig.loadConfigFromCMS) {
            var https = require('https');
            var fs = require('fs');
            var request = require('sync-request');

            try {fs.unlinkSync('app/' +  grunt.config.get('skinConfig') + '/conf.json'); fs.unlinkSync('conf.json');} catch (e){} //delete previously generated config if exists
            console.log("Loading conf.json from CMS");

            var res = request('GET', CMS_CONFIG_URL+ conf.VBET5.SkinConfig.main.site_id);
            var response = JSON.parse(res.getBody().toString());
            if (response && response.status === 'ok' && response.link) {
                var done = this.async();
                var file = fs.createWriteStream("conf.json");
                var url = response.link;
                https.get(url, function(response) {
                    console.log("response status code:", response.statusCode);
                    if (response.statusCode !== 200) {
                        throw "cannot load config from " + url;
                    }
                    response
                        .on('data', function(data) {file.write(data);})
                        .on('end', function() {
                            file.end();
                            console.log("downloaded conf.json from ", url);
                            done();
                        });
                });
            } else {
                console.log("\n******************\n\ncannot get config from CMS:\n", response, "\nconf.json will not be created!\n\n******************\n")
            }
            return;
        }
        var configObj = {};
        for (var moduleName in conf) {
            var moduleConfigName = Object.keys(conf[moduleName])[0];
            console.log("Loaded config for module ", moduleName, moduleConfigName);
            if (moduleConfigName) {
                configObj[moduleConfigName] = conf[moduleName][moduleConfigName]
            }
        }
        grunt.file.write("conf.json", JSON.stringify(configObj, null, 2));
        console.log("conf.json created (generated from local JS)");
    });

    grunt.registerTask('load-additional-modules', 'adds additional module files into build if specified in config', function () {
        var conf = grunt.config.get('angularValue');
        var tplConfig = grunt.config.get('ngtemplates');
        var jsConfig = grunt.config.get('closure-compiler');
        if (conf && conf.VBET5 && conf.VBET5.SkinConfig) {
            if (conf.VBET5.SkinConfig.additionalModules) {
                conf.VBET5.SkinConfig.additionalModules.map(function (module) {
                    console.log("building with additional module:" + module + "\n");
                    tplConfig.app.src.push('optional_modules/' + module + '/templates/**/*.html');
                    jsConfig.frontend.js.unshift('../optional_modules/' + module + '/lib/**/*.js');
                    jsConfig.frontend.js.splice(jsConfig.frontend.js.length - 4, 0, '../optional_modules/' + module + '/js/main.js');
                    jsConfig.frontend.js.splice(jsConfig.frontend.js.length - 4, 0, '../optional_modules/' + module + '/js/**/*.js');
                });
            }

            if (conf.VBET5.SkinConfig.enableSnowEffect) {
                jsConfig.frontend.js.splice(jsConfig.frontend.js.length - 4, 0, '../lib/snowflakes.js');
            }

            grunt.config.set('ngtemplates', tplConfig);
            grunt.config.set('closure-compiler', jsConfig);
        }
        console.log("files to be included in build:", tplConfig, jsConfig);
    });

    grunt.registerTask('no-cdn-libs', 'replaces cdn lib links with local ones if specified in config', function () {
        var conf = grunt.config.get('angularValue');
        var replaceConfig = grunt.config.get('replace');
        var copyConfig = grunt.config.get('copy');
        if (conf && conf.VBET5 && conf.VBET5.SkinConfig && conf.VBET5.SkinConfig.main && conf.VBET5.SkinConfig.main.loadLibsLocally) {
            console.log("libs will be loaded locally (not from CDN)");
            var replacement = (conf.VBET5.SkinConfig.main.resourcePathPrefix || '') + 'libs';
            replaceConfig.noCdnLibs.options.patterns = [{match: /\/\/ajax.googleapis.com\/ajax\/libs/g, replacement: replacement}];
            copyConfig.main.files.push({expand: true, cwd: '../lib/min', src: ['**'], dest: 'app/<%=skin%>/libs/'});
        }
        console.log(replaceConfig.noCdnLibs.options);
        grunt.config.set('replace', replaceConfig);
        grunt.config.set('copy', copyConfig);

    });
};
