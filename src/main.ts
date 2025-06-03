import Phaser from "phaser";
import InvertPostFX from "./pipelines/invert";
import { version } from "../package.json";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import BBCodeTextPlugin from "phaser3-rex-plugins/plugins/bbcodetext-plugin";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin";
import TransitionImagePackPlugin from "phaser3-rex-plugins/templates/transitionimagepack/transitionimagepack-plugin";
import { initI18n } from "./plugins/i18n";

// 捕获全局错误
window.onerror = (_message, _source, _lineno, _colno, error) => {
  console.error(error);
  return true;
};

window.addEventListener("unhandledrejection", event => {
  console.error(event.reason);
});

// 设定相对位置方法
const setPositionRelative = function (guideObject: Phaser.GameObjects.GameObject, x: number, y: number) {
  const offsetX = guideObject.width * (-0.5 + (0.5 - guideObject.originX));
  const offsetY = guideObject.height * (-0.5 + (0.5 - guideObject.originY));
  this.setPosition(guideObject.x + offsetX + x, guideObject.y + offsetY + y);
};

Phaser.GameObjects.Container.prototype.setPositionRelative = setPositionRelative;
Phaser.GameObjects.Sprite.prototype.setPositionRelative = setPositionRelative;
Phaser.GameObjects.Image.prototype.setPositionRelative = setPositionRelative;
Phaser.GameObjects.NineSlice.prototype.setPositionRelative = setPositionRelative;
Phaser.GameObjects.Text.prototype.setPositionRelative = setPositionRelative;
Phaser.GameObjects.Rectangle.prototype.setPositionRelative = setPositionRelative;

document.fonts.load("16px emerald").then(() => document.fonts.load("10px pkmnems"));

let game;

const startGame = async () => {
  await initI18n();
  const LoadingScene = (await import("./loading-scene")).LoadingScene;
  const BattleScene = (await import("./battle-scene")).default;
  game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent: "app",
    scale: {
      width: 1920,
      height: 1080,
      mode: Phaser.Scale.FIT,
    },
    plugins: {
      global: [
        { key: "rexInputTextPlugin", plugin: InputTextPlugin, start: true },
        { key: "rexBBCodeTextPlugin", plugin: BBCodeTextPlugin, start: true },
        { key: "rexTransitionImagePackPlugin", plugin: TransitionImagePackPlugin, start: true },
      ],
      scene: [
        { key: "rexUI", plugin: UIPlugin, mapping: "rexUI" },
      ],
    },
    input: {
      mouse: { target: "app" },
      touch: { target: "app" },
      gamepad: true,
    },
    dom: { createContainer: true },
    antialias: false,
    pipeline: [InvertPostFX] as unknown as Phaser.Types.Core.PipelineConfig,
    scene: [LoadingScene, BattleScene],
    version: version,
  });
  game.sound.pauseOnBlur = false;
};

startGame();
