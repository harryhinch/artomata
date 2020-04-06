const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const arraySize = 64;
const canvasSize = 640;
const gridSize = Math.floor(canvasSize/arraySize);

const TAPE_SIZE = (arraySize * arraySize);
const SYMBOLS = [0,1,2,3];
const C_LEFT = -1;
const C_RIGHT = 1;
const C_UP = arraySize;
const C_DOWN = -arraySize;

const MACHINES = 2;
const STATES = 2;
const HALTCHANCE = 0.0001;
const STATE_DIRS = [C_LEFT, C_RIGHT, C_UP, C_DOWN];

var tape = new Uint8Array(arraySize*arraySize);

const colors = ['black', 'red', 'lime', 'blue', 'white'];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

class UnitData
{
    constructor() {
        this.write = 0;
        this.moveto = 0;
        this.nextstate = 0;
    }
    makerandom()
    {
        this.write = SYMBOLS[getRandomInt(SYMBOLS.length)];
        this.moveto = STATE_DIRS[getRandomInt(STATE_DIRS.length)];
        this.nextstate = getRandomInt(STATES);
    }
}

class TuringState
{
  constructor() 
  {
    this.data = new Array(SYMBOLS.length);
    for(let i = 0; i<SYMBOLS.length; i++)
    this.data[i] = new UnitData();
  }
  init()
  {
    for(let i = 0; i<SYMBOLS.length; i++)
    this.data[i].makerandom();
  }
  calc(in_byte)
  {
    return this.data[in_byte];
  }
};

class TuringMachine
{
  constructor()
  {
    this.halted = false;
    this.current_state = 0;
    this.pos = 0;
    this.lastpos = 0;
    this.states = new Array(STATES);

    for(let i = 0; i < STATES; i++)
        this.states[i] = new TuringState();
  }
  init()
  {
    this.halted=false;
    this.pos = TAPE_SIZE/2 + gridSize/2;
    this.lastpos = this.pos;
    for(let i = 0; i < STATES; i++)
      this.states[i].init();
  }
  
  compute()
  {
    if(!this.halted)
    {
      this.lastpos = this.pos;
      let read_in = tape[this.pos];
      let state_data = this.states[this.current_state].calc(read_in);
      tape[this.pos] = state_data.write;
      this.pos = this.pos+state_data.moveto;

      if(this.pos>TAPE_SIZE-1)
        this.pos-=TAPE_SIZE;
      if(this.pos<0)
        this.pos+=TAPE_SIZE;

      if(this.current_state!=state_data.nextstate && Math.random()<HALTCHANCE)
        this.halted=true;
      this.current_state = state_data.nextstate;
    }
  }
  
  drawme()
  {
    if(!this.halted)
    {
        let x = this.pos%arraySize;
        let y = Math.floor(this.pos/arraySize);
        drawSquare(x,y,4);
        x = this.lastpos%arraySize;
        y = Math.floor(this.lastpos/arraySize);
        drawSquare(x,y,tape[this.lastpos]);
    }
  }
  
}

function init_turing(){
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    allmachines = new Array(MACHINES)
    for (let i = 0; i < MACHINES; i++) {
        allmachines[i] = new TuringMachine();
        allmachines[i].init();
    }

    window.requestAnimationFrame(drawFrame);
}


function drawFrame()
{   
    for (let i = 0; i < MACHINES; i++) {
        allmachines[i].compute();
    }
    for (let i = 0; i < MACHINES; i++) {
        allmachines[i].drawme();
    }
    
    window.requestAnimationFrame(drawFrame);
}

function drawSquare(x, y, col_index){
    ctx.fillStyle = colors[col_index];
    ctx.fillRect(x*gridSize, y*gridSize, gridSize, gridSize);
}

function redrawGrid(){
    for (let y = 0; y < arraySize; y++) {
        for (let x = 0; x < arraySize; x++) {
            const i = y*arraySize + x;
            const g = tape[i];
            ctx.fillStyle = colors[g];
            ctx.fillRect(x*gridSize, y*gridSize, gridSize, gridSize);
        }
    }
}

init_turing();