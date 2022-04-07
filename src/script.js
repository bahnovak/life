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
      matrix[i].push(0);
    }
  }

  return matrix;
};

const getSize = () => ({
  x: Math.floor(canvasWrap.clientWidth / 40) * 40,
  y: Math.floor(canvasWrap.clientHeight / 40) * 40,
});

class Game {
  constructor({ x, y }) {
    this.sizeX = x;
    this.sizeY = y;
    this.ratio = 2;
    this.matrixX = this.sizeX / this.ratio;
    this.matrixY = this.sizeY / this.ratio;
    this.matrixTemplate = JSON.stringify(getMatrix({ x: this.matrixX, y: this.matrixY }));
    this.matrix = JSON.parse(this.matrixTemplate);
    this.isPause = true;
    this.isBuild = false;
    this.builder = new Builder(this.matrix);
    this.matrixDraw = new Path2D();
  }

  checkNeighbours = (i, j) => {
    let count = 0;
    const lastCountX = this.matrixX - 1;
    const lastCountY = this.matrixY - 1;

    if ((i > 0) && (j > 0) && (i < lastCountY) && (j < lastCountX)) {
      count = this.matrix[i - 1][j - 1] + this.matrix[i - 1][j] + this.matrix[i - 1][j + 1]
      + this.matrix[i][j - 1] + this.matrix[i][j + 1] + this.matrix[i + 1][j - 1]
      + this.matrix[i + 1][j] + this.matrix[i + 1][j + 1];
      return count;
    }

    // Left Up

    if (i === 0 && j === 0 && this.matrix[lastCountY][lastCountX]) {
      count += 1;
    }

    if (i === 0 && j > 0 && this.matrix[lastCountY][j - 1]) {
      count += 1;
    }

    if (i > 0 && j === 0 && this.matrix[i - 1][lastCountX]) {
      count += 1;
    }

    if (i > 0 && j > 0 && this.matrix[i - 1][j - 1]) {
      count += 1;
    }

    // Up

    if (i === 0 && this.matrix[lastCountY][j]) {
      count += 1;
    }

    if (i > 0 && this.matrix[i - 1][j]) {
      count += 1;
    }

    // Right Up

    if (i === 0 && j === lastCountX && this.matrix[lastCountY][0]) {
      count += 1;
    }

    if (i === 0 && j < lastCountX && this.matrix[lastCountY][j + 1]) {
      count += 1;
    }

    if (i > 0 && j === lastCountX && this.matrix[i - 1][0]) {
      count += 1;
    }

    if (i > 0 && j < lastCountX && this.matrix[i - 1][j + 1]) {
      count += 1;
    }

    // Left

    if (j === 0 && this.matrix[i][lastCountX]) {
      count += 1;
    }

    if (j > 0 && this.matrix[i][j - 1]) {
      count += 1;
    }

    // Right

    if (j === lastCountX && this.matrix[i][0]) {
      count += 1;
    }

    if (j < lastCountX && this.matrix[i][j + 1]) {
      count += 1;
    }

    // Left Down

    if (i === lastCountY && j === 0 && this.matrix[0][lastCountX]) {
      count += 1;
    }

    if (i === lastCountY && j > 0 && this.matrix[0][j - 1]) {
      count += 1;
    }

    if (i < lastCountY && j === 0 && this.matrix[i + 1][lastCountX]) {
      count += 1;
    }

    if (i < lastCountY && j > 0 && this.matrix[i + 1][j - 1]) {
      count += 1;
    }

    // Down

    if (i === lastCountY && this.matrix[0][j]) {
      count += 1;
    }

    if (i < lastCountY && this.matrix[i + 1][j]) {
      count += 1;
    }

    // Right Down

    if (i === lastCountY && j === lastCountX && this.matrix[0][0]) {
      count += 1;
    }

    if (i < lastCountY && j === lastCountX && this.matrix[i + 1][0]) {
      count += 1;
    }

    if (i === lastCountY && j < lastCountX && this.matrix[0][j + 1]) {
      count += 1;
    }

    if (i < lastCountY && j < lastCountX && this.matrix[i + 1][j + 1]) {
      count += 1;
    }

    return count;
  };

  changeStatusCell = (coords, isBuild = false) => {
    if (isBuild) {
      const path = new Path2D();
      path.rect(coords.x * this.ratio, coords.y * this.ratio, this.ratio, this.ratio);
      this.matrixDraw.addPath(path);
    } else if (this.matrix[coords.y][coords.x] === 0) {
      this.matrix[coords.y][coords.x] = 1;
      context.fillStyle = '#00cc00';
      context.fillRect(coords.x * this.ratio, coords.y * this.ratio, this.ratio, this.ratio);
    } else {
      this.matrix[coords.y][coords.x] = 0;
      context.fillStyle = 'black';
      context.fillRect(coords.x * this.ratio, coords.y * this.ratio, this.ratio, this.ratio);
    }
  };

  init = () => {
    root.style.width = `${this.sizeX}px`;
    root.style.height = `${this.sizeY}px`;
    root.width = this.sizeX;
    root.height = this.sizeY;
    this.builder.init();
  };

  render = () => {
    context.clearRect(0, 0, this.sizeX, this.sizeY);
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.sizeX, this.sizeY);
    context.fillStyle = '#00cc00';
    context.fill(this.matrixDraw);
  };

  startLife = (status = true) => {
    clearInterval(this.interval);
    const startLoop = () => {
      const newMatrix = JSON.parse(this.matrixTemplate);
      this.matrixDraw = new Path2D();
      for (let i = 0; i < this.matrixY; i += 1) {
        for (let j = 0; j < this.matrixX; j += 1) {
          if (this.matrix[i][j] === 1) {
            const countNeighbours = this.checkNeighbours(i, j);
            if (countNeighbours === 2 || countNeighbours === 3) {
              newMatrix[i][j] = 1;
              const rect = new Path2D();
              rect.rect(j * this.ratio, i * this.ratio, this.ratio, this.ratio);
              this.matrixDraw.addPath(rect);
            }
          }

          if (this.matrix[i][j] === 0) {
            const countNeighbours = this.checkNeighbours(i, j);
            if (countNeighbours === 3) {
              newMatrix[i][j] = 1;
              const rect = new Path2D();
              rect.rect(j * this.ratio, i * this.ratio, this.ratio, this.ratio);
              this.matrixDraw.addPath(rect);
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
      this.matrixDraw = new Path2D();
      this.render();
    });

    root.addEventListener('click', (e) => {
      let x = e.offsetX;
      let y = e.offsetY;
      x = Math.floor(x / this.ratio);
      y = Math.floor(y / this.ratio);

      if (this.isBuild) {
        const coords = this.builder.constructBuilding({ x, y });
        coords.forEach((el) => {
          this.changeStatusCell(el, true);
        });
        this.render();
      } else {
        this.changeStatusCell({ x, y });
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
