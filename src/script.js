import './style.css';
import Builder from './modules/Builder';

window.addEventListener('orientationchange', () => {
  document.location.reload();
});

const root = document.querySelector('#root');
const body = document.querySelector('body');
const context = root.getContext('2d');
const loader = document.querySelector('#loader');
const builds = document.querySelector('#builds');
const canvasWrap = document.querySelector('.canvasWrap');

const start = document.querySelector('#start');
const clear = document.querySelector('#clear');
const chooseBuild = document.querySelector('#chooseBuild');
const close = document.querySelector('#close');
const checkbox = document.querySelector('#checkbox');
const zoomIn = document.querySelector('#zoomIn');
const zoomOut = document.querySelector('#zoomOut');
const checkboxText = document.querySelector('.checkbox-text');
const playImgElement = document.querySelector('#start img');
const input = document.querySelector('#input');

const getMatrix = ({ x, y }) => new Uint8Array(x * y);

const getSize = () => ({
  x: body.offsetWidth,
  y: body.offsetHeight,
});

class Game {
  constructor({ x, y }) {
    this.sizeX = x;
    this.sizeY = y;
    this.matrixX = this.sizeX;
    this.matrixY = this.sizeY;
    this.lastCountX = this.matrixX - 1;
    this.lastCountY = this.matrixY - 1;
    this.matrix = getMatrix({ x: this.matrixX, y: this.matrixY });
    this.matrixBufer = getMatrix({ x: this.matrixX, y: this.matrixY });
    this.imgData = context.createImageData(this.sizeX, this.sizeY);
    this.imgBufer = new Uint8ClampedArray(this.sizeX * this.sizeY * 4);
    this.isPause = true;
    this.isBuild = true;
    this.builder = new Builder(this.matrix, this.matrixX, this.lastCountX, this.lastCountY);
    this.zoom = 1;
    this.moveX = 0;
    this.moveY = 0;
  }

  setPixel(x, y, isClear) {
    this.imgBufer[(y * this.sizeX + x) * 4] = 187;
    this.imgBufer[(y * this.sizeX + x) * 4 + 1] = 208;
    this.imgBufer[(y * this.sizeX + x) * 4 + 2] = 219;
    this.imgBufer[(y * this.sizeX + x) * 4 + 3] = isClear ? 0 : 255;
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
    canvasWrap.style.width = `${this.sizeX}px`;
    canvasWrap.style.height = `${this.sizeY}px`;
    this.builder.init();
    loader.classList.add('v-hidden');
  };

  render = () => {
    this.imgData.data.set(this.imgBufer);
    context.putImageData(this.imgData, 0, 0);
    if (!this.isPause) window.requestAnimationFrame(this.startLife);
  };

  startLife = () => {
    this.matrixBufer.fill(0);
    this.imgBufer.fill(0);
    for (let i = 0; i < this.matrixBufer.length; i += 1) {
      const y = Math.floor(i / this.matrixX);
      const x = i % this.matrixX;

      const up = (y === 0) ? this.lastCountY : (y - 1);
      const right = (x === this.lastCountX) ? 0 : (x + 1);
      const down = (y === this.lastCountY) ? 0 : (y + 1);
      const left = (x === 0) ? this.lastCountX : (x - 1);

      const countNeighbours = this.matrix[up * this.matrixX + left]
        + this.matrix[up * this.matrixX + x]
        + this.matrix[up * this.matrixX + right]
        + this.matrix[y * this.matrixX + left]
        + this.matrix[y * this.matrixX + right]
        + this.matrix[down * this.matrixX + left]
        + this.matrix[down * this.matrixX + x]
        + this.matrix[down * this.matrixX + right];

      if ((this.matrix[i] === 1 && (countNeighbours === 2 || countNeighbours === 3))
        || (this.matrix[i] === 0 && countNeighbours === 3)) {
        this.matrixBufer[i] = 1;
        this.setPixel(x, y);
      }
    }
    this.matrix = new Uint8Array(this.matrixBufer);

    this.builder.updateMatrix(this.matrix);
    this.render();
  };

  addListeners = () => {
    close.addEventListener('click', () => {
      builds.classList.add('d-none');
      input.value = '';
    });

    start.addEventListener('click', () => {
      this.isPause = !this.isPause;
      this.startLife();
      if (this.isPause) {
        playImgElement.src = './images/play.png';
      } else {
        playImgElement.src = './images/pause.png';
      }
    });

    clear.addEventListener('click', () => {
      this.matrix = getMatrix({ x: this.matrixX, y: this.matrixY });
      this.builder.updateMatrix(this.matrix);
      this.imgBufer = this.imgBufer.fill(0);
      if (this.isPause) this.render();
    });

    root.addEventListener('click', (e) => {
      let x = e.offsetX;
      let y = e.offsetY;
      x = Math.floor(x);
      y = Math.floor(y);

      if (this.isBuild) {
        const coords = this.builder.constructBuilding({ x, y });
        coords.forEach((el) => {
          this.changeStatusCell(el, true);
        });
        if (this.isPause) this.render();
      } else {
        this.changeStatusCell({ x, y });
        if (this.isPause) this.render();
      }
    });

    zoomIn.addEventListener('click', (e) => {
      e.preventDefault();
      this.zoom *= 2;
      this.moveX = 0;
      this.moveY = 0;
      root.style = `transform: matrix(${this.zoom}, 0, 0, ${this.zoom}, 0, 0)`;
    });

    zoomOut.addEventListener('click', (e) => {
      e.preventDefault();
      this.zoom /= this.zoom === 1 ? 1 : 2;
      this.moveX = 0;
      this.moveY = 0;
      root.style = `transform: matrix(${this.zoom}, 0, 0, ${this.zoom}, 0, 0)`;
    });

    document.addEventListener('selectstart', (e) => e.preventDefault());

    canvasWrap.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    canvasWrap.addEventListener('mousedown', (e) => {
      if (this.zoom === 1) return;
      e.preventDefault();
      if (e.button === 2) {
        let centerX = e.layerX;
        let centerY = e.layerY;
        centerX = Math.floor(centerX);
        centerY = Math.floor(centerY);

        const shiftX = this.moveX;
        const shiftY = this.moveY;

        const handleMouseMove = (event) => {
          let x = event.layerX;
          let y = event.layerY;
          x = Math.floor(x);
          y = Math.floor(y);

          root.style = `transform: matrix(${this.zoom}, 0, 0, ${this.zoom}, ${

            this.moveX = x - (centerX - shiftX)
          }, ${
            this.moveY = y - (centerY - shiftY)
          })`;
        };

        canvasWrap.addEventListener('mousemove', handleMouseMove);

        const handleMouseUp = () => {
          canvasWrap.removeEventListener('mouseup', handleMouseUp);
          canvasWrap.removeEventListener('mousemove', handleMouseMove);
        };

        canvasWrap.addEventListener('mouseup', handleMouseUp);
      }
    });
    canvasWrap.addEventListener('touchstart', (e) => {
      if (this.zoom === 1) return;
      let centerX = e.changedTouches[0].pageX;
      let centerY = e.changedTouches[0].pageY;
      centerX = Math.floor(centerX);
      centerY = Math.floor(centerY);

      const shiftX = this.moveX;
      const shiftY = this.moveY;

      const handleMouseMove = (event) => {
        let x = event.changedTouches[0].pageX;
        let y = event.changedTouches[0].pageY;
        x = Math.floor(x);
        y = Math.floor(y);

        root.style = `transform: matrix(${this.zoom}, 0, 0, ${this.zoom}, ${
          this.moveX = x - (centerX - shiftX)
        }, ${
          this.moveY = y - (centerY - shiftY)
        })`;
      };

      canvasWrap.addEventListener('touchmove', handleMouseMove);

      const handleMouseUp = () => {
        e.preventDefault();
        canvasWrap.removeEventListener('touchend', handleMouseUp);
        canvasWrap.removeEventListener('touchmove', handleMouseMove);
      };

      canvasWrap.addEventListener('touchend', handleMouseUp);
    });

    chooseBuild.addEventListener('click', () => {
      builds.classList.remove('d-none');
    });

    checkbox.addEventListener('click', (e) => {
      e.preventDefault();
      this.isBuild = !this.isBuild;
      checkbox.classList.toggle('checkbox-active');
    });

    checkboxText.addEventListener('click', (e) => {
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
