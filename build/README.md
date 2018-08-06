# Releasing skin to local environment

Our team uses grunt for deployment. <br/>
Built sources are kept in build/ folder. <br/>
Grunt file is here build/Gruntfile.js.


#### In order to deploy project locally on your machine, perform the following steps:


* cd build/

* npm install (run just once, to install all dependencies)

* grunt [dev] [--skin=skinname.com]
* dev - skips stripping console.log()s from source, making build process much faster
* if run without --skin option, it will build vbet.com by default

* you’ll find built sources in build/app/skinname.com/ folder, they are ready to be put on production server (if run without dev option of course)

* in order to test locally this build version, just open http://[your_local_host]/build/app/skinname.com/


## Releasing skin to live environment

For automatic build process and release to live environment you'll need to develop your own Grunt tasks taking into account your server settings.
