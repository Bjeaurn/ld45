import { Gine, ImageAsset } from 'gine'

import { circleCollission } from './util'

function generateTrees(amount: number = 1, trees: any[]) {
	for (let i = 0; i < amount; i++) {
		trees.push({
			x: Math.random() * 600,
			y: Math.random() * 400,
			width: 28
		})
	}
}

const trees: Array<{ x: number; y: number; width: number }> = [
	{ x: 50, y: 60, width: 28 }
]

generateTrees(20, trees)

export class Map {
	totalWidth: number
	totalHeight: number
	grass: ImageAsset
	tree: ImageAsset
	constructor() {
		this.totalWidth = Gine.CONFIG.width / Gine.CONFIG.tileSize
		this.totalHeight = Gine.CONFIG.height / Gine.CONFIG.tileSize
		this.grass = Gine.store.getImage('grass')!
		this.tree = Gine.store.getImage('tree')!
	}

	draw() {
		for (var i = 0; i < this.totalWidth; i++) {
			for (var j = 0; j < this.totalHeight; j++) {
				Gine.handle.handle.drawImage(
					this.grass.image,
					i * Gine.CONFIG.tileSize,
					j * Gine.CONFIG.tileSize
				)
			}
		}
		trees.forEach(t => {
			Gine.handle.draw(this.tree, t.x - t.width / 2, t.y - t.width / 2)
			// Gine.handle.handle.beginPath()
			// Gine.handle.handle.ellipse(
			// 	t.x + t.width / 2,
			// 	t.y + t.width / 2,
			// 	t.width / 2,
			// 	t.width / 2,
			// 	0,
			// 	0,
			// 	2 * Math.PI
			// )
			// Gine.handle.handle.stroke()
		})
	}

	mapCollission(entity: any): boolean {
		if (entity.x && entity.y && entity.width) {
			return !!trees.find(t => circleCollission(entity, t))
		}
		return false
	}
}
