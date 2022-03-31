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
  GLIDER_RU: 'GLIDER_RU',
  GLIDER_LU: 'GLIDER_LU',
  GLIDER_RD: 'GLIDER_RD',
  GLIDER_LD: 'GLIDER_LD',
  Hivenudger: 'Hivenudger',
}

class Builder {
  constructor(matrix) {
    this.matrix = matrix;
    this.build = constants.GLIDER_RU;
  }

  updateMatrix = (matrix) => {
    this.matrix = matrix;
  }

  buildGliderRU = (coords) => {
    const coordsBuild = [
      {y: coords.y, x: coords.x},
      {y: coords.y + 1, x: coords.x},
      {y: coords.y + 1, x: coords.x + 1},
      {y: coords.y + 2, x: coords.x + 1},
      {y: coords.y + 2, x: coords.x - 1},
    ];
    coordsBuild.forEach(el => {
      this.matrix[el.y][el.x] = true;
    });
    return coordsBuild;
  }

  buildGliderLU = (coords) => {
    const coordsBuild = [
      {y: coords.y, x: coords.x},
      {y: coords.y + 1, x: coords.x},
      {y: coords.y, x: coords.x + 1},
      {y: coords.y, x: coords.x + 2},
      {y: coords.y + 2, x: coords.x + 1},
    ];
    coordsBuild.forEach(el => {
      this.matrix[el.y][el.x] = true;
    });
    return coordsBuild;
  }

  buildGliderRD = (coords) => {
    const coordsBuild = [
      {y: coords.y, x: coords.x},
      {y: coords.y, x: coords.x + 2},
      {y: coords.y + 1, x: coords.x + 1},
      {y: coords.y + 1, x: coords.x + 2},
      {y: coords.y + 2, x: coords.x + 1},
    ];
    coordsBuild.forEach(el => {
      this.matrix[el.y][el.x] = true;
    });
    return coordsBuild;
  }

  buildGliderLD = (coords) => {
    const coordsBuild = [
      {y: coords.y, x: coords.x + 2},
      {y: coords.y + 1, x: coords.x},
      {y: coords.y + 1, x: coords.x + 1},
      {y: coords.y + 2, x: coords.x + 1},
      {y: coords.y + 2, x: coords.x + 2},
    ];
    coordsBuild.forEach(el => {
      this.matrix[el.y][el.x] = true;
    });
    return coordsBuild;
  }

  buildHivenudger = (coords) => {
    const coordsBuild = [
      {y: coords.y, x: coords.x},
      {y: coords.y, x: coords.x + 1},
      {y: coords.y, x: coords.x + 2},
      {y: coords.y, x: coords.x + 3},
      {y: coords.y, x: coords.x + 9},
      {y: coords.y, x: coords.x + 12},
      {y: coords.y + 1, x: coords.x},
      {y: coords.y + 1, x: coords.x + 4},
      {y: coords.y + 1, x: coords.x + 8},
      {y: coords.y + 2, x: coords.x + 0},
      {y: coords.y + 2, x: coords.x + 8},
      {y: coords.y + 2, x: coords.x + 12},
      {y: coords.y + 3, x: coords.x + 1},
      {y: coords.y + 3, x: coords.x + 4},
      {y: coords.y + 3, x: coords.x + 8},
      {y: coords.y + 3, x: coords.x + 9},
      {y: coords.y + 3, x: coords.x + 10},
      {y: coords.y + 3, x: coords.x + 11},
      {y: coords.y + 5, x: coords.x + 5},
      {y: coords.y + 5, x: coords.x + 6},
      {y: coords.y + 6, x: coords.x + 5},
      {y: coords.y + 6, x: coords.x + 6},
      {y: coords.y + 7, x: coords.x + 5},
      {y: coords.y + 7, x: coords.x + 6},
      {y: coords.y + 9, x: coords.x + 1},
      {y: coords.y + 9, x: coords.x + 4},
      {y: coords.y + 9, x: coords.x + 8},
      {y: coords.y + 9, x: coords.x + 9},
      {y: coords.y + 9, x: coords.x + 10},
      {y: coords.y + 9, x: coords.x + 11},
      {y: coords.y + 10, x: coords.x},
      {y: coords.y + 10, x: coords.x + 8},
      {y: coords.y + 10, x: coords.x + 12},
      {y: coords.y + 11, x: coords.x},
      {y: coords.y + 11, x: coords.x + 4},
      {y: coords.y + 11, x: coords.x + 8},
      {y: coords.y + 12, x: coords.x},
      {y: coords.y + 12, x: coords.x + 1},
      {y: coords.y + 12, x: coords.x + 2},
      {y: coords.y + 12, x: coords.x + 3},
      {y: coords.y + 12, x: coords.x + 9},
      {y: coords.y + 12, x: coords.x + 12},
    ];
    coordsBuild.forEach(el => {
      this.matrix[el.y][el.x] = true;
    });
    return coordsBuild;
  }

  constructBuilding = (coords) => {
    switch (this.build) {
      case constants.GLIDER_RU:
        return this.buildGliderRU(coords);
      case constants.GLIDER_LU:
        return this.buildGliderLU(coords);
      case constants.GLIDER_RD:
        return this.buildGliderRD(coords);
      case constants.GLIDER_LD:
        return this.buildGliderLD(coords);
        case constants.Hivenudger:
        return this.buildHivenudger(coords);
      default: return;
    }
  }

  buildElementsCreator = (name) => {
    const div = document.createElement('div');
    div.classList.add('buildElement');
    div.textContent = name;
    div.addEventListener('click', () => {
      this.build = name;
      currentBuild.textContent = name;
      builds.classList.add('d-none');
    });

    buildElements.append(div);
  }

  init = () => {
    Object.keys(constants).forEach(el => {
      this.buildElementsCreator(constants[el]);
    });
  }

}

const game = new Game(getSize());
game.init();
game.render();
game.addListeners();
