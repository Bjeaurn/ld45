import { Gine, SpriteAsset } from 'gine'

const halfTile = 32 / 2

export function boxCollission(e1: any, e2: any): boolean {
	if (
		e1.x &&
		e1.y &&
		e1.width &&
		e1.height &&
		e2.x &&
		e2.y &&
		e2.width &&
		e2.height
	) {
		return (
			e1.x - e1.width / 2 < e2.x + e2.width / 2 && // a
			e1.x + e1.width / 2 > e2.x - e2.width / 2 && // b
			e1.y - e1.height / 2 < e2.y + e2.height / 2 && // c
			e1.y + e1.height / 2 > e2.y - e2.height / 2 // d
		)
	}
	return false
}

export function circleCollission(e1: any, e2: any): boolean {
	if (e1.x && e2.x && e1.y && e2.y && e1.width && e2.width) {
		const dx = e1.x - e2.x
		const dy = e1.y - e2.y
		const distance = Math.sqrt(dx * dx + dy * dy)
		return distance < e1.width / 2 + e2.width / 2
	}
	return false
}

export function checkCollission(e1: any, entities: any[]) {
	return entities.filter(e2 => {
		return circleCollission(e1, e2)
	})
}

export function xyToDegrees(dx: number, dy: number): number {
	const rad = Math.atan2(dx, -dy)
	return rad * (180 / Math.PI)
}

export function rotateSprite(
	image: SpriteAsset,
	x: number,
	y: number,
	degrees: number = 0,
	index?: number
): void {
	if (index) {
		image.calculatePerIndex(index)
	} else {
		image.draw()
	}
	const radians = (degrees * Math.PI) / 180
	Gine.handle.handle.save()
	Gine.handle.handle.translate(x, y)
	Gine.handle.handle.rotate(radians)
	Gine.handle.handle.drawImage(
		image.image,
		image.sourceX,
		image.sourceY,
		image.sizeX,
		image.sizeY,
		0 - image.sizeX / 2,
		0 - image.sizeY / 2,
		image.sizeX,
		image.sizeY
	)
	Gine.handle.handle.restore()
}
