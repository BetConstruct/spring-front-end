
 * Configuration

1. For being able to run the project on a PC there should be a Local Web server installed on it (Apache, nginx or any other webserver able to serve static files).  
2. For being able to run the build process on a PC Grunt with plugins installed on it take a look at the build\package.json file,  which descibes all dependencies that should be installed with NPM(Node Package Manager). Run "npm install" inside the build folder to install all dependencies.
 

 * Operation Instructions / Project Structure
 
 - audio: Sounds that are played during Live animation for Soccer and Tennis are maintained in this folder.
 - build: This folder is used during the Build process. Build process is based on Grunt. It uses standard and custom Grunt plugins. Build process is thouroughly described in web-project\doc\BuildRelease.pdf document. 
 
 - css: Global CSS files are kept in this folder. These files can be overridden by files in skins folder.
 - doc: Project related documents are kept here.
 - fonts: Global fonts are kept in this folder. These files can be overridden by files in skins folder.  
 - images: Global fonts are kept in this folder. These files can be overridden by files in skins folder.
 - js: Projet .js files are kept in this folder. In js\modules there are 2 folders - cms and vbet5.
 CMS module related files are kept in cms folder. Sportsbook related files and the core application are kept in vbet5 folder.
 
 - languages: This folder is for keeping and applying the Front End translations related .json files to the project.
But these will be applied on the local host only. For applying the translations in the build process separate .json files 
with translations have to be included in the build process.  

 - lib: These folder includes Angular library and 3rd party libraries used in the project.
 - optional_modules: These are the modules that may be optional for a website. These are included in build process based on configuration. So if a module isn't needed for a skin it'll not be included in the build process.
 - skins: Different websites specific files that should apply to these websites (skins) only are kept here.
 - swf: Flash video player related files are kept here. 
 - templates: This folder includes all .html template files used in the project.
 
 * Notes: 

 1. Each module has its own config files but they can be overriden on the level of each website (skin). 
 2. All calls to CMS are compatible with WordPress (i.e. we use our custom CMS, but WordPress can be used as well). WordPress JSON-API plugin should be used in that case (CMS is used only to get content via JSON API).  
 