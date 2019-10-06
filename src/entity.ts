export class Entity {
	static entities: Entity[] = []
	type: string = 'entity'
	alive: boolean = true
	width: number = 0
	height: number = 0
	x: number = 0
	y: number = 0
	public _id: number = Entity.entities.length + 1

	constructor() {
		Entity.entities.push(this)
	}

	despawn() {
		const idx = Entity.entities.findIndex(e => e._id === this._id)
		if (idx > -1) {
			Entity.entities.splice(idx, 1)
		}
	}

	draw(x: number, y: number) {}
	update(delta: number) {}
}
