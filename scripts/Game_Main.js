"use strict";
var app = app||{};

app.Game_Main = {
    //---PROPERTIES----//
    players: undefined,
    game_deck: [],
    discard_pile: [],
    current_game_state: undefined,
    game_states: ["the_donation_round", "pluck", "meld_or_discard", "melding", "discarding", "game_over"],
    current_pluck: undefined,
    current_decision: undefined,
    game_board_deck: {},
    decision_button_top: {},
    decision_button_bottom: {},
    potential_meld: [],
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
            var suits = ["bastos", "oros", "copas", "espadas"];
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
    
    renderGameBoard: function(players_)
    {
        //---set up the game board
        var game_board_border = 40; 
        var game_board_width = (this.game_canvas_width - game_board_border);
        var game_board_height = (this.game_canvas_height - game_board_border);
        var card_width = 60;
        var card_height = 75;
        
        var center_xoffset = 60;
        var game_board_deck_xpos = ((game_board_border/2) + (game_board_width/2) - (card_width/2) + center_xoffset);
        var game_board_deck_ypos = ((game_board_border/2) + (game_board_height/2) - (card_height/2));
        var button_xpos = ((game_board_border/2) + (game_board_width/2) - (90/2) - center_xoffset);
        var decision_button_top_ypos = ((game_board_border/2) + (game_board_height/2) - ((card_height) + 0));
        var decision_button_bottom_ypos = ((game_board_border/2) + (game_board_height/2) + ((card_height) - 10));
        
        this.game_board_deck.xpos = game_board_deck_xpos;
        this.game_board_deck.ypos = game_board_deck_ypos;
        this.decision_button_bottom.xpos = button_xpos;
        this.decision_button_bottom.ypos = decision_button_bottom_ypos;
        this.decision_button_top.xpos = button_xpos;
        this.decision_button_top.ypos = decision_button_top_ypos;
        
        var renderCard = function(a_card, a_card_xpos, a_card_ypos)
        {
            //---render the card
            game_canvas_context.strokeStyle = "rgba(0,0,0,1)";
            game_canvas_context.strokeWidth = "6";
            game_canvas_context.strokeRect(a_card_xpos, a_card_ypos, card_width, card_height);
            //---render some card features (like suit and value)
            //---for the time, the suits will be represented by a colored circle
            if(a_card.suit == "bastos")
            {
                game_canvas_context.fillStyle = "rgba(132,100,53,0.35)";
            }
            else if(a_card.suit == "oros")
            {
                game_canvas_context.fillStyle = "rgba(249,249,107,0.35)";
            }
            else if(a_card.suit == "copas")
            {
                game_canvas_context.fillStyle = "rgba(249,107,53,0.35)";
            }
            else if(a_card.suit == "espadas")
            {
                game_canvas_context.fillStyle = "rgba(225,154,222,0.35)";
            }
            game_canvas_context.beginPath();
            game_canvas_context.arc((a_card_xpos + (card_width/2)), (a_card_ypos + (card_height/2)), 25, 0, (2 * Math.PI));
            game_canvas_context.fill();
            game_canvas_context.textAlign = "center";
            game_canvas_context.textBaseline = "middle";
            game_canvas_context.font = "25px Montserrat";
            game_canvas_context.fillStyle = "rgba(0, 0, 0, 1)";
            game_canvas_context.fillText(a_card.val, (a_card_xpos + (card_width/2)), (a_card_ypos + (card_height/2)));            
        };
        var renderUIButton = function(button_text, button_xpos, button_ypos)
        {
            var button_width = 90;
            var button_height = 20;
            game_canvas_context.font = "16px Montserrat";
            game_canvas_context.strokeRect(button_xpos, button_ypos, button_width, button_height);
            game_canvas_context.fillText(button_text, (button_xpos + (button_width/2)), (button_ypos + (button_height/2)));
        };
        
        //---set up each player's hand
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
                //--give each card a position reference
                this.players[player].hand[card].xpos = card_xpos;
                this.players[player].hand[card].ypos = card_ypos;
                renderCard(this.players[player].hand[card], (card_xpos), (card_ypos));
            }
        }
        //---render the deck
        if(this.game_deck.length != 0)
        {
            game_canvas_context.fillRect(game_board_deck_xpos, game_board_deck_ypos, card_width, card_height);
        }
        //---render discard pile
        if(this.discard_pile.length != 0)
        {
            var last_card = (this.discard_pile.length - 1);
            renderCard(this.discard_pile[last_card], ((game_board_border/2) + (game_board_width/2) - (card_width/2) - center_xoffset), ((game_board_border/2) + (game_board_height/2) - (card_height/2)));
        }
        //---render decision mode buttons
        if(this.current_game_state == this.game_states[2])
        {
            renderUIButton("MELD", button_xpos, this.decision_button_top.ypos);
            renderUIButton("DISCARD", button_xpos, this.decision_button_bottom.ypos);
        }
        //---render melding mode buttons
        if(this.current_game_state == this.game_states[3])
        {
            renderUIButton("MELD", button_xpos, this.decision_button_top.ypos);
            renderUIButton("CANCEL", button_xpos, this.decision_button_bottom.ypos);
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
                        console.log(player);
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
            
            //---for pluck
            if((self.current_game_state == self.game_states[1]) && (self.game_deck.length != 0))
            {
                if((mouse_pos.x >= self.game_board_deck.xpos) && (mouse_pos.x <= (self.game_board_deck.xpos + 60))
                    && ((mouse_pos.y >= self.game_board_deck.ypos) && (mouse_pos.y <= (self.game_board_deck.ypos + 75))))
                {
                    var last_deck_card = (self.game_deck.length - 1);
                    self.discard_pile.push(self.game_deck[last_deck_card]);
                    self.game_deck.pop();
                    self.current_game_state = self.game_states[2];
                    self.current_decision = self.current_pluck;
                }
            }
            
            //---for player choice
            else if(self.current_game_state == self.game_states[2])
            {
                if((mouse_pos.x >= self.decision_button_bottom.xpos) && (mouse_pos.x <= (self.decision_button_bottom.xpos + 90))
                    && ((mouse_pos.y >= self.decision_button_bottom.ypos) && (mouse_pos.y <= (self.decision_button_bottom.ypos + 20))))
                {
                    console.log("Player " + self.current_decision + " has discarded.");
                    self.current_decision++;
                    if(self.current_decision>= self.players.length)
                    {
                        self.current_decision = 0;
                    }
                    if(self.current_decision == self.current_pluck)
                    {
                        self.current_game_state = self.game_states[1];
                        self.current_pluck++;
                        if(self.current_pluck >= self.players.length)
                        {
                            self.current_pluck = 0;
                        }
                        console.log("Player " + self.current_pluck + "'s turn");
                    }
                }
                if((mouse_pos.x >= self.decision_button_top.xpos) && (mouse_pos.x <= (self.decision_button_top.xpos + 90))
                    && ((mouse_pos.y >= self.decision_button_top.ypos) && (mouse_pos.y <= (self.decision_button_top.ypos + 20))))
                {
                    console.log("Player " + self.current_decision + " has decided to meld.");
                    self.current_game_state = self.game_states[3];
                    //---self.potential_meld.push(
                    var current_card = (self.discard_pile.length - 1);
                    self.potential_meld.push(self.discard_pile[current_card]);
                    console.log(self.potential_meld);
                }
            }
            
            //---for meld
            else if(self.current_game_state == self.game_states[3])
            {
                var accept_meld = function()
                {
                    console.log("counts");
                    var completed_meld = [];
                    for(var card = 0; card < self.potential_meld.length; card++)
                    {
                        completed_meld.push(self.potential_meld[card]);
                        //---now we have a completed meld, we gotta take out all the cards from the hand
                        //---so for every car in the player's hand, check to see if our current card
                        //   is equal to that card
                        for(var player_card = 0; player_card < self.players[self.current_decision].hand.length; player_card++)
                        {
                            if(self.potential_meld[card] == self.players[self.current_decision].hand[player_card])
                            {
                                self.players[self.current_decision].hand.splice(player_card, 1);
                            }
                        }
                        self.discard_pile.pop();
                    }
                    self.players[self.current_decision].active_melds.push(completed_meld);
                    self.potential_meld.splice(0, self.potential_meld.length);
                    self.current_game_state = self.game_states[4];
                };
                
                if((mouse_pos.x >= self.decision_button_top.xpos) && (mouse_pos.x <= (self.decision_button_top.xpos + 90))
                    && ((mouse_pos.y >= self.decision_button_top.ypos) && (mouse_pos.y <= (self.decision_button_top.ypos + 20)))
                    && (self.potential_meld.length >= 3))
                {
                    console.log("Player " + self.current_decision + " has melded`.");
                    console.log(self.potential_meld);
                    //---now the potential meld has to be checked
                    function compare(a,b)
                    {
                        return a === b;
                    }
                    function checkSameVal()
                    {
                        for(var card = 1; card < self.potential_meld.length; card++)
                        {
                            if(compare(self.potential_meld[0].val, self.potential_meld[card].val) == false)
                            {
                                checkSameSuit();
                                return;
                            }
                        }
                        accept_meld();
                    }
                    function checkSameSuit()
                    {
                        for(var card = 1; card < self.potential_meld.length; card++)
                        {
                            if(compare(self.potential_meld[0].suit, self.potential_meld[card].suit) == false)
                            {
                                self.potential_meld.splice(1, (self.potential_meld.length - 1));
                                console.log("womp");
                                return;
                            }
                        }
                        var reordered_potential_meld = self.potential_meld.sort(function(a, b){console.log(a + "   " + b); return a.val - b.val});
                        for(var card = 0; card < (reordered_potential_meld.length - 1); card++)
                        {
                            var xx = (card + 1);
                            if(reordered_potential_meld[xx].val == (reordered_potential_meld[card].val + 1))
                            {
                                console.log("yup");
                            }
                            else
                            {
                                self.potential_meld.splice(0, self.potential_meld.length);
                                return;
                            }
                        }
                        accept_meld();
                    }
                    checkSameVal();
                }
                if((mouse_pos.x >= self.decision_button_bottom.xpos) && (mouse_pos.x <= (self.decision_button_bottom.xpos + 90))
                    && ((mouse_pos.y >= self.decision_button_bottom.ypos) && (mouse_pos.y <= (self.decision_button_bottom.ypos + 20))))
                {
                    console.log("Player " + self.current_decision + " has canceled a meld.");
                    self.current_game_state = self.game_states[2];
                    self.potential_meld.splice(0, self.potential_meld.length);
                    console.log(self.potential_meld);
                }
                
                for(var card = 0; card < self.players[self.current_decision].hand.length; card++)
                {
                    if((mouse_pos.x >= self.players[self.current_decision].hand[card].xpos) && (mouse_pos.x <= (self.players[self.current_decision].hand[card].xpos + 60))
                        && ((mouse_pos.y >= self.players[self.current_decision].hand[card].ypos) && (mouse_pos.y <= (self.players[self.current_decision].hand[card].ypos + 75))))
                    {
                        for(var potential_meld_card = 0; potential_meld_card < self.potential_meld.length; potential_meld_card++)
                        {
                            if(self.potential_meld[potential_meld_card] == self.players[self.current_decision].hand[card])
                            {
                                return;
                            }
                        }
                        self.potential_meld.push(self.players[self.current_decision].hand[card]);
                    }                    
                }
            }
            
            //---for discard
            else if(self.current_game_state == self.game_states[4])
            {
                for(var card = 0; card < self.players[self.current_decision].hand.length; card++)
                {
                    if((mouse_pos.x >= self.players[self.current_decision].hand[card].xpos) && (mouse_pos.x <= (self.players[self.current_decision].hand[card].xpos + 60))
                        && ((mouse_pos.y >= self.players[self.current_decision].hand[card].ypos) && (mouse_pos.y <= (self.players[self.current_decision].hand[card].ypos + 75))))
                    {
                        self.discard_pile.push(self.players[self.current_decision].hand[card]);
                        self.players[self.current_decision].hand.splice(card,1);
                        self.current_game_state = self.game_states[1];
                        self.current_pluck++;
                        if(self.current_pluck >= self.players.length)
                        {
                            self.current_pluck = 0;
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
        this.current_pluck = 0;
    },
    
    update: function()
    {
        this.animationID = requestAnimationFrame(this.update.bind(this));
        game_canvas_context.fillStyle = "white";
        game_canvas_context.fillRect(0, 0, game_canvas.width, game_canvas.height);
        game_canvas_context.fillStyle = "rgba(127, 127, 127, 0.5)";
        game_canvas_context.fillRect(0, 0, game_canvas.width, game_canvas.height);
        this.renderGameBoard(this.players);
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
        
        //---check to see if anyone has won at least 9 active cards
        for(var player = 0; player < this.players.length; player++)
        {
            var card_count = 0;
            for(var meld = 0; meld < this.players[player].active_melds.length; meld++)
            {
                for(var card = 0; card < this.players[player].active_melds[meld].length; card++)
                {
                    card_count++;
                }
            }
            if(card_count >= 9)
            {
                this.current_game_state = this.game_states[6];
                console.log("Player " + player + " wins!!");
            }
        }
    }
};