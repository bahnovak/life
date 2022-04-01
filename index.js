// https://conwaylife.com/wiki/

const root = document.querySelector('#root');
const context = root.getContext('2d');
const body = document.querySelector('body');
const canvasWrap = document.querySelector('.canvasWrap');

const start = document.querySelector('#start');
const clear = document.querySelector('#clear');
const chooseBuild = document.querySelector('#chooseBuild');
const close = document.querySelector('#close');
const checkbox = document.querySelector('#checkbox');

const builds = document.querySelector('#builds');
const buildElements = document.querySelector('#buildElements');
const currentBuild = document.querySelector('#currentBuild');


const getMatrix = ({x, y}) => {
  const matrix = [];

  for (let i = 0; i < y; i++) {
    matrix.push([]);
    for (let j = 0; j < x; j++) {
      matrix[i].push(false);
    }
  }

  return matrix
}

const getSize = () => {
  return {
    x: Math.floor(canvasWrap.clientWidth / 10),
    y: Math.floor(canvasWrap.clientHeight / 10),
  }
}

class Game {
  constructor({x, y}){
    this.sizeX = x;
    this.sizeY = y;
    this.ratio = 4;
    this.canvasSizeX = Math.floor(this.sizeX * this.ratio);
    this.canvasSizeY = Math.floor(this.sizeY * this.ratio);
    this.matrixTemplate = JSON.stringify(getMatrix({x: this.canvasSizeX, y: this.canvasSizeY}));
    this.matrix = JSON.parse(this.matrixTemplate);
    this.isPause = true;
    this.isBuild = false;
    this.snapshot = new Set();
    this.builder = new Builder(this.matrix);
  }

  checkNeighbours(i, j) {
    let count = 0;
    let lastCountX = this.canvasSizeX - 1;
    let lastCountY = this.canvasSizeY - 1;

    // Left Up

    if (i === 0 && j === 0) {
      this.matrix[lastCountY][lastCountX] && count++
    }

    if (i === 0  && j > 0) {
      this.matrix[lastCountY][j - 1] && count++
    }

    if (j === 0 && i > 0) {
      this.matrix[i - 1][lastCountX] && count++
    }

    if (i > 0 && j > 0) {
      this.matrix[i - 1][j - 1] && count++
    }

    // Up

    if (i === 0) {
      this.matrix[lastCountY][j] && count++
    }

    if (i > 0) {
      this.matrix[i - 1][j] && count++
    }

    // Right Up

    if (j === lastCountX && i === 0) {
      this.matrix[lastCountY][0] && count++
    }

    if (j < lastCountX && i === 0) {
      this.matrix[lastCountY][j + 1] && count++
    }

    if (j === lastCountX && i > 0) {
      this.matrix[i - 1][0] && count++
    }

    if (i > 0 && j < lastCountX) {
      this.matrix[i - 1][j + 1] && count++
    }

    // Left

    if (j === 0) {
      this.matrix[i][lastCountX] && count++
    }

    if (j > 0) {
      this.matrix[i][j - 1] && count++
    }

    // Right

    if (j === lastCountX) {
      this.matrix[i][0] && count++
    }

    if (j < lastCountX) {
      this.matrix[i][j + 1] && count++
    }

    // Left Down

    if (j === 0 && i === lastCountY) {
      this.matrix[0][lastCountX] && count++
    }

    if (i === lastCountY && j > 0) {
      this.matrix[0][j - 1] && count++
    }

    if (j === 0 && i < lastCountY) {
      this.matrix[i + 1][lastCountX] && count++
    }

    if (i < lastCountY && j > 0) {
      this.matrix[i + 1][j - 1] && count++
    }

    // Down

    if (i === lastCountY) {
      this.matrix[0][j] && count++
    }

    if (i < lastCountY) {
      this.matrix[i + 1][j] && count++
    }

    // Right Down

    if (i === lastCountY && j === lastCountX) {
      this.matrix[0][0] && count++
    }

    if (i < lastCountY && j === lastCountX) {
      this.matrix[i + 1][0] && count++
    }

    if (i === lastCountY && j < lastCountX) {
      this.matrix[0][j + 1] && count++
    }

    if (i < lastCountY && j < lastCountX) {
      this.matrix[i + 1][j + 1] && count++
    }

    return count
  }

  changeStatusCell = (coords, isBuild = false) => {
    if(isBuild) {
      this.snapshot.add(`${coords.x}:${coords.y}`);
    } else {
      this.snapshot.has(`${coords.x}:${coords.y}`)
        ? this.snapshot.delete(`${coords.x}:${coords.y}`)
        : this.snapshot.add(`${coords.x}:${coords.y}`);
      this.matrix[coords.y][coords.x] = !this.matrix[coords.y][coords.x];
    }
  }

  init = () => {
    root.style.width = `${this.sizeX * 10}px`;
    root.style.height = `${this.sizeY * 10}px`;
    root.width = this.canvasSizeX * 10;
    root.height = this.canvasSizeY * 10;
    this.builder.init();
  }

  render = () => {
    context.clearRect(0, 0, this.canvasSizeX * 10, this.canvasSizeY * 10);
    context.fillStyle = "black";
    context.fillRect(0, 0, this.canvasSizeX * 10, this.canvasSizeY * 10);
    this.snapshot.forEach(el => {
      const coords = el.toString().split(':');
      context.fillStyle = "#00cc00";
      context.fillRect(+coords[0] * 10, +coords[1] * 10, 10, 10);
    });
  }

  startLife = (status = true) => {
    clearInterval(this.interval);
    const start = () => {
      const newMatrix = JSON.parse(this.matrixTemplate);
      this.snapshot.clear();
      for (let i = 0; i < this.canvasSizeY; i++) {
        for (let j = 0; j < this.canvasSizeX; j++) {
          if (this.matrix[i][j]) {
            const countNeighbours = this.checkNeighbours(i, j);
            if (countNeighbours === 2 || countNeighbours === 3) {
              newMatrix[i][j] = true;
              this.snapshot.add(`${j}:${i}`);
            }
          }

          if (!this.matrix[i][j]) {
            const countNeighbours = this.checkNeighbours(i, j);
            if (countNeighbours === 3) {
              newMatrix[i][j] = true;
              this.snapshot.add(`${j}:${i}`);
            }
          }
        }
      }
      this.matrix = newMatrix;
      this.builder.updateMatrix(this.matrix);
      this.render();
    }

    this.interval = setInterval(start, 10)

    !status && clearInterval(this.interval)
  }

  addListeners = () => {
    close.addEventListener('click', () => {
      builds.classList.add('d-none');
    })

    start.addEventListener('click', () => {
      this.startLife(this.isPause);
      this.isPause = !this.isPause;
      if (this.isPause) {
        start.textContent = 'Start'
      } else {
        start.textContent = 'Pause'
      }
    })

    clear.addEventListener('click', () => {
      this.startLife(false);
      this.matrix = JSON.parse(this.matrixTemplate);
      this.snapshot.clear();
      this.render();
    })

    root.addEventListener('click', (e) => {
      let x = e.offsetX;
      let y = e.offsetY;
      x = Math.floor(x / (10 / this.ratio) );
      y = Math.floor(y / (10 / this.ratio));

      if (this.isBuild) {
        const coords = this.builder.constructBuilding({x, y});
        coords.forEach( el => {
          this.changeStatusCell(el, true)
        });
        this.render();
      } else {
        this.changeStatusCell({x, y});
        this.render();
      }
    })

    chooseBuild.addEventListener('click', () => {
      builds.classList.remove('d-none');
    })

    checkbox.addEventListener('click', () => {
      this.isBuild = !this.isBuild
    });
  }
}

const constants = {
  GLIDER_RU: {
    name: 'Glider Right Up',
    shema: [
      [0, 0],
      [1, 0], [1, 1],
      [2, 1], [2, -1],
    ]
  } ,
  GLIDER_LU: {
    name: 'Glider Left Up',
    shema: [
      [0, 0], [0, 1], [0, 2],
      [1, 0],
      [2, 1]
    ]
  },
  GLIDER_RD: {
    name: 'Glider Right Down',
    shema: [
      [0, 0], [0, 2],
      [1, 1], [1, 2],
      [2, 1],
    ]
  },
  GLIDER_LD: {
    name: 'Glider Left Down',
    shema: [
      [0, 2],
      [1, 0], [1, 1],
      [2, 1], [2, 2],
    ]
  },
  Hivenudger: {
    name: 'Hivenudger',
    shema: [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 9], [0, 12],
      [1, 0], [1, 4], [1, 8],
      [2, 0], [2, 8], [2, 12],
      [3, 1], [3, 4], [3, 8], [3, 9], [3, 10], [3, 11],
      [5, 5], [5, 6],
      [6, 5], [6, 6],
      [7, 5], [7, 6],
      [9, 1], [9, 4], [9, 8], [9, 9], [9, 10], [9, 11],
      [10, 0], [10, 8], [10, 12],
      [11, 0], [11, 4], [11, 8],
      [12, 0], [12, 1], [12, 2], [12, 3], [12, 9], [12, 12],
    ]
  },
  Blinker: {
    name: 'Blinker',
    shema: [
      [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
      [2, 0], [2, 5], [2, 7], [2, 12],
      [3, 0], [3, 5], [3, 7], [3, 12],
      [4, 0], [4, 5], [4, 7], [4, 12],
      [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
      [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
      [8, 0], [8, 5], [8, 7], [8, 12],
      [9, 0], [9, 5], [9, 7], [9, 12],
      [10, 0], [10, 5], [10, 7], [10, 12],
      [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10],
    ]
  }
}

class Builder {
  constructor(matrix) {
    this.matrix = matrix;
    this.name = constants.GLIDER_RU.name;
  }

  updateMatrix = (matrix) => {
    this.matrix = matrix;
  }

  build = (coords, shema) => {
    shema.forEach(el => {
      this.matrix[el[0] + coords.y][el[1] + coords.x] = true;
    });
    return shema.map(el => ({y: el[0] + coords.y, x: el[1] + coords.x}));
  }

  constructBuilding = (coords) => {
    switch (this.name) {
      case constants.GLIDER_RU.name:
        return this.build(coords, constants.GLIDER_RU.shema);
      case constants.GLIDER_LU.name:
        return this.build(coords, constants.GLIDER_LU.shema);
      case constants.GLIDER_RD.name:
        return this.build(coords, constants.GLIDER_RD.shema);
      case constants.GLIDER_LD.name:
        return this.build(coords, constants.GLIDER_LD.shema);
      case constants.Hivenudger.name:
        return this.build(coords, constants.Hivenudger.shema);
      case constants.Blinker.name:
        return this.build(coords, constants.Blinker.shema);
      default: return;
    }
  }

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
  }

  init = () => {
    Object.keys(constants).forEach(el => {
      this.buildElementsCreator(constants[el].name);
    });
  }

}

const game = new Game(getSize());
game.init();
game.render();
game.addListeners();
