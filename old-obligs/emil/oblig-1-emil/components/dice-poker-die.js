export default class DicePokerDie extends HTMLElement {
  constructor() {
    super(); // Initializes the HTMLElement class
    this.attachShadow({ mode: 'open' }); // Attaches the shadow dom
  };

  // Getters
  get face(){
    return this.getAttribute('face'); // Gets the face attribute from the html. Makes us read properties by looking at html attribute
  };
  get held(){
    return this.hasAttribute('held'); // checks if there is a held attribute, if it has, then we get it.
  };
  get dieId(){
    return this.getAttribute('die-id'); // gets the dieId attribute from the html
  };
  //Setters
  set face(value){
    this.setAttribute('face', value); // Updates the value of the existing attribute 
  };
  set held(value){
    if(value){
      this.setAttribute('held', ''); // if the value is true, set an empty string on it, and that acts like true
    } else{
      this.removeAttribute('held'); // If there is a false value, we make shure that held attribute is not there. 
    }
    this.#fireHeldEvent(); //! Comment here
  };
  set dieId(value){
    this.setAttribute('die-id', value); // Updates the die id of the existing attribute
  };

  static get observedAttributes(){
    // Browser looks for these attributes if there is any change. If they change, it will let attributeChangedCallback know!
    return ['face', 'held', 'die-id'];
  };
  attributeChangedCallback(name, oldValue, newValue){ //Is like a bridge. It notices attribute change and calls the updateVisuals
    if(oldValue === newValue) return; // If old value is same as newValue, do nothing!
    this.#updateVisual(name, newValue); //This findes the face element, and changes its text
  };
  connectedCallback(){ //! Get clearer comment
    this.#render(); // Renders the HTML
    this.addEventListener('click', () => {
      this.held = !this.held; // when we click an dice (holds it), it toggles the held status
    });
  };
  #render(){
    this.shadowRoot.innerHTML = this.#getTemplate(); // Renders the html page
  };

  #updateVisual(name, newValue){
    const diceFace = this.shadowRoot.querySelector("#face"); // Gets the id of face from the html element in getTemplate
    if(name === 'face'){ // If name argument is face
       if(diceFace !== null){ // and if there is a value inside where the id is face
        diceFace.textContent = newValue; // We displays the new value!

        // If the new value is A, K or 8, we set a class list so the text color is red
        if(newValue === 'A' || newValue === 'K' || newValue === '8'){
          diceFace.classList.add('faceRed');
        } else{
          diceFace.classList.remove('faceRed'); // Removes the class after new roll if there is a number that is not A, K or 8
        }
        // If the new value is Q, J or 7, we set a class list so the text color is black! 
        if(newValue === 'Q' || newValue === 'J' || newValue === '7'){
          diceFace.classList.add('faceBlack');
        } else{
          diceFace.classList.remove('faceBlack'); // Removes the class after new roll if there is a number that is not Q, J or 7
        }

       };
    };

    // We collect the id of container which is the parent container for the dices. Get this to apply visual changes (yellow border)
    const diceHeld = this.shadowRoot.querySelector("#container");

    // Checks if the held attribute changes. if so we toggle the visual highlight by adding class is-held
    if(name === 'held'){ 
      if(diceHeld){
        if(newValue !== null){ 
          diceHeld.classList.add("is-held");
        } else{
          // If there is no changes, we assure that the class is not assigned
          diceHeld.classList.remove("is-held");
        };
      };
    };
  };
    
  roll(){
    const faces = ['A', 'K', 'Q', 'J', '8', '7'];
    const randomIndex = Math.floor(Math.random() * faces.length); // Gives a random number between 0 and 5

    const newValue = faces[randomIndex]; // we attach the face to the matchingrandom number (e.g 0 = A) and we assign it to a variable
    this.face = newValue // The face (from the getter) is now assigned to the new value variable. 
    this.#fireRolledEvent(); // Tells that we have rolled. 
    return this.face; //displays the value
  };

  #getTemplate() {
    return `
      <link rel="stylesheet" href="./assets/style.css">
      <section id="container" class="${this.held ? 'is-held' : ''}"> <!-- if the dice was toggled, we assign the class name, else it is not toggled it gets an empty string which is false. -->
        <span id="face">${this.face || ''}</span> <!-- Displays the face to the dice, we need the || '', to set it empty at start, or it will say null! --> 
      </section>
    `;
  };

  #fireRolledEvent(){
    this.dispatchEvent(new CustomEvent('dp:die-rolled', { // Gives the faces to the handEvaluation method inside player component. 
      detail: {
          dieId: this.dieId,
          face: this.face
      },
      bubbles: true,
      composed: true
    }));
  };
  #fireHeldEvent(){
    this.dispatchEvent(new CustomEvent('dp:die-held-changed', { // is used in av eventlistner inside player component to check held dice. 
      detail: {
        dieId: this.dieId,
        held: this.held
      },
      composed: true,
      bubbles: true
    }));
  };
}


customElements.define('dice-poker-die', DicePokerDie);
