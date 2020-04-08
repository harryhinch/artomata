// v0.1.0


var canvas;// = $('#canvas')[0];
var ctx;// = canvas.getContext('2d');
var tape;

var arraySize = 48;
var gridSize;
var canvasSize;
var padding;
var allmachines;

var TAPE_SIZE = (arraySize * arraySize);
var SYMCOUNT = 4;
var SYMBOLS = [0,1,2,3];
var C_LEFT = -1;
var C_RIGHT = 1;
var C_UP = arraySize;
var C_DOWN = -arraySize;
var h;

var MACHINES = 2;
var STATES = 2;
var HALTCHANCE = 0.0001;
var STATE_DIRS = [C_LEFT, C_RIGHT, C_UP, C_DOWN];

var colors = ['black', 'red', 'lime', 'blue', 'aqua', 'yellow', 'fushcia', 'maroon', 'green', 'navy', 'teal', 'olive', 'purple', 'gray', 'silver', 'white'];
var machinecolor = 'white' 

var ctrlarray = [];

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

}

function init_turing(){

  tape = new Uint8Array(arraySize*arraySize);

  //arraySize = 48;
  gridSize = Math.floor(h/arraySize);
  canvasSize = gridSize*arraySize;
  padding = Math.floor((h - canvasSize)/2);

  
  TAPE_SIZE = (arraySize * arraySize);
  C_UP = arraySize;
  C_DOWN = -arraySize;

  STATE_DIRS = [C_LEFT, C_RIGHT, C_UP, C_DOWN];

  //var SYMCOUNT = 4;
  SYMBOLS = new Array(SYMCOUNT);
  for (let i = 0; i < SYMCOUNT; i++)
    SYMBOLS[i]=i;  


  ctx.fillStyle = "#111";
  ctx.fillRect(-1, -1, canvasSize+100, canvasSize+100);

  ctx.fillStyle = colors[0]
  ctx.fillRect(padding, padding, canvasSize, canvasSize);

  allmachines = new Array(MACHINES)
  for (let i = 0; i < MACHINES; i++) {
      allmachines[i] = new TuringMachine();
      allmachines[i].init(Math.floor(TAPE_SIZE/2 + arraySize/2));
  }
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
  if(col_index>=0)
    ctx.fillStyle = colors[col_index];
  else
    ctx.fillStyle = machinecolor;
  ctx.fillRect(x*gridSize+padding, y*gridSize+padding, gridSize, gridSize);
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

function read_controls(){
  ctrlarray.forEach(ctrl => {
    if(ctrl.t == "INT")
      window[ctrl.v] = parseInt($("#"+ctrl.i).val());
    if(ctrl.t == "FLOAT")
      window[ctrl.v] = parseFloat($("#"+ctrl.i).val());
    if(ctrl.T == "STRING")
      window[ctrl.v] = $("#"+ctrl.i).val();
  });
}

$(function() {
  h = $("body").height()-2;
  $("app").html("<canvas id=\"canvas\" width=\""+h+"\" height=\""+h+"\"></canvas>");

  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');

  init_turing();
  window.requestAnimationFrame(drawFrame);

  
  function initControl(name, iname, varname, min_c, max_c, step_c, default_c, type_c){
    ctrlarray.push({i: iname, v: varname, t: type_c});
    let htmlstring = "<div class=\"slidecontainer\"><p>"+name+": <span id=\""+iname+"_span\">"+default_c+"</span></p>";
    htmlstring+= "<input autocomplete=\"off\" type=\"range\" min=\""+min_c+"\" max=\""+max_c+"\" step=\""+step_c+"\" value=\""+default_c+"\" ";
    htmlstring+= "class=\"slider\" id=\""+iname+"\"></div>\n";
    return htmlstring;
  }
  ctrlstring = "";
  ctrlstring += initControl("Number of Machines", "c_machines", 'MACHINES', 1, 10, 1, 2, 'INT');
  ctrlstring += initControl("Number of Machine States", "c_states", 'STATES', 1, 10, 1, 2, 'INT');
  ctrlstring += initControl("Number of Symbols", "c_symbols", 'SYMCOUNT', 2, 16, 1, 4, 'INT');
  ctrlstring += initControl("Grid Size", "c_gridsize", 'arraySize', 16, 128, 2, 48, 'INT');
  ctrlstring += initControl("Halt Chance", "c_haltchance", 'HALTCHANCE', 0, 0.01, 0.00005, 0.0001, 'FLOAT');

  ctrlstring += "<button type=\"button\" onclick=\"read_controls(); init_turing();\">Start</button>\n";
  $("controls").html(ctrlstring);

  $("input").on("input", function() {
    $("#"+this.id+"_span").html(this.value);
  })
});