import { Gine, ImageAsset } from 'gine'

import { circleCollission } from './util'

function generateTrees(amount: number = 1, trees: any[]) {
	for (let i = 0; i < amount; i++) {
		const tree = {
			x: Math.random() * 1200,
			y: Math.random() * 1200,
			width: 28
		}
		if (!trees.find(t => circleCollission(tree, t))) {
			trees.push(tree)
		}
	}
}

const trees: Array<{ x: number; y: number; width: number }> = [
	{ x: 50, y: 60, width: 28 }
]

generateTrees(200, trees)

export class Map {
	totalWidth: number
	totalHeight: number
	grass: ImageAsset
	tree: ImageAsset
	boundaries: { width: number; height: number; tileSize: number }
	constructor() {
		this.totalWidth = Gine.CONFIG.width / Gine.CONFIG.tileSize
		this.totalHeight = Gine.CONFIG.height / Gine.CONFIG.tileSize
		this.grass = Gine.store.getImage('grass')!
		this.tree = Gine.store.getImage('tree')!
		this.boundaries = {
			width: Gine.CONFIG.width,
			height: Gine.CONFIG.height,
			tileSize: Gine.CONFIG.tileSize * 2
		}
	}

	draw(x: number, y: number) {
		for (var i = 0; i < this.totalWidth; i++) {
			for (var j = 0; j < this.totalHeight; j++) {
				Gine.handle.handle.drawImage(
					this.grass.image,
					i * Gine.CONFIG.tileSize,
					j * Gine.CONFIG.tileSize
				)
			}
		}
		trees
			.filter(
				t =>
					t.x >= x - this.boundaries.width - this.boundaries.tileSize &&
					t.x <= x + this.boundaries.width + this.boundaries.tileSize &&
					t.y >= y - this.boundaries.height - this.boundaries.tileSize &&
					t.y <= y + this.boundaries.height + this.boundaries.tileSize
			)
			.forEach(t => {
				Gine.handle.draw(
					this.tree,
					t.x - t.width / 2 - x,
					t.y - t.width / 2 - y
				)
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
