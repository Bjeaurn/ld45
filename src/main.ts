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
const assets: BasicAsset[] = [
	{ name: 'grass', src: 'grass.png' },
	{ name: 'tree', src: 'tree.png' },
	{ name: 'meat-empty', src: 'meat-empty.png' },
	{ name: 'meat-full', src: 'meat-filled.png' },
	{ name: 'alert-box', src: 'alert-box.png' },
	{ name: 'stamina-empty', src: 'stamina-empty.png' },
	{ name: 'stamina-full', src: 'stamina-full.png' }
]
assets.forEach(d => {
	Gine.store.image(d.name, d.src)
})

Gine.store.sprite('grass', 'grass-sprite.png', new SpriteOptions(32, 32, 4, 4))

Gine.store.sprite('tree', 'tree-sprite.png', new SpriteOptions(32, 32, 4, 4))

Gine.store.sprite('bear-cub', 'bear-cub-sprite.png', {
	widthPerImage: 18,
	heightPerImage: 22,
	imagesPerRow: 6,
	numberOfFrames: 7,
	ticksPerFrame: 10,
	frameIndex: 0
})

Gine.store.sprite(
	'e-button',
	'e-button-sprite.png',
	new SpriteOptions(16, 16, 4, 4, 64)
)

Gine.store.sprite('bunny', 'bunny-sprite.png', {
	widthPerImage: 11,
	heightPerImage: 15,
	imagesPerRow: 5,
	numberOfFrames: 2
} as SpriteOptions)
// Gine.store.sprite('player', 'spritesheet-example.png', {
// 	widthPerImage: 32,
// 	heightPerImage: 32,
// 	imagesPerRow: 5,
// 	numberOfFrames: 9,
// 	ticksPerFrame: 24
// } as SpriteOptions)

const mainScene = new MainScene()
game.changeScene(mainScene)
game.start()

Gine.keyboard.key$.subscribe()
// Gine.mouse.mouse$.subscribe()

// Gine.events
// 	.pipe(filter(ev => ev === Scene.DESTROY_CURRENT_SCENE))
// 	.subscribe(ev => {
// 		game.changeScene(mainScene)
// 	})

Gine.events.subscribe(ev => console.log(ev))
