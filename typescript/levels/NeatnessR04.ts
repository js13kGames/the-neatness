import { tiles, width, xs, ys } from '../bitmaps/NeatnessR04.js'
import { Level } from '../Level.js'
import { Settings } from '../prelude.js'

export class NeatnessR04 extends Level {
    constructor() {
        super()

        this.reflect = true

        this.addHotspot(xs[0], ys[0], false)
        this.addHotspot(xs[1], ys[1], false)
        this.addHotspot(xs[2], ys[2], true)
        this.addHotspot(xs[3], ys[3], true)
    }

    override paintInternal() {
        this.paintInternalTiles(tiles, width, 6 * Settings.TILE_WIDTH)
    }
}
