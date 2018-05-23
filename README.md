# Spring sportsbook

## Requirements

1. For being able to run the project locally there should be a Local Web server installed  (Apache, nginx or any other webserver able to serve static files).

2. For being able to run the build process Grunt with plugins must be installed. Take a look at the build\package.json file,  which descibes all dependencies that should be installed with NPM(Node Package Manager). Run `npm install` inside the build folder to install all dependencies.

3. JS minification/optimisation is done with closure compiler(it's being run by grunt plugin). To be able to use it you need to have Java installed.

## Building

To build project, just run `grunt` without any parameters.
It will build project in `build/app/vbet.com` directory.
The directory is ready to be deployed to web server root.

To build another skin(`js/skins/<skin name>.js` config file and `<skin name>` folder with styles must be present) run `grun --skin=<skin name>`. It will be built in `build/app/<skin name>` directory.

There are other grunt tasks like scss compilation, partial build/deployment and so on. See `build/Gruntfile.js` file for details.

## Project Structure

### Directories

* audio: Sounds that are played during Live animation for Soccer and Tennis are maintained in this folder.

* build: This folder is used during the Build process. Build process is based on Grunt. It uses standard and custom Grunt plugins. Build process is thouroughly described in web-project\doc\BuildRelease.pdf document.

* css: Global CSS files are kept in this folder. These files can be overridden by files in skins folder.
* doc: Project related documents are kept here.
* fonts: Global fonts are kept in this folder. These files can be overridden by files in skins folder.
* images: Global fonts are kept in this folder. These files can be overridden by files in skins folder.
* js: Project .js files are kept in this folder. In js\modules there are 2 folders - cms and vbet5.
 CMS module related files are kept in cms folder. Sportsbook related files and the core application are kept in vbet5 folder.

* languages: Contains the translations in json format.

* lib: This folder includes Angular library and 3rd party libraries used in the project.

* optional_modules: These are the modules that may be optional for a website. These are included in build process based on configuration. So if a module isn't needed for a skin it'll not be included in the build process.

* skins: Different websites specific files that should apply to these websites (skins) only are kept here.

* swf: Flash video player related files are kept here.

* templates: This folder includes all .html template files used in the project.

## Configuration

  Each module has its own config files(`config.js` inside module directory) but they can be overriden on the level of each website(skin). See `js/skins/vbet.com.js` for example.

## CMS

Application makes calls to CMS API to get content like images, banners, texts. CMS API is compatible with WordPress (i.e. we use our custom CMS, but WordPress can be used as well). WordPress JSON-API plugin should be used in that case (CMS is used only to get content via JSON API).
