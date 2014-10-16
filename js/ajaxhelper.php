<?
        // allow local calls for testing purposes
        header('Access-Control-Allow-Origin: *');

        // get the url for the given player's overview page
        $url = "http://halo.bungie.net/Stats/Reach/default.aspx?player=" . $_GET['player'];
        $url = str_replace(" ", "%20", $url);
        
        // create curl resource
        $ch = curl_init();

        // set url
        curl_setopt($ch, CURLOPT_URL, $url);

        //return the transfer as a string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        // $html contains the output string
        $html = curl_exec($ch);

        // close curl resource to free up system resources
        curl_close($ch); 
        
        // search the html for the player's profile picture
        if (preg_match("/ctl00_mainContent_ucPlayerModel_hlModel([^>]+)/s", (string)$html, $matches)) {
            $div = $matches[0];
            preg_match("/href=[^\s]+/s", $div, $out);
            $sub_url = trim($out[0], "\"");
            $sub_url = substr($sub_url, 6);
            $image_link = "http://halo.bungie.net" . $sub_url;
            
            // return the link to the player's image
            echo $image_link;
        }

/*$newDom = new domDocument;
$newDom->loadHTML($html);
$newDom->preserveWhiteSpace = false;
        echo($newDom->getElementById('ctl00_mainContent_ucPlayerModel_hlModel')->href);
*/
?>
