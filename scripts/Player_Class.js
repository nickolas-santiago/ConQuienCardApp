"use strict";
var app = app||{};

app.Player_ = function()
{
    function Player_(player_position)
    {
        this.player_position = player_position;
        this.hand = [];
        this.potential_meld = [];
        this.active_melds = [];
        this.card_queue = undefined;
        this.chosen_card = undefined;
        this.is_donating = false;
    }
    var me_prototype = Player_.prototype;
    
    me_prototype.choose_card = function(card)
    {
        this.chosen_card = card;
    };
    me_prototype.donate_card = function()
    {
        var next_player = (this.player_position + 1);
        if(next_player >= app.Game_Main.players.length)
        {
            next_player = 0;
        }
        app.Game_Main.players[next_player].card_queue = this.hand[this.chosen_card];
        this.hand.splice(this.chosen_card,1);
        this.choose_card = undefined;
        this.is_donating = false;
    };
    me_prototype.pluck = function(game_deck)
    {
        var last_deck_card = (game_deck.length - 1);
        app.Game_Main.discard_pile.push(game_deck[last_deck_card]);
        app.Game_Main.game_deck.pop();
        app.Game_Main.current_game_state = app.Game_Main.game_states[2];
        app.Game_Main.current_decision = app.Game_Main.current_pluck;
    };
    me_prototype.overlook = function(current_pluck, current_decision, current_discard, players_length)
    {
        current_decision++;
        if(current_decision >= players_length)
        {
            current_decision = 0;
        }
        app.Game_Main.current_decision = current_decision;
        //---if the current card was someone's discard...
        if(current_discard != undefined)
        {
            if(current_decision == current_discard)
            {
                app.Game_Main.current_discard = undefined;
                app.Game_Main.current_game_state = app.Game_Main.game_states[1];
                current_pluck++;
                if(current_pluck >= players_length)
                {
                    current_pluck = 0;
                }
                app.Game_Main.current_pluck = 0;
                app.Game_Main.current_button_prompts.splice(0);
            }
        }
        else
        {
            if(current_decision == current_pluck)
            {
                app.Game_Main.current_game_state = app.Game_Main.game_states[1];
                current_pluck++;
                if(current_pluck >= players_length)
                {
                    current_pluck = 0;
                }
                app.Game_Main.current_pluck = current_pluck;
                app.Game_Main.current_button_prompts.splice(0);
            }
        }
    };
    me_prototype.initMeld = function()
    {
        app.Game_Main.current_game_state = app.Game_Main.game_states[3];
        if(this.chosen_card == undefined)
        {
            this.potential_meld.push(app.Game_Main.discard_pile[(app.Game_Main.discard_pile.length - 1)]);
        }
        else
        {
            this.potential_meld.push(this.hand[this.chosen_card]);
        }
        this.chosen_card = this.potential_meld[0];
    };
    me_prototype.addCardToMeld = function(card_)
    {
        for(var card = 0; card < this.potential_meld.length; card++)
        {
            if(this.potential_meld[card] == this.hand[card_])
            {
                this.potential_meld.splice(card,1);
                return;
            }
        }
        this.potential_meld.push(this.hand[card_]);
    };
    me_prototype.addMeldToMeld = function(meld_holder_, active_meld_)
    {
        if(this.potential_meld.length != 1)
        {
            var is_unselecting_meld;
            for(var x = 0; x < active_meld_.length; x++)
            {
                is_unselecting_meld = this.potential_meld.includes(active_meld_[x]);
            }
            if(is_unselecting_meld == true)
            {
                for(var active_meld_card = 0; active_meld_card < active_meld_.length; active_meld_card++)
                {
                    for(var potential_meld_card = 0; potential_meld_card < this.potential_meld.length; potential_meld_card++)
                    {
                        if(active_meld_[active_meld_card] == this.potential_meld[potential_meld_card])
                        {
                            this.potential_meld.splice(potential_meld_card,1);
                        }
                    }
                }
                return;
            }
            if(meld_holder_ != this.player_position)
            {
                this.potential_meld.splice(1);
            }
            else
            {
                for(potential_meld_card = 0; potential_meld_card < this.potential_meld.length; potential_meld_card++)
                {
                    var is_the_players_card;
                    is_the_players_card = (this.hand.includes(this.potential_meld[potential_meld_card]) || this.potential_meld[potential_meld_card] == app.Game_Main.discard_pile[app.Game_Main.discard_pile.length - 1]);
                    if(is_the_players_card == false)
                    {
                        this.potential_meld.splice(potential_meld_card,1);
                    }
                }
            }
        }
        for(var active_meld_card = 0; active_meld_card < active_meld_.length; active_meld_card++)
        {
            
            this.potential_meld.push(active_meld_[active_meld_card]);
        }
    };
    me_prototype.discardCard = function()
    {
        app.Game_Main.discard_pile.push(this.hand[this.chosen_card]);
        this.hand.splice(this.chosen_card,1);
        this.chosen_card = undefined;
        app.Game_Main.current_discard = app.Game_Main.current_decision;
        app.Game_Main.current_decision++;
        if(app.Game_Main.current_decision >= app.Game_Main.players.length)
        {
            app.Game_Main.current_decision = 0;
        }
        app.Game_Main.current_game_state = app.Game_Main.game_states[2];
    };
    return Player_;
}();