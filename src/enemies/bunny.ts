import { Asset, Gine, Math2D, SpriteAsset } from 'gine'

import { rotateSprite } from '../util'
import { Enemy } from './enemy'

export type BunnyBehaviors = 'hopping' | 'eating' | 'scared'

export class Bunny extends Enemy {
	spriteIndex: number = 0
	moveSpeed: number = Math.random() * 15 + 10
	direction: number = 90
	points: number = 1
	constructor(public x: number, public y: number) {
		super(x, y, Gine.store.getSprite('bunny')!)
	}
	status: BunnyBehaviors = 'hopping'
	delay: number = 0
	lastActionTime: number = 0

	update(delta: number) {
		this.ebtn.update()
		if (!this.alive) {
			return
		}
		if (this.lastActionTime + this.delay <= Date.now()) {
			switch (this.status) {
				case 'hopping':
					this.status = 'eating'
					this.lastActionTime = Date.now()
					this.delay = Math.random() * 3000 + 2000
					break
				case 'eating':
					this.status = 'hopping'
					this.direction = Math.round(Math.random() * 8) * 45
					this.lastActionTime = Date.now()
					this.delay = Math.random() * 5000 + 1000
					break
			}
		}
		if (this.status === 'hopping') {
			const xy = Math2D.degreesToXY(this.direction)
			this.x += xy.x * this.moveSpeed * delta
			this.y += xy.y * this.moveSpeed * delta
		}
	}

	hit() {
		this.die()
	}

	die() {
		this.alive = false
		this.spriteIndex = 1
		this.lastActionTime = Date.now()
	}

	draw(x: number, y: number) {
		// Math2D.rotate(this.image, this.x, this.y, this.direction)
		if (
			!this.alive &&
			this.image &&
			Date.now() >= this.lastActionTime + 4000 &&
			Date.now() <= this.lastActionTime + 24000
		) {
			Gine.handle.drawSprite(this.ebtn, this.x - x - 8, this.y - y - 20)
		}
		if (this.image && this.image.type === Asset.SPRITE) {
			this.image.draw()
			rotateSprite(
				this.image as SpriteAsset,
				this.x - x,
				this.y - y,
				this.direction,
				this.spriteIndex
			)
		}
	}
}
