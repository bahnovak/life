import './style.css';
import Builder from './modules/Builder';

const root = document.querySelector('#root');
const context = root.getContext('2d');
const canvasWrap = document.querySelector('.canvasWrap');

const start = document.querySelector('#start');
const clear = document.querySelector('#clear');
const chooseBuild = document.querySelector('#chooseBuild');
const close = document.querySelector('#close');
const checkbox = document.querySelector('#checkbox');

const builds = document.querySelector('#builds');

const getMatrix = ({ x, y }) => {
  const matrix = [];

  for (let i = 0; i < y; i += 1) {
    matrix.push([]);
    for (let j = 0; j < x; j += 1) {
      matrix[i].push(false);
    }
  }

  return matrix;
};

const getSize = () => ({
  x: Math.floor(canvasWrap.clientWidth / 10),
  y: Math.floor(canvasWrap.clientHeight / 10),
});

class Game {
  constructor({ x, y }) {
    this.sizeX = x;
    this.sizeY = y;
    this.ratio = 5;
    this.canvasSizeX = Math.floor(this.sizeX * this.ratio);
    this.canvasSizeY = Math.floor(this.sizeY * this.ratio);
    this.matrixTemplate = JSON.stringify(getMatrix({ x: this.canvasSizeX, y: this.canvasSizeY }));
    this.matrix = JSON.parse(this.matrixTemplate);
    this.isPause = true;
    this.isBuild = false;
    this.snapshot = new Set();
    this.builder = new Builder(this.matrix);
  }

  checkNeighbours = (i, j) => {
    let count = 0;
    const lastCountX = this.canvasSizeX - 1;
    const lastCountY = this.canvasSizeY - 1;

    const incrementCount = () => {
      count += 1;
    };

    // Left Up

    if (i === 0 && j === 0 && this.matrix[lastCountY][lastCountX]) {
      incrementCount();
    }

    if (i === 0 && j > 0 && this.matrix[lastCountY][j - 1]) {
      incrementCount();
    }

    if (j === 0 && i > 0 && this.matrix[i - 1][lastCountX]) {
      incrementCount();
    }

    if (i > 0 && j > 0 && this.matrix[i - 1][j - 1]) {
      incrementCount();
    }

    // Up

    if (i === 0 && this.matrix[lastCountY][j]) {
      incrementCount();
    }

    if (i > 0 && this.matrix[i - 1][j]) {
      incrementCount();
    }

    // Right Up

    if (j === lastCountX && i === 0 && this.matrix[lastCountY][0]) {
      incrementCount();
    }

    if (j < lastCountX && i === 0 && this.matrix[lastCountY][j + 1]) {
      incrementCount();
    }

    if (j === lastCountX && i > 0 && this.matrix[i - 1][0]) {
      incrementCount();
    }

    if (i > 0 && j < lastCountX && this.matrix[i - 1][j + 1]) {
      incrementCount();
    }

    // Left

    if (j === 0 && this.matrix[i][lastCountX]) {
      incrementCount();
    }

    if (j > 0 && this.matrix[i][j - 1]) {
      incrementCount();
    }

    // Right

    if (j === lastCountX && this.matrix[i][0]) {
      incrementCount();
    }

    if (j < lastCountX && this.matrix[i][j + 1]) {
      incrementCount();
    }

    // Left Down

    if (j === 0 && i === lastCountY && this.matrix[0][lastCountX]) {
      incrementCount();
    }

    if (i === lastCountY && j > 0 && this.matrix[0][j - 1]) {
      incrementCount();
    }

    if (j === 0 && i < lastCountY && this.matrix[i + 1][lastCountX]) {
      incrementCount();
    }

    if (i < lastCountY && j > 0 && this.matrix[i + 1][j - 1]) {
      incrementCount();
    }

    // Down

    if (i === lastCountY && this.matrix[0][j]) {
      incrementCount();
    }

    if (i < lastCountY && this.matrix[i + 1][j]) {
      incrementCount();
    }

    // Right Down

    if (i === lastCountY && j === lastCountX && this.matrix[0][0]) {
      incrementCount();
    }

    if (i < lastCountY && j === lastCountX && this.matrix[i + 1][0]) {
      incrementCount();
    }

    if (i === lastCountY && j < lastCountX && this.matrix[0][j + 1]) {
      incrementCount();
    }

    if (i < lastCountY && j < lastCountX && this.matrix[i + 1][j + 1]) {
      incrementCount();
    }

    return count;
  };

  changeStatusCell = (coords, isBuild = false) => {
    if (isBuild) {
      this.snapshot.add(`${coords.x}:${coords.y}`);
    } else {
      if (this.snapshot.has(`${coords.x}:${coords.y}`)) {
        this.snapshot.delete(`${coords.x}:${coords.y}`);
      } else {
        this.snapshot.add(`${coords.x}:${coords.y}`);
      }
      this.matrix[coords.y][coords.x] = !this.matrix[coords.y][coords.x];
    }
  };

  init = () => {
    root.style.width = `${this.sizeX * 10}px`;
    root.style.height = `${this.sizeY * 10}px`;
    root.width = this.canvasSizeX * 10;
    root.height = this.canvasSizeY * 10;
    this.builder.init();
  };

  render = () => {
    context.clearRect(0, 0, this.canvasSizeX * 10, this.canvasSizeY * 10);
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.canvasSizeX * 10, this.canvasSizeY * 10);
    this.snapshot.forEach((el) => {
      const coords = el.toString().split(':');
      context.fillStyle = '#00cc00';
      context.fillRect(+coords[0] * 10, +coords[1] * 10, 10, 10);
    });
  };

  startLife = (status = true) => {
    clearInterval(this.interval);
    const startLoop = () => {
      const newMatrix = JSON.parse(this.matrixTemplate);
      this.snapshot.clear();
      for (let i = 0; i < this.canvasSizeY; i += 1) {
        for (let j = 0; j < this.canvasSizeX; j += 1) {
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
    };

    this.interval = setInterval(startLoop, 20);

    if (!status) {
      clearInterval(this.interval);
    }
  };

  addListeners = () => {
    close.addEventListener('click', () => {
      builds.classList.add('d-none');
    });

    start.addEventListener('click', () => {
      this.startLife(this.isPause);
      this.isPause = !this.isPause;
      if (this.isPause) {
        start.textContent = 'Start';
      } else {
        start.textContent = 'Pause';
      }
    });

    clear.addEventListener('click', () => {
      this.matrix = JSON.parse(this.matrixTemplate);
      this.builder.updateMatrix(this.matrix);
      this.snapshot.clear();
      this.render();
    });

    root.addEventListener('click', (e) => {
      let x = e.offsetX;
      let y = e.offsetY;
      x = Math.floor(x / (10 / this.ratio));
      y = Math.floor(y / (10 / this.ratio));

      if (this.isBuild) {
        const coords = this.builder.constructBuilding({ x, y });
        coords.forEach((el) => {
          this.changeStatusCell(el, true);
        });
        this.render();
      } else {
        this.changeStatusCell({ x, y });
        this.render();
      }
    });

    chooseBuild.addEventListener('click', () => {
      builds.classList.remove('d-none');
    });

    checkbox.addEventListener('click', () => {
      this.isBuild = !this.isBuild;
    });
  };
}

const game = new Game(getSize());
game.init();
game.render();
game.addListeners();
