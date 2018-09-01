"use strict";
var app = app||{};

app.Game_Main = {
    //---PROPERTIES----//
    game_deck: [],
    players: undefined,
    current_game_state: undefined,
    game_states: ["the_donation_round", "pluck"],
    //---canvas properties
    game_canvas: undefined,
    game_canvas_context: undefined,
    game_canvas_width: 700,
    game_canvas_height: 500,
    
    
    //---METHODS---//
    init: function(players_, game_canvas_, game_canvas_context_, getMouse_)
    {
        this.players = players_;
        var self = this;
        //---initiate canvas properties
        this.game_canvas = game_canvas_;
        this.game_canvas_context = game_canvas_context_;
        this.initEventListeners(this.game_canvas, getMouse_);
        
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
        var deal_cards = function()
        {
            var starting_hand_num = 10;
            for(var card = 0; card < starting_hand_num; card++)
            {
                for(var player = 0; player < self.players.length; player++)
                {
                    var deck_length = (self.game_deck.length - 1);
                    self.players[player].hand.push(self.game_deck[deck_length]);
                    self.game_deck.pop();
                }
            }
        }
        
        build_deck();
        shuffle_deck();
        deal_cards();
        console.log(this.game_deck);
        console.log(this.players[0].hand);
        console.log(this.players[1].hand);
        this.current_game_state = this.game_states[0];
        this.update();
    },
    
    
    renderPlayerCards: function(players_)
    {
        var game_board_border = 40; 
        var game_board_width = (this.game_canvas_width - game_board_border);
        var game_board_height = (this.game_canvas_height - game_board_border);
        var card_width = 60;
        var card_height = 75;
        
        for(var player = 0; player < this.players.length; player++)
        {
            for(var card = 0; card < players_[player].hand.length; card++)
            {
                var card_segment = (game_board_width/this.players[player].hand.length);
                var card_xpos = ((game_board_border/2) + ((game_board_width/this.players[player].hand.length) * card) + (card_segment/2) - (card_width/2));
                var card_ypos;
                if(player == 0)
                {
                    card_ypos = (game_board_border/2);
                }
                else if(player == 1)
                {
                    card_ypos = ((game_board_border/2) + game_board_height - card_height);
                }
                var new_card_pos = {};
                
                game_canvas_context.strokeStyle = "rgba(0,0,0,1)";
                game_canvas_context.strokeWidth = "6";
                game_canvas_context.strokeRect(card_xpos, card_ypos, card_width, card_height);
                //--give each card a position reference
                this.players[player].hand[card].xpos = card_xpos;
                this.players[player].hand[card].ypos = card_ypos;
            }
        }
    },
    
    initEventListeners: function(game_canvas_, getMouse_)
    {
        var self = this;
        game_canvas_.addEventListener('mouseup', function(evt)
        {
            mouse_pos = getMouse_(game_canvas_, evt);
            for(var player = 0; player < self.players.length; player++)
            {
                for(var card = 0; card < self.players[player].hand.length; card++)
                {
                    //---for each card, see if the mouse_pos is inside any of the cards
                    if((mouse_pos.x >= self.players[player].hand[card].xpos) && (mouse_pos.x <= (self.players[player].hand[card].xpos + 60))
                        && ((mouse_pos.y >= self.players[player].hand[card].ypos) && (mouse_pos.y <= (self.players[player].hand[card].ypos + 75))))
                    {
                        //console.log(self.players[player].hand[card]);
                        console.log(player);
                        //console.log(card);
                        if(self.players[player].is_donating == true)
                        {
                            var next_player = (player + 1);
                            if(next_player >= self.players.length)
                            {
                                next_player = 0;
                            }
                            self.players[next_player].card_queue.push(self.players[player].hand[card]);
                            self.players[player].hand.splice(card, 1);
                            self.players[player].is_donating = false;
                        }
                    }
                }
            }
        }, false);
    },
    
    endDonationRound: function()
    {
        for(var player = 0; player < this.players.length; player++)
        {
            for(var card = 0; card < this.players[player].card_queue.length; card++)
            {
                this.players[player].hand.push(this.players[player].card_queue[card]);
                this.players[player].card_queue.splice(card,1);
            }
        }
        this.current_game_state = this.game_states[1];
    },
    
    update: function()
    {
        this.animationID = requestAnimationFrame(this.update.bind(this));
        game_canvas_context.fillStyle = "white";
        game_canvas_context.fillRect(0, 0, game_canvas.width, game_canvas.height);
        game_canvas_context.fillStyle = "rgba(127, 127, 127, 0.5)";
        game_canvas_context.fillRect(0, 0, game_canvas.width, game_canvas.height);
        this.renderPlayerCards(this.players);
        if(this.current_game_state == "the_donation_round")
        {
            //---if the current state is the "donation round" but everyone has already donated
            //   their single card, the state can be changed
            var donation_count = 0;
            for(var player = 0; player < this.players.length; player++)
            {
                if(this.players[player].is_donating == false)
                {
                    donation_count++
                }
            }
            if(donation_count >= this.players.length)
            {
                this.endDonationRound();
            }
        }
    }
};