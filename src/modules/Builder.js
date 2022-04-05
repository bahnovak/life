import json from './constants';

const constants = JSON.parse(json);

const buildElements = document.querySelector('#buildElements');
const currentBuild = document.querySelector('#currentBuild');
const builds = document.querySelector('#builds');

export default class Builder {
  constructor(matrix) {
    this.matrix = matrix;
    this.name = constants['101'].name;
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
    switch (this.name) {
      case constants['101'].name:
        return this.build(coords, constants['101'].schema);
      case constants['103P4H1V0.RLE'].name:
        return this.build(coords, constants['103P4H1V0.RLE'].schema);
      // case constants.GLIDER_RD.name:
      //   return this.build(coords, constants['101'].shema);
      // case constants.GLIDER_LD.name:
      //   return this.build(coords, constants['101'].shema);
      // case constants.Hivenudger.name:
      //   return this.build(coords, constants['101'].shema);
      // case constants.Blinker.name:
      //   return this.build(coords, constants['101'].shema);
      default:
        return [];
    }
  };

  buildElementsCreator = (name) => {
    const div = document.createElement('div');
    div.classList.add('buildElement');
    div.textContent = name;
    div.addEventListener('click', () => {
      this.name = name;
      currentBuild.textContent = name;
      builds.classList.add('d-none');
    });

    buildElements.append(div);
  };

  init = () => {
    Object.keys(constants).forEach((el) => {
      this.buildElementsCreator(constants[el].name);
    });
  };
}
