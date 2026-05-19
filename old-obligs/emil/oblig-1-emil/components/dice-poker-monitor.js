export default class DicePokerMonitor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#render();
  };

  #render(){
    this.shadowRoot.innerHTML = this.#getTemplate(); // dipslays the html
    this.#eventLisners(); // sets the eventlistners
  };

  #getTemplate(){
    return `
      <link rel="stylesheet" href="./assets/style.css">
      <section id="wrapper">
        <h2>Scoreboard</h2>
        <div id="match_score"></div>
        <div id="current_status"></div>
        <div id="roll_executed"></div>
      </section>
    `;
  }

  #eventLisners(){
    const element = document.querySelector('dice-poker-board'); // finds the board element so the addEventListner works! 
    // Finds the player element trough the board element since we dont have the player component in index.html we cant use document
    const playerElement = element.shadowRoot.querySelectorAll('dice-poker-player');

    element.addEventListener('dp:round-start', (e) =>{ // Used for showing new round!
      this.currentRound = e.detail.round; // gets the current round.
      this.activePlayer = e.detail.player; // Gets the active player 
      this.rollsLeft = e.detail.rollsRemaining; // Gets the rolls remaining

      // Displays when it is player 1´s turn. 
      this.shadowRoot.querySelector("#current_status").textContent = `Round ${this.currentRound} - ${this.activePlayer}´s turn - You have up to ${this.rollsLeft} roll attempts!`;
    });


    element.addEventListener('dp:turn-changed', (e) => {
      setTimeout(()=>{
        this.activePlayer = e.detail.player; // Gets the active player 
        this.rollsLeft = e.detail.rollsRemaining; // Gets the rolls remaining
        
        //Displays when it is player 2´s turn. 
        // one second delay, then displays when it is player 2´s turn. 
        this.shadowRoot.querySelector("#current_status").textContent = `Round ${this.currentRound} - ${this.activePlayer}´s turn - You have up to ${this.rollsLeft} roll attempts!`;
      }, 1000);
    });


    playerElement.forEach(player =>{ // loops over booth players inside player component.
      player.addEventListener('dp:roll-executed', (e) => {
        const rolledFace = e.detail.faces.join(", ") // gets the rolled face, and converts it to string from array
        const heldFace = e.detail.held.join(", "); // Gets the rolled face if a dice is held and converts from array to string
        
        // Displays everytime players roll
        this.shadowRoot.querySelector("#roll_executed").textContent = `${this.activePlayer} rolled: ${rolledFace} and held: ${heldFace}`;
      });

    })

    element.addEventListener('dp:round-decided', (e)=>{
      this.player1Name = e.detail.hands.player1.name; // Gets player 1 name
      this.player2Name = e.detail.hands.player2.name; // Gets player2 name
      const player1Wins = e.detail.scores.player1; // gets player 1 win score
      const player2Wins = e.detail.scores.player2;// gets player 2 win score
      const player1HandType = e.detail.hands.player1.handType; // gets player 1 hand type
      const player2HandType = e.detail.hands.player2.handType;// gets player 2 hand type
      const result = e.detail.winner; // gets the round winner. 

      let winnerMsg = ""; // Will print out the round winner when found put
      let winningHandType = ""; // Prints out the hand type when found out
      if(result === this.player1Name){ // if winner is player1
        winningHandType = player1HandType; // Gets player 1´s handtype
      } else if(result === this.player2Name){ // if winner is player2
        winningHandType = player2HandType // Gets player 2´s handtype
      }
      if(result === "Draw"){ // If identical dices, its a draw. 
        winnerMsg = "Its a draw! This round did not count! Roll again";
      } else{ 
        winnerMsg = `Round winner: ${result} with a ${winningHandType}! Score is: ${player1Wins}-${player2Wins}`; // Prints out the found out winner and their handtype
      }
      this.shadowRoot.querySelector("#match_score").textContent = winnerMsg;
    });

    element.addEventListener('dp:match-decided', (e) =>{
      const champion = e.detail.champion; // Gets the winner name. 
      const player1Wins = e.detail.scores.player1; // Gets player 1 score
      const player2Wins = e.detail.scores.player2; // Get player 2 score

      // Displays when we have a winner. Takes the dp-round-decided´s place!
      this.shadowRoot.querySelector("#match_score").textContent = `${champion} wins the match ${player1Wins}-${player2Wins}`;
    });
  };  
}

customElements.define('dice-poker-monitor', DicePokerMonitor);
