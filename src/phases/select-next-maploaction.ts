import { UiMode } from "#enums/ui-mode";
import { globalScene } from "#app/global-scene";

export class SelectNextRoomPhase {
  private currentLayer: number;
  private currentIndex: number;

  constructor(currentLayer: number, currentIndex: number) {
    this.currentLayer = currentLayer;
    this.currentIndex = currentIndex;
  }

  start() {
    const nextLayer = this.currentLayer + 1;
    const nextRooms = globalScene.map[nextLayer];

    // 找到当前节点连接到的目标节点
    const connections = globalScene.connections[this.currentLayer].filter(c => c.from === this.currentIndex);
    const targetIndices = connections.map(c => c.to);

    if (targetIndices.length === 0) {
      console.warn("当前节点没有连接到下层任何节点");
      return;
    }

    let selected = 0; // 当前选中的目标下标
    globalScene.ui.setMode(UiMode.MENU, () => {
      // 渲染选项
      this.renderOptions(nextRooms, targetIndices, selected);

      // 绑定输入事件
      globalScene.ui.onKeyPress = (key: string) => {
        if (key === "a") selected = (selected - 1 + targetIndices.length) % targetIndices.length;
        if (key === "d") selected = (selected + 1) % targetIndices.length;

        if (key === "Enter") {
          globalScene.moveTo(nextLayer, targetIndices[selected]);
          globalScene.ui.setMode(UiMode.MESSAGE);
        }

        this.renderOptions(nextRooms, targetIndices, selected);
      };
    });
  }

  renderOptions(rooms: RoomType[], indices: number[], selected: number) {
    globalScene.ui.showText(
      "请选择进入的房间：\n" +
        indices
          .map((idx, i) => (i === selected ? `> ${rooms[idx]}` : `  ${rooms[idx]}`))
          .join("\n"),
    );
  }
}