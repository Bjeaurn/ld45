import { ImageAsset, Math2D, SpriteAsset } from 'gine'

import { Entity } from '../entity'

export class Enemy extends Entity {
	alive: boolean = true
	direction: number = 0
	constructor(
		public x: number,
		public y: number,
		public image: ImageAsset | SpriteAsset
	) {
		super()
		if (this.image.imageLoaded) {
			this.width = this.image.image.width
			this.height = this.image.image.height
		} else {
			this.width = (this.image as SpriteAsset).sizeX
			this.height = (this.image as SpriteAsset).sizeY
		}
		console.log(this)
	}

	update(delta: number) {}

	draw(x: number, y: number) {
		if (this.image) {
			// Gine.handle.handle.drawImage(this.image.image, this.x, this.y)
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
}
