<?php
/**
 *
 * PHP version 5.4+
 *
 * used for collecting strings from all .po files
 * and generating  AngularJs 'constant' statement for all found languages
 *
 */

class Po2Json
{
    protected $translations = array();
    protected $counts = array();
    protected $onlyShow = false;
    protected $showNotTranslated = false;
    protected $onlyForLang = false;
    protected $justJson = false;

    /**
     * @param bool $onlyShow if true, will not save translations file, will only show requested information
     * @param null $onlyForLang if set, will process only this language
     * @param false $justJson if true, will output just JSON, not angularjs constant
     */
    public function __construct($onlyShow = false, $onlyForLang = null, $justJson = false) {
        $this->onlyShow = $onlyShow;
        $this->onlyForLang = $onlyForLang;
        $this->justJson = $justJson;

        if ($this->onlyShow) {
            $this->showNotTranslated = true;
        }
    }

    /**
     * Collects strings from all PO files within $dir directory
     *
     * @param string $dir directory
     */
    public function generate($dir)
    {
        if ($handle = opendir($dir)) {
            while (false !== ($entry = readdir($handle))) {
                $pathInfo = pathinfo($entry);
                if ( $this->onlyForLang && strtolower($pathInfo['filename']) != strtolower($this->onlyForLang)) {
                    continue;
                }
                if ($pathInfo['extension'] === 'po') {
                    $this->addTranslationsFromPoFile($dir . DIRECTORY_SEPARATOR . $entry, $pathInfo['filename']);
                }
            }
            closedir($handle);
        }

    }

    /**
     * Collects strings from all skin PO
     *
     * @param string $dir directory
     * @param string $skin skin name. will look for skin specific PO file and join translation from it
     */
    public function generateForSkin($dir, $skin)
    {
        $dir = $dir . DIRECTORY_SEPARATOR . 'skin'. DIRECTORY_SEPARATOR . $skin;
        if ($handle = opendir($dir)) {
            echo "adding skin translations from $dir\n";
            while (false !== ($entry = readdir($handle))) {
                $pathInfo = pathinfo($entry);
                if ( $this->onlyForLang && strtolower($pathInfo['filename']) != strtolower($this->onlyForLang)) {
                    continue;
                }
                if ($pathInfo['extension'] === 'po') {
                    $this->addTranslationsFromPoFile($dir . DIRECTORY_SEPARATOR . $entry, $pathInfo['filename']);
                }
            }
            closedir($handle);
        }

    }
    /**
     * Parses PO file and stores strings in $translations array
     *
     * @param string $file absolute path
     * @param string $lang language
     */
    protected function addTranslationsFromPoFile($file, $lang)
    {
//        echo "parsing $file for $lang\n";
        $lines = file($file);
        $key = $val = null;
        $mode = null;
        if (!isset($this->counts[$lang])) {
            $this->counts[$lang] = array('translated'=>0, 'untranslated'=>0);
        }
        for ($i=0; $i <= count($lines); $i++) {
            $line = $lines[$i];
            if ($line[0] === '#') continue;
            if (substr($line, 0, 5) === 'msgid') {
                $mode = 'key';
                $key = substr(substr($line,6), 1, -2);
                continue;

            } else if (substr($line, 0, 6) === 'msgstr') {
                $mode ='val';
                $val = substr(trim(substr($line,7)), 1, -1);
                continue;
            }

            if ($mode === 'key') {
                $key .= substr($line, 1, -2);
            } else if ($mode === 'val') {
                $val .= substr($line, 1, -2);
            }

            if (strlen(trim($line)) === 0 && $key && $val) {
                $this->translations[$lang][ str_replace("\\'","'", $key)] = str_replace('\\"', '"', str_replace("\\'","'", $val));
                if ($key!=$val) {
                    $this->counts[$lang]['translated']++;
                } else {
                    $this->counts[$lang]['untranslated']++;
                    if ($this->showNotTranslated) {
                        echo "not translated: $lang  [$key]\n";
                    }
                }
                $key = $val = $mode = null;
            }

        }
    }

    /**
     * Returns count of translated and not translated strings (available after generation)
     * @return array
     */
    public function getCounts() {
        return $this->counts;
    }

    /**
     * Writes $translations array to JS file
     *
     * @param string $path absolute path
     */
    public function save($path, $jsonAdvancedFeatures = false)
    {
        if ($this->onlyShow) {
            echo "not saving";
            return;
        }
        if (count($this->translations) < 1) {
            echo "No PO files found. Aborting\n";
            exit(-1);
        }
        $fh = fopen($path, 'w');
        if (!$this->justJson) {
            fwrite($fh, "/**\n\nIMPORTANT: \nuse only double quotes for strings, as this file contents are \nused for translation file generation and have to contain valid JSON\n\nGenerated on: ". date('r') ."\n*/\n");
            fwrite($fh, "/* global VBET5 */\n");
            fwrite($fh, "angular.module('vbet5').constant('Translations', \n");    
        }
        
        if ($jsonAdvancedFeatures) {
            fwrite($fh, json_encode($this->translations, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
        } else {
            fwrite($fh, json_encode($this->translations));
        }
        if (!$this->justJson) {
            fwrite($fh, "\n);");
        }
        
    }

    public function savePerLanguage($path, $jsonAdvancedFeatures = false) {
        foreach ($this->translations as $lang => $content) {
            $fh = fopen($path . DIRECTORY_SEPARATOR. $lang . '.json', 'w');
            //echo "writing " . $path . DIRECTORY_SEPARATOR. $lang . '.json' . PHP_EOL;
            if ($jsonAdvancedFeatures) {
                fwrite($fh, json_encode(array($lang=>$content), JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
            } else {
                fwrite($fh, json_encode(array($lang=>$content)));
            }
            fclose($fh);
        }
    }
}

if (version_compare(PHP_VERSION, '5.4', '<')) {
    echo "PHP < 5.4, json formatting will not work\n";
    $jsonAdvancedFeatures = false;
} else {
    $jsonAdvancedFeatures = true;
}

echo "Generating translations from PO files...\n";
$onlyForLang = null;
$saveAll = true;
$onlyShow = false;
$justJson = false;
$skin = false;

if (isset($argv[1])) {
    if (strtolower($argv[1]) === 'separate' || strtolower($argv[2]) === 'separate') {
        $saveAll = false;
    }
    if (strtolower($argv[1]) === 'shownottranslated') {
        $onlyShow = true;
        if (isset($argv[2])) {
            $onlyForLang = strtolower($argv[2]);
        }
    }
    if (strstr(strtolower($argv[1]), '--skin=') ) {
        $skin = substr($argv[1], 7);
        echo "skin: $skin\n";
    }

}

$generator = new Po2Json($onlyShow, $onlyForLang, $justJson);
$generator->generate(dirname(__FILE__));
if ($skin) {
    $generator->generateForSkin(dirname(__FILE__), $skin);
}
if ($saveAll) {
    $generator->save(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'translations.js', $jsonAdvancedFeatures);
} else {
    $generator->savePerLanguage(dirname(__FILE__), $jsonAdvancedFeatures);
}


foreach ($generator->getCounts() as $lang=>$counts) {
    echo "\n $lang: " . $counts['translated'] . ' strings translated and ' . $counts['untranslated'] . " strings  not translated\n";
}