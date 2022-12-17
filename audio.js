// v1.0.0

var audioController;
var notegroups = {};
var ACData = {
    volume: {type: 'float', default: 0.2, min: 0, max: 1, step: 0.005, inputname: 'Volume', unit: '%', scale: 100},
    legato: {type: 'bool', default: true, inputname: 'Legato'},
    notegroup: {type: 'choice', data: notegroups, default: '12TET Pentatonic Major', inputname: 'Notegroup'},
    transpose: {type: 'int', default: 0, min: -10, max: 10, step: 1, inputname: 'Note Shift', unit: '+-', scale: 1},
    basefreq: {type: 'int', default: 220, min: 50, max: 500, step: 1, inputname: 'Base Frequency', unit: 'hz', scale: 1},
    attack: {type: 'float', default: 0.02, min: 0, max: 1, step: 0.001, inputname: 'Voice Attack', unit: 'ms', scale: 1000},
    decay: {type: 'float', default: 0.15, min: 0, max: 1, step: 0.001, inputname: 'Voice Decay', unit: 'ms', scale: 1000},
    voicedelay: {type: 'float', default: 0.0, min: 0, max: 0.25, step: 0.0001, inputname: 'Strum Amount', unit: 'ms', scale: 1000},
    voicecount: {type: 'int', default: 3, min: 1, max: 4, step: 1, inputname: 'Voices', unit: '', scale: 1},
};

class AudioController {
    constructor() {
        this.context = new window.AudioContext();
        this.dest = this.context.destination;
        this.voices =  new Array(4);

        const fields = Object.keys(ACData);
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if(ACData[field].type == 'choice')
                this[field] = ACData[field].data[ACData[field].default];
            else
                this[field] = ACData[field].default;
        }
    }
    
    begin() {
        for(let i = 0; i<this.voices.length; i++){
            this.voices[i] = {};
            this.voices[i].delay = this.context.createDelay(1);
            this.voices[i].delay.connect(this.dest);
            this.voices[i].gain = this.context.createGain();
            this.voices[i].gain.gain.setValueAtTime(0, this.context.currentTime);
            this.voices[i].gain.connect(this.voices[i].delay);
            this.voices[i].osc = this.context.createOscillator();
            this.voices[i].osc.frequency.value = 100;
            this.voices[i].osc.connect(this.voices[i].gain);
            this.voices[i].osc.start(0);
        }
    }

    end() {
        for(let i = 0; i<this.voices.length; i++){
            this.voices[i].osc.disconnect(this.voices[i].gain);
            this.voices[i].gain.disconnect(this.voices[i].delay);
            this.voices[i].osc.stop(0);
            this.voices[i].delay.disconnect(this.dest);
        }
        this.context.close();
    }

    play(value, voice_index) {
        const voice = this.voices[voice_index];
        voice.osc.frequency.value = this.basefreq * this.#getnote(value+this.transpose);
        voice.delay.delayTime.setValueAtTime(this.voicedelay * voice_index, this.context.currentTime);
        voice.gain.gain.cancelScheduledValues(this.context.currentTime);
        voice.gain.gain.setValueAtTime(0, this.context.currentTime);
        voice.gain.gain.linearRampToValueAtTime(this.#constrain(this.volume), this.context.currentTime + this.attack);
        voice.gain.gain.linearRampToValueAtTime(0, this.context.currentTime + this.decay + this.attack);
    }

    #constrain(i, min=0, max=1) {
        return Math.min(max, Math.max(min, i));
    }

    #getnote(n) {
        let octave = 1;
        if(n<0) { 
            const sz = 1 + Math.floor(Math.abs(n) / this.notegroup.multipliers.length);
            octave = 1 / 2**sz;
            n += this.notegroup.multipliers.length*sz;
        } else
            octave = 1 + Math.floor(n / this.notegroup.multipliers.length);
        return  octave * this.notegroup.multipliers[n % (this.notegroup.multipliers.length)];
    }
}

function toggleAudio(me) {
  if (!audioController) {
    me.classList = 'toggled';
    me.innerHTML = `Stop Audio`;
    audioController = new AudioController();
    audioController.begin();

    const audioinputs = document.querySelectorAll(".audioslider, .audiobutton");
    audioinputs.forEach((audioinput) => {
      audioinput.disabled = false;
      // read values
      if(audioinput.classList.contains('slider'))
        audioSlider(audioinput);
      if(audioinput.classList.contains('button'))
        audioButton(audioinput);
    });

  } else {
    me.classList = '';
    me.innerHTML = `Start Audio`;
    audioController.end();
    audioController = undefined;

    const audioinputs = document.querySelectorAll(".audioslider, .audiobutton");
    audioinputs.forEach((audioinput) => {
      audioinput.disabled = true;
    });
  }
  
}

function createAudioInput(fieldname) {
  const field = ACData[fieldname];
  switch (field.type) {
    case 'float':
    case 'int':

    let default_valuetext = audioInputValFormatter(field, field.default);

    return `<div class="slidecontainer"><p>${field.inputname}: <span id="audio${fieldname}slider_span">${default_valuetext}</span></p>
    <input autocomplete="off" type="range" min="${field.min}" max="${field.max}" data-target="${fieldname}" disabled
    step="${field.step}" value="${field.default}" class="slider audioslider" id="audio${fieldname}slider" oninput="audioSlider(this)"></div>`

    case 'bool':

    return `<button type="button" id="audio${fieldname}button" onclick="audioButton(this);"
    data-target="${fieldname}" class="toggled audiobutton" disabled>${field.inputname}</button>`

    case 'choice':
    
    return `<div class="slidecontainer"><p>${field.inputname}: <span id="notegroupslider_span">${field.default}</span></p>
    <input autocomplete="off" type="range" min="0" max="${Object.keys(field.data).length-1}" data-target="notegroup" disabled
    step="1" value="${Object.keys(field.data).indexOf(field.default)}" class="slider audioslider" id="notegroupslider" oninput="audioSlider(this)"></div>`
    
  }
}

function audioSlider(me) {
  const field = ACData[me.dataset.target];

  if(field.type == "choice") {
    const choice_index = parseInt(me.value);
    const choice_key = Object.keys(field.data)[choice_index];
    audioController[me.dataset.target] = field.data[choice_key];
    document.getElementById(me.id + '_span').innerText = choice_key;
    return;
  }

  document.getElementById(me.id + '_span').innerText = audioInputValFormatter(field, me.value);
  audioController[me.dataset.target] = Number(me.value);
}

function audioButton(me) {
  me.classList.toggle('toggled'); 
  const state = me.classList.contains('toggled');
  audioController[me.dataset.target] = state;
}

function audioInputValFormatter(field, val){
  let format_v = Number(val);
  let precision = field.type == 'int' ? 0 : 1;
  if(field.scale > 1)
    format_v = (Number(val)*field.scale);

  if(precision>0)
    format_v = format_v.toFixed(precision); //.replace(`.${"0".repeat(precision)}`, "")
  else
    format_v = Math.round(format_v);

  let valuetext = `${format_v}${field.unit ?? ''}`;
  if(field.unit == '+-')
    valuetext = `${val>=0 ? "+":""}${format_v}`;

  return valuetext;
}

notegroups['Harmonic Series'] = {
    multipliers: [
        1,
        1.5,
    ],
};

notegroups['12TET Pentatonic Major'] = {
    multipliers: [
        1,
        1.122462,
        1.259921,
        1.498307,
        1.681793,
    ],
};

notegroups['12TET Pentatonic Minor'] = {
    multipliers: [
        1,
        1.189207,
        1.33484,
        1.498307,
        1.781797,
    ],
};

notegroups['12TET Major'] = {
    multipliers: [
        1,
        1.122462,
        1.259921,
        1.33484,
        1.498307,
        1.681793,
        1.887749,
    ],
};

notegroups['12TET Minor'] = {
    multipliers: [
        1,
        1.122462,
        1.189207,
        1.33484,
        1.498307,
        1.587401,
        1.781797,
    ],
};

notegroups['12TET Chromatic'] = {
    multipliers: [
        1,
        1.059463,
        1.122462,
        1.189207,
        1.259921,
        1.33484,
        1.414214,
        1.498307,
        1.587401,
        1.681793,
        1.781797,
        1.887749,
    ],
};

notegroups['5TET'] = {
    multipliers: [
        1,
        1.2,
        1.4,
        1.6,
        1.8
    ],
};

notegroups['7TET'] = {
    multipliers: [
        1,
        1.142857,
        1.285714,
        1.428571,
        1.571428,
        1.714285,
        1.857142,
    ],
};