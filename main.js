// v1.1.0


var canvas;
var ctx;
var tape;

var arraySize = 32;
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


var currentPalette = palettes["Blue Retro"]; // from palletes.js
var ctrlarray = [];

function round_lerp (a, b, t) { return Math.round( (1 - t) * b + t * a ) }
function rgb_to_string(r, g, b) { return `rgb(${r}, ${g}, ${b})` }
function get_random_int(max) { return Math.floor(Math.random() * max) }

function blend_colors(start, end, t)
{
  let a_r, a_g, a_b, b_r, b_g, b_b, c_r, c_g, c_b;
  a_r = start[0]; a_g = start[1]; a_b = start[2];
  b_r = end[0];   b_g = end[1];   b_b = end[2];
  c_r = round_lerp(a_r, b_r, t);
  c_g = round_lerp(a_g, b_g, t);
  c_b = round_lerp(a_b, b_b, t);
  return rgb_to_string(c_r, c_g, c_b);
}

function generate_gradient(start, end, steps, powerfactor)
{
  if(steps <= 1) return [rgb_to_string(start[0], start[1], start[2])]
  let arr = [];
  for(let i = 0; i < steps; i++)
  {
    let t = Math.pow( 1.0-(i/(steps-1.0)), powerfactor);
    arr.push(blend_colors(start, end, t));
  }
  return arr;
}

// big thanks to: https://stackoverflow.com/a/6274381
Object.defineProperty(Array.prototype, 'shuffle', {
  value: function() {
      for (let i = this.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this[i], this[j]] = [this[j], this[i]];
      }
      return this;
  }
});


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

  SYMBOLS = new Array(SYMCOUNT);
  for (let i = 0; i < SYMCOUNT; i++)
    SYMBOLS[i]=i;  

  do_palette_change();


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
  if(col_index==0)
    ctx.fillStyle = currentPalette.background;
  else if(col_index>0)
    ctx.fillStyle = currentPalette.colors[col_index-1];
  else
    ctx.fillStyle = currentPalette.machinecolor;
  ctx.fillRect(x*gridSize+padding, y*gridSize+padding, gridSize, gridSize);
}

function redrawGrid(){
  ctx.fillStyle = currentPalette.background;
  ctx.fillRect(-2, -2, canvas.width+2, canvas.height+2);

  for (let y = 0; y < arraySize; y++) {
      for (let x = 0; x < arraySize; x++) {
          const i = y*arraySize + x;
          const g = tape[i];
          if(g == 0)
            ctx.fillStyle = currentPalette.background;
          else
            ctx.fillStyle = currentPalette.colors[g-1];
          ctx.fillRect(x*gridSize+padding, y*gridSize+padding, gridSize, gridSize);
      }
  }
}

function do_palette_change()
{
  let newPaletteName = document.querySelector("input[name=chosenpalette]:checked").value;
  currentPalette = palettes[newPaletteName];

  if(currentPalette.type == 'GRADIENT')
    currentPalette.colors = generate_gradient(currentPalette.start, currentPalette.end, SYMCOUNT-1, currentPalette.powerfactor);

  if(currentPalette.type == 'LIST_SHUFFLE')
    currentPalette.colors.shuffle();

  document.getElementById('artomata').style.backgroundColor = currentPalette.background;
  
  redrawGrid();
}


function controlOnInput(me) {
  document.getElementById(me.id + '_span').innerText = me.value;
}

function read_controls(){
  ctrlarray.forEach(ctrl => {
    if(ctrl.t == "INT")
      window[ctrl.v] = parseInt(document.getElementById(ctrl.i).value);
    if(ctrl.t == "FLOAT")
      window[ctrl.v] = parseFloat(document.getElementById(ctrl.i).value);
    if(ctrl.t == "STRING")
      window[ctrl.v] = document.getElementById(ctrl.i).value;
  });
}

window.onload = () => {
  h = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth)-40;
  document.getElementById('artomatacanvas').innerHTML = `<canvas id="canvas" width="${h}" height="${h}"></canvas>`;

  let paletteString = `<div class="palette-outer">`;
  let palRadioID = 0;

  for (let paletteName in palettes) {
    if (palettes.hasOwnProperty(paletteName)){let paletteLine = `<div class="palette-container">`;
      let palette = palettes[paletteName]
      
      let is_checked = currentPalette == palette ? " checked" : ""

      paletteLine += `<div class="palette-name"><input type="radio" name="chosenpalette" id="palradio${palRadioID}"
        value="${paletteName}" onchange="do_palette_change();"${is_checked}></input>
        <label for="palradio"${palRadioID}">${paletteName}</label></div>`;

      if(palette.type == 'GRADIENT')
        palette.colors = generate_gradient(palette.start, palette.end, 15, palette.powerfactor);

      paletteLine += `<div class="palette-preview"><span style="background: ${palette.machinecolor}"></span>`;
      palette.colors.forEach(color => {
        paletteLine += `<span style="background: ${color}"></span>`;
      });
      paletteLine += `<span style="background: ${palette.background}"></span></div></div>`;      
      paletteString += paletteLine;
      palRadioID++;
    }
  }

  document.getElementById('palettes').innerHTML = paletteString;
  
  
  function initControl(name, iname, varname, min_c, max_c, step_c, default_c, type_c){
    ctrlarray.push({i: iname, v: varname, t: type_c});
    let htmlstring = `<div class="slidecontainer"><p>${name}: <span id="${iname}_span">
      ${default_c}</span></p><input autocomplete="off" type="range" min="${min_c}" max="${max_c}"
      step="${step_c}" value="${default_c}" class="slider" id="${iname}" oninput="controlOnInput(this)"></div>`;
    return htmlstring;
  }
  let controls = [];
  controls.push(initControl("Number of Machines", "c_machines", 'MACHINES', 1, 10, 1, 3, 'INT'));
  controls.push(initControl("Number of Machine States", "c_states", 'STATES', 1, 10, 1, 2, 'INT'));
  controls.push(initControl("Number of Symbols", "c_symbols", 'SYMCOUNT', 2, 16, 1, 4, 'INT'));
  controls.push(initControl("Grid Size", "c_gridsize", 'arraySize', 16, 128, 2, 32, 'INT'));
  controls.push(initControl("Halt Chance", "c_haltchance", 'HALTCHANCE', 0, 0.01, 0.00005, 0.0001, 'FLOAT'));
  
  document.getElementById('settings').innerHTML = controls.join('\n');
  
  let playback = [];
  playback.push(`<button class="green" type="button" onclick="read_controls(); init_turing();">Restart</button>`);

  document.getElementById('playback').innerHTML = playback.join('\n');

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  init_turing();
  window.requestAnimationFrame(drawFrame);


};