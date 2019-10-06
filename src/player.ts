import { Gine, KEYCODES, Math2D, SpriteAsset } from 'gine'

import { Enemy } from './enemies'
import { Entity } from './entity'
import { rotateSprite, xyToDegrees } from './util'

export class Player extends Entity {
	type: 'player' = 'player'
	image: SpriteAsset
	isColliding: boolean = false
	public health: number = 5
	public stamina: number = 1
	public hunger: number = 0.6
	public isCarrying: number = 0
	public isAttacking: boolean = false
	public starvingTime: number = 0

	private moveSpeed: number = 35
	private direction: number = 0
	private actionTime: number = 0
	private attackDelayTime: number = 0
	private lastHit: number = 0
	private attackDelay: number = 600
	private attackIsDelayed: boolean = false
	private attackSpeed: number = 700
	private carrying?: any

	constructor(public x: number, public y: number) {
		super()
		this.image = Gine.store.getSprite('bear-cub')!
		this.width = this.image.sizeX
		this.height = this.image.sizeY
	}

	tick(delta: number) {
		this.hunger -= delta * 0.006
		if (this.hunger < 0.2) {
			if (this.starvingTime === 0) {
				this.starvingTime = Date.now()
				this.hit()
			}
			if (Date.now() >= this.starvingTime + 10000) {
				this.hit()
				this.starvingTime = Date.now()
			}
		}
		if (this.actionTime > 0) {
			this.actionTime -= delta
		}
		if (this.actionTime < 0) {
			this.actionTime = 0
		}
		if (this.alive) {
			this.handleKeyboard(delta)
			if (this.attackIsDelayed) {
				if (Date.now() >= this.attackDelayTime + this.attackDelay) {
					this.attackIsDelayed = false
					this.attackDelayTime = 0
				}
			}

			if (Date.now() >= this.lastHit + 200) {
				if (this.attackDelayTime > 0) {
					this.image.update()
				} else {
					this.image.currentSpriteIndex = 0
				}
			}
		} else {
			this.image.currentSpriteIndex = 8
		}
	}

	handleKeyboard(delta: number) {
		if (this.isColliding) {
			this.moveSpeed = 10
		} else if (this.isCarrying) {
			this.moveSpeed = 25
		} else {
			this.moveSpeed = 35
		}
		this.isAttacking = false
		const vector = { x: 0, y: 0 }
		const vectorSpeed = (this.moveSpeed / 2) * (2 * this.stamina + 1) * delta
		if (Gine.keyboard.allPressed()[KEYCODES.W]) {
			vector.y -= vectorSpeed
		}
		if (Gine.keyboard.allPressed()[KEYCODES.D]) {
			vector.x += vectorSpeed
		}
		if (Gine.keyboard.allPressed()[KEYCODES.S]) {
			vector.y += vectorSpeed
		}
		if (Gine.keyboard.allPressed()[KEYCODES.A]) {
			vector.x -= vectorSpeed
		}
		if (vector.x !== 0 || vector.y !== 0) {
			if (this.stamina > 0) {
				this.stamina -= delta * 0.02
			} else {
				this.stamina = 0
			}
			this.direction = xyToDegrees(vector.x, -vector.y)
		} else {
			this.stamina += delta / 32
			if (this.stamina > 1) this.stamina = 1
			if (this.stamina < 1) {
				this.hunger -= delta * 0.007
			}
		}
		if (this.hunger < 0) this.hunger = 0
		if (this.hunger > 1) this.hunger = 1
		this.x += vector.x
		this.y += vector.y
		if (this.carrying) {
			this.handleCarry(vector)
		}
		if (Gine.keyboard.allPressed()[KEYCODES.SPACE]) {
			this.attack(delta)
		}
		this.x = +this.x.toFixed(3)
		this.y = +this.y.toFixed(3)
	}

	attack(delta: number) {
		if (this.isCarrying) {
			// Eat it!
			this.eat(this.carrying)
			this.setAttackDelay()
		} else {
			if (!this.attackIsDelayed && this.stamina >= delta) {
				const xy = Math2D.degreesToXY(this.direction)
				this.x += xy.x * delta * this.attackSpeed
				this.y += xy.y * delta * this.attackSpeed
				this.isAttacking = true
				this.setAttackDelay()
				this.stamina -= delta
			}
		}
	}

	eat(entity: Enemy) {
		if (entity.lifePoints) {
			this.hunger += entity.lifePoints
			this.stamina += entity.lifePoints / 2
			if (this.hunger > 1) this.hunger = 1
			if (this.stamina > 1) this.stamina = 1
			entity.consume()
		}
		this.drop()
	}

	canDoAction(): boolean {
		return this.actionTime === 0
	}

	setAction() {
		this.actionTime = 0.2
	}

	die() {
		console.log('You died')
		this.alive = false
		this.stamina = 0
		this.hunger = 0
	}

	hit() {
		this.lastHit = Date.now()
		this.image.currentSpriteIndex = 7
		this.health--
		if (this.health <= 0) {
			this.die()
		}
	}

	carry(entity: Enemy) {
		if (!this.carrying) {
			entity.x = this.x
			entity.y = this.y
			this.carrying = entity
			this.isCarrying = Date.now()
		}
	}

	handleCarry(vector: any) {
		if (this.carrying) {
			this.carrying.x += vector.x
			this.carrying.y += vector.y
		}
	}

	consume() {
		console.log('Game is over')
	}

	drop() {
		if (this.carrying) {
			this.carrying = undefined
			this.isCarrying = 0
		} else {
			this.isCarrying = 0
		}
	}

	setAttackDelay() {
		this.attackIsDelayed = true
		this.attackDelayTime = Date.now()
	}

	draw() {
		rotateSprite(this.image, 300, 200, this.direction)
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
