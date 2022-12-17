// v1.1.0

class UnitData
{
  constructor() {
      this.write = 0;
      this.moveto = 0;
      this.nextstate = 0;
  }
  makerandom()
  {
      this.write = SYMBOLS[get_random_int(SYMBOLS.length)];
      this.moveto = STATE_DIRS[get_random_int(STATE_DIRS.length)];
      this.nextstate = get_random_int(STATES);
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
    this.lastwrite = 0;
    this.updatedwrite = false;
    this.states = new Array(STATES);

    for(let i = 0; i < STATES; i++)
        this.states[i] = new TuringState();
  }
  init(centerpos)
  {
    this.halted=false;
    this.pos = centerpos;
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
      this.updatedwrite = !(state_data.write == this.lastwrite);
      this.lastwrite = state_data.write;
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
        drawSquare(x,y,-1);
        x = this.lastpos%arraySize;
        y = Math.floor(this.lastpos/arraySize);
        drawSquare(x,y,tape[this.lastpos]);
    }
  }

  audio(audioController, voice_index) {
    if(audioController.legato && !this.updatedwrite) return;
    //if(this.lastwrite != 0)
      audioController.play(this.lastwrite, voice_index);
  }

}