"use strict";
var app = app||{};

app.Game_Main = {
    //---PROPERTIES----//
    game_deck: [],
    
    //---METHODS---//
    init: function()
    {
        var self = this;
        var temp_deck = [];
        var build_deck = function()
        {
            var suits = ["a", "b", "c", "d"];
            for(var suit = 0; suit < suits.length; suit++)
            {
                for(var val = 0; val < 10; val++)
                {
                    var new_card = {};
                    new_card.suit = suits[suit];
                    new_card.val = (val + 1);
                    temp_deck.push(new_card);
                }
            }
        }
        var shuffle_deck = function()
        {
            var num_of_cards = 40;
            for(var card = 0; card < num_of_cards; card++)
            {
                var rando = Math.floor(Math.random() * temp_deck.length);
                self.game_deck.push(temp_deck[rando]);
                temp_deck.splice(rando, 1);
            }
        }
        
        build_deck();
        shuffle_deck();
        console.log(this.game_deck);
    }
};