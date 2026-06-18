/**
 * 猪只状态机 — 客户端事件可用性矩阵（BRD-CORE-001 镜像 PigStateMachine.java）。
 *
 * 仅用于 UI 层"哪些事件按钮可点 / 哪些 disable"。
 * 真实 transition 校验由后端 PigStateMachine 兜底（前端漏判 / 越权 / 跨界都会被
 * `pig.event.invalid_transition` 拒绝）。
 *
 * 11 UI 事件 × 8 状态 × 2 性别（F/M）— 对齐 BRD-CORE-001-be 报告 + ADR-0016 状态轴解耦。
 * 仅种母猪(sow)走繁殖状态机；非种母猪（公猪/育肥/仔猪）current_status 为空 ''。
 *
 *   from\event | INTRO | BREED | FARROW | WEAN | OESTRUS | NULL_RETURN | DIE | ELIMINATE | SLAUGHTER | CASTRATE | TRANSFER
 *   ---------- |-------|-------|--------|------|---------|-------------|-----|-----------|-----------|----------|----------
 *   HB(F,sow)  |   -   |   ✓   |   -    |  -   |    -    |      -      |  ✓  |     ✓     |     ✓     |    -     |    ✓
 *   PZ(F,sow)  |   -   |   -   |   ✓    |  -   |    ✓    |      ✓      |  ✓  |     ✓     |     ✓     |    -     |    ✓
 *   FM(F,sow)  |   -   |   -   |   -    |  ✓   |    -    |      -      |  ✓  |     ✓     |     ✓     |    -     |    ✓
 *   DN/LC/KH/FQ|   -   |   ✓   |   -    |  -   |    -    |      -      |  ✓  |     ✓     |     ✓     |    -     |    ✓
 *   空(公/育肥)|   -   |   -   |   -    |  -   |    -    |      -      |  ✓  |     ✓     |     ✓     |   M ✓    |    ✓
 *   END        |   -   |   -   |   -    |  -   |    -    |      -      |  -  |     -     |     -     |    -     |    -
 *
 * INTRO 不走 fireEvent，由 BRD-EVENT-001 引种端点调 createPig（INTRO 本身不出现在 dropdown）。
 */

import type { PigLifecycle, PigSex, PigStatusEventCode, PigType } from '@/api/djs-breed/pig/types';

/** 11 events 全集（INTRO 不进 dropdown） */
export const PIG_DROPDOWN_EVENTS: PigStatusEventCode[] = [
  'BREED',
  'OESTRUS',
  'NULL_RETURN',
  'FARROW',
  'WEAN',
  'CASTRATE',
  'DIE',
  'ELIMINATE',
  'SLAUGHTER',
  'TRANSFER'
];

/** 终态（END） — 拒绝所有事件 */
function isTerminal(currentStatus: PigLifecycle | ''): boolean {
  return currentStatus === 'END';
}

/**
 * 判断单个事件在当前 pig 状态下是否合法。
 *
 * @param event       UI 事件码
 * @param currentStatus 当前生命周期状态
 * @param pigSex      性别 F/M
 * @param pigType     猪只类型（piglet/fattening 不参与 BREED/OESTRUS 等繁育流；
 *                    见 -be 报告 §"piglet/fattening 不参与状态机"）
 */
export function isEventAllowed(event: PigStatusEventCode, currentStatus: PigLifecycle | '', pigSex: PigSex, pigType?: PigType): boolean {
  // INTRO 不走 fireEvent 路径
  if (event === 'INTRO') return false;
  // 终态 END 拒绝所有事件
  if (isTerminal(currentStatus)) return false;

  switch (event) {
    case 'BREED':
      // 仅母猪（F）且 type=sow；piglet/fattening 不繁育
      if (pigSex !== 'F') return false;
      if (pigType === 'piglet' || pigType === 'fattening') return false;
      // 合法 from：HB / DN / LC / KH / FQ → PZ
      return ['HB', 'DN', 'LC', 'KH', 'FQ'].includes(currentStatus);

    case 'OESTRUS':
      // 母猪 PZ 查情：保持 PZ（确认妊娠仅落记录，不切态；无配怀 PH 中间态）
      if (pigSex !== 'F') return false;
      if (pigType === 'piglet' || pigType === 'fattening') return false;
      return currentStatus === 'PZ';

    case 'NULL_RETURN':
      // 母猪 PZ 返空：abort → LC / return → FQ / idle → KH
      if (pigSex !== 'F') return false;
      if (pigType === 'piglet' || pigType === 'fattening') return false;
      return currentStatus === 'PZ';

    case 'FARROW':
      // 母猪 PZ → FM（配种→分娩直达，无配怀 PH 中间态）
      if (pigSex !== 'F') return false;
      if (pigType === 'piglet' || pigType === 'fattening') return false;
      return currentStatus === 'PZ';

    case 'WEAN':
      // 母猪 FM → DN
      if (pigSex !== 'F') return false;
      if (pigType === 'piglet' || pigType === 'fattening') return false;
      return currentStatus === 'FM';

    case 'CASTRATE':
      // 公猪阉割（空状态，无状态变更）；与选猪 sex='M' 口径一致
      return pigSex === 'M' && !isTerminal(currentStatus);

    case 'DIE':
    case 'ELIMINATE':
    case 'SLAUGHTER':
      // 终态事件：任何非 END 状态均可（含 piglet/fattening HB）
      return !isTerminal(currentStatus);

    case 'TRANSFER':
      // 转栏：任何非 END 状态均可（不改 currentStatus，仅改 barn_id/pen_id）
      return !isTerminal(currentStatus);

    default:
      return false;
  }
}

/** 取当前 pig 可用的事件清单（顺序固定，符合业务直觉：常用繁育事件在前，终态事件在后） */
export function getAllowedEvents(currentStatus: PigLifecycle | '', pigSex: PigSex, pigType?: PigType): PigStatusEventCode[] {
  return PIG_DROPDOWN_EVENTS.filter((ev) => isEventAllowed(ev, currentStatus, pigSex, pigType));
}
