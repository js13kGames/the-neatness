import type { Pointer } from '../node_modules/natlib/controls/Pointer'

import { conPaint } from './canvas.js'
import { tiles as buttonLevel } from './levels/tiles/ButtonLevel.js'
import { tiles as buttonMusic } from './levels/tiles/ButtonMusic.js'
import { tiles as buttonReset } from './levels/tiles/ButtonReset.js'
import { painting, Settings } from './prelude.js'
import { state } from './state.js'

type UpdateFunction = (x: number, y: number) => void

export function paint1BppSprite(tiles: number[], width: number, updateFunction: UpdateFunction) {
    for (let y = 0; y < tiles.length; ++y) {
        for (let x = 0; x < width; ++x) {
            const a = tiles[y] >> (width - 1 - x) & 1
            if (a === 0) continue

            updateFunction(x, y)
        }
    }
}

function paintRoundRect(x: number, y: number, width: number, height: number, color: string) {
    conPaint.beginPath()
    conPaint.rect(x + 1, y, width - 2, 1)
    conPaint.rect(x, y + 1, width, height - 2)
    conPaint.rect(x + 1, y + height - 1, width - 2, 1)

    conPaint.fillStyle = color
    conPaint.fill()
}

function paintButton(x: number, y: number, p: number) {
    conPaint.fillStyle = '#000'
    conPaint.fillRect(x, y, Settings.buttonWidth, 1)

    // Colors: https://lospec.com/palette-list/twilioquest-76
    paintRoundRect(x, y + 1,
        Settings.buttonWidth, Settings.buttonHeight - 1, '#636261')
    paintRoundRect(x + 1, y + p,
        Settings.buttonWidth - 2, Settings.buttonHeight - 3, '#eaeae8')
    paintRoundRect(x + 2, y + p + 1,
        Settings.buttonWidth - 4, Settings.buttonHeight - 5, '#cecac9')
}

export function paintToolbar() {
    const toolbarHeight = state.buttonsEnabled * Settings.buttonHeight + 2

    const x0 = Settings.IR_SCREEN_WIDTH - Settings.buttonWidth | 0
    const y0 = 0.5 * (Settings.IR_SCREEN_HEIGHT - toolbarHeight) | 0

    const buttons = [buttonMusic, buttonReset, buttonLevel]

    for (let n = 0; n < state.buttonsEnabled; ++n) {
        const v0 = y0 + n * (Settings.buttonHeight + 1)
        const p = state.buttonsPressed[n] ? 2 : 0

        paintButton(x0, v0, p)

        conPaint.beginPath()
        paint1BppSprite(buttons[n], 7, (x, y) => {
            conPaint.rect(x + x0 + 4, y + p + v0 + 3, 1, 1)
        })
        conPaint.fillStyle = (n === 0 && state.soundEnabled) ? '#ffe091' : '#000'
        conPaint.fill()

        for (let x = 0; x < Settings.buttonWidth; ++x) {
            for (let y = 0; y < Settings.buttonHeight; ++y) {
                if ((x === 0 || x === Settings.buttonWidth - 1) &&
                    (y === 0 || y === Settings.buttonHeight - 1)) continue

                painting[y + v0][x + x0] = 2
            }
        }
    }
}

function pointInButton(x: number, y: number) {
    x = (x + 0.5) / Settings.IR_X
    y = (y + 0.5) / Settings.IR_Y

    const toolbarHeight = state.buttonsEnabled * Settings.buttonHeight + 2

    const x0 = Settings.IR_SCREEN_WIDTH - Settings.buttonWidth | 0
    const y0 = 0.5 * (Settings.IR_SCREEN_HEIGHT - toolbarHeight) | 0

    for (let n = 0; n < state.buttonsEnabled; ++n) {
        const _y0 = y0 + n * (Settings.buttonHeight + 1)

        if (x >= x0 && x < x0 + Settings.buttonWidth &&
            y >= _y0 && y < _y0 + Settings.buttonHeight) {
            return n
        }
    }

    return NaN
}

export function updateButtons(pointer: Pointer) {
    state.oldPressed[0] = state.buttonsPressed[0]
    state.oldPressed[1] = state.buttonsPressed[1]
    state.oldPressed[2] = state.buttonsPressed[2]

    state.buttonsPressed[0] = state.buttonsPressed[1] = state.buttonsPressed[2] = false

    if (pointer.held) {
        const btn = pointInButton(pointer.x, pointer.y)
        if (isFinite(btn)) {
            state.buttonsPressed[btn] = true
        }
    }
    if (state.oldPressed[0] !== state.buttonsPressed[0] ||
        state.oldPressed[1] !== state.buttonsPressed[1] ||
        state.oldPressed[2] !== state.buttonsPressed[2]) {
        // Pressed buttons changed
        if (state.oldPressed[0] && !state.buttonsPressed[0]) {
            // Music button released
            state.soundEnabled = !state.soundEnabled
        }
        if (state.oldPressed[1] && !state.buttonsPressed[1]) {
            // Reset button released
            state.level.reset()
        }
        if (state.oldPressed[2] && !state.buttonsPressed[2]) {
            // Level button released
            console.log('Level!')
        }
        paintToolbar()
    }
}
