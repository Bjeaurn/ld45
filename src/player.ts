import { Gine, ImageAsset, KEYCODES, Math2D } from 'gine'

import { Entity } from './entity'
import { xyToDegrees } from './util'

export class Player extends Entity {
	image: ImageAsset
	isColliding: boolean = false
	private moveSpeed: number = 35
	private direction: number = 0
	private dirArr: number[] = []

	public isAttacking: boolean = false
	private attackDelayTime: number = 0
	private attackDelay: number = 600
	private attackIsDelayed: boolean = false
	private attackSpeed: number = 700

	constructor(public x: number, public y: number) {
		super()
		this.image = Gine.store.getImage('bear-cub')!
		this.width = this.image.image.width
		this.height = this.image.image.height
	}

	tick(delta: number) {
		this.handleKeyboard(delta)
		if (this.attackIsDelayed) {
			if (Date.now() >= this.attackDelayTime + this.attackDelay) {
				this.attackIsDelayed = false
				this.attackDelayTime = 0
			}
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
		this.direction = xyToDegrees(vector.x, vector.y)
		this.x += vector.x
		this.y += vector.y
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

	setAttackDelay() {
		this.attackIsDelayed = true
		this.attackDelayTime = Date.now()
	}

	draw() {
		Math2D.rotate(this.image, this.x, this.y, this.direction)
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
