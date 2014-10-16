/***
 * Show the information card for the currently selected player.
 */
function showPlayerInfo(player) {

    // show the selected player's name
    d3.select("#player_name").html("Meet: " + player["Gamertag"] + ", a " + player["playstyle"].capitalize());
  
    // fix a little grammar...
    var favorite_weapon = "";
    if (player["#1 Weapon Name"] == "Melee")
        favorite_weapon = "<b>Melee</b>";
    else
        favorite_weapon = "the <b>" + player["#1 Weapon Name"] + "</b>";
        
    // show the player's basic info (short story)
    var basic_info = "He's played a total of <b>" + player["Games Played"] + "</b> games in the <b>" + player["Playtime"] + "</b> days he's played Halo Reach. Wow! " + player["Gamertag"] + "'s first time online was <b>" + player["Date_start"] + "</b>, and his last game was played on <b>" + player["Date_end"] +"</b>. Through all this, he's earned a grand total of <b>" + player["Commendation Progress (%)"] + "%</b> of the commendations available to Halo players. His very favorite weapon in the entire world is " + favorite_weapon + ". What a cool dude."
    d3.select("#basic_info").html(basic_info);

    // show some statistics about this player
    var stats_info = "";
    stats_info += "<li><b>Games Played: </b>" + precise_round(parseFloat(player["Games Played"]), 2) + "</li>";
    stats_info += "<li><b>Kills/Death: </b>" + precise_round(parseFloat(player["K/D"]), 2) + "</li>";

    // include information about all the indicators used in the scatter plot + bar chart
    for (var i = 0; i < all_sig.length; i++) {
        var indicator = all_sig[i];
        if (indicator.indexOf("/Game") !== -1) 
            indicator = indicator.substring(0, indicator.length - 5);
        stats_info += "<li><b>" + indicator + ": </b>" + precise_round(parseFloat(player[indicator]), 2) + "</li>";
    }
    d3.select("#stats_info").html(stats_info);
    
    // display the player's profile picture
    // our php script that scrapes the player's image's url from their profile page
    var targetUrl = "http://superappbros.com/js/ajaxhelper.php?player=" + player["Gamertag"];

    // load the player's image via ajax
    $.ajax({
      type: "GET",
      async: true,
      url: targetUrl,
      success: function( imageUrl ){
        d3.select("#playerImage").attr('src', imageUrl);
      }
    });    
}
