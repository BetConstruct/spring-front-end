// Karma configuration
module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
        'lib/angular/angular.js',
        '../lib/angular/1.5.9/angular-mocks.js',
        'lib/angular/angular-*.js',
        'lib/*.js',
        'lib/modules/*.js',
        
        'js/modules/vbet5/main.js',
        'js/modules/vbet5/config.js',
        'js/modules/vbet5/routes.js',

        'js/modules/vbet5/constants/*.js',

        'js/main.js',

        'js/modules/vbet5/*.js',        
        'js/modules/cms/main.js',
        'optional_modules/casino/main.js',

        'extension/translations.js',
        'js/modules/vbet5/services/*.js',
        'js/modules/vbet5/directives/*.js',
        'js/modules/vbet5/filters/*.js',        


        'js/skins/vbet.com.js',

//         'js/modules/vbet5/services/translator.js',
//         'js/modules/truncate.js',        
//         'js/modules/cms/services/*.js',      
//         'js/modules/casino/services/*.js',
//         'js/modules/cms/*.js',
//         'js/modules/casino/*.js',
        'test/unit/mocks/*.js',
//         'test/unit/*.js',
        'test/unit/modules/vbet5/services/utils.js'
    ],

    // list of files to exclude
    exclude: ['lib/angular/angular-scenario.js'],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
//     reporters: ['progress', 'coverage'],
    reporters: ['progress'],

//     preprocessors: {
//         'js/*.js': ['coverage'],
//         'js/services/*.js': ['coverage']
//     },
    preprocessors: {
    },

//     coverageReporter: {
//         type : 'html',
//         dir : 'test/coverage/'
//     },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    plugins: [
        'karma-chrome-launcher',
        'karma-jasmine'
    ]
  });
};
