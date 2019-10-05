import { Gine, KEYCODES, Scene } from 'gine'

import { Bunny, Enemy } from '../enemies'
import { Map } from '../map'
import { Player } from '../player'
import { checkCollission } from '../util'

export class MainScene extends Scene {
	map: Map
	player: Player
	enemies: Enemy[] = []
	viewport: { x: number; y: number; width: number; height: number }
	constructor() {
		super()
		this.player = new Player(300, 200)
		this.map = new Map()
		this.viewport = {
			width: Gine.CONFIG.width / 2,
			height: Gine.CONFIG.height / 2,
			x: Gine.CONFIG.width / 2,
			y: Gine.CONFIG.height / 2
		}
		this.enemies.push(
			new Bunny(Math.random() * 1200, Math.random() * 1200),
			new Bunny(Math.random() * 1200, Math.random() * 1200),
			new Bunny(Math.random() * 1200, Math.random() * 1200),
			new Bunny(Math.random() * 1200, Math.random() * 1200),
			new Bunny(Math.random() * 1200, Math.random() * 1200)
		)
	}

	tick(delta: number) {
		delta = +delta.toFixed(4)
		if (this.player.isAttacking) {
			checkCollission(this.player, this.enemies).forEach(enemy => enemy.hit())
		}
		this.player.tick(delta)
		this.viewport.x = this.player.x - this.viewport.width
		this.viewport.y = this.player.y - this.viewport.height
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
		if (Gine.keyboard.allPressed()[KEYCODES.E]) {
			if (this.player.isCarrying === 0) {
				const targets = checkCollission(
					this.player,
					this.enemies.filter(e => !e.alive)
				).sort((a, b) => {
					const ax = a.x - this.player.x
					const bx = b.x - this.player.x
					const ay = a.y - this.player.y
					const by = b.y - this.player.y
					const distanceA = Math.sqrt(ax * ax + ay * ay)
					const distanceB = Math.sqrt(bx * bx + by * by)
					return distanceA - distanceB
				})
				if (targets.length > 0) {
					this.player.carry(targets[0])
				}
			} else {
				this.player.drop()
			}
		}

		this.map.draw(this.viewport.x, this.viewport.y)
		this.enemies.forEach(e => e.draw(this.viewport.x, this.viewport.y))
		this.player.draw()
	}
}
