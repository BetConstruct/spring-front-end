module.exports = function (grunt) {
    require('time-grunt')(grunt);
    var path = require("path");
    var serverOptions = grunt.file.readJSON('servers.json');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //------------------ imports needed values from angular skin config --------------------------------------------
        import_angular_value: {
            default_options: {
                options: {
                    path: '../js/skins/<%=skinConfig%>.js',
                    modules: ['VBET5', 'CMS', 'CASINO']
                }
            }
        },
        sass: {
            options: {
                sourceMap: false,
                outputStyle: 'compressed',
                includePaths: ['../skins/<%=skin%>/sass']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '../skins/<%=skin%>/sass/',
                    src: ['**/!(_)*.scss'],
                    dest: '../skins/<%=skin%>/css/',
                    ext: '.css'
                }]
            }
        },
        //------------------ put all templates content into JS file (templateCache) ------------------------------------
        ngtemplates: {
            app: {
                cwd: '..',
                options: {
                    module: "vbet5",
                    htmlmin: {
                        collapseBooleanAttributes:      true,
                        collapseWhitespace:             true,
                        removeAttributeQuotes:          true,
                        removeComments:                 true, // Only if you don't use comment directives!
                        removeEmptyAttributes:          false,
                        removeRedundantAttributes:      false,
                        removeScriptTypeAttributes:     true,
                        removeStyleLinkTypeAttributes:  false
                    }
                },
                src: ["templates/**/*.html", "skins/<%=skin%>/templates/**/*.html", "skins/<%=skinConfig%>/templates/**/*.html"],
                dest: "templates.js"
            }
        },
        replace: {
            removeContextAttr: {
                options: {
                    patterns: [
                        {match: /\scontext=\\\"[^\\]*\\\"/g, replacement: '' }
                    ]
                },
                files: [
                    { src: ['./templates.js'], dest: './templates.js'}
                ]
            },
            changeAppVersion: {
                options: {
                    patterns: [
                        {match: /"appVersion"\:\"[a-z0-9]+\"/g, replacement: '"appVersion":"<%= gitinfo.local.branch.current.SHA %>"'}
                    ]
                },
                files: [
                    { src: ['./appVersion.json'], dest: './appVersion.json'}
                ]
	    },
	    //------------------  Create index.html for specific skin --------------------------------------------------
            createSkinIndexHtml: {
                options: {
                    patterns: [
                        {match: /<script\ssrc="js\/skins\/local\.js"/g, replacement: '<script src="js/skins/<%=skinConfig%>.js"'},
                        {match: /xdomain\.slaves\(\{\}\)/g, replacement: 'xdomain.slaves(<%=angularValue.VBET5.SkinConfig.xDomainSlaves%>)'},
                        {match: /<script\sid="bodyscript"><\/script>/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.bodyScript%>'},
                        {match: /skinCssFileList/g, replacement: '<%=cssFilesArray%>'},
                        {match: /<!--skin\sjs\sfiles-->/g, replacement: '<%=sourceFiles%>'},
                        {match: /<!--optional\sjs\sfiles-->/g, replacement: '<%=optionalSourceFiles%>'},
                        {match: /<!--metas-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlMetaTags%>'},
                        {match: /<!--header-scripts-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlHeaderScripts%>'},
                        {match: /<!--about-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlAboutText%>'},
                        {match: /<!--scripts-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlScripts%>'},
                        {match: /data\-id=""/g, replacement: 'data-id="<%=angularValue.VBET5.SkinConfig.main.site_id%>"'},
                        {match: /data\-config\-is\-externall=""/g, replacement: 'data-config-is-externall="<%=angularValue.VBET5.SkinConfig.loadConfigFromCMS || false%>"'}
                    ]
                },
                files: [{src: ['../index.html'], dest: '../<%=skinConfig%>.html'}]
            },
            xDomainFrameUrl: {
                options: {
                    patterns: [
                        {match: /xdomain\.slaves\(\{\}\)/g, replacement: 'xdomain.slaves(<%=angularValue.VBET5.SkinConfig.xDomainSlaves%>)'}
                    ]
                },
                files: [{src: ['index.html'], dest: 'index.html'}]
            },
            configUrlPath: {
                options: {
                    patterns: [
                        {match: /data\-config\-url\-path=""/g, replacement: 'data-config-url-path="<%=configUrlPath%>"'}
                    ]
                },
                files: [{src: ['index.html'], dest: 'index.html'}]
            },
            htmlPlaceholders: {
                options: {
                    patterns: [
                        {match: /<script\sid="bodyscript"><\/script>/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.bodyScript%>'},
                        {match: /data\-config\-url\-path=""/g, replacement: 'data-config-url-path="<%=angularValue.VBET5.SkinConfig.main.resourcePathPrefix || ""%>"'},
                        {match: /<!--metas-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlMetaTags%>'},
                        {match: /<!--header-scripts-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlHeaderScripts%>'},
                        {match: /<!--about-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlAboutText%>'},
                        {match: /<!--scripts-->/g, replacement: '<%=angularValue.VBET5.SkinConfig.main.htmlScripts%>'}
                    ]
                },
                files: [{src: ['index.html'], dest: 'index.html'}]
            },
            noCdnLibs: {
                options: {
                    patterns: []
                },
                files: [{src: ['index.html'], dest: 'index.html'}]
            }
        },
        //------------------- Minify JS --------------------------------------------------------------------------------
        'closure-compiler': {
            frontend: {
                closurePath: '..', // compiler.jar has to be in 'build' directory
                js: [
//                    '../lib/angular/angular-animate.js',
//                    '../lib/es5-shim.js',
                    '../lib/amplify.store.min.js',
                    '../lib/moment-with-locales.min.js',
                    '../lib/ng-map.js',
                    '../lib/hls.js',
//		            '../lib/hopscotch.min.js',
                    '../lib/readable-range.js',
                    '../lib/xml2json.js',
//                    '../lib/intro.min.js',
                    '../lib/script.js',
                    '../lib/autofill-event.js',//for fixing bug with auto-fill(https://github.com/angular/angular.js/issues/1460)
                    '../lib/swfobject.js',
                    '../lib/evercookie.js',   // anti-fraud project
                    '../lib/fingerprint2.min.js',   // anti-fraud project
                    '../lib/socket.io.js',
                    '../lib/modules/**/*.js',
                    '../js/modules/vbet5/main.js',
                    '../js/modules/vbet5/config.js',
                    //'translations.js', // this will be created by replace:cleanTranslationsFile  task
                    '../js/modules/vbet5/routes.js',
                    '../js/modules/vbet5/services/**/*.js',
                    '../js/modules/vbet5/constants/**/*.js',
                    '../js/modules/vbet5/directives/**/*.js',
                    '../js/modules/vbet5/controllers/**/*.js',
                    '../js/modules/vbet5/filters/**/*.js',
                    '../js/modules/cms/main.js',
                    '../js/modules/cms/config.js',
                    '../js/modules/cms/services/**/*.js',
                    '../js/modules/cms/directives/**/*.js',
                    '../js/modules/cms/controllers/**/*.js',
                    '../js/modules/cms/filters/**/*.js',
                    '../js/modules/casino/main.js',
                    '../js/modules/casino/config.js',
                    '../js/modules/casino/controllers/**/*.js',
                    '../js/modules/casino/services/**/*.js',
                    '../js/modules/casino/directives/**/*.js',
                    '../js/skins/<%=skinConfig%>.js',
                    '../skins/<%=skinConfig%>/js/**/*.js',
                    '../js/main.js',  // order is important!
                    'templates.js' //  created by ngtemplates task
                ],
                jsOutputFile: 'app.min.js',
                maxBuffer: 3500,
                options: {
//                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT'
                }
            },
            partnerinit: {
                closurePath: '..', // compiler.jar has to be in 'build' directory
                js: ['../js/partnerinit.js'],
                jsOutputFile: 'app/<%=skin%>/js/partnerinit.js',
                options: {compilation_level: 'ADVANCED_OPTIMIZATIONS',language_in: 'ECMASCRIPT5_STRICT'}
            }
        },
        //---------------------- Strip all console logging from sources ------------------------------------------------
        strip : {
            main : {
                src : 'app.min.js',
                options : {
                    nodes : ['console.log', 'console.warn', 'debugger'],
                    inline : true
                }
            }
        },
        //---------------------- Process index.html (replace srcs and hrefs with  minified/cdn ones) -------------------
        processhtml: {
            options: {
                data: {
                    version: '<%= pkg.version %>',
                    resourcePathPrefix: '<%= angularValue.VBET5.SkinConfig.main.resourcePathPrefix || "" %>',
                    buildDate: '<%= grunt.template.today("yyyymmddhhMMss") %>',
                    favicon: '<%= (angularValue.VBET5.SkinConfig.main.integrationMode || angularValue.VBET5.SkinConfig.main.disableFavicon) ? "" : (angularValue.VBET5.SkinConfig.main.resourcePathPrefix || "") + (angularValue.VBET5.SkinConfig.main.logo && angularValue.VBET5.SkinConfig.main.logo.favicon || "favicon.ico") + "?=" + grunt.template.today("yyyymmddhhMMss")  %>',
                    gitinfo: '<%= gitinfo.local.branch.current.SHA %>',
                    skin: '<%= skin %>',
                    rtl: '<%= rtl %>',
                    title: '<%= metaTags.title && metaTags.title.eng || "" %>',
                    keywords: '<%= metaTags.keywords && metaTags.keywords.eng || "" %>',
                    description: '<%= metaTags.description && metaTags.description.eng || "" %>'
                }
            },
            dist: {
                files: {
                    'index.html': ['../index.html'],
                    'fbapplanding.html': ['../fbapplanding.html']
                }
            }
        },
        //---------------------- Copy all needed files to build/app/<skin> directory for deployment ---------------------------
        copy: {
            main: {
                files: [
                    {expand: true, src: ['app.min.js', 'index.html', 'conf.json', 'appVersion.json'], dest: 'app/<%=skin%>/'},
                    {expand: true, src: ['main.min.css'], dest: 'app/<%=skin%>/css'},
                    {expand: true, src: ['skin.min.css'], dest: 'app/<%=skin%>/skins/<%=skin%>/css'},
                    {expand: true, src: ['../skins/<%=skin%>/**'], dest: 'app/<%=skin%>/skins/'},
                    //{expand: true, src: ['../js/partnerinit.js'], dest: 'app/<%=skin%>/partnerinit.js'},
                    {expand: true, flatten: true, src: ['languages_tmp/*.json'], dest: 'app/<%=skin%>/languages'},
                    {expand: true, src: ['../images/**'], dest: 'app/<%=skin%>/images'},

                    {expand: true, src: ['../swf/**'], dest: 'app/<%=skin%>/swf'},
                    {expand: true, src: ['../audio/**'], dest: 'app/<%=skin%>/audio'},
                    {expand: true, src: ['../fonts/**'], dest: 'app/<%=skin%>/fonts'},
                    {expand: false, src: ['../skins/<%=skin%>/favicon.ico'], dest: 'app/<%=skin%>/favicon.ico'},
                    {expand: true, flatten: true, src: ['../css/fonts/*.*'], dest: 'app/<%=skin%>/css/fonts/'},
                    {expand: true, flatten: true, src: ['../skins/<%=skin%>/css/fonts/*.css'], dest: 'app/<%=skin%>/css/fonts'},
                    {expand: true, flatten: true, src: ['../skins/<%=skin%>/css/additional/*.css'], dest: 'app/<%=skin%>/css/additional/'}
                ]
            },
            easternView: {
                files: [
                    {expand: true, src: ['eastern_view/**'], dest: 'app/<%=skin%>/'}
                ]
            },
            devtranslations: { //copies generated translation json files to languages folder (used in dev environment)
                files: [
                    {expand: true, flatten: true, src: ['languages_tmp/*.json'], dest: '../languages'}
                ]
            }
        },
        downloadfile: {}, //options will be set by  'load-translations' task
        //---------------------- Generate documentation ----------------------------------------------------------------
        docular: {
            groups: [
                {
                    groupTitle: 'VBET5',
                    groupId: 'VBET5',
                    groupIcon: 'icon-book',
                    sections : [
                        {
                            id: "main",
                            title: "VBET5 AngularJS app documentation",
                            scripts: [ "../js"]
                        }
                    ]
                }
            ],
//            baseUrl: 'http://127.0.0.1/docs',
            showDocularDocs: true,
            showAngularDocs: true,
            docular_webapp_target : "docs",
            docular_partial_home: 'docs.html'
        },
        //---------------------- remove temporary files-----------------------------------------------------------------
        clean: {
            'languages-temp': ['languages_tmp/*.*'],
            'eastern-view': ['eastern_view', 'app/<%=skin%>/eastern_view'],
            'build-temp': ['templates.js', 'translations.js', 'app.min.js.report.txt', 'app/<%=skin%>/js/partnerinit.js.report.txt', 'app.min.js', 'index.html', 'main.min.css', 'skin.min.css', 'app/<%=skin%>/skins/<%=skin%>/css/main.css', 'app/<%=skin%>/css/transitions.css', '<%=skin%>_translations.js', 'conf.json', 'tmp'],
            'news-delta': ['seo/result/news_delta/*.*']
        },
        //---------------------- Extraction of translateable strings and PO files generation ---------------------------
        shell: {
            extractTranslations: {
                options: { stdout: true, failOnError: true },
                command: 'php translations/extract.php ' + (grunt.option('lang') || '')
            },
            generateTranslation:  {
                options: { stdout: true, failOnError: true },
                command: 'php translations/generate.php && mv translations/translations.js ../js/modules/vbet5/'
            },
            generateTranslationSeparate:  {
                options: { stdout: true, failOnError: true },
                command: 'php translations/generate.php separate && mv translations/*.json languages_tmp/'
            },
            generateSkinTranslation:  {
                options: { stdout: true, failOnError: true },
                command: 'php translations/generate.php --skin=<%=skinConfig%> && mv translations/translations.js <%=skin%>_translations.js'
            },
            generateSkinTranslationSeparate:  {
                options: { stdout: true, failOnError: true },
                command: 'php translations/generate.php --skin=<%=skinConfig%> separate && mv translations/*.json languages_tmp/'
            },
            showUntranslated: {
                options: { stdout: true, failOnError: true },
                command: 'php translations/generate.php showNotTranslated ' + (grunt.option('lang') || '')
            },
            makeGzipFiles: {  // nginx will serve available gz files instead of doing gzip compression on every request
                options: { stdout: true, failOnError: false },
                command: 'gzip -c app/<%=skin%>/app.min.js > app/<%=skin%>/app.min.js.gz; gzip -c app/<%=skin%>/css/main.min.css > app/<%=skin%>/css/main.min.css.gz;'
            },
            buildEasternView: {
                options: { stdout: true, failOnError: true },
                command: './eastern_view_releaser.sh <%=skin%> release'
            }
        },
        //---------------------- Minify CSS  ---------------------------------------------------------------------------
        cssmin: { }, //config  will be set by load-css-filelist task

        //---------------------- Deploy to SFTP server (auth file with credentials is not in SVN)-----------------------
        'sftp-deploy': {
            all: {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>',
                dest: '<%=deployServerPath%>',
                exclusions: ['./app/<%=skin%>/images/flag', './app/<%=skin%>/files', './app/<%=skin%>/index.html'],
                concurrency: 1,
                progress: false,
                cashe: "./deploy-cache.json"
            },
            files: {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: '../skins/<%=skin%>/files',
                dest: '<%=deployServerPath%>',
                concurrency: 1
            },
            'js-css': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>',
                dest: '<%=deployServerPath%>',
                exclusions: ['./app/<%=skin%>/skins/<%=skin%>/templates', './app/<%=skin%>/files', './app/<%=skin%>/skins/<%=skin%>/js', './app/<%=skin%>/images', './app/<%=skin%>/skins/<%=skin%>/images', './app/<%=skin%>/skins/<%=skin%>/fonts', './app/<%=skin%>/swf', './app/<%=skin%>/audio', './app/<%=skin%>/fonts', './app/<%=skin%>/templates', './**/*.scss', './**/*.ico', './app/<%=skin%>/index.html']
            },
            'css': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>',
                dest: '<%=deployServerPath%>',
                exclusions: ['./app/<%=skin%>/skins/<%=skin%>/templates', './app/<%=skin%>/files', './app/<%=skin%>/images', './app/<%=skin%>/skins/<%=skin%>/images', './app/<%=skin%>/skins/<%=skin%>/fonts', './app/<%=skin%>/swf', './app/<%=skin%>/audio', './app/<%=skin%>/fonts', './app/<%=skin%>/templates', './**/*.scss', './**/*.ico', './**/*.json','./app/<%=skin%>/index.html', './**/*.js*']
            },
            'css-fonts': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>',
                dest: '<%=deployServerPath%>',
                exclusions: ['./app/<%=skin%>/skins/<%=skin%>/templates', './app/<%=skin%>/files', './app/<%=skin%>/images', './app/<%=skin%>/skins/<%=skin%>/images',  './app/<%=skin%>/swf', './app/<%=skin%>/audio', './app/<%=skin%>/templates', './**/*.scss', './**/*.ico', './**/*.json','./app/<%=skin%>/index.html', './**/*.js*']
            },
            'css-images': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>',
                dest: '<%=deployServerPath%>',
                exclusions: ['./app/<%=skin%>/skins/<%=skin%>/templates', './app/<%=skin%>/files', './app/<%=skin%>/skins/<%=skin%>/fonts', './app/<%=skin%>/swf', './app/<%=skin%>/audio', './app/<%=skin%>/fonts', './app/<%=skin%>/templates', './**/*.scss', './**/*.ico', './**/*.json','./app/<%=skin%>/index.html', './**/*.js*']
            },
            'conf': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: "./",
                dest: '<%=deployServerPath%>',
                include: ["conf.json"]
            },
            'index': {  // index has to be uploaded separately, after all the others are uploaded, no to request old(not updated files) with new urls to avoid caching them
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: "./app/<%=skin%>/",
                dest: '<%=deployServerPath%>',
                include: ["index.html"]
            },
            'translations': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>/languages',
                dest: '<%=deployServerPath%>/languages'
            },
            'seo': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './seo/result/',
                dest: '<%=deployServerPath%>',
                exclusions : ['./seo/result/news_delta/']
            },
            'seo-google': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './seo/result/',
                dest: '<%=deployServerPath%>/google',
                exclusions : ['./seo/result/news_delta/']
            },
            'seo-news-delta': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './seo/result/news_delta/',
                dest: '<%=deployServerPath%>' + '/news',
                exclusions : []
            },
            'eastern-view': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: './app/<%=skin%>/eastern_view',
                dest: '<%=deployServerPath%>/eastern-view',
                exclusions : []
            },
            'rollback': {
                auth: {host: '<%=deployServerHost%>', port: 22, authKey: '<%=deployServerKey%>' },
                src: '../../builds/<%=buildnumber%>/archive/build/app/<%=skin%>',
                dest: '<%=deployServerPath%>',
                exclusions: ['../../builds/<%=buildnumber%>/archive/build/app/<%=skin%>/images/flag']
            }
        },
        plato: {
            task: {
                files: {
                    'report/': ['../js/**/*.js']
                }
            }
        },
        execute: {
            'seo-all': { // update all seo files - news and pages
                options: {args: ['--skin=<%=skinConfig%>']},
                src: ['./seo/generate.js']
            },
            'seo-all-google': { // update all seo files - news and pages
                options: {args: ['no-redirects', '--skin=<%=skinConfig%>']},
                src: ['./seo/generate.js']
            },
            'seo-update-news': { // update only news
                options: {args: ['update-news', '--skin=<%=skinConfig%>']},
                src: ['./seo/generate.js']
            },
            'seo-update-news-google': { // update only news
                options: {args: ['update-news', 'no-redirects', '--skin=<%=skinConfig%>']},
                src: ['./seo/generate.js']
            }
        },
        spritepacker: {
            flags: { // flags spritre generation
                options: {
                    template: '../css/flags.sprite.tpl',
                    destCss: '../css/flags.css',
                    baseUrl: '../images/',
                    padding: 5
                },
                files: {
                    '../images/flags.png?<%= grunt.template.today("yyyymmddhhMMss") %>': ['../images/flag/*.png']
                }
            }
        }
    });

    //************************************   Load the plugins **********************************************************
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks("grunt-strip");
    grunt.loadNpmTasks('grunt-svninfo');
    grunt.loadNpmTasks('grunt-gitinfo');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-docular');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-sftp-deploy-i');
//    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('import-angular-value');
    grunt.loadNpmTasks('grunt-sprite-packer');
    grunt.loadNpmTasks('grunt-downloadfile');
    grunt.loadNpmTasks('grunt-sass');

    require('./grunt-custom-tasks.js')(grunt);

    //************************************* init stuff - set default values, etc. **************************************
    grunt.config.set('translationsJsonUrl', grunt.option('translations-url') || 'http://web.betconstruct.int/translations/app/get_language/');
    grunt.config.set('configUrlPath', grunt.option('config-url-path') || '');
    grunt.config.set('skin', grunt.option('skin') || 'vbet.com');
    grunt.config.set('skinConfig', grunt.option('skin-config') || grunt.config.get('skin'));


    if (grunt.cli.tasks.indexOf('create-skin') === -1) { //for create-skin task config doesn't exist yet
        grunt.task.run('import_angular_value');grunt.task.start(); //load skin config
        if (!grunt.config.get('angularValue')) {
            grunt.fail.fatal("cannot read config of [" + grunt.config.get('skinConfig') + "] skin , check if skin name is correct and skin config file exists");
        }
        //check if another skin name is specified in config (i.e. names for skin config and skin css folder are different)
        if (grunt.config.get('angularValue').VBET5.SkinConfig.main.skin !== "") {
            grunt.config.set('skin', grunt.config.get('angularValue').VBET5.SkinConfig.main.skin);
        }
    }
    console.log("\n***********************************\n        GRUNT           \n");
    console.log("task:", grunt.cli.tasks, "skinConfig:", grunt.config.get('skinConfig'), "skin:", grunt.config.get('skin'));
    console.log("\n***********************************\n");

    grunt.config.set('buildnumber', grunt.option('buildnumber'));
    var skinDeployConfig = {
        path: serverOptions.paths[grunt.config.get('skinConfig')],
        key: serverOptions.keys[grunt.config.get('skinConfig')] || serverOptions.keys._default,
        host: serverOptions.hosts[grunt.config.get('skinConfig')] || serverOptions.hosts._default
    };
    try {
        skinDeployConfig = grunt.file.readJSON(path.resolve(path.join(__dirname, "..", "skins", grunt.config.get('skinConfig'), "deploy.json")));
        console.log("using skin local deployment config", skinDeployConfig);
    } catch (e) {
        console.log("no local deployment config for skin, using values from servers.json");
    }


    grunt.config.set('deployServerPath', grunt.option('deploy-path') || skinDeployConfig.path);
    grunt.config.set('deployServerKey', grunt.option('deploy-key') || skinDeployConfig.key);
    grunt.config.set('deployServerHost', grunt.option('deploy-host') || skinDeployConfig.host);

    grunt.config.set('rtl',  grunt.option('rtl')  || false);  //must be set to true if skin have RTL languages
    grunt.config.set('metaTags', grunt.file.readJSON('./metainfo.json')[grunt.config.get('skinConfig')] || {title: {eng: ""}, description: {eng: ""}, keywords: {eng: ""}});
    grunt.config.set('defaultCssFileList', ['soccer-control.css', 'tennis-control.css', 'games-animations-classic.css', 'main.css', 'media.css', 'flags.css', 'transitions.css', 'lib/introjs.min.css', 'lib/rg-slider.min.css', 'lib/rzslider.min.css', 'lib/hopscotch.min.css', 'lib/barcode.css'])


    //************************************************************* Tasks **********************************************
    grunt.registerTask("crateBuildConfig", function () {
       var path = "../js/modules/vbet5/constants/buildConfig.js";
       var constant = {
           releaseDate: grunt.template.today("dd/mm/yyyy-HH:MM")
       };
       var content = "angular.module('vbet5').constant('BuildConfig', " + JSON.stringify(constant) + ")";
       grunt.file.write(path, content);
    });

    grunt.registerTask('test',                         ['gitinfo',  'processhtml', 'no-cdn-libs', 'replace:noCdnLibs', 'copy']);
    grunt.registerTask('dev',                          ['gitinfo', 'load-additional-modules', 'create-conf', 'load-css-filelist', 'ngtemplates', 'load-translations', 'replace:removeContextAttr', 'replace:changeAppVersion', 'closure-compiler', 'cssmin', 'processhtml', 'replace:xDomainFrameUrl', 'replace:htmlPlaceholders',  'no-cdn-libs', 'replace:noCdnLibs', 'copy', 'clean:build-temp']);
    //grunt.registerTask('load-translations',            ['shell:generateSkinTranslationSeparate']); //old way, from .po
    grunt.registerTask('load-translations',            ['clean:languages-temp', 'load-language-filelist', 'downloadfile']);  // new way, from translation tool
    grunt.registerTask('debug',                        ['gitinfo', 'load-additional-modules', 'create-conf', 'load-css-filelist', 'ngtemplates', 'load-translations', 'closure-compiler', 'cssmin', 'processhtml', 'replace:xDomainFrameUrl', 'replace:htmlPlaceholders', 'no-cdn-libs', 'replace:noCdnLibs', 'copy:main']);
//    grunt.registerTask('default-inline-templates',     ['closure-compiler', 'processhtml', 'strip', 'inline_angular_templates', 'copy', 'clean:build-temp']);
    grunt.registerTask('create-css',                   ['gitinfo', 'load-additional-modules', 'load-css-filelist', 'cssmin', 'processhtml', 'replace:xDomainFrameUrl', 'replace:htmlPlaceholders', 'no-cdn-libs', 'replace:noCdnLibs', 'copy:main', 'clean:build-temp']);
    grunt.registerTask('default',                      ['gitinfo', 'load-additional-modules', 'create-conf', 'load-css-filelist', 'ngtemplates', 'load-translations', 'replace:removeContextAttr', 'replace:changeAppVersion', 'crateBuildConfig', 'closure-compiler', 'sass', 'cssmin', 'strip', 'processhtml', 'replace:xDomainFrameUrl', 'replace:htmlPlaceholders', 'no-cdn-libs', 'replace:noCdnLibs', 'copy:main', 'clean:build-temp']);
    grunt.registerTask('build-with-logs',              ['gitinfo', 'load-additional-modules', 'create-conf', 'load-css-filelist', 'ngtemplates', 'load-translations', 'replace:removeContextAttr', 'replace:changeAppVersion', 'closure-compiler', 'sass', 'cssmin', 'processhtml', 'replace:xDomainFrameUrl', 'replace:htmlPlaceholders', 'no-cdn-libs', 'replace:noCdnLibs', 'copy:main', 'clean:build-temp']);
    grunt.registerTask('create-skin',                  ['create-new-skin', 'sass', 'create-skin-launcher']);
    grunt.registerTask('create-skin-and-build',        ['create-new-skin', 'sass', 'create-skin-launcher', 'default']);
    grunt.registerTask('create-skin-and-deploy',       ['create-new-skin', 'sass', 'create-skin-launcher', 'build-with-logs', 'sass', 'shell:makeGzipFiles', 'deploy-all']);

    // ----------------------------------------   DEPRECATED:  we're using translations tool for translations
    //----------- Translations generation. Requires PHP 5.4 or higher.    to generate PO file for new language run "grunt extractTrans --lang=<language>".
    grunt.registerTask('extractTrans',                 ['shell:extractTranslations']);  // will generate PO files from JS/HTML sources. Usage:  grunt extractTrans --lang=<language>
    grunt.registerTask('generateTrans',                ['shell:generateTranslationSeparate', 'copy:devtranslations']);  // will generate translation JS file from all PO files and copy it to 'languages' folder
    grunt.registerTask('generateTransSeparate',        ['shell:generateTranslationSeparate']);  // will generate translations in separate json files
    grunt.registerTask('showUnTranslated',             ['shell:showUntranslated']);  // will show not translated strings in specified language. Usage grunt showUnTranslated --lang=<language> if lang is not specified, for all languages

    grunt.registerTask('update-dev-translations',       ['load-translations', 'copy:devtranslations']);

    // deployment tasks.  this needs .ftppass file with auth data in current directory, see https://github.com/thrashr888/grunt-sftp-deploy#authentication-parameters for details
    grunt.registerTask('deploy',                        ['sftp-deploy:js-css', 'sftp-deploy:index']);   // will deploy only html/js/css
    grunt.registerTask('deploy-css',                    ['sftp-deploy:css', 'sftp-deploy:index']);   // will deploy only css
    grunt.registerTask('deploy-css-images',             ['sftp-deploy:css-images', 'sftp-deploy:index']);   // will deploy css and images
    grunt.registerTask('deploy-css-fonts',              ['sftp-deploy:css-fonts', 'sftp-deploy:index']);   // will deploy css and fonts
    grunt.registerTask('deploy-translations',           ['load-translations', 'copy', 'sftp-deploy:translations']);
    grunt.registerTask('deploy-all',                    ['sftp-deploy:all', 'sftp-deploy:index']);      // will deploy everything, including images, fonts, swf
    grunt.registerTask('deploy-files',                  ['sftp-deploy:files']);      // will deploy files from skin's "files" directory
    grunt.registerTask('rollback',                      ['sftp-deploy:rollback']);

    grunt.registerTask('build-and-deploy',                  ['default', 'shell:makeGzipFiles', 'deploy']);
    grunt.registerTask('build-and-deploy-css',              ['sass', 'create-css', 'shell:makeGzipFiles', 'deploy-css']);
    grunt.registerTask('build-and-deploy-css-and-images',   ['sass', 'create-css', 'shell:makeGzipFiles', 'deploy-css-images']);
    grunt.registerTask('build-and-deploy-css-and-fonts',    ['sass', 'create-css', 'shell:makeGzipFiles', 'deploy-css-fonts']);
    grunt.registerTask('build-and-deploy-all',              ['default', 'sass', 'shell:makeGzipFiles', 'deploy-all']);
    grunt.registerTask('deploy-config',                     ['create-conf', 'sftp-deploy:conf', 'clean:build-temp']);
    grunt.registerTask('deploy-eastern-view',               ['shell:buildEasternView', 'copy', 'copy:easternView', 'sftp-deploy:eastern-view', 'clean:eastern-view']);

    grunt.registerTask('update-seo',                  ['execute:seo-all', 'sftp-deploy:seo', 'clean:news-delta']);
    grunt.registerTask('update-seo-news',             ['execute:seo-update-news', 'sftp-deploy:seo-news-delta', 'clean:news-delta']);
    grunt.registerTask('update-seo-google',           ['execute:seo-all-google', 'sftp-deploy:seo-google', 'clean:news-delta']);

    // will create an html file to launch app with specified skin config(needed for development).Usage example:   grunt create-skin-launcher --skin=vbet.com    (this will create vbet.com.html file)
    grunt.registerTask('create-skin-launcher',                    ['load-css-filelist', 'get-src-list', 'replace:createSkinIndexHtml']);


};
