// The data that will be passed to linked visualizations
linked_data = [];

// TODO Assists/Death Assists/Kill
var team_pos = ["Showstopper", "Wheelman Spree", "Wingman", "Assists/Kill", "Assists/Death", "Assist Spree"]; 
var team_neg = ["Yoink"]; 
var reck_pos = ["Kills/Hour", "Deaths/Hour", "First Strike", "Pummel"];    
var reck_neg = ["Beat Down", "Assassin", "Sniper Kill"];

var team_sig = team_pos.concat(team_neg);
var reck_sig = reck_pos.concat(reck_neg);
all_sig = team_sig.concat(reck_sig);

var bar_colors = ["#0000FF", "#FF0000", "#00AA00", "#FFFF00"];
//quad_colors = ["
colors_by_ind = {};
for (var i in team_pos)
    colors_by_ind[team_pos[i]] = bar_colors[0];
for (var i in team_neg) 
    colors_by_ind[team_neg[i]] = bar_colors[1];
for (var i in reck_pos) 
    colors_by_ind[reck_pos[i]] = bar_colors[2];
for (var i in reck_neg) 
    colors_by_ind[reck_neg[i]] = bar_colors[3];
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
}

// Calculate the average of each stat to use in bar chart (will be included in linked_data)
averages = getAverages(data, all_sig);

// Set size and margin of the scatterplot
margin = {top: 20, right: 20, bottom: 20, left: 20};
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Set viewing range for x-axis
var x = d3.scale.linear()
    .domain([-2, 2])
    .range([0, width ]);

// Set viewing range for y-axis
var y = d3.scale.linear()
    .domain([-2, 2])
    .range([ height, 0 ]);

// Add actual SVG element to hold scatterplot to the HTML
var chart = d3.select('body')
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'scatterplot')

// Add scatterplot graph to the SVG
var main = chart.append('svg:g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'scatterplot')   

// Draw the four labels on the axes of the scatterplot
// left side (Individual)
main.append("text") 
      .attr("class", "individual_label")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.top/2)
      .attr("x", -height/2 + margin.top)
      .text("Individual"); // left side

// right side (Team)
main.append("text") 
      .attr("class", "team_label")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(90)")
      .attr("y", -width - margin.top/2)
      .attr("x", height/2 + margin.top/2)
      .text("Team"); 

// bottom (Cautious)
main.append("text")
    .attr("class", "cautious_label")
    .attr("text-anchor", "end")
    .attr("y", height + margin.top/2)
    .attr("x", width/2 + margin.top)
    .text("Cautious"); 

// top (Reckless)
main.append("text")
    .attr("class", "reckless_label")
    .attr("text-anchor", "end")
    .attr("y", -margin.top/2)
    .attr("x", width/2 + margin.left/2)
    .text("Reckless");         

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

// Create the div that will act as a tooltip
var tooltip = d3.select("body").append("div")   
    .attr("class", "tooltip")
    .style("opacity", 0);

// Draw the actual dots on the scatterplot
var dots = main.append("svg:g"); 
dots.selectAll("scatter-dots")
    .data(data)
    .enter().append("svg:circle")
        .attr("cx", function (d,i) { if (x(d.team) > margin.left && x(d.team) < width - margin.right) {return x(d.team);} else {return -100};} )
        .attr("cy", function (d) { if (y(d.reck) > margin.top && y(d.reck) < height - margin.bottom) {return y(d.reck);} else {return -100};} )
        .attr("r", 5)
        
        // Add tooltip functionality
        .on("mouseover", function(d) { 
            d3.select(d3.event.target).classed("highlight", true);
            tooltip.transition()        
                .duration(200)      
                .style("opacity", .9);      
            tooltip.html("Player: " + d["Gamertag"] + "<br/>")  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })          
        .on("mouseout", function(d) {
            d3.select(d3.event.target).classed("highlight", false);
            tooltip.transition()       
                .duration(500)      
                .style("opacity", 0); 
        })
        .on("click", function(d) {
            showPlayer(d);
        });

// Select the upper left quadrant by default
selectQuadrant(1);


/*** Helper functions ***/

/***
 * Highlight the given quadrant and pass its data to other visualizations via "linked_data".
 * Quadrants are as follows:
 *  1 | 2
 *  -----
 *  3 | 4
 */
function selectQuadrant(number) {
	linked_data = [averages];
    dots.selectAll("circle").classed("hidden", function(d) {
		switch (number) {
			case 1:
				if (d["team"] < 0 && d["reck"] > 0) {
					linked_data.push(d);
					return false;
				}
				return true;
				break;
			case 2:
				if (d["team"] > 0 && d["reck"] > 0) {
					linked_data.push(d);
					return false;
				}
				return true;
				break;
			case 3:
				if (d["team"] > 0 && d["reck"] < 0) {
					linked_data.push(d);
					return false;
				}
				return true;
				break;
			case 4:
				if (d["team"] < 0 && d["reck"] < 0) {
					linked_data.push(d);
					return false;
				}
				return true;
		}
    });
	
	// Show linked data in other visualizations
	redrawBarChart();
}

/***
 * Show the information of the currently selected player.
 */
function showPlayer(player) {
    
    // show the selected player's information
    var info = "<table>";
    info += "<tr><td><b>Meet</b></td><td>" + player["Gamertag"] + "</td></tr>";
    info += "<tr><td><b>Games played</b></td><td>" + player["Games Played"] + "</td></tr>";
    info += "<tr><td><b>Kills/Game</b></td><td>" + player["Kills/Game"] + "</td></tr>";
    info += "<tr><td><b>Deaths/Game</b></td><td>" + player["Deaths/Game"] + "</td></tr>";
    info += "<tr><td><b>Medals/Game</b></td><td>" + player["Medals/Game"] + "</td></tr>";
    info += "<tr><td><b>Commendation Progress</b></td><td>" + player["Commendation Progress (%)"] + "%</td></tr>";
    info += "</table>";
    d3.select("#playerInfo").html(info);

    var targetUrl = "/js/ajaxhelper.php?player=" + "libertarianpear";
    var parameters = ""; // later

    $.ajax({
      type: "GET",
      async: true,
      url: targetUrl,
      data: parameters,
      success: function( newdata){
        console.log(newdata);
      }
    });
    

}

/***
 * Normalize an array
 */
function normalize(array) {
    var stats = [];
    var stats_squared = [];
    for (var i in array) {
        stats.push(array[i]);
        stats_squared.push(Math.pow(array[i], 2));
    }
    var expected_value = d3.mean(stats);
    var expected_value_squared = d3.mean(stats_squared);
    var sd = Math.sqrt(expected_value_squared - Math.pow(expected_value, 2));
    
    for (var i in stats) {
        stats[i] = ((stats[i] - expected_value) / sd);
    }        
    return stats;
}

/***
 * Calculate the average values of the given categories for the given data set
 */
function getAverages(data, categories) {
    var averages = {};
    for (var i in data) {
        var player = data[i];
        for (var j in all_sig) {
            var indicator = all_sig[j];
            if (averages[indicator])
                averages[indicator] += parseFloat(player[indicator]);
            else
                averages[indicator] = parseFloat(player[indicator]);
        }
    }
    for (i in all_sig) {
        var indicator = all_sig[i];
        averages[indicator] /= data.length;
    }
    return averages;
}
