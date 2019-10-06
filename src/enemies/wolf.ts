import { Gine, Math2D, SpriteAsset } from 'gine'
import { Player } from 'src/player'

import { Entity } from '../entity'
import { rotateSprite } from '../util'
import { Enemy } from './enemy'

export class Wolf extends Enemy {
	type: 'wolf' = 'wolf'
	selectedIndex: number = 0
	lastHit: number = 0
	health: number = 3
	lifePoints: number = 0.05
	points: number = 5
	target?: Entity
	targetTime: number = 0
	distanceToTarget: number = 0
	carrying?: Entity
	moveVector?: { x: number; y: number }
	moveSpeed: number = 25
	attackDelay: number = 1000
	startPos: { x: number; y: number }
	lastAttack: number = 0
	mode: 'moving' | 'hunting' | 'defending' | 'carrying' = 'moving'
	constructor(x: number, y: number) {
		super(x, y, Gine.store.getSprite('wolf')!)
		this.startPos = { x, y }
	}

	hit() {
		this.lastAttack = Date.now() + this.attackDelay / 2
		this.selectedIndex = 2
		this.lastHit = Date.now()
		this.health--
		if (this.health <= 0) {
			this.die()
		}
		if (this.carrying) {
			this.carrying = undefined
		}
		this.mode = 'defending'
		this.target = undefined
		this.selectTarget()
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
			if (Date.now() > this.targetTime + 2500) {
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
						this.direction = this.calculateDirection(
							this.target.x,
							this.target.y
						)
						this.moveVector = Math2D.degreesToXY(this.direction)
						this.mode = 'moving'
					} else {
						if (!this.carrying && this.distanceToTarget < 16) {
							if (this.target.alive) {
								if (Date.now() >= this.lastAttack + this.attackDelay) {
									;(this.target as Enemy | Player).hit()
									this.lastAttack = Date.now()
								}
							} else {
								this.carrying = this.target
								this.mode = 'carrying'
								// ;(this.target as Enemy | Player).consume()
								this.direction = this.calculateDirection(
									this.startPos.x,
									this.startPos.y
								)
								this.moveVector = Math2D.degreesToXY(this.direction)
								this.target = undefined
							}
						} else {
							this.direction = this.calculateDirection(
								this.target.x,
								this.target.y
							)
							this.moveVector = Math2D.degreesToXY(this.direction)
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
			if (this.moveVector) {
				this.x += this.moveVector.x * this.moveSpeed * delta
				this.y += this.moveVector.y * this.moveSpeed * delta
				this.carrying.x = this.x
				this.carrying.y = this.y
				if (this.calculateDistance(this.startPos as Entity) < 16) {
					if (this.carrying.type === 'player') {
						this.carrying = undefined
					} else {
						this.carrying.despawn()
					}
					this.despawn()
				}
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
			this.target = Entity.entities
				.filter(e => e.alive && e.type === 'player')
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
		if (this.target) {
			this.targetTime = Date.now()
			if (this.mode === 'defending') {
				this.targetTime -= 600
			}
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

			if (
				this.alive &&
				this.selectedIndex !== 0 &&
				Date.now() >= this.lastHit + 200
			)
				this.selectedIndex = 0
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
