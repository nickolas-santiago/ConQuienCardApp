"use strict";
var app = app||{};

app.Game_Main = {
    //---PROPERTIES----//
    game_deck: [],
    players: undefined,
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
        this.renderPlayerCards(this.players);
    },
    
    
    renderPlayerCards: function(players_)
    {
        var game_board_border = 40; 
        var game_board_width = (this.game_canvas_width - game_board_border);
        var game_board_height = (this.game_canvas_height - game_board_border);
        var card_width = 60;
        var card_height = 75;
        
        for(var player = 0; player < players_.length; player++)
        {
            for(var card = 0; card < players_[player].hand.length; card++)
            {
                var card_segment = (game_board_width/players_[player].hand.length);
                var card_xpos = ((game_board_border/2) + ((game_board_width/players_[player].hand.length) * card) + (card_segment/2) - (card_width/2));
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
                
                game_canvas_context.rect(card_xpos, card_ypos, card_width, card_height);
                game_canvas_context.strokeWidth = "6";
                game_canvas_context.stroke();
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
                        console.log(self.players[player].hand[card]);
                    }
                }
            }            
        }, false);
    }
};