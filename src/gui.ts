import { Gine, ImageAsset, SpriteAsset } from 'gine'

export class GUI {
	static alerts: Alert[] = []
	static createAlert(text: string, duration?: number) {
		GUI.alerts.push(new Alert(text, duration))
	}

	static drawAlerts() {
		if (GUI.alerts.length > 0) {
			const alert = GUI.alerts[0]
			alert.draw()
		}
	}

	static updateAlerts(
		delta: number,
		isActionButtonPressed: boolean,
		lastAlert: number
	): boolean {
		if (GUI.alerts.length > 0) {
			const alert = GUI.alerts[0]
			alert.update(delta)
			if (alert.duration && alert.duration <= 0) {
				this.alerts.splice(0, 1)
				return true
			} else if (
				Date.now() >= lastAlert + 800 &&
				isActionButtonPressed === true
			) {
				this.alerts.splice(0, 1)
				return true
			}
		}
		return false
	}
}

export class Alert {
	public x: number
	public y: number
	private image: ImageAsset
	private eBtn: SpriteAsset
	private metrics: TextMetrics
	constructor(public text: string, public duration?: number) {
		this.image = Gine.store.getImage('alert-box')!
		this.eBtn = Gine.store.getSprite('e-button')!
		this.x = (Gine.CONFIG.width - this.image.width) / 2
		this.y = Gine.CONFIG.height - this.image.height - 16
		this.metrics = Gine.handle.handle.measureText(this.text)
	}

	update(delta: number) {
		if (this.duration) {
			this.duration -= delta
			if (this.duration <= 0) {
			}
		}
	}

	draw() {
		Gine.handle.draw(this.image, this.x, this.y)
		Gine.handle.text(
			this.text,
			(Gine.CONFIG.width - this.metrics.width) / 2,
			this.y + 24
		)
		if (!this.duration) {
			Gine.handle.drawSprite(
				this.eBtn,
				this.x + this.image.width - 8,
				this.y - 8
			)
		}
	}
}
