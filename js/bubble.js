bubble_loaded = false;
isBubbleZoomed = false;

/**
 * Render bubble chart
 */
function renderBubbleChart(selected_data) {
    
    // save the parent node
    var main_container = document.getElementById("bubble_chart_container");
    var bubble_chart_width = main_container.clientWidth;
    var bubble_chart_height = window.innerHeight - document.getElementById("player_info").clientHeight - document.getElementById("titlebar").clientHeight - document.getElementById("bubble_chart_legend").clientHeight - 10;
    
    // determine how much padding is on the left and right sides
    var side_padding = 0;
    if (bubble_chart_width > bubble_chart_height)
        side_padding = (bubble_chart_width - bubble_chart_height) / 2;
    
    // initialize important variables
    var diameter = ((bubble_chart_width < bubble_chart_height) ? bubble_chart_width : bubble_chart_height);
    var format = d3.format(",d");
    var color = d3.scale.category20c();
    var center_shift = 0;
    var x = d3.scale.linear().range([0, diameter / 2]);
    var y = d3.scale.linear().range([0, diameter / 2]);
    
    // bubble arrangement layout
    var bubble = d3.layout.pack()
        .sort(function comparator(a, b) {return a.value - b.value;})
        //.sort(null)
        .size([diameter, diameter])
        .padding(1.5);
        
    // colors for each weapon type
    var pie_color = d3.scale.ordinal()
        .range(["#1f77b4", "#ff7f0e", "#d62728", "#6b486b"]);
        
    // arc for weapon regions
    var arc = d3.svg.arc()
        .outerRadius(function (d) {return d3.select(this).node().parentNode.parentNode.__data__.r;})
        .innerRadius(0);
        
    // pie chart function
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.count; });
    
    // load the visualization
    if (!bubble_loaded) {
        init();
        bubble_loaded = true;
    }
    else {
    
        // make sure that some data is selected
        if (selected_data.length != 0) {
        
            // update the data and transition to the new position
            update();
            
            // hacky way to make sure update completed smoothly
            setTimeout(function(){
                d3.select("#bubble_chart").remove();
                init();
            },750);
        }
        
        // if no data is selected then minimize chart to the center
        else 
            minimize();
    }
    
    
    /**
     * Initialize the bubble chart from scratch
     */
    function init() {

        // append bubble_chart svg to html
        var svg = d3.select("#bubble_chart_container").append("svg")
            .attr("width", bubble_chart_width)
            .attr("height", bubble_chart_height)
            .attr("id", "bubble_chart")
            .attr("class", "bubble");

            
        // parse and alphabetically sort medals
        var bubble_data = bubble.nodes(parse_medals(selected_data));
        
        // node container for elements in bubble chart
        var node = svg.selectAll(".bubble_node")
            .data(bubble_data.filter(function (d) {return !d.children;})).enter()
            .append("g")
            .attr("class", "bubble_node")
            .attr("transform", function (d) {return "translate(" + (d.x + side_padding) + "," + d.y + ")";})
            .on("mouseover", function(d,i){
                
                // create pie chart
                create_pie(d, this); 
                
                // show pie chart
                d3.select(this).selectAll(".arc").style("visibility", "visible")
            })
            .on("mouseout", function() {
                
                // hide pie chart
                d3.select(this).selectAll(".arc").style("visibility", "hidden");
            })
            .on("click", function(d) { return zoom(d); });

        // create bubbles for other medals
        node.append("circle")
            .attr("class", "bubble_chart_circle")
            .attr("r", function (d) {return d.r;})

        // label all medals
        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("fill","black")
            .text(function (d) {return d.className.substring(0, d.r / 3);});

            
        d3.select(self.frameElement).style("height", diameter + "px");

        // reset zoom size when window is clicked
        d3.select("#bubble_chart_container").on("click", function() { zoomreset(); });
    }
    
    /**
     * Update the bubble chart
     */
    function update() {
    
        // change the zoom state
        isBubbleZoomed = false;
        
        // parse new data
        bubble_data = bubble.nodes(parse_medals(selected_data));
        
        // remove previous pies
        d3.selectAll(".arc").remove();
        
        // update node data
        d3.selectAll(".bubble_node")
            .data(bubble_data.filter(function (d) {return !d.children;}))
            .on("mouseover", function(d,i){
                
                // create pie chart
                create_pie(d, this); 
                
                // show pie chart
                d3.select(this).selectAll(".arc").style("visibility", "visible")
            });
        
        // reset the zoom
        zoomreset();
    }

    /**
     * Show the tooltip
     *
     * @param d - selected element
     * @param ctx - context
     */
    function show_tooltip(d, ctx) {
        
        // make tooltip visible
        d3.select("#bubble_chart_tooltip").style("display", "block");
        d3.select("#bubble_chart_tooltip").style("visibility", "visible");
        
        // location data based on parent node
        par = d3.select(ctx).node().parentNode.__data__;
        
        // determine left and top margins
        var leftMargin = (bubble_chart.offsetLeft + (isBubbleZoomed ? x(par.x + center_shift) : par.x) + side_padding + d3.mouse(ctx)[0] + 10);
        var topMargin = (bubble_chart.offsetTop + (isBubbleZoomed ? y(par.y + center_shift) : par.y) + d3.mouse(ctx)[1] + 5);

        // make sure tooltip does not make the page scroll to the right
        if (window.innerWidth < (leftMargin + 70))
            leftMargin = window.innerWidth - 70;
        if (window.innerHeight < (topMargin + 200))
            topMargin = window.innerHeight - 200;
        
        // position tooltip
        d3.select("#bubble_chart_tooltip").style("left", leftMargin + "px");
        d3.select("#bubble_chart_tooltip").style("margin-top", topMargin + "px");

        // update tooltip content
        d3.select("#bubble_chart_tooltip").html(par.className + ": " + format(par.value) + "</br>" + d.data.type + ": " + precise_round(d.value * 100.0 / par.value,1) + "%");
    }
    
    /**
     * Create the pie chart for the data
     *
     * @param d - selected element
     * @param ctx - context
     */
    function create_pie(d, ctx) {
    
        // parse pie data
        weapon_count_per_medal = parse_pie_data(selected_data);
        
        // create arcs for pie charts (only for nodes with medals)  
        var g = d3.select(ctx).filter(function(d) {return (d["value"] > 0);})
            .selectAll(".arc")
            .data(function(d) {return pie(weapon_count_per_medal[d["className"]]);})
            .enter()
            .append("g")
            .attr("class", "arc")
            .on("mouseover", function(d,i){
            
                // emphasize arc
                d3.select(this).selectAll(".pie_path")
                    .style("stroke-opacity","1.0")
                    .style("stroke","#FFFFFF");
                
                // show tooltip
                show_tooltip(d, this);
            })
            .on("mousemove", function(d,i) {show_tooltip(d, this);})
            .on("mouseout", function() {
            
                // reset arc
                d3.select(this).selectAll(".pie_path")
                    .style("stroke-opacity","0.0");
            
                // hide tooltip
                d3.select("#bubble_chart_tooltip").style("display", "none");
            });
            
        // draw paths for arcs in pie charts
        g.append("path")
            .attr("class", "pie_path")
            .attr("d", arc)
            .style("fill", function(d) { return pie_color(d.data.type); })
    }
    
/**
 * Minimize bubble chart to the center (much prettier than simply making it invisible)
 */
function minimize() {

        // get the svg for animation
        var svg = d3.select("#bubble_chart_container").select("svg");
        
        // prepare the transition
        var t = svg.transition()
            .duration(750);

        // make all nodes go toward the center
        t.selectAll(".bubble_node")
            .attr("transform", function (d) {return "translate(" + (bubble_chart_width / 2) + "," + (bubble_chart_height / 2) + ")";});

        // make all nodes disappear to zero size
        t.selectAll(".bubble_chart_circle")
            .attr("r", function (d) {return 0;});
        
        // remove all text
        t.selectAll("text")
            .text(function (d) {return "";});
            
        // stop propagation if spawned by user click
        try {
            d3.event.stopPropagation();
        }
        catch (err) {
            // do nothing
        }
}

    /**
     * Zoom in closer to the selected node
     *
     * @param d - selected bubble
     */
    function zoom(d) {
    
        // change the zoom state
        isBubbleZoomed = true;
        
        // get the svg for animation
        var svg = d3.select("#bubble_chart_container").select("svg");
        
        // calculate the zoom scale and range
        var k = diameter / d.r / 4;
        x.domain([d.x - d.r, d.x + d.r]);
        y.domain([d.y - d.r, d.y + d.r]);
        center_shift = d.r;

        // prepare transition
        var t = svg.transition()
            .duration(750);

        // change the position of all the nodes
        t.selectAll(".bubble_node")
            .attr("transform", function (d) {return "translate(" + (x(d.x + center_shift) + side_padding )+ "," + y(d.y + center_shift) + ")";});

        // resize all the circles
        t.selectAll(".bubble_chart_circle")
            .attr("r", function (d) {return k * d3.select(this).node().parentNode.__data__.r;});
            
        // resize all the pie charts
        t.selectAll(".pie_path")
            .attr("d", arc.outerRadius(function (d) {return d3.select(this).node().parentNode.parentNode.__data__.r * k;}));
            
        // update the text
        t.selectAll("text")
            .text(function (d) {return d.className.substring(0, (k *d.r) / 3);});

        // stop propagation if spawned by user click
        d3.event.stopPropagation();

    }

    /**
     * Reset the zoom to its original position
     */
    function zoomreset() {

        // change the zoom state
        isBubbleZoomed = false;
        
        // get the svg for animation
        var svg = d3.select("#bubble_chart_container").select("svg");
        
        // prepare the transition
        var t = svg.transition()
            .duration(750);

        // put all nodes back to their original location
        t.selectAll(".bubble_node")
            .attr("transform", function (d) {return "translate(" + (d.x + side_padding) + "," + d.y + ")";});

        // make all circles their original size
        t.selectAll(".bubble_chart_circle")
            .attr("r", function (d) {return d3.select(this).node().parentNode.__data__.r;});
            
        // reset pie chart size
        t.selectAll(".pie_path")
            .attr("d", arc.outerRadius(function (d) {return d3.select(this).node().parentNode.parentNode.__data__.r;}));
            
        // update the text
        t.selectAll("text")
            .text(function (d) {return d.className.substring(0, d.r / 3);});

        // stop propagation if spawned by user click
        try {
            d3.event.stopPropagation();
        }
        catch (err) {
            // do nothing
        }
    }
}


/**
 * Parse medal data to count the distribution of favorite weapons for each 
 * medal
 *
 * @param data - json medal data
 * @return specially formatted object with children that contains the positions and
 *      size of each node
 */
function parse_medals(data) {

    // initialize medal sums to zero
    for (var i in medals_meta)
        medals_meta[i]["count"] = 0;

    // sum the number of times each medal was achieved
    for (var i in data) 
        for (var j in medals_meta) 
            medals_meta[j]["count"] += parseInt(data[i][medals_meta[j]["name"]]);

    // put data in json array
    var m_data = [];
    for (var i in medals_meta) {
        m_data.push({
            packageName: medals_meta[i]["category"],
            className: medals_meta[i]["name"],
            value: medals_meta[i]["count"]
        });
    }
    
    // this is a magical function that determines the size and location
    // of all the bubles
    m_data = {children: m_data};
    
    return m_data
}

/**
 * Parsed data into an array of pie chart data
 *
 * @param selected data - an array of users
 * @return an array of usable pie chart data structures
 */
function parse_pie_data(selected_data) {

    // json array of weapon use for each medal
    var weapon_count_per_medal = {};

    // count the number of times the medal was achieved for each weapon
    for (i in medals_meta) {

        // set intial weapon counts to zero
        var weapon_count = [];
        for (j in weapons_meta)
            weapon_count[weapons_meta[j]["Weapon"]] = 0;

        // sum the number of times a medal was achieved with each weapon
        for (j in selected_data) 
            weapon_count[selected_data[j]["#1 Weapon Name"]] += parseInt(selected_data[j][medals_meta[i]["name"]]);
            
        // group weapons by type
        var type_count = [];
        for (j in weapons_meta)
            type_count[weapons_meta[j]["Type"]] = 0;
        for (j in weapons_meta)
            type_count[weapons_meta[j]["Type"]] += weapon_count[weapons_meta[j]["Weapon"]]; 
        
        // convert from associative array to array of objects
        weapon_count_arr = [];
        for (j in type_count) 
            weapon_count_arr.push({
                type: j, 
                count: type_count[j]});
        
        // append to array of objects
        weapon_count_per_medal[medals_meta[i]["name"]] = weapon_count_arr;
    }
    
    return weapon_count_per_medal;
}