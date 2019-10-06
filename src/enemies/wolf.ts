import { Gine, Math2D, SpriteAsset } from 'gine'
import { Player } from 'src/player'

import { Entity } from '../entity'
import { rotateSprite } from '../util'
import { Enemy } from './enemy'

export class Wolf extends Enemy {
	selectedIndex: number = 0
	health: number = 3
	lifePoints: number = 0.05
	target?: Entity
	targetTime: number = 0
	distanceToTarget: number = 0
	carrying?: Entity
	moveVector?: { x: number; y: number }
	moveSpeed: number = 25
	lastAttack: number = 0
	mode: 'moving' | 'hunting' | 'defending' | 'carrying' = 'moving'
	constructor(x: number, y: number) {
		super(x, y, Gine.store.getSprite('wolf')!)
	}

	hit() {
		this.selectedIndex = 2
		this.health--
		if (this.health <= 0) {
			this.die()
		}
		if (this.carrying) {
			this.carrying = undefined
			this.mode = 'defending'
			console.log(this)
		}
	}

	die() {
		this.selectedIndex = 1
		this.alive = false
		this.target = undefined
	}

	update(delta: number) {
		if (!this.target && !this.carrying) {
			this.selectTarget()
		} else if (this.target) {
			if (Date.now() > this.targetTime + 4000) {
				this.target = undefined
			} else {
				if (this.mode === 'moving') {
					this.distanceToTarget = this.calculateDistance(this.target)
					if (this.distanceToTarget < 60) {
						this.mode = 'hunting'
					} else {
						if (this.moveVector) {
							this.x += this.moveVector.x * this.moveSpeed * delta
							this.y += this.moveVector.y * this.moveSpeed * delta
						}
					}
				}
				if (this.mode === 'hunting') {
					this.direction = this.calculateDirection(this.target.x, this.target.y)
					this.distanceToTarget = this.calculateDistance(this.target)
					if (this.distanceToTarget > 60) {
						this.mode = 'moving'
					} else {
						if (!this.carrying && this.distanceToTarget < 16) {
							if (this.target.alive) {
								;(this.target as Enemy | Player).hit()
							} else {
								this.carrying = this.target
								this.mode = 'carrying'
								// ;(this.target as Enemy | Player).consume()
								this.moveVector = { x: 1, y: 0 }
								this.target = undefined
							}
						} else {
							// console.log(this.moveVector)
							if (this.moveVector) {
								this.x += this.moveVector.x * this.moveSpeed * delta
								this.y += this.moveVector.y * this.moveSpeed * delta
							}
						}
					}
				}
			}
		}
		if (this.mode === 'carrying' && this.carrying) {
			this.moveSpeed = 30
			this.direction = 90
			if (this.moveVector) {
				this.x += this.moveVector.x * this.moveSpeed * delta
				this.y += this.moveVector.y * this.moveSpeed * delta
				this.carrying.x = this.x
				this.carrying.y = this.y
			}
		}
		if (this.mode === 'defending') {
			this.mode = 'hunting'
		}
	}

	selectTarget() {
		if (this.mode !== 'defending') {
			this.target = Entity.entities
				.filter(e => !e.alive)
				.sort((a, b) => {
					// FIXME - Should be in the library. Math2D
					const ax = a.x - this.x
					const bx = b.x - this.x
					const ay = a.y - this.y
					const by = b.y - this.y
					const distanceA = Math.sqrt(ax * ax + ay * ay)
					const distanceB = Math.sqrt(bx * bx + by * by)
					return distanceA - distanceB
				})[0]
		}
		if (!this.target) {
			this.target = Entity.entities.find(e => e.alive)
		}
		if (this.target) {
			this.targetTime = Date.now()
			this.direction = this.calculateDirection(this.target.x, this.target.y)
			this.moveVector = Math2D.degreesToXY(this.direction)
		}
	}

	draw(x: number, y: number) {
		if (this.image) {
			// Gine.handle.handle.drawImage(this.image.image, this.x, this.y)
			rotateSprite(
				this.image as SpriteAsset,
				this.x - x,
				this.y - y,
				this.direction,
				this.selectedIndex
			)

			if (this.alive && this.selectedIndex !== 0) this.selectedIndex = 0
			// Gine.handle.handle.strokeRect(this.x, this.y, this.width, this.height)
			// Gine.handle.handle.beginPath()
			// Gine.handle.handle.ellipse(
			// 	this.x,
			// 	this.y,
			// 	this.width / 2,
			// 	this.width / 2,
			// 	this.direction,
			// 	0,
			// 	2 * Math.PI
			// )
			// Gine.handle.handle.stroke()
		}
	}

	calculateDistance(target: Entity): number {
		const a = this.x - target.x
		const b = this.y - target.y
		return +Math.sqrt(a * a + b * b)
	}

	calculateDirection(targetX: number, targetY: number): number {
		return (Math.atan2(targetY - this.y, targetX - this.x) * 180) / Math.PI + 90
	}
}
