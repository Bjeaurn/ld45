import { BasicAsset, Config, DEFAULT_CONFIG, Gine, IConfigArguments, SpriteOptions } from 'gine'

import { MainScene } from './scenes/main'

const cfg: Config = new Config(
	document.querySelector('#game') as HTMLCanvasElement,
	Object.assign(DEFAULT_CONFIG, {
		width: 600,
		height: 400,
		tickRate: 120
	} as IConfigArguments)
)

const game = new Gine(cfg)
const assets: BasicAsset[] = [{ name: 'logo', src: 'logo.png' }]
assets.forEach(d => {
	Gine.store.image(d.name, d.src)
})
Gine.store.sprite('player', 'spritesheet-example.png', {
	widthPerImage: 64,
	heightPerImage: 64,
	imagesPerRow: 5,
	numberOfFrames: 9,
	ticksPerFrame: 24
} as SpriteOptions)

const mainScene = new MainScene()
game.changeScene(mainScene)
game.start()

Gine.keyboard.key$.subscribe()
Gine.mouse.mouse$.subscribe()

// Gine.events
// 	.pipe(filter(ev => ev === Scene.DESTROY_CURRENT_SCENE))
// 	.subscribe(ev => {
// 		game.changeScene(mainScene)
// 	})

Gine.events.subscribe(ev => console.log(ev))
