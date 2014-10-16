// Will contain the preprocessed data produced by this file, should be used by other visualizations
global_data = [];

// The global averages of each indicator (will be used to calculate difference in bar chart)
global_averages = [];

// The playstyles that are currently selected (used in bar chart and bubble chart)
playstyles = [];

// The player who is currently selected (used in player info and bar chart)
selectedPlayer = null;

// Variable indicating whether the user is allowed to select multiple quadrants at once
multiSelect = false;

// Indices of example players who can be highlighted by default (indices are based on global_data)
var samplePlayers = {"hero": 34, "guardian": 38, "daredevil": 10, "camper": 49};

// Remember which circle is currently selected (used locally)
var selectedCircle = null;

/**
 * Load the scatter plot once the dom has loaded
 */
$(function() {
    renderScatterPlot();
})

/**
 * Render scatter plot
 */
function renderScatterPlot() {

    // Get the original dataset we'll be using from the loaded "scatter_data"
    var data = scatter_data;
    
    // Ensure that all numeric values in the data set are treated as numbers not strings
    for (var i in data) {
        var player = data[i];
        for (var property in player) {
            if (isNumber(player[property]))
                player[property] = parseFloat(player[property]);
        }
    }

    // Calculate the per game and per kill values
    for (var i in all_sig) {
        var indicator = all_sig[i];

        // If this value doesn't need preprocessing, skip it
        if (data[1][indicator])
            continue;
        else {
            for (var j in data) {
                var player = data[j];

                // If we're calculating the assists/kill or assists/death values...
                if (indicator == "Assists/Kill")
                    data[j]["Assists/Kill"] = parseFloat(player["Assists"])/parseFloat(player["Kills"]);
                else if (indicator == "Assists/Death")
                    data[j]["Assists/Death"] = parseFloat(player["Assists"])/parseFloat(player["Deaths"]);

                // Otherwise this is a medal, which we want the per game value of
                else {                
                    var old_indicator = indicator.substring(0,indicator.length-5);
                    data[j][indicator] = parseFloat(player[old_indicator])/parseFloat(player["Games Played"]);
                }
            }
        }
    }
    
    // Initialize arrays to hold the team and reckless values for each player (needed for normalization)
    var team = new Array(data.length);
    var reck = new Array(data.length);
    for (var i in data) {
        team[i] = 0;
        reck[i] = 0;
    }

    // Calculate Team values
    for (var i in team_sig) {
        var indicator = team_sig[i];
        var stats = [];
        var stats_squared = [];
        for (var j in data) {
            player = data[j];
            stats.push(player[indicator]);
            stats_squared.push(Math.pow(player[indicator], 2));
        }
        var expected_value = d3.mean(stats);
        var expected_value_squared = d3.mean(stats_squared);
    
        var sd = Math.sqrt(expected_value_squared - Math.pow(expected_value, 2));
    
        for (var j in stats) {
            if (team_pos.indexOf(indicator)) {
                team[j] += ((stats[j] - expected_value) / sd);
            }
            else {
                team[j] -= ((stats[j] - expected_value) / sd);        
            }
        }
    }

    // Calculate Reckless values
    for (var i in reck_sig) {
        var indicator = reck_sig[i];
        var stats = [];
        var stats_squared = [];
        for (var j in data) {
            player = data[j];
            stats.push(player[indicator]);
            stats_squared.push(Math.pow(player[indicator], 2));
        }
        var expected_value = d3.mean(stats);
        var expected_value_squared = d3.mean(stats_squared);
    
        var sd = Math.sqrt(expected_value_squared - Math.pow(expected_value, 2));
    
        for (var j in stats) {
            if (reck_pos.indexOf(indicator)) {
                reck[j] += ((stats[j] - expected_value) / sd);
            }
            else {
                reck[j] -= ((stats[j] - expected_value) / sd);        
            }
        }             
    }

    // Normalize the Team values
    team = normalize(team);

    // Normalize the Reckless values
    reck = normalize(reck);

    // Associate every player with her playstyle
    for (var i in data) {
        var player = data[i];
        player["team"] = team[i];
        player["reck"] = reck[i];
        if (player["team"] < 0 && player["reck"] > 0)
            player["playstyle"] = "daredevil";
        else if (player["team"] < 0 && player["reck"] < 0)
            player["playstyle"] = "camper";
        else if (player["team"] > 0 && player["reck"] > 0)
            player["playstyle"] = "hero";
        else
            player["playstyle"] = "guardian";
    }

    // Calculate the average of each stat to use in bar chart (will be included in linked_data)
    global_averages = getAverages(data, all_sig);

    // Set the preprocessed data as a global variable all visualizations can use
    global_data = data;
    
    // Now that all the preprocessing is done, actually draw the scatterplot!
    // Set size and margin of the scatterplot
    margin = {top: 20, right: 20, bottom: 20, left: 20};
        height = $(document).height()/2;
        width = $(document).width()/2 - 50;

    // Set viewing range for x-axis
    var x = d3.scale.linear()
        .domain([-3, 3])
        .range([0, width ]);

    // Set viewing range for y-axis
    var y = d3.scale.linear()
        .domain([-3, 3])
        .range([ height, 0 ]);

    // Add actual SVG element to hold scatterplot to the HTML
    var chart = d3.select('#scatter_plot_container')
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'scatterplot');

    // Add scatterplot graph to the SVG
    var main = chart.append('svg:g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'scatterplot')   

    // Draw the four labels on the axes of the scatterplot
    // left side (Individual)
    main.append("text") 
          .attr("id", "individual_label")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.top/2)
          .attr("x", -height/2 + 2*margin.top)
          .text("INDIVIDUAL");

    // right side (Team)
    main.append("text") 
          .attr("id", "team_label")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(90)")
          .attr("y", -width)
          .attr("x", height/2 + margin.top)
          .text("TEAM"); 

    // bottom (Cautious)
    main.append("text")
        .attr("id", "cautious_label")
        .attr("text-anchor", "end")
        .attr("y", height + margin.top)
        .attr("x", width/2 + 2*margin.left)
        .text("CAUTIOUS"); 

    // top (Reckless)
    main.append("text")
        .attr("id", "reckless_label")
        .attr("text-anchor", "end")
        .attr("y", -margin.top/2)
        .attr("x", width/2 + 2*margin.left)
        .text("RECKLESS");         

    // Draw the two axes on the scatterplot
    var axes = main.append("svg:g"); 

    // Add the horizontal axis
    axes.append("rect")
        .attr("class", "frame")
        .attr("x", 0)
        .attr("y", height / 2)
        .attr("width", width)
        .attr("height", 1);
    
    // Add the vertical axis
    axes.append("rect")
        .attr("class", "frame")
        .attr("x", width / 2)
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", height);

    // Draw the actual dots on the scatterplot
    dots = main.append("svg:g"); 
    dots.selectAll("scatter-dots")
        .data(data)
        .enter().append("svg:circle")
            .attr("class", function(d) { return "scatterdot " + d["playstyle"] + "_dot"; })
            .attr("cx", function (d,i) { if (x(d.team) > margin.left && x(d.team) < width - margin.right) { return x(d.team); } else { return -100; };} )
            .attr("cy", function (d) { if (y(d.reck) > margin.top && y(d.reck) < height - margin.bottom) { return y(d.reck); } else { return -100; };} )
            .attr("r", 4)
            .on("mouseover", function(d) { 

                // Outline the selected dot
                d3.select(this).style("stroke-width", 1.5).style("stroke", "#000");

                // Show the tooltip
                d3.select("#scatter_plot_tooltip").style("visibility", "visible");
                d3.select("#scatter_plot_tooltip").html(d["Gamertag"])  
                    .style("left", (d3.event.pageX + 8) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
                })
            .on("mouseout", function(d) {

                // Remove outline
                d3.select(this).style("stroke-width", 0);

                // Hide the tooltip
                d3.select("#scatter_plot_tooltip").style("visibility", "hidden");
            
            })
            .on("click", function(d) {

                // Highlight this player's circle and show her information
                selectPlayer(d);                
            });

    // Select the upper left quadrant by default
    toggleQuadrant("hero");    
}

/***
 * Highlight the given quadrant and pass its data to other visualizations via "linked_data".
 * Quadrants are as follows:
 *  1 | 2
 *  -----
 *  3 | 4
 */
function toggleQuadrant(playstyle) {

    // If we're only allowing the user to select one quadrant, just use its single playstyle
    if (multiSelect === false) {
        playstyles = [playstyle];
        highlightSingleQuadrant(playstyle);
    }
    
    // Otherwise, add/remove this quadrant appropriately
    else {
        var index = playstyles.indexOf(playstyle);
        if (index == -1)
            playstyles.push(playstyle);
        else
            playstyles.splice(index, 1);
    }
    
    // Hide the unselected dots appropriately
    dots.selectAll(".scatterdot").classed("hidden", function(d) {
        return (playstyles.indexOf(d["playstyle"]) == -1);
    });
	
	// Figure out how many players are currently selected
	var selected_data = new Array();
	for (var i in global_data)
	    if (playstyles.indexOf(global_data[i]["playstyle"]) != -1)
            selected_data.push(global_data[i]);
    var percent_selected = precise_round((selected_data.length / global_data.length) * 100, 1);

    // Show the percentage of data being examined at the moment
	d3.select("#percent_selected").html(percent_selected + "% Selected");
	
	// Show linked data in other visualizations
	renderBarChart(selected_data);
    renderBubbleChart(selected_data);
    
    // If this is the only selected quadrant, show its sample player
	if (multiSelect === false) {
	    selectPlayer(global_data[samplePlayers[playstyle]]);

	}
}

/***
 * Select a player's dot on the scatterplot and show her information.
 */
function selectPlayer(player) {

    // Remove highlight from previously highlighted circle
    d3.select(selectedCircle).classed("highlight", false);                

    // Keep track of this player
    selectedPlayer = player;
    selectedCircle = d3.selectAll(".scatterdot").filter(function(d) { return (d["Gamertag"] == player["Gamertag"])})[0][0];
    
    // Highlight this player
    d3.select(selectedCircle).classed("highlight", true);
        
    // Display information about the selected player
    showPlayerInfo(player);
    
    // Show the player's relative stats on the bar chart
    showPlayerOnBarChart(player);
}

/***
 * Refresh (i.e. re-render) the bar chart, bubble chart, and scatterplot. 
 */
function refreshAll() {

    // Delete all the old visualizations' SVG elements
    d3.selectAll("svg").remove();

    // Reset the loaded checks to false
    bar_loaded = false;
    isBubbleZoomed = false;
    bubble_loaded = false;
    player_loaded = false;
    
    // Reset the global variables
    global_data = [];
    global_averages = [];
    playstyles = [];
    selectedPlayer = null;
    selectedCircle = null;

    // Render the scatter plot again, which in turn calls renderBubbleChart() and renderBarChart()
    renderScatterPlot();

    // Since "hero" is selected by default, make sure the buttons reflect that
    highlightSingleQuadrant("hero");
}


/***
 * Ensure only the given playstyle's button is highlighted (pressed).
 */
function highlightSingleQuadrant(playstyle) {
    var buttonIDs = ["hero", "guardian", "camper", "daredevil"];
    for (var i in buttonIDs) {
        var buttonID = buttonIDs[i];
        if (buttonID == playstyle)
            $("#" + buttonID + "_button").prop('checked',true).button("refresh");
        else
            $("#" + buttonID + "_button").removeAttr('checked').button("refresh");    
    }
}