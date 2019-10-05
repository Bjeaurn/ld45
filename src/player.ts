import { Gine, KEYCODES, Math2D, SpriteAsset } from 'gine'

import { Entity } from './entity'
import { rotateSprite, xyToDegrees } from './util'

export class Player extends Entity {
	image: SpriteAsset
	isColliding: boolean = false
	private moveSpeed: number = 35
	private direction: number = 0
	private dirArr: number[] = []
	private actionTime: number = 0
	public isCarrying: number = 0
	public isAttacking: boolean = false
	private attackDelayTime: number = 0
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
		this.handleKeyboard(delta)
		if (this.attackIsDelayed) {
			if (Date.now() >= this.attackDelayTime + this.attackDelay) {
				this.attackIsDelayed = false
				this.attackDelayTime = 0
			}
		}

		if (this.attackDelayTime > 0) {
			this.image.update()
		} else {
			this.image.currentSpriteIndex = 0
		}
	}

	handleKeyboard(delta: number) {
		if (this.isColliding) {
			this.moveSpeed = 10
		} else {
			this.moveSpeed = 35
		}
		this.isAttacking = false
		const vector = { x: 0, y: 0 }
		if (Gine.keyboard.allPressed()[KEYCODES.W]) {
			vector.y -= delta * this.moveSpeed
		}
		if (Gine.keyboard.allPressed()[KEYCODES.D]) {
			vector.x += delta * this.moveSpeed
		}
		if (Gine.keyboard.allPressed()[KEYCODES.S]) {
			vector.y += delta * this.moveSpeed
		}
		if (Gine.keyboard.allPressed()[KEYCODES.A]) {
			vector.x -= delta * this.moveSpeed
		}
		if (vector.x !== 0 || vector.y !== 0) {
			this.direction = xyToDegrees(vector.x, -vector.y)
		}
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
		if (!this.attackIsDelayed) {
			const xy = Math2D.degreesToXY(this.direction)
			this.x += xy.x * delta * this.attackSpeed
			this.y += xy.y * delta * this.attackSpeed
			this.isAttacking = true
			this.setAttackDelay()
		}
	}

	canDoAction(delta: number): boolean {
		if (this.actionTime > 0) {
			this.actionTime -= delta
		}
		if (this.actionTime < 0) {
			this.actionTime = 0
		}
		return this.actionTime === 0
	}

	setAction() {
		this.actionTime = 0.2
	}

	carry(entity: any) {
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
