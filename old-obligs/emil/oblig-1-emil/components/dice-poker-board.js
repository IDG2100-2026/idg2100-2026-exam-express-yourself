import DicePokerPlayer from "./dice-poker-player.js";

export default class DicePokerBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // These are game tracking variables. Will be incremented later on in the code. 
    this.player1Wins = 0;
    this.player2Wins = 0;
    this.currentRound = 0;
    this.activePlayerIndex = 0; // Starts with player 1, because of index 0
    this.rollsRemaining = 3; // Each player gets 3 up to rolls each. 
  };

  #findPlayer(){
    //Looping trough the players. index 0 is player1, index 1 is player 1. 
    // if we are done with player1 and needs to go to the second player, we add one step forward (+1) and checks the remainder of the players length. In this case we have 2 players, and then we have 1 remainder, so we move to index 1, and the same back to player 1. We move one step forward (+1) then we are at 2, and we check the remainder 2 % 2 which is 0, then back at index 0 (player 1);
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
  }
  connectedCallback() {
    this.#render(); // Draws the html
    this.#eventListners(); // listening to clicks
    this.players = this.shadowRoot.querySelectorAll('dice-poker-player'); // Gets booth players
  };
  #render(){
    this.#checkForStraightAllowed();
    this.shadowRoot.innerHTML = this.#getTemplate(); // stores the html inside render. When render is called, html is. dipslayed! 
  }

  #startRound(){
    this.rollsRemaining = 3; // Resets the rolls when a new round is started
    // booth buttons is disbaled at the start
    this.shadowRoot.querySelector('#startBtn').disabled = true;
    this.shadowRoot.querySelector("#nextRoundBtn").disabled = true;

    this.players.forEach((player, index) =>{
      player.resetRound(); // Clears the dice
      if(index === this.activePlayerIndex){
        player.setActiveButtons(true); // Sets the buttons clickable when it is the player´s turn. 
      } else{
        player.setActiveButtons(false) // Sets the other player´s button´s off we they cant roll at the same time. 
      }
    })
    this.#fireRoundEvent(); // Fires a round start event
  }


  #startGame(){
    // grabs the value from the drop down to decide if we are playing a best of 3, 5 or 7
    this.maxRounds = parseInt(this.shadowRoot.querySelector("#matchLength").value);
    this.#startRound(); // After grabing the match lenght value, we start the round! 
  }


  #nextRound() {
        //with a new. round, we go back to the first player (index0)
        this.activePlayerIndex = 0; 
        // and in this one we also resets the rollcount
        this.#startRound(); 
    }

  #handleRoll(e){ 
    if(e.target === this.players[this.activePlayerIndex]){ // after a roll happens, it checks that the active player was the one who did it. 
      this.rollsRemaining = this.rollsRemaining - 1; // after each roll, we decrement by 1
      console.log(`Rolls remaing is ${this.rollsRemaining} for ${this.activePlayerIndex}`);
      if(this.rollsRemaining === 0){ // if we have rolled 3 times, we calls the endturn method! 
        this.#endTurn();
      }
    }
  }


  #endTurn(){ 
    this.rollsRemaining = 3; // When player1s turn is done, it gives player 2, 3 rolls! If this is removed, player2 has infinite rolls.  
    if(this.activePlayerIndex === this.players.length - 1){ // If booth players have rolled, we call the endRound method
        this.#endRound();
        return;
    } else{
      // if player2 has not rolled, we find them, and their buttons is enabled! 
      this.#findPlayer();
      this.players.forEach((player, index) =>{
        if(index === this.activePlayerIndex){
          player.setActiveButtons(true);
        } else{
          player.setActiveButtons(false)
        }
      });
      console.log(`players turn: ${this.activePlayerIndex}`);
      this.#fireTurnChangeEvent(); // fire the turn change event!
    }
  }


  #endRound(){
    // Loops trough every player, and sets their buttons to disabled, so we cant press them anymore. 
    this.players.forEach((player) => {
      player.setActiveButtons(false);
    });

    // Booth players run the handEvaluation method from player component. 
    // Here we can extract the score, face, tieBraker and handtype
    this.player1Result = this.players[0].handEvaluation(); // !player 1
    this.player2Result = this.players[1].handEvaluation(); // !player2

    // Translated letters into numbers so the system can understand!
    const values = { 'A': 6, 'K': 5, 'Q': 4, 'J': 3, '8': 2, '7': 1 };

    // Empty string where we can put out winner. 
    this.result = '';
    //checks if the hand of player1 is higher that the hand of player 2
    if(this.player1Result.score > this.player2Result.score){
      this.result = this.player1Name;
    } else if(this.player1Result.score < this.player2Result.score){
      //checks is player 2 hand is higher that player 1
      this.result = this.player2Name;
    } else{
      // if booth players roll the same handtypes, example booth rolls fullhouse, we need to check who has the better hand. (example: full house of A and K, beats full house of Q and 8)
      
      // tieBraker[0] targets the strongest value inside the array, and the [0] after [0] get the first index inside that array (the face). Then the values check inside the translated letters, and uses that face we extracted (A), and sees that this is a number 6 face(strongest).
      this.player1TieDice = values[this.player1Result.tieBraker[0][0]]; 
      this.player2TieDice = values[this.player2Result.tieBraker[0][0]];
      
      // Checks if player 1 rolled higer pair than player 2, if so player 1 win
      if(this.player1TieDice > this.player2TieDice){
        this.result = this.player1Name;
      } else if(this.player1TieDice < this.player2TieDice){
        // Checks if player 2 rolled a higher pair than playerr 1, if so player 2 wins. 
        this.result = this.player2Name;
      } else{
        this.result = "Draw";
      }
    }

    
    if(this.result === this.player1Name){
      this.player1Wins++; // if player1 wins, we increment their wins by one
    } else if(this.result === this.player2Name){
      this.player2Wins++; //if player2 wins, we increment their wins by one
    }

    // maxRoundTarget is to calculate how many rounds needed to win to win the game. Example: If we play a best of 5, we calculate 5 devided by 2, then we round it up to the nearest int, which is 3. Then the maxRoundTarget has become 3, and the first player to win 3 games is the champion. 
    this.maxRoundTarget = Math.ceil(this.maxRounds / 2);

    // if player 1 and 2 has reached the maxRoundTarget we fire the matchDecider event
    if(this.player1Wins >= this.maxRoundTarget || this.player2Wins >= this.maxRoundTarget){
      this.#fireMatchDecider();
    } else{
      // if there is still rounds available to play, we play as usual. 
      this.shadowRoot.querySelector("#nextRoundBtn").disabled = false;
      this.#fireRoundDecided();
    }
    console.log(`Winner is ${this.result}`);
  }


  get player1Name(){ // Gets the player 1 name of the document html
    return this.getAttribute('player1');
  }
  get player2Name(){ // Gets the player 1 name of the document html
    return this.getAttribute('player2')
  }
  get includeStraight(){ // checks if we have isStraight enables in the document html
    return this.getAttribute('include-straight');
  }
  #checkForStraightAllowed(){ // Checks if we are allaws straight to be counted. 
    const isAllowed = this.includeStraight !== null && this.includeStraight !== 'false';// we make a variable stat stores the allowed value, because we checks if the get includeStraight is not null, or not 'false'
    this.straight = isAllowed ? 'include-straight="true"' : ''; // if it is allowed, we ensures that it is set to true, else we set an empty string, meaning it is false. 
  }
  // HTML template!
  #getTemplate(){
    return `
      <link rel="stylesheet" href="./assets/style.css">
      <section id="start_game">
        <label for="matchLength">Best of:</label>
        <select id="matchLength">
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
        <button id="startBtn">Start Game</button>
        <button disabled id="nextRoundBtn">Next Round</button>
        <span id="current_round">Current round: ${this.currentRound}</span>
      </section>
      <section id="players">
        <dice-poker-player ${this.straight} id="player1" name="${this.player1Name}"></dice-poker-player>
        <dice-poker-player ${this.straight} id="player2" name="${this.player2Name}"></dice-poker-player>
      </section>
    `;
  }


  /* Events */
  #fireMatchDecider(){
    this.dispatchEvent(new CustomEvent('dp:match-decided', { // fires when there is a winner, and gives the winner namme, and player 1 & 2´s wins score!
      detail: {
        champion: this.result, // Winner name
        scores: {
          player1: this.player1Wins, // player 1 win score
          player2: this.player2Wins // Player 2 win score
        }
      },
      bubbles: true,// Allows event to bubble up the DOM
      composed: true// Allows event to cross shadowDom boundaries
    }));
  }
  #fireRoundDecided(){ // Fires when a round is done. gives all these details to the monitor component
    this.dispatchEvent(new CustomEvent('dp:round-decided', {
      detail: {
        winner: this.result, // winner of the round
        scores: {
          player1: this.player1Wins, // player 1 wins score
          player2: this.player2Wins // player 2 wins score
        },
        hands: {
          player1: {
            name: this.player1Name, // player 1 name
            face: this.player1Result.faces, // player 1´s hand faces
            handType: this.player1Result.handType // player 1 handtype!
          },
          player2: {
            name: this.player2Name, // player 2 name
            face: this.player2Result.faces, // player 2´s hand faces
            handType: this.player2Result.handType // Player. 2 handtype
          }
        },
      },
      bubbles: true,// Allows event to bubble up the DOM
      composed: true // Allows event to cross shadowDom boundaries
    }));
  }
  #fireRoundEvent(){ // Fires when a new round to player 1 is started.
    this.dispatchEvent(new CustomEvent('dp:round-start', {
      detail: {
        round: ++this.currentRound, // increments the rounds
        // checks if the player index is 0, if so we display player 1 name, else we display player 2 anme
        player: (this.activePlayerIndex === 0) ? this.player1Name : this.player2Name,
        // The number of rolls remaining (static number, could not figure out how to decrement it)
        rollsRemaining: this.rollsRemaining,
      },
      bubbles: true, // Allows event to bubble up the DOM
      composed: true
    }));
    this.shadowRoot.querySelector('#current_round').textContent = `Current round: ${this.currentRound}`;
  }
  #fireTurnChangeEvent(){ // Fires chen turn changes, when player 2´s turn. 
        this.dispatchEvent(new CustomEvent('dp:turn-changed', {
      detail: {
        // if index is 0, then it is player1, else it is player2. 
        player: (this.activePlayerIndex === 0) ? this.player1Name : this.player2Name,
        rollsRemaining: this.rollsRemaining,
      },
        bubbles: true,
        composed: true
    }));
  }
  #eventListners(){
    this.shadowRoot.addEventListener('dp:roll-executed', (e) =>{
      this.#handleRoll(e); // When a roll is exected (rolled), we handle the roll. checks how many times we have pressed the roll button
    })

    this.shadowRoot.querySelector('#startBtn').addEventListener('click', () => {
      this.#startGame(); // When we click on start game button, we start the official game. 

      this.shadowRoot.addEventListener('dp:player-turn-end', () => {
        this.#endTurn(); // If a player chooses to end their turn before 3 rolls, we fires the end turn method! 
      })

      this.shadowRoot.querySelector('#nextRoundBtn').addEventListener('click', () =>{
        // When we are done with a round, and want to move over to the next round! 
        this.#nextRound();
      });
    });
  };
}

customElements.define('dice-poker-board', DicePokerBoard);
