window.onload = function () {

    // load calendar with "Player Since" data by default
    renderCalendar(0);
}

/**
 * Function for parsing CSV data into an associative
 * array of frequencies for each date.
 *
 * Iterates through all the rows in the data and 
 * keeps track of the occurence of each date.
 *
 * @param type - the field for the calendar data 
 *          (0 for "Player Since" and 1 for "Last Played")
 *
 */
function parseCalendarData(type) {

    // object for final data
    data = {};
    
    // iterate through each row in the dataset
    for (row in calendar_data) {
    
        // Player Since type - count date frequencies
        if (type == 0) {
            if (data[calendar_data[row].Date_start]) 
                data[calendar_data[row].Date_start] += 1;
            else
                data[calendar_data[row].Date_start] = 1;
        }
        
        // Last Played type - count date frequencies
        if (type == 1) {
            if (data[calendar_data[row].Date_end]) 
                data[calendar_data[row].Date_end] += 1;
            else
                data[calendar_data[row].Date_end] = 1;
        }
    }
    
    return data
}

/**
 * Render the D3 Calendar view.
 *
 * Clears pre-existing calendars, if necessary.
 */
function renderCalendar(type) {

    // get each calendar year and the body (their parent)
    var calendars = document.getElementsByClassName("RdYlGn");
    
    // remove calendars in reverse order
    for (var i = calendars.length - 1; i >= 0; i--) 
        document.getElementById("calendar").removeChild(calendars[i]);

    // size of each calendar year
    var width = 960,
        height = 136,
        cellSize = 17; // day size

    // date text formatting
    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");

    // create svg calendars for each year
    var svg = d3.select("#calendar").selectAll("svg")
        .data(d3.range(2010, 2013))
        .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    // label each year
    svg.append("text")
        .attr("class", "cal-year-text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function (d) {return d;});

    // create rectangle object for each day
    var rect = svg.selectAll(".cal-day")
        .data(function (d) {return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));})
        .enter().append("rect")
        .attr("class", "cal-day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function (d) {return week(d) * cellSize;})
        .attr("y", function (d) {return day(d) * cellSize;})
        .datum(format);

    // append a title to each day
    rect.append("title")
        .text(function (d) {return d;});

    // draw month paths
    svg.selectAll(".cal-month")
        .data(function (d) {return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));})
        .enter().append("path")
        .attr("class", "cal-month")
        .attr("d", monthPath);
     
    
    // everything done once the data has been loaded - used here to
    // extract repeated code without worrying about scope
    function loadData() {
        
        // parse data based on calendar type
        data = parseCalendarData(type);

        // programmatically set range
        var values = [];
        for (key in data)
            values.push(data[key]);
        var range = d3.extent(values);
        
        // create method for coloring days
        var color = d3.scale.quantize()
            .domain([Math.log(range[0]), Math.log(range[1])])
            .range(d3.range(11).map(function (d) {return "q" + d + "-11";}));

        // set days to appropriate colors
        rect.filter(function (d) {return d in data;})
            .attr("class", function (d) {return "cal-day " + color(Math.log(data[d]));})
            .select("title")
            .text(function (d) {return d + ": " + data[d];});
    }

    // load csv from file if the data does not already exist
    loadData();

    // draw dark lines for month boundaries
    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = +day(t0),
            w0 = +week(t0),
            d1 = +day(t1),
            w1 = +week(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
    }
}