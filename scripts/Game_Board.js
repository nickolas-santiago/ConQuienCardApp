"use strict";
var app = app||{};

app.Game_Board = {
    game_board_border: undefined,
    game_board_width: undefined,
    game_board_height: undefined,
    card_width: undefined,
    card_height: undefined,
    center_offset: undefined,
    deck_pos: {
        x: undefined,
        y: undefined
    },
    discard_pos: {
        x: undefined,
        y: undefined
    },
    button_prompt_width: 100,
    button_prompt_height: 20,
    button_prompt_pos: {
        x: undefined,
        y: undefined
    },
    
    initGameBoard: function()
    {
        //---first the overall board itself
        this.game_board_border = 40;
        this.center_offset = 60;
        this.game_board_width =(game_canvas.width - this.game_board_border);
        this.game_board_height =(game_canvas.height - this.game_board_border);
        this.card_width = 60;
        this.card_height = 75;
        
        var game_board_mid_point_x = (game_canvas.width/2)
        var game_board_mid_point_y = (game_canvas.height/2)
        this.deck_pos.x = (game_board_mid_point_x + this.center_offset);
        this.deck_pos.y = (game_board_mid_point_y - (this.card_height/2));
        this.discard_pos.x = (game_board_mid_point_x - this.center_offset - this.card_width);
        this.discard_pos.y = (game_board_mid_point_y - (this.card_height/2));
    },
    renderCard: function(a_card_, a_card_xpos_, a_card_ypos_)
    {
        //---render the card
        game_canvas_context.fillStyle = "rgba(220, 220, 220, 1)";
        game_canvas_context.fillRect(a_card_xpos_, a_card_ypos_, this.card_width, this.card_height);
        game_canvas_context.strokeStyle = "rgba(0,0,0,1)";
        game_canvas_context.strokeWidth = "6";
        game_canvas_context.strokeRect(a_card_xpos_, a_card_ypos_, this.card_width, this.card_height);
        //---render some card features (like suit and value)
        //---for the time, the suits will be represented by a colored circle
        if(a_card_.suit == "bastos")
        {
            game_canvas_context.fillStyle = "rgba(132,100,53,0.45)";
        }
        else if(a_card_.suit == "oros")
        {
            game_canvas_context.fillStyle = "rgba(249,249,107,0.45)";
        }
        else if(a_card_.suit == "copas")
        {
            game_canvas_context.fillStyle = "rgba(249,107,53,0.45)";
        }
        else if(a_card_.suit == "espadas")
        {
            game_canvas_context.fillStyle = "rgba(225,154,222,0.45)";
        }
        game_canvas_context.beginPath();
        game_canvas_context.arc((a_card_xpos_ + (this.card_width/2)), (a_card_ypos_ + (this.card_height/2)), 25, 0, (2 * Math.PI));
        game_canvas_context.fill();
        game_canvas_context.textAlign = "center";
        game_canvas_context.textBaseline = "middle";
        game_canvas_context.font = "25px Montserrat";
        game_canvas_context.fillStyle = "rgba(0, 0, 0, 1)";
        game_canvas_context.fillText(a_card_.val, (a_card_xpos_ + (this.card_width/2)), (a_card_ypos_ + (this.card_height/2)));
    },
    renderButtonPrompt: function(button_text_, button_xpos_, button_ypos_)
    {
        game_canvas_context.fillStyle = "rgba(0,0,0,1)";
        game_canvas_context.strokeStyle = "rgba(0,0,0,1)";
        game_canvas_context.strokeWidth = "6";
        game_canvas_context.font = "16px Montserrat";
        game_canvas_context.strokeRect(button_xpos_, button_ypos_, this.button_prompt_width, this.button_prompt_height);
        game_canvas_context.fillText(button_text_, (button_xpos_ + (this.button_prompt_width/2)), (button_ypos_ + (this.button_prompt_height/2)));
    },
    renderGameBoard: function()
    {
        //---start with clean canvas
        game_canvas_context.fillStyle = "rgba(188,245,255,1)";
        game_canvas_context.fillStyle = "rgba(188, 245, 255, 1)";
        game_canvas_context.fillRect(0, 0, game_canvas.width, game_canvas.height);
        game_canvas_context.fillStyle = "white";
        game_canvas_context.fillRect((this.game_board_border/2), (this.game_board_border/2), this.game_board_width, this.game_board_height);
        game_canvas_context.fillStyle = "rgba(127, 127, 127, 0.5)";
        game_canvas_context.fillRect((this.game_board_border/2), (this.game_board_border/2), this.game_board_width, this.game_board_height);
        game_canvas_context.fillStyle = "rgba(227, 127, 127, 1)";
        //---render the deck
        if(app.Game_Main.game_deck.length != 0)
        {
            game_canvas_context.fillRect(this.deck_pos.x, this.deck_pos.y, this.card_width, this.card_height);
        }
        //---render the discard pile
        if(app.Game_Main.discard_pile.length != 0)
        {
            var last_card = (app.Game_Main.discard_pile.length - 1);
            this.renderCard(app.Game_Main.discard_pile[last_card], this.discard_pos.x, this.discard_pos.y);
        }
        //---render button_prompts
        for(var button_prompt = 0; button_prompt < app.Game_Main.current_button_prompts.length; button_prompt++)
        {
            var this_button = app.Game_Main.current_button_prompts[button_prompt];
            //console.log(this_button);
            this.renderButtonPrompt(this_button.text, this_button.xpos, this_button.ypos);
        }
        
        //---render each player's side
        for(var player = 0; player < app.Game_Main.players.length; player++)
        {
            //---render the hand
            for(var hand_card = 0; hand_card < app.Game_Main.players[player].hand.length; hand_card++)
            {
                var card_segment = (this.game_board_width/app.Game_Main.players[player].hand.length);
                var card_xpos = ((this.game_board_border/2) + ((this.game_board_width/app.Game_Main.players[player].hand.length) * hand_card) + (card_segment/2) - (this.card_width/2));
                var card_ypos;
                if(player == 0)
                {
                    card_ypos = (this.game_board_border/2);
                }
                else if(player == 1)
                {
                    card_ypos = ((this.game_board_border/2) + this.game_board_height - this.card_height);
                }
                this.renderCard(app.Game_Main.players[player].hand[hand_card], (card_xpos), (card_ypos));
            }
            //---render the active melds
            for(var meld = 0; meld < app.Game_Main.players[player].active_melds.length; meld++)
            {
                var meld_xpos = ((this.game_board_border/2) + ((this.game_board_width/3) * meld));
                var meld_ypos = 0;
                if(player == 0)
                {
                    meld_ypos = (this.game_board_border/2) + 100;
                }
                else if(player == 1)
                {
                    meld_ypos = ((this.game_board_border/2) + this.game_board_height - this.card_height - 100);
                }
                app.Game_Main.players[player].active_melds[meld].xpos = meld_xpos;
                app.Game_Main.players[player].active_melds[meld].ypos = meld_ypos;
                for(var active_meld_card = 0; active_meld_card < app.Game_Main.players[player].active_melds[meld].length; active_meld_card++)
                {                    
                    this.renderCard(app.Game_Main.players[player].active_melds[meld][active_meld_card], (meld_xpos + ((this.card_width/2) * active_meld_card)), meld_ypos);
                }
            }
        }
    }
};