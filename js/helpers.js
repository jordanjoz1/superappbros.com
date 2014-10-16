/***
 * Helper function to capitalize the first letter in the given string.
 * Take from: http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/***
 * Helper function to round numbers to a given decimal place. 
 * Taken from: http://stackoverflow.com/questions/1726630/javascript-formatting-number-with-exactly-two-decimals
 */
function precise_round(num, decimals){
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/***
 * Helper function to check if a value is numeric. 
 * Taken from: http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
 */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/***
 * Helper function that returns a normalized version of an array.
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
 * Helper function that calculates the average values of the given data set 
 * based on the given categories.
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
