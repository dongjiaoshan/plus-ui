import { describe, expect, it } from 'vitest';
import { shiftYmd, todayYmd, ymdOf } from './date';

/**
 * 业务日期一律按中国（本地）时区算。
 *
 * 项目只在中国用，后端容器与 JVM 都是 Asia/Shanghai。旧写法 `toISOString().slice(0, 10)` 取的是
 * **UTC 的今天**，东八区 00:00–08:00 会退成昨天——农场早班（杀猪 / 摘菜 / 发货）正好在这个时段，
 * 表单默认日期错一天，仓库就照错的那天备货。
 */
describe('todayYmd / shiftYmd', () => {
  // 用本地时间构造，避开测试机时区差异（同 miniapp demand-date.test.ts 的既定写法）；
  // 断言只依赖「本地 0:30 与本地日期同日」这一事实，在任何时区都成立。
  const earlyMorning = new Date(2026, 7, 30, 0, 30, 0); // 本地 2026-08-30 00:30

  it('东八区凌晨取今天 → 当天，不退成昨天', () => {
    expect(todayYmd(earlyMorning)).toBe('2026-08-30');
    // 钉住对照：旧写法（UTC 口径）在东八区会给出前一天。只在 GMT+8 机器上断言具体错值，
    // 其余时区只断言「本地口径恒等于本地日历日」，不让用例挂在测试机时区上。
    if (-earlyMorning.getTimezoneOffset() === 480) {
      expect(earlyMorning.toISOString().slice(0, 10)).toBe('2026-08-29');
    }
  });

  it('白天取今天照常正确', () => {
    expect(todayYmd(new Date(2026, 7, 30, 15, 0, 0))).toBe('2026-08-30');
  });

  it('ymdOf 补零到两位', () => {
    expect(ymdOf(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('shiftYmd 跨月 / 跨年 / 闰年交给 Date 自己进位', () => {
    expect(shiftYmd(1, new Date(2026, 7, 31, 9, 0, 0))).toBe('2026-09-01');
    expect(shiftYmd(1, new Date(2026, 11, 31, 9, 0, 0))).toBe('2027-01-01');
    expect(shiftYmd(1, new Date(2024, 1, 28, 9, 0, 0))).toBe('2024-02-29');
    expect(shiftYmd(-30, new Date(2026, 2, 5, 9, 0, 0))).toBe('2026-02-03');
  });

  it('凌晨算 N 天后同样不偏一天', () => {
    expect(shiftYmd(1, earlyMorning)).toBe('2026-08-31');
  });
});
