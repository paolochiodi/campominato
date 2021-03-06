const HEIGHT = 10
const WIDTH = 8
const BOMBS = 10
const WIN_LEVEL = HEIGHT * WIDTH - BOMBS

function mapTable(origin) {
  const result = []
  for (let y = 0; y < HEIGHT; y++) {
    const row = []
    result.push(row)

    for (let x = 0; x < WIDTH; x++) {
      row.push({
        x, y,
        value: origin[y][x],
        flagged: false,
        cleared: false,
        dirty: false
      })
    }
  }

  return result
}

function start () {
  const board = document.getElementById('board')
  const bombCounter = document.getElementById('bombs')
  const face = document.getElementById('face')
  const timer = document.getElementById('timer')
  const flagger = document.getElementById('flagger')
  const fragment = document.createDocumentFragment()

  let i = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const item = document.createElement('div')
      item.setAttribute('data-x', x)
      item.setAttribute('data-y', y)
      fragment.appendChild(item)
      i++
    }
  }

  board.appendChild(fragment)

  board.addEventListener('contextmenu', rightClick, false)
  board.addEventListener('click', clickSquare, false)
  flagger.addEventListener('click', toggleFlagger, false)
  face.addEventListener('click', clickRestart, false)

  let table, started, lost, won, startTime, missingBombs, cleared, faceDirty
  let flaggerActive = false

  init()

  function init () {
    console.log('restart')
    started = false
    table = null
    lost = false
    won = false
    faceDirty = true
    startTime = null
    missingBombs = BOMBS
    cleared = 0

    const list = board.querySelectorAll('div')
    for (const child of list) {
      child.className = ''
      child.innerText = ''
    }

    renderHeader()
  }

  function clickRestart () {
    console.log('click')
    init()
  }

  function toggleFlagger () {
    flaggerActive = !flaggerActive
  }

  function flagItem (item) {
    if (!item.cleared) {
      item.dirty = true
      item.flagged = !item.flagged
      item.flagged ? missingBombs-- : missingBombs++
    }
  }

  function rightClick (ev) {
    ev.preventDefault()
    ev.stopPropagation()
    ev.cancelBubble = true

    const x = parseInt(ev.target.getAttribute('data-x'), 10)
    const y = parseInt(ev.target.getAttribute('data-y'), 10)
    const item = table[y][x]

    flagItem(item)

    return false
  }

  function clickSquare (ev) {
    const x = parseInt(ev.target.getAttribute('data-x'), 10)
    const y = parseInt(ev.target.getAttribute('data-y'), 10)

    if (!table) {
      startTime = Date.now()
      table = mapTable(generate(x, y, HEIGHT, WIDTH, BOMBS))
      show(x, y)
      started = true
      window.requestAnimationFrame(render)
      return
    }

    const item = table[y][x]

    if (item.cleared) {
      reveal(x, y)
      return false
    }

    if (flaggerActive) {
      flagItem(item)
      return false
    }

    if (item.flagged) {
      return false
    }

    show(x, y)

    return false
  }

  function winGame () {
    won = true
    faceDirty = true
    missingBombs = 0
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const item = table[y][x]
        if (item.value === 'B' && !item.flagged) {
          item.flagged = true
          item.dirty = true
        }
      }
    }
  }

  function looseGame () {
    lost = true
    faceDirty = true
  }

  function show(x, y) {
    const content = table[y][x]

    if (content.cleared || content.flagged) {
      return
    }

    content.cleared = true
    content.dirty = true

    if (content.value === 'B') {
      return looseGame()
    }

    cleared++

    if (cleared === WIN_LEVEL) {
      return winGame()
    }

    if (content.value === 0) {
      flood(x, y)
    }
  }

  function flood (x, y) {
    if (x > 0) {
      show(x - 1, y)
    }

    if (x + 1 < WIDTH) {
      show(x + 1, y)
    }

    if (y > 0) {
      show(x, y - 1)

      if (x > 0) {
        show(x - 1, y - 1)
      }

      if (x + 1 < WIDTH) {
        show(x + 1, y - 1)
      }
    }

    if (y + 1 < HEIGHT) {
      show(x, y + 1)

      if (x > 0) {
        show(x - 1, y + 1)
      }

      if (x + 1 < WIDTH) {
        show(x + 1, y + 1)
      }
    }
  }

  function reveal (x, y) {
    const item = table[y][x]
    if (item.value === 0 || item.flagged || !item.cleared) {
      return
    }

    let foundBombs = 0

    if (x > 0 && table[y][x - 1].flagged) {
      foundBombs++
    }

    if (x + 1 < WIDTH && table[y][x + 1].flagged) {
      foundBombs++
    }

    if (y > 0) {
      if (table[y - 1][x].flagged) {
        foundBombs++
      }

      if (x > 0 && table[y - 1][x - 1].flagged) {
        foundBombs++
      }

      if (x + 1 < WIDTH && table[y - 1][x + 1].flagged) {
        foundBombs++
      }
    }

    if (y + 1 < HEIGHT) {
      if (table[y + 1][x].flagged) {
        foundBombs++
      }

      if (x > 0 && table[y + 1][x - 1].flagged) {
        foundBombs++
      }

      if (x + 1 < WIDTH && table[y + 1][x + 1].flagged) {
        foundBombs++
      }
    }

    if (foundBombs === item.value) {
      flood(x, y)
    }
  }

  function renderHeader () {
    flagger.classList.toggle('active', flaggerActive)
    bombCounter.innerText = String(Math.max(missingBombs, 0)).padStart(3, '0')
    timer.innerText = startTime ? String(Math.min(Math.round((Date.now() - startTime)/ 1000), 999)).padStart(3, '0') : '000'

    if (faceDirty) {
      face.innerText = won
        ? '????'
        : lost
          ? '????'
          : '????'
      faceDirty = false
    }
  }

  function render () {
    renderHeader()

    if (table) {
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const item = table[y][x]
          if (!item.dirty) continue

          const pos = (y * WIDTH) + x
          const el = board.querySelector(`div:nth-of-type(${pos + 1})`)

          if (item.cleared) {
            el.classList.add('cleared')

            if (item.value === 'B') {
              el.classList.add('bomb')
              el.innerText = '????'
            } else {
              el.classList.add('level-' + item.value)

              if (item.value !== 0) {
                el.innerText = String(item.value)
              }
            }
          }

          el.classList.toggle('flagged', item.flagged)

          item.dirty = false
        }
      }
    }

    if (won) {
      window.requestAnimationFrame(() => alert('Vittoria'))
      return
    }

    if (lost) {
      window.requestAnimationFrame(() => alert('Sconfitta'))
      return
    }

    if (started) {
      window.requestAnimationFrame(render)
    }
  }

  // window.requestAnimationFrame(render)
}

if (document.readyState != 'loading') {
  start()
} else {
  document.addEventListener('DOMContentLoaded', start)
}