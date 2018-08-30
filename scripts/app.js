"use strict";
var app = app || {};

window.onload = function()
{
    var players = [];
    for(var new_player = 0; new_player < 2; new_player++)
    {
        players.push(new app.Player_());
    }
    app.Game_Main.init(players);
}