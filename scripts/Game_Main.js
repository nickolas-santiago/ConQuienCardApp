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
    current_discard: undefined,
    
    game_board_deck: {},
    game_board_discard_pile: {},
    current_button_prompts: [],
    
    //---canvas properties
    game_canvas: undefined,
    game_canvas_context: undefined,
    game_canvas_width: 680,
    game_canvas_height: 700,
    suits: ["bastos", "oros", "copas", "espadas"],
    
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
            var suits = self.suits;
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
        
        //**/////////////
        game_canvas_context.fillStyle = "rgba(188, 245, 255, 1)";
        game_canvas_context.fillRect(0, 0, this.game_canvas_width, this.game_canvas_height);
        game_canvas_context.fillStyle = "white";
        game_canvas_context.fillRect((game_board_border/2), (game_board_border/2), game_board_width, game_board_height);
        game_canvas_context.fillStyle = "rgba(127, 127, 127, 0.5)";
        game_canvas_context.fillRect((game_board_border/2), (game_board_border/2), game_board_width, game_board_height);
        //**/////////////
        
        var center_xoffset = 60;
        var game_board_deck_xpos = ((game_board_border/2) + (game_board_width/2) - (card_width/2) + center_xoffset);
        var game_board_deck_ypos = ((game_board_border/2) + (game_board_height/2) - (card_height/2));
        var game_board_discard_pile_xpos = ((game_board_border/2) + (game_board_width/2) - (card_width/2) - center_xoffset);
        var game_board_discard_pile_ypos = ((game_board_border/2) + (game_board_height/2) - (card_height/2));
        var button_xpos = ((game_board_border/2) + (game_board_width/2) - (90/2) - center_xoffset);
        var decision_button_top_ypos = ((game_board_border/2) + (game_board_height/2) - ((card_height) + 0));
        var decision_button_bottom_ypos = ((game_board_border/2) + (game_board_height/2) + ((card_height) - 10));
        
        this.game_board_deck.xpos = game_board_deck_xpos;
        this.game_board_deck.ypos = game_board_deck_ypos;
        this.game_board_discard_pile.xpos = game_board_discard_pile_xpos;
        this.game_board_discard_pile.ypos = game_board_discard_pile_ypos;
        
        var renderCard = function(a_card, a_card_xpos, a_card_ypos)
        {
            //---render the card
            game_canvas_context.fillStyle = "rgba(220, 220, 220, 1)";
            game_canvas_context.fillRect(a_card_xpos, a_card_ypos, card_width, card_height);
            game_canvas_context.strokeStyle = "rgba(0,0,0,1)";
            game_canvas_context.strokeWidth = "6";
            game_canvas_context.strokeRect(a_card_xpos, a_card_ypos, card_width, card_height);
            //---render some card features (like suit and value)
            //---for the time, the suits will be represented by a colored circle
            if(a_card.suit == "bastos")
            {
                game_canvas_context.fillStyle = "rgba(132,100,53,0.45)";
            }
            else if(a_card.suit == "oros")
            {
                game_canvas_context.fillStyle = "rgba(249,249,107,0.45)";
            }
            else if(a_card.suit == "copas")
            {
                game_canvas_context.fillStyle = "rgba(249,107,53,0.45)";
            }
            else if(a_card.suit == "espadas")
            {
                game_canvas_context.fillStyle = "rgba(225,154,222,0.45)";
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
        
        
        var self = this;
        var initUIButton = function(button_function, button_xpos, button_ypos)
        {
            var button = {};
            button.button_function = button_function;
            button.button_xpos = button_xpos;
            button.button_ypos = button_ypos;
            self.current_button_prompts.push(button);
        }
        var renderUIButton = function(button_text, button_xpos, button_ypos)
        {
            var button_width = 90;
            var button_height = 20;
            game_canvas_context.font = "16px Montserrat";
            game_canvas_context.strokeRect(button_xpos, button_ypos, button_width, button_height);
            game_canvas_context.fillText(button_text, (button_xpos + (button_width/2)), (button_ypos + (button_height/2)));
        };
        
        //---render each player's side
        for(var player = 0; player < this.players.length; player++)
        {
            //---render the hand
            for(var card = 0; card < this.players[player].hand.length; card++)
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
                renderCard(this.players[player].hand[card], (card_xpos), (card_ypos));
            }
            //---render the active melds
            for(var meld = 0; meld < this.players[player].active_melds.length; meld++)
            {
                var meld_xpos = ((game_board_border/2) + ((game_board_width/3) * meld));
                var meld_ypos = 0;
                if(player == 0)
                {
                    meld_ypos = (game_board_border/2) + 100;
                }
                else if(player == 1)
                {
                    meld_ypos = ((game_board_border/2) + game_board_height - card_height - 100);
                }
                this.players[player].active_melds[meld].xpos = meld_xpos;
                this.players[player].active_melds[meld].ypos = meld_ypos;
                for(card = 0; card < this.players[player].active_melds[meld].length; card++)
                {
                    //game_canvas_context.fillRect((meld_xpos + ((card_width/2) * card)), meld_ypos, 60, 75);                    
                    renderCard(this.players[player].active_melds[meld][card], (meld_xpos + ((card_width/2) * card)), meld_ypos);
                }
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
            renderCard(this.discard_pile[last_card], this.game_board_discard_pile.xpos, this.game_board_discard_pile.ypos);
        }
        //---render any button prompts
        for(var button_prompt = 0; button_prompt < this.current_button_prompts.length; button_prompt++)
        {
            var this_button = this.current_button_prompts[button_prompt];
            renderUIButton(this_button.text, this_button.xpos, this_button.ypos);
        }
        
    },
    
    initEventListeners: function(game_canvas_, getMouse_)
    {
        var self = this;
        game_canvas_.addEventListener('mouseup', function(evt)
        {
            mouse_pos = getMouse_(game_canvas_, evt);
            
            //---clicking deck
            if((mouse_pos.x >= self.game_board_deck.xpos) && (mouse_pos.x <= (self.game_board_deck.xpos + 60))
                && ((mouse_pos.y >= self.game_board_deck.ypos) && (mouse_pos.y <= (self.game_board_deck.ypos + 75)))
                && ((self.current_game_state == self.game_states[1]) && (self.game_deck.length != 0)))
            {
                self.players[self.current_pluck].pluck(self.game_deck);
                console.log(self.discard_pile);
                self.initButtonPrompts("init meld", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos - 20 - 10), "MELD");
                self.initButtonPrompts("overlook", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos + 75 + 10), "OVERLOOK");
            }
            
            //---clicking buttons
            for(var button_prompt = 0; button_prompt < self.current_button_prompts.length; button_prompt++)
            {
                if((mouse_pos.x >= self.current_button_prompts[button_prompt].xpos) && (mouse_pos.x <= (self.current_button_prompts[button_prompt].xpos + 90))
                    && (mouse_pos.y >= self.current_button_prompts[button_prompt].ypos) && (mouse_pos.y <= (self.current_button_prompts[button_prompt].ypos + 20)))
                {
                    if(self.current_button_prompts[button_prompt].funct == "donate card")
                    {
                        console.log("hello from donate button prompt");
                        self.players[1].donateCard();
                        self.current_button_prompts.splice(0);
                    }
                    else if(self.current_button_prompts[button_prompt].funct == "overlook")
                    {
                        self.players[self.current_decision].overlook(self.current_pluck, self.current_decision, self.current_discard, self.players.length);
                    }
                    else if(self.current_button_prompts[button_prompt].funct == "init meld")
                    {
                        console.log("i have decided to meld");
                        self.players[1].initMeld();
                        self.current_button_prompts.splice(0);
                        console.log(self.current_game_state);
                        self.initButtonPrompts("check meld", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos - 20 - 10), "MELD");
                        self.initButtonPrompts("cancel meld", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos + 75 + 10), "CANCEL");
                    
                    }
                    else if(self.current_button_prompts[button_prompt].funct == "check meld")
                    {
                        self.checkPotentialMeld();
                    }
                    else if(self.current_button_prompts[button_prompt].funct == "cancel card choice")
                    {
                        self.players[1].chosen_card = undefined;
                        self.current_button_prompts.splice(0);
                    }
                    else if(self.current_button_prompts[button_prompt].funct == "cancel meld")
                    {
                        console.log("Player " + self.current_decision + " has canceled a meld.");
                        self.current_button_prompts.splice(0);
                        self.players[self.current_decision].potential_meld.splice(0);
                        if(self.players[self.current_decision].chosen_card == self.discard_pile[(self.discard_pile.length - 1)])
                        {
                            self.current_game_state = self.game_states[2];
                            self.initButtonPrompts("init meld", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos - 20 - 10), "MELD");
                            self.initButtonPrompts("overlook", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos + 75 + 10), "OVERLOOK");            
                        }
                        else
                        {
                            self.current_game_state = self.game_states[4];
                        }
                        self.players[1].chosen_card = undefined;
                        console.log(self.players[1].potential_meld);
                    }
                    else if(self.current_button_prompts[button_prompt].funct == "discard")
                    {
                        self.players[1].discardCard();
                        self.current_button_prompts.splice(0);
                        console.log(self.current_game_state);
                        self.initButtonPrompts("init meld", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos - 20 - 10), "MELD");
                        self.initButtonPrompts("overlook", self.game_board_discard_pile.xpos + (60/2) - (90/2), (self.game_board_discard_pile.ypos + 75 + 10), "OVERLOOK");    
                    }
                }
            }
            
            //---clicking cards
            for(var card = 0; card < self.players[1].hand.length; card++)
            {
                //console.log(self.players[1].hand[card]);
                var game_board_width = (self.game_canvas_width - 40);
                var card_xpos = ((40/2) + ((game_board_width/self.players[1].hand.length) * card) + ((game_board_width/self.players[1].hand.length)/2) - (60/2));
                var card_ypos = (self.game_canvas_height - (40/2) - 75);
                var decision_button_xpos = (card_xpos + (60/2) - (90/2));
                
                if((mouse_pos.x >= card_xpos) && (mouse_pos.x <= (card_xpos + 60))
                    && (mouse_pos.y >= (self.game_canvas_height - (40/2) - 75)) && (mouse_pos.y <= (self.game_canvas_height - (40/2))))
                {           
                    console.log(card);
                    if(self.current_game_state == self.game_states[0])
                    {
                        self.players[1].chooseCard(card);
                        //self.players[1].donateCard();
                        //console.log(self.players[1].chosen_card);
                        if(self.current_button_prompts.length != 0)
                        {
                            self.current_button_prompts.splice(0);
                        }
                        self.initButtonPrompts("donate card", decision_button_xpos, (card_ypos - 20 - 10), "DONATE");
                        self.initButtonPrompts("cancel card choice", decision_button_xpos, (card_ypos + 75 + 10), "CANCEL");
                    }
                    else if(self.current_game_state == self.game_states[3])
                    {
                        self.players[1].addCardToMeld(card);
                    }
                    else if(self.current_game_state == self.game_states[4])
                    {
                        self.players[1].chooseCard(card);
                        if(self.current_button_prompts.length != 0)
                        {
                            self.current_button_prompts.splice(0);
                        }
                        self.initButtonPrompts("init meld", decision_button_xpos, (card_ypos - 20 - 10 - 20 - 10), "MELD");
                        self.initButtonPrompts("discard", decision_button_xpos, (card_ypos - 20 - 10), "DISCARD");
                        self.initButtonPrompts("cancel card choice", decision_button_xpos, (card_ypos + 75 + 10), "CANCEL");                    
                    }
                }
            }
            
            //---clicking an active meld
            for(var player = 0; player < self.players.length; player++)
            {
                for(var meld = 0; meld < self.players[player].active_melds.length; meld++)
                {
                    if((mouse_pos.x >= self.players[player].active_melds[meld].xpos) && (mouse_pos.x <= (self.players[player].active_melds[meld].xpos + ((60/2) * (self.players[player].active_melds[meld].length - 1) + 60)))
                        && (mouse_pos.y >= self.players[player].active_melds[meld].ypos) && (mouse_pos.y <= (self.players[player].active_melds[meld].ypos + 75)))
                    {
                        self.players[1].addMeldToMeld(player, self.players[player].active_melds[meld]);                          
                    }
                }
            }
        }, false);
    },
    
    endDonationRound: function()
    {
        
        for(var player = 0; player < this.players.length; player++)
        {
            this.players[player].hand.push(this.players[player].card_queue);
            this.players[player].card_queue = undefined;
        }
        
        this.current_game_state = this.game_states[1];
        this.current_pluck = 0;
    },
    
    initButtonPrompts: function(button_function_, button_xpos_, button_ypos_, button_text_)
    {
        var button = {};
        button.xpos = button_xpos_;
        button.ypos = button_ypos_;
        button.funct = button_function_;
        button.text = button_text_;
        this.current_button_prompts.push(button);
    },
    
    checkPotentialMeld: function()
    {
        var current_player = this.players[this.current_decision];
        var self = this;
        var accept_meld = function()
        {
            console.log("counts");
            var completed_meld = [];
            for(var card = 0; card < current_player.potential_meld.length; card++)
            {
                completed_meld.push(current_player.potential_meld[card]);
                //---now we have a completed meld, we gotta take out all the cards from the hand
                //---so for every car in the player's hand, check to see if our current card
                //   is equal to that card
                for(var player_card = 0; player_card < current_player.hand.length; player_card++)
                {
                    if(current_player.potential_meld[card] == current_player.hand[player_card])
                    {
                        current_player.hand.splice(player_card, 1);
                    }
                }
            }
            var idea = [];
            for(var i = 0; i < current_player.potential_meld.length; i++)
            {
                if(current_player.potential_meld[i] != current_player.chosen_card[0])
                {
                    idea.push(current_player.potential_meld[i]);
                }
            }
            function compare(a,b)
            {
                return a === b;
            }
            
            for(var meld = 0; meld < current_player.active_melds.length; meld++)
            {
                var rr;
                for(var card = 0; card < current_player.active_melds[meld].length; card++)
                {
                    rr = current_player.potential_meld.some(function(x)
                    {
                        return x == current_player.active_melds[meld][card];
                    });
                }
                if(rr == true)
                {
                    current_player.active_melds[meld].splice(0);
                    console.log(current_player.chosen_card);
                    for(var card = 0; card < completed_meld.length; card++)
                    {
                        current_player.active_melds[meld].push(completed_meld[card]);
                    }
                    if(current_player.chosen_card == self.discard_pile[(self.discard_pile.length - 1)])
                    {
                        self.discard_pile.pop();
                    }
                    current_player.potential_meld.splice(0);
                    current_player.chosen_card = undefined;
                    //self.current_discard = player;
                    //self.current_decision = player;
                    self.current_game_state = self.game_states[4];
                    self.current_button_prompts.splice(0);
                    return;
                }
            }
            
            current_player.active_melds.push(completed_meld);
            if(current_player.chosen_card == self.discard_pile[(self.discard_pile.length - 1)])
            {
                self.discard_pile.pop();
            }                
            current_player.potential_meld.splice(0);
            current_player.chosen_card = undefined;
            self.current_discard = self.current_decision;
            self.current_game_state = self.game_states[4];
            self.current_button_prompts.splice(0);
        };
        
        console.log("Player " + this.current_decision + " has melded`.");
        console.log(current_player.potential_meld);
        //---now the potential meld has to be checked
        function compare(a,b)
        {
            return a === b;
        }
        function checkSameVal()
        {
            for(var card = 1; card < current_player.potential_meld.length; card++)
            {
                if(compare(current_player.potential_meld[0].val, current_player.potential_meld[card].val) == false)
                {
                    checkSameSuit();
                    return;
                }
            }
            accept_meld();
        }
        function checkSameSuit()
        {
            for(var card = 1; card < current_player.potential_meld.length; card++)
            {
                if(compare(current_player.potential_meld[0].suit, current_player.potential_meld[card].suit) == false)
                {
                    current_player.potential_meld.splice(1);
                    console.log("womp");
                    return;
                }
            }
            var reordered_potential_meld = current_player.potential_meld.sort(function(a, b){return a.val - b.val});
            for(var ll = 0; ll < current_player.potential_meld.length; ll++)
            {
                console.log(current_player.potential_meld[ll]);
            }
            for(var card = 0; card < (reordered_potential_meld.length - 1); card++)
            {
                var xx = (card + 1);
                if(reordered_potential_meld[xx].val == (reordered_potential_meld[card].val + 1))
                {
                    console.log("yup");
                }
                else
                {
                    current_player.potential_meld.splice(0);
                    console.log("womp");
                    return;
                }
            }
            accept_meld();
        }
        if(current_player.potential_meld.length < 3)
        {
            return;
        }
        checkSameVal();
    },
    
    
    run_computer_player: function(comp_)
    {
        if((this.current_game_state == this.game_states[0]) && (comp_.is_donating == true))
        {
            comp_.findAllCurrentPotentialMelds(this.suits);
            comp_.chooseCard(comp_.findLeastUsedCard());
            comp_.donateCard();
        }
        else if((this.current_game_state == this.game_states[1]) && (this.current_pluck == comp_.player_position))
        {
            comp_.pluck(this.game_deck);
        }
        else if((this.current_game_state == this.game_states[2]) && (this.current_decision == comp_.player_position))
        {
            console.log("comp overlooked");
            comp_.overlook(this.current_pluck, this.current_decision, this.current_discard, this.players.length);            
            this.initButtonPrompts("init meld", this.game_board_discard_pile.xpos + (60/2) - (90/2), (this.game_board_discard_pile.ypos - 20 - 10), "MELD");
            this.initButtonPrompts("overlook", this.game_board_discard_pile.xpos + (60/2) - (90/2), (this.game_board_discard_pile.ypos + 75 + 10), "OVERLOOK");
        }
    },
    
    update: function()
    {
        this.animationID = requestAnimationFrame(this.update.bind(this));
        this.renderGameBoard(this.players);
        
        for(var player = 0; player < this.players.length; player++)
        {
            if(player == 0)
            {
                this.run_computer_player(this.players[player]);
            }
        }
        
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