import { Gine, ImageAsset, KEYCODES, Scene } from 'gine'

import { BearParent } from '../bearparent'
import { Bunny, Enemy, Wolf } from '../enemies'
import { Entity } from '../entity'
import { GUI } from '../gui'
import { GameMap } from '../map'
import { Player } from '../player'
import { checkCollission } from '../util'

export class MainScene extends Scene {
	map: GameMap
	player: Player
	viewport: { x: number; y: number; width: number; height: number }
	kills: Enemy[] = []
	lastAlert: number = 0
	timePassed: number = 0
	flags: Map<string, boolean | number> = new Map()
	startTime: number = Date.now()
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

		new Bunny(100, 120)

		new Bunny(Math.random() * 1200, Math.random() * 1200)
		new Bunny(Math.random() * 1200, Math.random() * 1200)
		new Bunny(Math.random() * 1200, Math.random() * 1200)
	}

	tick(delta: number) {
		delta = +delta.toFixed(4)
		if (this.flags.get('gameWon') === true) {
			return
		}
		if (!this.player.alive && !this.flags.get('dead')) {
			this.gameLost()
		}
		if (this.player.isAttacking) {
			checkCollission(
				this.player,
				Entity.entities.filter(e => e.alive && e._id !== this.player._id)
			).forEach(enemy => {
				enemy.hit()
				if (!enemy.alive) {
					this.kills.push(enemy)
				}
			})
		}
		if (this.player.canDoAction() && Gine.keyboard.allPressed()[KEYCODES.E]) {
			if (this.player.isCarrying === 0) {
				const ents = Entity.entities.filter(
					e => (e.type === 'bear' || !e.alive) && e._id !== this.player._id
				)
				const targets = checkCollission(this.player, ents).sort((a, b) => {
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
					if (targets[0].type === 'bear') {
						this.winTheGame()
					} else {
						this.player.carry(targets[0])
					}
				}
			} else {
				this.player.drop()
			}
			this.player.setAction()
		}
		this.player.tick(delta)
		this.viewport.x = this.player.x - this.viewport.width
		this.viewport.y = this.player.y - this.viewport.height
		Entity.entities
			.filter(e => e.alive && e._id !== this.player._id)
			.forEach(enemy => enemy.update(delta))
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
		this.timePassed++
		if (this.timePassed === 20) {
			if (!this.flags.get('weatherChange')) {
				this.flags.set('weatherChange', true)
				GUI.createAlert('Oh it is getting colder. I should save up some food.')
			}
			if (this.flags.get('weatherDown') === true) {
				this.map.weather--
				if (this.map.weather <= 0) {
					this.map.weather = 0
					this.flags.set('weatherDown', false)
					if (!this.flags.get('yearComplete')) {
						this.flags.set('yearComplete', true)
						GUI.createAlert('The winter has gone, maybe I can find mom')
						// new BearParent(Math.random() * 1200, Math.random() * 1200)
						new BearParent(300, 300)
					}
				}
			} else {
				if (!this.flags.get('yearComplete')) {
					this.map.weather++
					if (this.map.weather > 3) {
						this.map.weather = 2
						this.flags.set('weatherDown', true)
					}
				}
			}
			this.timePassed = 0
			this.spawnAnimals(this.map.weather)
		}
		Entity.entities.forEach((e, i) => {
			if (!e.alive && (e as any).lifePoints === 0) Entity.entities.splice(i, 1)
		})
		if (this.lastAlert === 0 && this.kills.length === 0) {
			this.lastAlert = Date.now()
			GUI.createAlert("Oh no, where's mom? I'm lost!")
			GUI.createAlert("I'm hungry too, maybe I can find something to eat...")
			GUI.createAlert('--- Use WSAD to move ---')
			GUI.createAlert('--- Use the SPACE bar to attack & eat ---')
		}
		if (!this.flags.get('staminaWarning') && this.player.stamina < 0.4) {
			GUI.createAlert("I'm getting tired, I should rest...", 6)
			this.flags.set('staminaWarning', true)
		}
		if (!this.flags.get('foodWarning') && this.player.hunger < 0.4) {
			GUI.createAlert("I am really hungry, I may die if I don't eat...", 6)
			this.flags.set('foodWarning', true)
		}
	}

	init() {}

	frame() {
		this.map.draw(this.viewport.x, this.viewport.y)
		Entity.entities
			.filter(e => e.type !== 'player')
			.forEach((e, i) => {
				e.draw(this.viewport.x, this.viewport.y)
			})
		this.player.draw()
		this.drawStats()
		GUI.drawAlerts()
		if (this.flags.get('gameWon') === true) {
			Gine.handle.draw(Gine.store.getImage('game-completed')!, 100, 50)
			Gine.handle.text('You scored: ' + this.flags.get('totalScore') + ' points', 100, 32 )
			Gine.handle.text('You played for: ' + this.flags.get('timePlayed') + ' seconds', 300, 32)
		}
		if (this.flags.get('dead') === true) {
			Gine.handle.draw(Gine.store.getImage('game-over')!, 100, 50)
		}
	}

	drawStats() {
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

		for (var i = 0; i < this.player.health; i++) {
			Gine.handle.draw(Gine.store.getImage('heart')!, 8, 280 + i * 18)
		}
	}

	spawnAnimals(weather: number) {
		let bunnies = 0
		let wolves = 0
		switch (weather) {
			case 0:
				bunnies = 5
				break
			case 1:
				bunnies = 3
				break
			case 2:
				bunnies = 2
				wolves = 1
				break
			case 3:
				wolves = 2
				break
		}

		if (bunnies > 0) {
			for (var i = 0; i < bunnies; i++) {
				new Bunny(Math.random() * 1200, Math.random() * 1200)
			}
		}
		if (wolves > 0) {
			for (var i = 0; i < wolves; i++) {
				new Wolf(Math.random() * 1200, Math.random() * 1200)
			}
		}
	}

	winTheGame() {
		this.flags.set('gameWon', true)
		console.log('For you speedrunners! Here are your stats!')
		console.log('You scored: ' + this.calculateScore() + ' points')
		console.log('You played for: ' + this.calculateTime() + ' seconds')
		console.log('Thanks for playing! @Bjeaurn on Twitch, Twitter and more!')
	}

	gameLost() {
		this.flags.set('dead', true)
		console.log('You scored: ' + this.calculateScore() + ' points')
		console.log('You played for: ' + this.calculateTime() + ' seconds')
	}

	calculateTime() {
		const timePlayed = (Date.now() - this.startTime) / 1000
		this.flags.set('timePlayed', timePlayed)
		return timePlayed
	}

	calculateScore() {
		const killScore = this.kills.reduce((p, c) => {
			return p + c.points
		}, 0)
		const lifeScore = this.player.health * 2
		const hungerScore = Math.round(this.player.hunger * 25)
		const totalScore = lifeScore + killScore + hungerScore
		this.flags.set('totalScore', totalScore)
		return totalScore
	}
}
