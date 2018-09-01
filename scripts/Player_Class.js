"use strict";
var app = app||{};

app.Player_ = function()
{
    function Player_()
    {
        this.hand = [];
        this.active_melds = [];
        this.card_queue = [];
        this.is_donating = true;
    }
    return Player_;
}();