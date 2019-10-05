import { Scene } from 'gine'

import { Bunny, Enemy } from '../enemies'
import { Map } from '../map'
import { Player } from '../player'
import { checkCollission } from '../util'

export class MainScene extends Scene {
	map: Map
	player: Player
	enemies: Enemy[] = []
	constructor() {
		super()
		this.player = new Player(300, 200)
		this.map = new Map()
		this.enemies.push(
			new Bunny(120, 120),
			new Bunny(138, 118),
			new Bunny(115, 100)
		)
	}

	tick(delta: number) {
		delta = +delta.toFixed(4)
		if (this.player.isAttacking) {
			checkCollission(this.player, this.enemies).forEach(enemy => enemy.hit())
		}
		this.player.tick(delta)
		this.enemies.forEach(enemy => enemy.update(delta))
		if (this.map.mapCollission(this.player)) {
			this.player.isColliding = true
		} else {
			this.player.isColliding = false
		}
	}

	second() {}

	init() {}

	frame() {
		this.map.draw()
		this.enemies.forEach(e => e.draw())
		this.player.draw()
	}
}
