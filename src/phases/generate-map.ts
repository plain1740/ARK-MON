type RoomType = 
  | "普通怪物"
  | "精英怪物"
  | "宝箱"
  | "休息"
  | "商店"
  | "事件"
  | "BOSS";

// 房间类型权重
const baseWeights: Record<RoomType, number> = {
  "普通怪物": 50,
  "精英怪物": 20,
  "宝箱": 15,
  "休息": 10,
  "商店": 5,
  "事件": 5,
};

// 1. 加权随机选择函数
function weightedRandomChoice(weightMap: Record<string, number>): string | undefined {
  if (!weightMap || Object.keys(weightMap).length === 0) {
    console.warn("weightedRandomChoice: 参数为空或未定义");
    return undefined;
  }

  const entries = Object.entries(weightMap);
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);

  if (totalWeight === 0) {
    console.warn("weightedRandomChoice: 权重总和为0");
    return undefined;
  }

  let random = Math.random() * totalWeight;

  for (const [key, weight] of entries) {
    if (random < weight) {
      return key;
    }
    random -= weight;
  }
  // 理论上不会到这里，兜底返回第一个
  return entries[0][0];
}

// 2. 生成层节点数，范围2~5随机
function randomNodeCount(): number {
  return Math.floor(Math.random() * 3) + 2; // 2~5
}

// 3. 根据规则返回当前层允许的房间权重
function getWeightsByLayer(layer: number, strict = false): Record<RoomType, number> {
  if (strict) {
    if (layer === 14) return { "休息": 1 };
    if (layer === 15) return { "BOSS": 1 };
  }

  const weights: Record<RoomType, number> = { ...baseWeights };

  if (layer === 1) return { "普通怪物": 1 };
  if (layer === 8) return { "宝箱": 1 };

  if (layer <= 4) {
    weights["精英怪物"] = 0;
    weights["休息"] = 0;
  }

  if (layer > 12) {
    weights["休息"] = 0;
  }

  return weights;
}

// 4. 判断房间是否属于“特殊类型”
function isSpecialRoom(room: RoomType) {
  return ["精英怪物", "休息", "商店", "宝箱"].includes(room);
}

export function generateMap(layers: number = 15): RoomType[][] {
  const map: RoomType[][] = [];

  for (let layer = 1; layer <= layers; layer++) {
    // 特殊层数节点数固定
    let nodesCount: number;
    if (layer === 14) {
      nodesCount = 3;
    } else if (layer === 15) {
      nodesCount = 1;
    } else {
      nodesCount = randomNodeCount();
    }

    const layerRooms: RoomType[] = [];

    // 是否强制指定房型
    const isStrict = layer === 14 || layer === 15;
    let weights = getWeightsByLayer(layer, isStrict);

    for (let nodeIndex = 0; nodeIndex < nodesCount; nodeIndex++) {
      let currentWeights = { ...weights };

      if (!isStrict && layer > 1) {
        // 父母房间规则
        const parentIndex = Math.min(nodeIndex, map[layer - 2].length - 1);
        const parentRoom = map[layer - 2][parentIndex];
        if (isSpecialRoom(parentRoom)) {
          currentWeights[parentRoom] = 0;
        }

        // 兄弟房间规则
        for (const sibling of layerRooms) {
          if (isSpecialRoom(sibling) || sibling === "普通怪物" || sibling === "事件") {
            currentWeights[sibling] = 0;
          }
        }

        // 移除无效权重项
        for (const key in currentWeights) {
          if (currentWeights[key as RoomType] <= 0) {
            delete currentWeights[key as RoomType];
          }
        }

        if (Object.keys(currentWeights).length === 0) {
          currentWeights = { "普通怪物": 1 }; // fallback
        }
      }

      const chosen = weightedRandomChoice(currentWeights);
      layerRooms.push(chosen as RoomType);
    }

    map.push(layerRooms);
  }

  return map;
}
// 6. 打印结果
export  function printMap(map: RoomType[][]) {
  for (let i = 0; i < map.length; i++) {
    console.log(`第${i + 1}层 (${map[i].length}个节点):`, map[i]);
  }
}

type RoomType = string;
type Connection = { from: number; to: number }; // 上层节点索引 -> 下层节点索引


export function generateConnections(map: RoomType[][]): Connection[][] {
  const connections: Connection[][] = [];

  for (let layer = 0; layer < map.length - 1; layer++) {
    const upperCount = map[layer].length;
    const lowerCount = map[layer + 1].length;

    const conn: Connection[] = [];
    const upperLinks = Array(upperCount).fill(0);
    const lowerLinks = Array(lowerCount).fill(0);

    for (let i = 0; i < lowerCount; i++) {
      const targetLinkCount = Math.floor(Math.random() * 3) + 1;
      const connected: number[] = [];

      // 获取上层节点索引及其与当前节点的距离
      const candidates = [...Array(upperCount).keys()].map(j => ({
        index: j,
        dist: Math.abs(j - i * upperCount / lowerCount)
      })).sort((a, b) => a.dist - b.dist);

      let primary = 0;
      while (connected.length < targetLinkCount && primary < candidates.length) {
        // 50% 使用最近（primary），50% 使用次近（primary + 1）
        const pick = (Math.random() < 0.5 || primary + 1 >= candidates.length)
          ? candidates[primary]
          : candidates[primary + 1];

        const j = pick.index;

        if (upperLinks[j] >= 3 || connected.includes(j)) {
          primary++;
          continue;
        }

        const isCrossing = conn.some(c =>
          (c.from < j && c.to > i) || (c.from > j && c.to < i)
        );
        if (isCrossing) {
          primary++;
          continue;
        }

        conn.push({ from: j, to: i });
        upperLinks[j]++;
        lowerLinks[i]++;
        connected.push(j);
        primary++;
      }

      // 如果完全没有连接成功（极小概率）
      if (connected.length === 0) {
        const fallback = candidates.find(c => upperLinks[c.index] < 3);
        if (fallback) {
          conn.push({ from: fallback.index, to: i });
          upperLinks[fallback.index]++;
          lowerLinks[i]++;
        }
      }
    }

    connections.push(conn);
  }

  return connections;
}


export function visualizeMap(map: RoomType[][], connections: Connection[][]): void {
  console.log("地图结构：");

  for (let layer = 0; layer < map.length; layer++) {
    const line = map[layer].map((room, i) => `[${layer}-${i} ${room}]`).join("  ");
    console.log(line);

    // 显示连接线
    if (layer < connections.length) {
      const conn = connections[layer];
      const connLine = conn.map(c => `↑${layer}-${c.from}→${layer + 1}-${c.to}`).join(", ");
      console.log("连接: ", connLine);
    }

    console.log("");
  }
}
