$(function() {
	
	// Load data
	d3.csv("/data/parallel_data.csv", function(rows) {
	
        var players = rows;	
    
        var dimensions = new Filter();
        var highlighter = new Selector();
    
        dimensions.set({data: players });

        var columns = _(players[0]).keys();
        var axes = _(columns).without('name', 'group');

        var weapons =
          ['DMR - M392', 'Melee', 'Magnum - M6G Pistol', 'Frag Grenade - M9 HE-DP', 'Gravity Hammer - T2 EW/H', 
          'Needler Rifle - T31 Rifle', 'Sniper Rifle - SRS99', 'Energy Sword - T1 EW/S', 
          'Assault Rifle - MA37 ICWS', 'Needler - T33 GML', 'Shotgun - M45 TS', 'Plasma Grenade - T1 AP-G', 
          'Wraith - Type 26 AGC (Driver)', 'Banshee Bomb - T26 GSA', 'Plasma Repeater - T51 DER/I', 
          'Scorpion - M808B MBT', 'Ghost - T32 RAV', 'Concussion Rifle - T50 DER/H', 'Bomb - No. 14 Anti-tank Mine', 
          'Rocket Launcher - M41SSR', 'Warthog - M41 LAAG', 'GrenadeLauncher - M319 IGL'];

        var colors = {
          "DMR - M392" : '#1f77b4',
          "Melee" : '#ff7f0e',
          "Magnum - M6G Pistol" : '#555',
          "Frag Grenade - M9 HE-DP" : '#ffbb78',
          "Gravity Hammer - T2 EW/H" : '#d62728',
          "Needler Rifle - T31 Rifle" : '#98df8a',
          "Sniper Rifle - SRS99" : '#2ca02c',
          "Energy Sword - T1 EW/S" : '#ff9896',
          "Assault Rifle - MA37 ICWS" : '#9467bd',
          "Needler - T33 GML" : '#c5b0d5',
          "Shotgun - M45 TS" : '#8c564b',
          "Plasma Grenade - T1 AP-G" : '#c49c94',
          "Wraith - Type 26 AGC (Driver)" : '#e377c2',
          "Banshee Bomb - T26 GSA" : '#f7b6d2',
          "Plasma Repeater - T51 DER/I" : '#7f7f7f',
          "Scorpion - M808B MBT" : '#c7c7c7',
          "Ghost - T32 RAV" : ' #bcbd22',
          "Concussion Rifle - T50 DER/H" : '#dbdb8d',
          "Bomb - No. 14 Anti-tank Mine" : '#17becf',
          "Rocket Launcher - M41SSR" : '#9edae5',
          "Warthog - M41 LAAG" : '#e7ba52',
          "GrenadeLauncher - M319 IGL" : '#aec7e8'
        }
    
        _(weapons).each(function(weapon) {
          $('#legend').append("<div class='item'><div class='color' style='background: " + colors[weapon] + "';></div><div class='key'>" + weapon + "</div></div>");
        });

        var pc = parallel(dimensions, colors);
        var pie = piegroups(players, weapons, colors, 'Favorite Weapon');
        var totals = pietotals(
          ['in', 'out'],
          [_(players).size(), 0]
        );

        var slicky = new grid({
          model: dimensions,
          selector: highlighter,
          width: $('body').width(),
          columns: columns
        });
    
        // vertical full screen
        var parallel_height = $(window).height() - 64 - 12 - 120 - 320;
        if (parallel_height < 120) parallel_height = 120;  // min height
        if (parallel_height > 340) parallel_height = 340;  // max height
        $('#parallel').css({
            height: parallel_height + 'px',
            width: $(window).width() + 'px'
        });
    
        slicky.update();
        pc.render();

        dimensions.bind('change:filtered', function() {
          var data = dimensions.get('data');
          var filtered = dimensions.get('filtered');
          var data_size = _(data).size();
          var filtered_size = _(filtered).size();
          pie.update(filtered);
          totals.update([filtered_size, data_size - filtered_size]);
      
          var opacity = _([2/Math.pow(filtered_size,0.37), 100]).min();
          $('#line_opacity').val(opacity).change();
        });
    
        highlighter.bind('change:selected', function() {
          var highlighted = this.get('selected');
          pc.highlight(highlighted);
        });

        $('#remove_selected').click(function() {
          dimensions.outliers();
          pc.update(dimensions.get('data'));
          pc.render();
          dimensions.trigger('change:filtered');
          return false;
        });
    
        $('#keep_selected').click(function() {
          dimensions.inliers();
          pc.update(dimensions.get('data'));
          pc.render();
          dimensions.trigger('change:filtered');
          return false;
        });
    
        $('#export_selected').click(function() {
          var data = dimensions.get('filtered');
          var keys = _.keys(data[0]);
          var csv = _(keys).map(function(d) { return '"' + addslashes(d) + '"'; }).join(",");
          _(data).each(function(row) {
            csv += "\n";
            csv += _(keys).map(function(k) {
              var val = row[k];
              if (_.isString(val)) {
                return '"' + addslashes(val) + '"';
              }
              if (_.isNumber(val)) {
                return val;
              }
              if (_.isNull(val)) {
                return "";
              }
            }).join(",");
          });
          var uriContent = "data:application/octet-stream," + encodeURIComponent(csv);
          var myWindow = window.open(uriContent, "Nutrient CSV");
          myWindow.focus();
          return false;
        });

        $('#line_opacity').change(function() {
          var val = $(this).val();
          $('#parallel .foreground path').css('stroke-opacity', val.toString());
          $('#opacity_level').html((Math.round(val*10000)/100) + "%");
        });
    
        $('#parallel').resize(function() {
          // vertical full screen
          pc.render();
          var val = $('#line_opacity').val();
          $('#parallel .foreground path').css('stroke-opacity', val.toString());
        });
    
        $('#parallel').resizable({
          handles: 's',
          resize: function () { return false; }
        });
    
        $('#myGrid').resizable({
          handles: 's'
        });

        function addslashes( str ) {
          return (str+'')
            .replace(/\"/g, "\"\"")        // escape double quotes
            .replace(/\0/g, "\\0");        // replace nulls with 0
        };
  	});
});
