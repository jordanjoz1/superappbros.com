// The signals (indicators) we will use to calculate playstyle values
team_pos = ["Wheelman Spree/Game", "Wingman/Game", "Assists/Kill", "Assists/Death", "Assist Spree/Game"]; 
team_neg = ["Yoink/Game"]; 
reck_pos = ["Pummel/Game", "Kills/Hour", "Deaths/Hour", "First Strike/Game"];
reck_neg = ["Beat Down/Game", "Assassin/Game", "Sniper Kill/Game"];

// Combinations of those signals
team_sig = team_pos.concat(team_neg);
reck_sig = reck_pos.concat(reck_neg);
all_sig = team_sig.concat(reck_sig);
