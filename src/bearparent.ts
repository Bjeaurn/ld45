import { Gine, Math2D, SpriteAsset } from 'gine'

import { Entity } from './entity'
import { rotateSprite } from './util'

export class BearParent extends Entity {
	type: 'bear' = 'bear'
	image: SpriteAsset
	moveSpeed: number = 40
	direction: number = 90
	status: 'moving' | 'chilling' = 'moving'
	lastActionTime: number = 0
	delay: number = 4000

	constructor(public x: number, public y: number) {
		super()
		this.image = Gine.store.getSprite('big-bear')!
		this.width = this.image.sizeX
		this.height = this.image.sizeY
	}

	update(delta: number) {
		if (!this.alive) {
			return
		}
		if (this.lastActionTime + this.delay <= Date.now()) {
			switch (this.status) {
				case 'moving':
					this.status = 'chilling'
					this.lastActionTime = Date.now()
					this.delay = Math.random() * 5000 + 2000
					break
				case 'chilling':
					this.status = 'moving'
					const player = Entity.entities.find(e => e.type === 'player')
					if (player) {
						this.direction = this.calculateDirection(player.x, player.y)
					} else {
						this.direction = Math.round(Math.random() * 8) * 45
					}
					this.lastActionTime = Date.now()
					this.delay = Math.random() * 3000 + 1000
					break
			}
		}
		if (this.status === 'chilling') {
			const xy = Math2D.degreesToXY(this.direction)
			this.x += xy.x * this.moveSpeed * delta
			this.y += xy.y * this.moveSpeed * delta
		}
	}

	draw(x: number, y: number) {
		rotateSprite(
			this.image as SpriteAsset,
			this.x - x,
			this.y - y,
			this.direction,
			0
		)
	}

	hit() {}
	calculateDirection(targetX: number, targetY: number): number {
		return (Math.atan2(targetY - this.y, targetX - this.x) * 180) / Math.PI + 90
	}
}
