import json from './constants';

const constants = JSON.parse(json);

const buildElements = document.querySelector('#buildElements');
const currentBuild = document.querySelector('#currentBuild');
const builds = document.querySelector('#builds');

export default class Builder {
  constructor(matrix) {
    this.matrix = matrix;
    this.name = '101';
  }

  updateMatrix = (matrix) => {
    this.matrix = matrix;
  };

  build = (coords, schema) => {
    schema.forEach((el) => {
      this.matrix[el[0] + coords.y][el[1] + coords.x] = true;
    });
    return schema.map((el) => ({ y: el[0] + coords.y, x: el[1] + coords.x }));
  };

  constructBuilding = (coords) => {
    let name = this.name.toUpperCase();
    name = name.replace(' ', '_').trim();
    return this.build(coords, constants[name].schema);
  };

  buildElementsCreator = (name) => {
    const div = document.createElement('div');
    div.classList.add('buildElement');
    div.textContent = constants[name].name;
    div.addEventListener('click', () => {
      this.name = name;
      currentBuild.textContent = constants[name].name;
      builds.classList.add('d-none');
    });

    buildElements.append(div);
  };

  init = () => {
    currentBuild.textContent = constants[this.name].name;
    Object.keys(constants).forEach((el) => {
      this.buildElementsCreator(el);
    });
  };
}
