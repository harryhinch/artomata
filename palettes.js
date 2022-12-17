// v1.1.0

var palettes = {};

palettes["Whitepaper"] = {
  type: 'GRADIENT',
  start: [32, 32, 37],
  end: [200, 200, 220],
  powerfactor: 0.5,
  background: 'white',
  machinecolor: '#000',
};

palettes["Charcoal"] = {
  type: 'GRADIENT',
  start: [220, 220, 220],
  end: [32, 32, 32],
  powerfactor: 2,
  background: '#080808',
  machinecolor: '#fff',
};


palettes["Virtual Boy"] = {
  type: 'GRADIENT',
  start: [238, 0, 0],
  end: [64, 0, 0],
  powerfactor: 2,
  background: '#200',
  machinecolor: '#f00',
};

palettes["Matrix"] = {
  type: 'GRADIENT',
  start: [24, 238, 0],
  end: [12, 64, 0],
  powerfactor: 2,
  background: '#040a00',
  machinecolor: '#0f0',
};

palettes["Blue Retro"] = {
  type: 'GRADIENT',
  start: [0, 128, 238],
  end: [32, 48, 64],
  powerfactor: 2,
  background: '#123',
  machinecolor: '#3af',
};

palettes["Sunset"] = {
  type: 'HSVGRADIENT',
  start: [1.15, 1, 1],
  end: [0.75, 0.8, 1],
  powerfactor: 1,
  background: 'rgb(127, 55, 199)',
  machinecolor: 'rgb(255, 240, 20)',
};

palettes["Lush"] = {
  type: 'HSVGRADIENT',
  start: [0.35, 1, 1],
  end: [0.65, 1, 1],
  powerfactor: 1.75,
  background: 'rgb(0, 0, 140)',
  machinecolor: 'rgb(0, 255, 26)',
};

palettes["Vivid Rainbow"] = {
  type: 'HSVGRADIENT',
  start: [0, 1, 1],
  end: [0.88, 1, 1],
  powerfactor: 1,
  background: 'rgb(0, 0, 0)',
  machinecolor: 'rgb(255, 255, 255)',
};

palettes["Pastel Rainbow"] = {
  type: 'HSVGRADIENT',
  start: [0, 0.33, 1],
  end: [0.88, 0.33, 1],
  powerfactor: 1,
  background: 'rgb(228, 237, 250)',
  machinecolor: 'rgb(255, 255, 255)',
};

palettes["PICO-8"] = {
  type: 'LIST_SHUFFLE',
  colors: ['#7E2553', '#29ADFF', '#008751', '#1D2B53', '#AB5236', '#FF004D', '#FF77A8', '#00E436', '#C2C3C7', '#FFEC27', '#5F574F', '#83769C', '#FFCCAA', '#FFA300', '#FFF1E8'],
  background: '#000',
  machinecolor: '#FFF1E8',
} 

palettes["CGA Eyesore"] = {
  type: 'LIST',
  colors: ['#f00', '#0f0', '#00f', '#0ff', '#ff0', '#f0f', '#f08', '#080', '#008', '#08f', '#8f0', '#80f', '#888', '#f88', '#0f8'],
  background: '#000',
  machinecolor: '#fff',
};