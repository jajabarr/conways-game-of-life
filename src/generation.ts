function forEachNeighbor(
  x: number,
  y: number,
  width: number,
  height: number,
  callback: (x: number, y: number) => void
) {
  for (let _y = y - 1; _y <= y + 1; ++_y) {
    for (let _x = x - 1; _x <= x + 1; ++_x) {
      const x = (_x + width) % width;
      const y = (_y + height) % height;

      callback(x, y);
    }
  }
}

function summarizeGridNeighbors(
  grid: Grid<BlockValue>,
  coordinate: Coordinate
): { alive: number; dead: number } {
  let dead = 0;
  let alive = 0;

  const { width, height } = grid.dimensions();

  forEachNeighbor(coordinate.x, coordinate.y, width, height, (x, y) => {
    const blockValue = grid.get(x, y);

    if (coordinate.x !== x || coordinate.y !== y) {
      blockValue == 1 ? ++alive : ++dead;
    }
  });

  return { alive, dead };
}

export function makeNextGeneration(
  grid: Grid<BlockValue>,
  fader: any,
  isAnimating: boolean
): Grid<BlockValue> {
  const dimensions = grid.dimensions();

  const nextGeneration: Grid<BlockValue> = new Grid<BlockValue>(
    dimensions,
    grid.getCanvas()
  );

  const seenBlocks: Grid<BlockValue> = new Grid<BlockValue>(dimensions);

  grid.iterate((parentX, parentY) => {
    forEachNeighbor(
      parentX,
      parentY,
      dimensions.width,
      dimensions.height,
      (x, y) => {
        const block = seenBlocks.get(x, y);

        if (block === 1) {
          return;
        }

        seenBlocks.set(x, y, 1);

        const isAlive = grid.get(x, y) == 1;
        const { alive } = summarizeGridNeighbors(grid, { x, y });

        if (isAlive) {
          if (between(alive, 2, 3)) {
            nextGeneration.set(x, y, 1);
            if (isAnimating) {
              fader.set(x, y);
            }
          } else {
            nextGeneration.set(x, y, -1);
          }
        } else if (!isAlive && alive == 3) {
          nextGeneration.set(x, y, 1);
          if (isAnimating) {
            fader.set(x, y);
          }
        }
      }
    );
  });

  return nextGeneration;
}
