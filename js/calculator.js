var possible_indicators = [
        "Wingman/Game", "Assists/Kill", "Assists/Death", "Assist Spree/Game",
        "Wheelman Spree/Game", "Yoink/Game", "Pummel/Game", "Kills/Hour", "Deaths/Hour", 
        "First Strike/Game", "Beat Down/Game", "Assassin/Game", "Sniper Kill/Game", 
        "Triple Kill/Game", "Overkill/Game", "Sharpshooter/Game",
        "Shotgun Spree/Game", "Splatter/Game", "Grenade Stick/Game", "Close Call/Game"
];

var possible_playstyles = ["team", "individual", "reckless", "cautious"];

/**
 * Load the playstyle calculator once the dom has loaded
 */
$(function() {
    generateCalculatorOptions();
})

/***
 * Create the table of all possible playstyle combinations in the calculator dialog.
 */
function generateCalculatorOptions() {
    var calculator = d3.select("#calculator_controls");
    var calculator_options = "<table>";
    
    for (var i in possible_indicators) {
        var indicator = possible_indicators[i];
        calculator_options += "<tr><td><b>" + indicator + ":</b></td><td><form>";
        var noneChecked = false;
        for (var j in possible_playstyles) {
            var playstyle = possible_playstyles[j];
            
            // determine if the box should be checked by default
            isChecked = false;
            if (playstyle == "team" && (team_pos.indexOf(indicator) != -1))
                isChecked = true;
            else if (playstyle == "individual" && (team_neg.indexOf(indicator) != -1))
                isChecked = true;
            else if (playstyle == "reckless" && (reck_pos.indexOf(indicator) != -1))
                isChecked = true;
            else if (playstyle == "cautious" && (reck_neg.indexOf(indicator) != -1))
                isChecked = true;
                
            noneChecked = (isChecked) ? isChecked : noneChecked;
            
            calculator_options += '<input type="radio" ' + ((isChecked) ? 'checked="checked"' : '') + 'id="' + formatID(indicator) + '_' + playstyle + '" name="radio" /><label for="' + formatID(indicator) + '_' + playstyle + '">' + playstyle + '</label>';
        }
        calculator_options += '<input type="radio" ' + ((noneChecked) ? '' : 'checked="checked"' ) + 'id="' + formatID(indicator) + '_none" name="radio" /><label for="' + formatID(indicator) + '_none">none</label>';
        calculator_options += "</form></td></tr>";
    }

    calculator_options += "</table>";
    calculator.html(calculator_options);
    
    
}

/***
 * Based on what was selected in the playstyle table, update the indicators and re-render
 * all the visualizations.
 */
function updateIndicators() {
    
    // Reset all indicators to empty
    team_pos = []; 
    team_neg = []; 
    reck_pos = [];
    reck_neg = [];

    // Check which playstyle is selected for each indicator and add it to the appropriate
    // indicator array
    for (var i in possible_indicators) {
        var indicator = possible_indicators[i];
        for (var j in possible_playstyles) {
            var playstyle = possible_playstyles[j];
            if (document.getElementById(formatID(indicator) + '_' + playstyle).checked) {
                switch (playstyle) {
                    case "team":
                        team_pos.push(indicator);
                        break;
                    case "individual":
                        team_neg.push(indicator);
                        break;
                    case "reckless":
                        reck_pos.push(indicator);
                        break;
                    case "cautious":
                        reck_neg.push(indicator);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // Recreate the combinations of indicators (signals) used in the visualizations
    team_sig = team_pos.concat(team_neg);
    reck_sig = reck_pos.concat(reck_neg);
    all_sig = team_sig.concat(reck_sig);

    // Redraw all of the visualizations based on these new indicators!
    refreshAll();
}

/***
 * Helper function to format indicators so that they can be used as IDs for HTML elements.
 */
function formatID(indicator) {
    return indicator.replace(" ", "_").replace("/", "_");
}