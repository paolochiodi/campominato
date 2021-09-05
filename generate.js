function generate (initialX, initialY, HEIGHT, WIDTH, BOMBS) {
  const table = []
  for (let y = 0; y < HEIGHT; y++) {
    table[y] = []
  }

  let missingBombs = BOMBS;

  while (missingBombs) {
    const x = Math.round(Math.random() * (WIDTH - 1))
    const y = Math.round(Math.random() * (HEIGHT - 1))

    if (
      (x === initialX && y === initialY) ||
      (x === initialX - 1 && y === initialY) ||
      (x === initialX + 1 && y === initialY) ||
      (x === initialX && y === initialY - 1) ||
      (x === initialX && y === initialY + 1) ||
      (x === initialX - 1 && y === initialY - 1) ||
      (x === initialX + 1 && y === initialY - 1) ||
      (x === initialX - 1 && y === initialY + 1) ||
      (x === initialX + 1 && y === initialY + 1) ||
      (table[y][x] !== undefined)
    ) {
      continue
    }

    table[y][x] = 'B'
    missingBombs--
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let nearby = 0

      if (table[y][x] === 'B') {
        continue
      }

      if (table[y][x - 1] === 'B') {
        nearby += 1
      }
      if (table[y][x + 1] === 'B') {
        nearby += 1
      }

      if (y > 0) {
        if (table[y - 1][x] === 'B') {
          nearby += 1
        }
        if (table[y - 1][x - 1] === 'B') {
          nearby += 1
        }
        if (table[y - 1][x + 1] === 'B') {
          nearby += 1
        }
      }

      if (y + 1 < HEIGHT) {
        if (table[y + 1][x] === 'B') {
          nearby += 1
        }
        if (table[y + 1][x - 1] === 'B') {
          nearby += 1
        }
        if (table[y + 1][x + 1] === 'B') {
          nearby += 1
        }
      }

      table[y][x] = nearby
    }
  }

  // console.table(table)

  return table
}