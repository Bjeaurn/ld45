export class Entity {
	static entities: Entity[] = []
	alive: boolean = true
	width: number = 0
	height: number = 0
	x: number = 0
	y: number = 0

	constructor() {
		Entity.entities.push(this)
	}
}
