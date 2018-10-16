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
        this.is_donating = true;
        if(this.player_position == 0)
        {
            this.current_possible_melds = [];
            this.current_complete_melds = [];
        }
    }
    var me_prototype = Player_.prototype;
    
    me_prototype.chooseCard = function(card_)
    {
        this.chosen_card = card_;
    };
    me_prototype.donateCard = function()
    {
        var next_player = (this.player_position + 1);
        if(next_player >= app.Game_Main.players.length)
        {
            next_player = 0;
        }
        app.Game_Main.players[next_player].card_queue = this.hand[this.chosen_card];
        this.hand.splice(this.chosen_card,1);
        this.chosen_card = undefined;
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
            this.chosen_card = this.potential_meld[0];
        }
        else
        {
            this.potential_meld.push(this.hand[this.chosen_card]);
        }
        //
        console.log(this.chosen_card);
        console.log(this.potential_meld);
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
    
    //---mwthods for a computer player
    me_prototype.findAllCurrentPotentialMelds = function(suits_)
    {
        var temp_potential_melds_array = [];
        this.current_possible_melds.splice(0);
        for(var primary_card = 0; primary_card < this.hand.length; primary_card++)
        {
            for(var secondary_card = (primary_card + 1); secondary_card < this.hand.length; secondary_card++)
            {
                if(this.hand[primary_card].val == this.hand[secondary_card].val)
                {
                    for(var suit = 0; suit < suits_.length; suit++)
                    {
                        if((this.hand[primary_card].suit != suits_[suit]) && (this.hand[secondary_card].suit != suits_[suit]))
                        {
                            var potential_meld = [];
                            potential_meld.push(this.hand[primary_card]);
                            potential_meld.push(this.hand[secondary_card]);
                            var card = {};
                            card.suit = suits_[suit];
                            card.val = this.hand[primary_card].val;
                            potential_meld.push(card);
                            temp_potential_melds_array.push(potential_meld);
                        }
                    }
                }
                else if(this.hand[primary_card].suit == this.hand[secondary_card].suit)
                {
                    var suit = this.hand[primary_card].suit;
                    var higher_card = Math.max(this.hand[primary_card].val, this.hand[secondary_card].val);
                    var lower_card = Math.min(this.hand[primary_card].val, this.hand[secondary_card].val);
                    if(higher_card == (lower_card + 1))
                    {
                        if(lower_card != 1)
                        {
                            var potential_meld = [];
                            potential_meld.push(this.hand[primary_card]);
                            potential_meld.push(this.hand[secondary_card]);
                            var card = {};
                            card.suit = suit;
                            card.val = (lower_card - 1);
                            potential_meld.push(card);
                            temp_potential_melds_array.push(potential_meld);
                        }
                        if(higher_card != 10)
                        {
                            var potential_meld = [];
                            potential_meld.push(this.hand[primary_card]);
                            potential_meld.push(this.hand[secondary_card]);
                            var card = {};
                            card.suit = suit;
                            card.val = (higher_card + 1);
                            potential_meld.push(card);
                            temp_potential_melds_array.push(potential_meld);
                        }
                    }
                    else if (higher_card == (lower_card + 2))
                    {
                        var potential_meld = [];
                        potential_meld.push(this.hand[primary_card]);
                        potential_meld.push(this.hand[secondary_card]);
                        var card = {};
                        card.suit = suit;
                        card.val = (lower_card + 1);
                        potential_meld.push(card);
                        temp_potential_melds_array.push(potential_meld);
                    }
                    else
                    {
                        continue;
                    }
                }
                else
                {
                    continue;
                }
            }
        }
        
        for(var current_possible_meld = 0; current_possible_meld < temp_potential_melds_array.length; current_possible_meld++)
        {
            temp_potential_melds_array[current_possible_meld].sort(function(a,b){return a.val - b.val});
            temp_potential_melds_array[current_possible_meld].sort(function(a,b){return (a.suit < b.suit) ? -1 : (a.suit > b.suit) ? 1 : 0;});
        }
        
        for(var current_possible_meld = 0; current_possible_meld < temp_potential_melds_array.length; current_possible_meld++)
        {
            if(this.current_possible_melds.length == 0)
            {
                this.current_possible_melds.push(temp_potential_melds_array[current_possible_meld]);
            }
            else
            {
                var meld_is_a_duplicate = false;
                for(var current_meld = 0; current_meld < this.current_possible_melds.length; current_meld++)
                {
                    var self = this;
                    var duplicate_is_true = temp_potential_melds_array[current_possible_meld].every(function(temp_potential_meld_card)
                    {
                        var card_is_duplicate = self.current_possible_melds[current_meld].some(function(final_potential_array_card)
                        {
                            return((final_potential_array_card.suit == temp_potential_meld_card.suit) && (final_potential_array_card.val == temp_potential_meld_card.val));
                        });
                        return card_is_duplicate;
                    });
                    if(duplicate_is_true == true)
                    {
                        meld_is_a_duplicate = true;
                    }
                }
                if(meld_is_a_duplicate == false)
                {
                    this.current_possible_melds.push(temp_potential_melds_array[current_possible_meld]);
                }
            }
        }
    };
    
    me_prototype.findLeastUsedCard = function()
    {
        var card_usage_counter = [];
        var lowest_uasge_times;
        var indexes_of_lowest_used_cards = [];
        for(var hand_card = 0; hand_card < this.hand.length; hand_card++)
        {
            var card_usage = 0;
            for(var current_possible_meld = 0; current_possible_meld < this.current_possible_melds.length; current_possible_meld++)
            {
                if(this.current_possible_melds[current_possible_meld].includes(this.hand[hand_card]))
                {
                    card_usage++;
                }
            }
            card_usage_counter.push(card_usage);
        }
        lowest_uasge_times = Math.min.apply(null,card_usage_counter);
        for(var n = 0; n < card_usage_counter.length; n++)
        {
            if(card_usage_counter[n] == lowest_uasge_times)
            {
                indexes_of_lowest_used_cards.push(n);
            }
        }
        var card_index_choice = Math.floor(Math.random()*indexes_of_lowest_used_cards.length);
        return indexes_of_lowest_used_cards[card_index_choice];
    };
    
    me_prototype.findAllCurrentPossibleMoves = function(discard_pile_)
    {
        var possible_moves = [];
        console.log(discard_pile_[(discard_pile_.length - 1)]);
        console.log(discard_pile_);
        for(var meld = 0; meld < this.current_possible_melds.length; meld++)
        {
            var can_use_card;
            var last_discard_card = (discard_pile_.length - 1);
            can_use_card = this.current_possible_melds[meld].some(function(card)
            {
                return ((card.val == discard_pile_[last_discard_card].val) && (card.suit == discard_pile_[last_discard_card].suit));
            });
            console.log(can_use_card);
            if(can_use_card == true)
            {
                possible_moves.push(meld);
            }
        }
        return possible_moves;
    };
    return Player_;
}();