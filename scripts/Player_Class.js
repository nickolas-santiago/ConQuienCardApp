"use strict";
var app = app||{};

app.Player_ = function()
{
    function Player_()
    {
        this.hand = [];
        this.active_melds = [];
    }
    var player_prototype = Player_.prototype;
    return Player_;
}();