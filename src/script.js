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

const getMatrix = ({ x, y }) => new Uint8Array(x * y);

const getSize = () => ({
  x: Math.floor(canvasWrap.clientWidth / 40) * 40,
  y: Math.floor(canvasWrap.clientHeight / 40) * 40,
});

class Game {
  constructor({ x, y }) {
    this.sizeX = x;
    this.sizeY = y;
    this.matrixX = this.sizeX / 2;
    this.matrixY = this.sizeY / 2;
    this.lastCountX = this.matrixX - 1;
    this.lastCountY = this.matrixY - 1;
    this.matrix = getMatrix({ x: this.matrixX, y: this.matrixY });
    this.matrixBufer = getMatrix({ x: this.matrixX, y: this.matrixY });
    this.imgData = context.createImageData(this.sizeX, this.sizeY);
    this.imgBufer = new Uint8ClampedArray(this.sizeX * this.sizeY * 4);
    this.isPause = true;
    this.isBuild = false;
    this.builder = new Builder(this.matrix, this.matrixX, this.matrixY);
  }

  checkNeighbours = (i, j) => {
    let count = 0;

    if ((i > 0) && (j > 0) && (i < this.lastCountY) && (j < this.lastCountX)) {
      return this.matrix[(i - 1) * this.matrixX + j - 1]
        + this.matrix[(i - 1) * this.matrixX + j]
        + this.matrix[(i - 1) * this.matrixX + j + 1]
        + this.matrix[i * this.matrixX + j - 1]
        + this.matrix[i * this.matrixX + j + 1]
        + this.matrix[(i + 1) * this.matrixX + j - 1]
        + this.matrix[(i + 1) * this.matrixX + j]
        + this.matrix[(i + 1) * this.matrixX + j + 1];
    }

    // Left Up

    if (i === 0 && j === 0 && this.matrix[this.matrixX * this.matrixY - 1]) {
      count += 1;
    }

    if (i === 0 && j > 0 && this.matrix[this.lastCountY * this.matrixX + j - 1]) {
      count += 1;
    }

    if (i > 0 && j === 0 && this.matrix[(i - 1) * this.matrixX + this.lastCountX]) {
      count += 1;
    }

    if (i > 0 && j > 0 && this.matrix[(i - 1) * this.matrixX + j - 1]) {
      count += 1;
    }

    // Up

    if (i === 0 && this.matrix[this.lastCountY * this.matrixX + j]) {
      count += 1;
    }

    if (i > 0 && this.matrix[(i - 1) * this.matrixX + j]) {
      count += 1;
    }

    // Right Up

    if (i === 0 && j === this.lastCountX && this.matrix[this.lastCountY * this.matrixX]) {
      count += 1;
    }

    if (i === 0 && j < this.lastCountX && this.matrix[this.lastCountY * this.matrixX + j + 1]) {
      count += 1;
    }

    if (i > 0 && j === this.lastCountX && this.matrix[(i - 1) * this.matrixX]) {
      count += 1;
    }

    if (i > 0 && j < this.lastCountX && this.matrix[(i - 1) * this.matrixX + j + 1]) {
      count += 1;
    }

    // Left

    if (j === 0 && this.matrix[i * this.matrixX + this.lastCountX]) {
      count += 1;
    }

    if (j > 0 && this.matrix[i * this.matrixX + j - 1]) {
      count += 1;
    }

    // Right

    if (j === this.lastCountX && this.matrix[i * this.matrixX]) {
      count += 1;
    }

    if (j < this.lastCountX && this.matrix[i * this.matrixX + j + 1]) {
      count += 1;
    }

    // Left Down

    if (i === this.lastCountY && j === 0 && this.matrix[this.lastCountX]) {
      count += 1;
    }

    if (i === this.lastCountY && j > 0 && this.matrix[j - 1]) {
      count += 1;
    }

    if (i < this.lastCountY && j === 0 && this.matrix[(i + 1) * this.matrixX + this.lastCountX]) {
      count += 1;
    }

    if (i < this.lastCountY && j > 0 && this.matrix[(i + 1) * this.matrixX + j - 1]) {
      count += 1;
    }

    // Down

    if (i === this.lastCountY && this.matrix[j]) {
      count += 1;
    }

    if (i < this.lastCountY && this.matrix[(i + 1) * this.matrixX + j]) {
      count += 1;
    }

    // Right Down

    if (i === this.lastCountY && j === this.lastCountX && this.matrix[0]) {
      count += 1;
    }

    if (i < this.lastCountY && j === this.lastCountX && this.matrix[(i + 1) * this.matrixX]) {
      count += 1;
    }

    if (i === this.lastCountY && j < this.lastCountX && this.matrix[j + 1]) {
      count += 1;
    }

    if (i < this.lastCountY && j < this.lastCountX && this.matrix[(i + 1) * this.matrixX + j + 1]) {
      count += 1;
    }

    return count;
  };

  setPixel(x, y, isClear) {
    this.imgBufer[(y * 2 * this.sizeX + x * 2) * 4] = 187;
    this.imgBufer[(y * 2 * this.sizeX + x * 2) * 4 + 1] = 208;
    this.imgBufer[(y * 2 * this.sizeX + x * 2) * 4 + 2] = 219;
    this.imgBufer[(y * 2 * this.sizeX + x * 2) * 4 + 3] = isClear ? 0 : 255;

    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2) * 4] = 187;
    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2) * 4 + 1] = 208;
    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2) * 4 + 2] = 219;
    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2) * 4 + 3] = isClear ? 0 : 255;

    this.imgBufer[(y * 2 * this.sizeX + x * 2 + 1) * 4] = 187;
    this.imgBufer[(y * 2 * this.sizeX + x * 2 + 1) * 4 + 1] = 208;
    this.imgBufer[(y * 2 * this.sizeX + x * 2 + 1) * 4 + 2] = 219;
    this.imgBufer[(y * 2 * this.sizeX + x * 2 + 1) * 4 + 3] = isClear ? 0 : 255;

    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2 + 1) * 4] = 187;
    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2 + 1) * 4 + 1] = 208;
    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2 + 1) * 4 + 2] = 219;
    this.imgBufer[((y * 2 + 1) * this.sizeX + x * 2 + 1) * 4 + 3] = isClear ? 0 : 255;
  }

  changeStatusCell = (coords, isBuild = false) => {
    if (isBuild) {
      this.setPixel(coords.x, coords.y);
    } else if (this.matrix[coords.y * this.matrixX + coords.x] === 0) {
      this.matrix[coords.y * this.matrixX + coords.x] = 1;
      this.setPixel(coords.x, coords.y);
    } else if (this.matrix[coords.y * this.matrixX + coords.x] === 1) {
      this.matrix[coords.y * this.matrixX + coords.x] = 0;
      this.setPixel(coords.x, coords.y, true);
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
    this.imgData.data.set(this.imgBufer);
    context.putImageData(this.imgData, 0, 0);
  };

  startLife = (status = true) => {
    clearInterval(this.interval);
    const startLoop = () => {
      this.matrixBufer.fill(0);
      this.imgBufer.fill(0);
      for (let i = 0; i < this.matrixBufer.length; i += 1) {
        const y = Math.floor(i / this.matrixX);
        const x = i % this.matrixX;
        const countNeighbours = this.checkNeighbours(y, x);
        if ((this.matrix[i] === 1 && (countNeighbours === 2 || countNeighbours === 3))
        || (this.matrix[i] === 0 && countNeighbours === 3)) {
          this.matrixBufer[i] = 1;
          this.setPixel(x, y);
        }
      }
      this.matrix = this.matrixBufer.slice();
      this.builder.updateMatrix(this.matrix);
      this.render();
    };

    this.interval = setInterval(startLoop, 15);

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
      this.matrix = getMatrix({ x: this.matrixX, y: this.matrixY });
      this.builder.updateMatrix(this.matrix);
      this.imgBufer = this.imgBufer.fill(0);
      this.render();
    });

    root.addEventListener('click', (e) => {
      let x = e.offsetX;
      let y = e.offsetY;
      x = Math.floor(x / 2);
      y = Math.floor(y / 2);

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

    checkbox.addEventListener('click', (e) => {
      e.preventDefault();
      this.isBuild = !this.isBuild;
      checkbox.classList.toggle('checkbox-active');
    });
  };
}

const game = new Game(getSize());
game.init();
game.render();
game.addListeners();
