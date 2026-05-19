import DicePokerDie from "./dice-poker-die.js";

export default class DicePokerPlayer extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.isDiceHeld = {};  // when a user holds a die, it will be placed inside here. 
    }
    connectedCallback(){
        this.#render();
        this.#eventListners();
        this.#heldDices();
        this.#dieRolled();
    };

    #render(){
        this.shadowRoot.innerHTML = this.#getTemplate();
    }

    get name(){
        return this.getAttribute('name') || 'Player1'; // Player 1 is a fallback!
    }

    get score(){
        return this.getAttribute('score') || '0'; // 0 if there is no score! 
    }

    #getTemplate(){ 
        return `
            <link rel="stylesheet" href="./assets/style.css">
            <h2>${this.name}</h2>
            <section id="dice_container">
                <dice-poker-die die-id="0" owner="${this.name}"></dice-poker-die>
                <dice-poker-die die-id="1" owner="${this.name}"></dice-poker-die>
                <dice-poker-die die-id="2" owner="${this.name}"></dice-poker-die>
                <dice-poker-die die-id="3" owner="${this.name}"></dice-poker-die>
                <dice-poker-die die-id="4" owner="${this.name}"></dice-poker-die>
            </section>
            <section id="controls">
                <button disabled id="rollBtn">Roll</button>
                <button disabled id="endTurnBtn">Done</button>
            </section>
        `;
    }
    roll(){
        this.currentHand = {}; // Resets to 0, so the previous values do not affect the new roll. 
        this.dices = this.shadowRoot.querySelectorAll("dice-poker-die");
        this.dices.forEach(die =>{
            const diceId = die.getAttribute('die-id'); // get the attribute from the die component inside getTemplate over. 
            
            const checkHeld = this.isDiceHeld[diceId]; // Uses the gotten id to check status of it is held or not. 
            if(!checkHeld){ // If the dice id is not held, we roll! 
                die.roll();
            }
        });
        this.#fireExecutedEvent();

    };

    handEvaluation(){
        const values = {'A': 6, 'K': 5, 'Q': 4, 'J': 3, '8': 2, '7': 1} // give the poker order. for the system to know that A is higher than K and so fourth...
        this.dices = this.shadowRoot.querySelectorAll("dice-poker-die"); // gets all poker-die elements from html(5 components). This gives a nodelist of elements

        this.faces = Array.from(this.dices).map(die => die.face); // Gets the faces from the die component. Converts the nodelist into a regular array, and we map over it. Gives us an array of strings ['A', 'K'] etc..
        
        const faceValue = this.faces.map(face =>{ // goes trough every string in the faces array, and gives the numeric values from values variable! ['A', 'A', 'K'] becomes [6, 6, 5] etc...
            return values[face]; 
        });

        // checks on how many of each die we have. 
        // .reduce is transform array of faces into a single object. 
        const countDice = this.faces.reduce((accumulator, face) => { // looks at the faces array, and looks at a face. Example 'A'.
            if(!accumulator[face]){  // Checks the accumulator object if already have a K  in the object
                accumulator[face] = 1; // If we dont have a key for it, when sets the count to 1. example {'K': 1}
            } else{
                accumulator[face]++; // if we already have a key for it, we increment the count by one. Example we have rolled 2 'A'. The first one goes trough to the accumulator[face] = 1 since we dont have a key for it. The second one goes trough the incrament one, since we already have a key for it. Example: {'A': 2, 'K': 1, 'Q': 1, '7': 1}. 
            }
            return accumulator;
        }, {});


        const count = Object.values(countDice); // turns out countDice into game understanding. For example if countDice gave us {'A': 2, 'K': 2, 'Q': 1} the Object.value gives us [2, 2, 1]

        // the .sort((a, b) => b -a ) ensures us that the largest number will come first! Then we join them into a tring, so example we will get "221" from the example above
        const pattern = count.sort((a, b)=> b - a).join(""); // 
        
        // If booth playrs roll the same handtype (e.g, Poker) we need to check which one of it is the strongest pair. 
        //The Object entries converts our frequency object to an array of pairs. Like this {'A':2, 'Q': 3} = [['Q', 3] ['A', 2]] it always displays the highest number first! 
        const sortDice = Object.entries(countDice).sort((a, b) =>{
            const countDiff = b[1] - a[1]; // if the second index on booth array pairs is equal to 0 (e.g, same hand type) we go to the second rule which is returning the numeric value of the face. (e.g, if player rolled 'A' we return 6 and if player 2 rolled 'K' which is 5, we have the one who is bigger.)
            if(countDiff !== 0) return countDiff;
            return values[b[0]] - values[a[0]];
        });
        
        // Checks if we have a straight pattern. The .wort((a, b) => a - b) puts the number in acending order, and puts it to a string. If we have 7,8,j,q,k we checks the values from the faceValue (which mapped over the values to get the numberic value from the face) and the string comes to '12345'
        const straightPattern = faceValue.sort((a, b)=> a - b).join("");
        // Here we check if we have a straight with the values if 7,8,j,q,k or 8,j,q,k,a
        const isStraight = straightPattern === '12345' || straightPattern === '23456'; // Checks if it is a low straight or a high straight!
        
        // helper function
        // create a result variable, and it expects two pieces of information where we use it. We gave it gaveResult, which will hold the handType (e.g, "repóker", "full") and the score, which represent a number on how strong that hand is. 
        const result = (giveResult, score) => {
            return {
                faces: this.faces, // Checks for faces variable inside handEvaluation, and returns that! which is example 'A', 'K'
                handType: giveResult, // Taking the argument and assigns it a key name handtype
                score: score, // Takes the score argument, and assigns it a key name score
                tieBraker: sortDice // Checks for sortDice variable, inside handEvaluation,  but i am renaming it tieBraker. this will be used in the board component.
            };
        };
        // Evaluation Logic! 
        // The numbers are for score managment to give out who won the round!
        if(pattern === '5'){ // 5 alike
            return result("Repóker", 8); // 'repoker' is the giveResult, and the 8 is the score from result above! 
        } else if(pattern === '41'){ // 4 alike and 1 different
            return result("Póker", 7);
        } else if(pattern === '32'){ // three and two alike
            return result("Full", 6);
        }else if(isStraight && this.hasAttribute('include-straight')) {// either 7, 8, J, Q, K or 8, J, Q, K, A
            return result("Escalera", 5);
        }else if(pattern === '311'){ // three alike and two different
            return result("Trío", 4);
        } else if(pattern === '221'){ // two two alike and one different
            return result("Doble Pareja", 3);
        } else if(pattern === '2111'){  // two alike and three different
            return result("Pareja", 2);
        } else {
            return result("Carta Alta", 1);
        }
    };

    resetRound(){
        this.isDiceHeld = {}; // Clearing the held memory when going to a new round to it does not hold on to the old values from previous round. 
        this.#render();
        this.#eventListners();
    }

    setActiveButtons(isActive){
        const rollBtn = this.shadowRoot.querySelector("#rollBtn");
        const endTurn = this.shadowRoot.querySelector('#endTurnBtn');

        if(isActive){
            rollBtn.disabled = false;
            endTurn.disabled = false;
            this.shadowRoot.querySelector("#controls").classList.add('active');
        } else{
            rollBtn.disabled = true;
            endTurn.disabled = true;
            this.shadowRoot.querySelector("#controls").classList.remove('active');
        }
    }
    
    #dieRolled(){
        this.addEventListener('dp:die-rolled', (e) => {
            // gets the dieID and dieFace from the die-rolled custom event from die comp
            const dieId = e.detail.dieId;
            const dieFace = e.detail.face;
            this.currentHand[dieId] = dieFace;
            
            // checks if all five dicces have reported
            if(Object.keys(this.currentHand).length === 5){
                // Start to evaluate as soon as all five dices is rolled. 
                // if so, it is time to evaluate the hand in the method above. 
                this.handEvaluation();
            };
        });
    };

    #heldDices(){
        //Tracks which dice the user wants to hold.
        this.addEventListener('dp:die-held-changed', (e) =>{
            // gets the data if it is held or not, and which die is held 
            const held = e.detail.held;
            const dieId = e.detail.dieId;

            //! Updates the memory, check for a better description
            this.isDiceHeld[dieId] = held;
        });
    };
    #eventListners(){
        //gets the rollbutton from the html. 
        const rollBtn = this.shadowRoot.querySelector('#rollBtn');
        rollBtn.addEventListener('click', () => {
            this.roll(); // Triggers the physical roll loop
        });

        // gets the end turn button from the html
        const endTurn = this.shadowRoot.querySelector('#endTurnBtn');
        endTurn.addEventListener('click', () => {
            //Tells the board we are finished. Is connected to endRound in the board comp.
            this.#fireEndTurnEvent();
        });
    };

    
    #fireEndTurnEvent(){
        this.dispatchEvent(new CustomEvent('dp:player-turn-end', {
            detail: {
                name: this.name // Here is who finished! 
            },
            bubbles: true, // name of the player bubble up to board
            composed: true // Lets the player name escape this shadow DOM.
        }));
    }
    #fireExecutedEvent(){
        const diceHeld = Array.from(this.dices).filter(die => die.held).map(die => die.face); // When held, displays in an array ["A", "K"] etc...
        this.dispatchEvent(new CustomEvent('dp:roll-executed', {
            detail: {
                faces: this.faces, // returns the face
                held: diceHeld // Returns the face on held dices
            },
            bubbles: true, // face and held bubbles up
            composed: true // face and held escape this shadow DOM
        }));
    };


}

customElements.define('dice-poker-player', DicePokerPlayer);