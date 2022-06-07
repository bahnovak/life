import json from './constants';

const constants = JSON.parse(json);

const buildElements = document.querySelector('#buildElements');
const builds = document.querySelector('#builds');
const input = document.querySelector('#input');
const search = document.querySelector('#search');

export default class Builder {
  constructor(matrix, matrixX, lastcountX, lastcountY) {
    this.matrix = matrix;
    this.matrixX = matrixX;
    this.lastcountX = lastcountX;
    this.lastcountY = lastcountY;
    this.name = '101';
  }

  updateMatrix = (matrix) => {
    this.matrix = matrix;
  };

  getCorrectCoord = (shift, value, direction) => {
    if (direction === 'x') {
      if (shift + value > this.lastcountX) {
        return shift + value - this.lastcountX - 1;
      }
    }

    if (direction === 'y') {
      if (shift + value > this.lastcountY) {
        return shift + value - this.lastcountY - 1;
      }
    }

    return shift + value;
  };

  build = (coords, schema) => {
    schema.forEach((el) => {
      this.matrix[(this.getCorrectCoord(el[0], coords.y, 'y')) * this.matrixX + this.getCorrectCoord(el[1], coords.x, 'x')] = 1;
    });
    return schema.map((el) => ({ y: this.getCorrectCoord(el[0], coords.y, 'y'), x: this.getCorrectCoord(el[1], coords.x, 'x') }));
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
      input.placeholder = constants[name].name;
      builds.classList.add('d-none');
      input.value = '';
    });

    buildElements.append(div);
  };

  init = () => {
    search.addEventListener('click', () => {
      buildElements.innerHTML = '';

      const temp = Object.keys(constants);
      const filteredArray = temp.filter((el) => el.includes(input.value.toUpperCase()));
      filteredArray.forEach((el) => {
        this.buildElementsCreator(el);
      });
    });
    input.placeholder = constants[this.name].name;
    Object.keys(constants).forEach((el) => {
      this.buildElementsCreator(el);
    });
  };
}
