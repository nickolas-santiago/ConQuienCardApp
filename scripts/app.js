"use strict";
var app = app || {};
var game_canvas;
var game_canvas_context;
var mouse_pos;

window.onload = function()
{
    var players = [];
    for(var new_player = 0; new_player < 2; new_player++)
    {
        players.push(new app.Player_());
    }
    game_canvas = document.querySelector('#game_canvas');
    game_canvas_context = game_canvas.getContext('2d');
    function getMouse(game_canvas, evt)
    {
        var canvas_bounding_box = game_canvas.getBoundingClientRect();
        return {
            x: evt.clientX - canvas_bounding_box.left,
            y: evt.clientY - canvas_bounding_box.top
        };
    }
    app.Game_Main.init(players, game_canvas, game_canvas_context, getMouse);
}