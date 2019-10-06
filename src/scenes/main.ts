import { Gine, ImageAsset, KEYCODES, Scene } from 'gine'

import { Bunny, Enemy, Wolf } from '../enemies'
import { Entity } from '../entity'
import { GUI } from '../gui'
import { GameMap } from '../map'
import { Player } from '../player'
import { checkCollission } from '../util'

export class MainScene extends Scene {
	map: GameMap
	player: Player
	enemies: Enemy[] = []
	viewport: { x: number; y: number; width: number; height: number }
	kills: Enemy[] = []
	lastAlert: number = 0
	flags: Map<string, boolean | number> = new Map()
	constructor() {
		super()
		this.player = new Player(300, 200)
		this.map = new GameMap()
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

		this.enemies.push(new Wolf(100, 50))
	}

	tick(delta: number) {
		delta = +delta.toFixed(4)
		if (this.player.isAttacking) {
			checkCollission(this.player, this.enemies.filter(e => e.alive)).forEach(
				enemy => {
					enemy.hit()
					if (!enemy.alive) {
						this.kills.push(enemy)
					}
				}
			)
		}
		if (this.player.canDoAction() && Gine.keyboard.allPressed()[KEYCODES.E]) {
			if (this.player.isCarrying === 0) {
				const targets = checkCollission(
					this.player,
					this.enemies.filter(e => !e.alive)
				).sort((a, b) => {
					// FIXME - Should be in the library. Math2D
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
			this.player.setAction()
		}
		this.player.tick(delta)
		this.viewport.x = this.player.x - this.viewport.width
		this.viewport.y = this.player.y - this.viewport.height
		this.enemies.filter(e => e.alive).forEach(enemy => enemy.update(delta))
		if (this.map.mapCollission(this.player)) {
			this.player.isColliding = true
		} else {
			this.player.isColliding = false
		}
		if (
			GUI.updateAlerts(
				delta,
				Gine.keyboard.isPressed(KEYCODES.E),
				this.lastAlert
			)
		) {
			this.lastAlert = Date.now()
		}
	}

	second() {
		// Fun little trick to play with the weather
		// this.map.weather++
		// if (this.map.weather > 3) this.map.weather = 0
		this.enemies.forEach((e, i) => {
			if (!e.alive && e.lifePoints === 0) this.enemies.splice(i, 1)
		})
		Entity.entities.forEach((e, i) => {
			if (!e.alive && (e as any).lifePoints === 0) Entity.entities.splice(i, 1)
		})
		if (this.lastAlert === 0 && this.kills.length === 0) {
			this.lastAlert = Date.now()
			GUI.createAlert("Oh no, where's mom? I'm lost!")
			GUI.createAlert("I'm hungry too, maybe I can find something to eat...")
			GUI.createAlert('--- Use the SPACE bar to attack ---')
		}
		if (!this.flags.get('staminaWarning') && this.player.stamina < 0.4) {
			GUI.createAlert("I'm getting tired, I should rest...", 6)
			this.flags.set('staminaWarning', true)
		}
	}

	init() {}

	frame() {
		this.map.draw(this.viewport.x, this.viewport.y)
		this.enemies.forEach(e => e.draw(this.viewport.x, this.viewport.y))
		this.player.draw()
		this.drawHungerStamina()
		GUI.drawAlerts()
	}

	drawHungerStamina() {
		Gine.handle.draw(Gine.store.getImage('meat-empty')!, 8, 160)
		const meat: ImageAsset = Gine.store.getImage('meat-full')!
		const hungerAmount = meat.image.height * (1 - this.player.hunger)
		Gine.handle.handle.drawImage(
			meat.image,
			0,
			hungerAmount,
			meat.image.width,
			meat.image.height,
			8,
			160 + hungerAmount,
			meat.image.width,
			meat.image.height
		)

		Gine.handle.draw(Gine.store.getImage('stamina-empty')!, 8, 210)
		const staminaImg: ImageAsset = Gine.store.getImage('stamina-full')!
		const staminaAmount = staminaImg.image.height * (1 - this.player.stamina)
		Gine.handle.handle.drawImage(
			staminaImg.image,
			0,
			staminaAmount,
			staminaImg.image.width,
			staminaImg.image.height,
			8,
			210 + staminaAmount,
			staminaImg.image.width,
			staminaImg.image.height
		)
	}
}
