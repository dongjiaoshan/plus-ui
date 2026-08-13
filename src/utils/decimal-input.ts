/**
 * 小数输入框的字符归一 —— 让用户在**任何标点习惯下**都能把小数打进去。
 *
 * 为什么需要它：`el-input-number` 底层渲染的是 `<input type="number">`，浏览器会**静默丢弃**
 * 它不认的字符。中文输入法处于全角标点态时，句号键产生的是 `。`(U+3002) 而不是 `.`，
 * 于是 `12。345` 直接变成 `12345` —— 用户看到「小数点打不出来」，而值已经悄悄放大了 1000 倍且能通过校验。
 * （半角 `.` 与全角句点 `．`(U+FF0E) 浏览器会正常接受，只有 `。`/`，` 这类会被吞。）
 * 这类框还**不会派发 `beforeinput`**，所以「拦截后替换成半角点」的补丁根本没有触发点。
 *
 * 结论：要让小数真的录得进去，输入框就不能是 `type="number"`——改用 `el-input`
 * （`inputmode="decimal"` 仍出数字键盘）+ 本模块做归一。
 *
 * 归一口径与小程序端 `miniapp/src/pages/breed/feed/list/box-input.ts` 一致：
 * 全角转半角 → 常见分隔符归一成小数点 → **取最长合法前缀**。
 */

/** 全角数字 → 半角。 */
const FULLWIDTH_DIGITS = /[０-９]/g;

/**
 * 会被当成小数点的字符：中文句号 / 全角句点 / 中英文逗号 / 顿号 / 间隔号 / 空白。
 * 意图明确就是小数点，必须归一，**不能当成非法字符剥掉** —— 剥掉会让两侧数字拼起来，
 * 把 `1。5` 变成 `15`（静默放大 10 倍）。
 */
const DECIMAL_SEPARATORS = /[。．，,、·・\s]/g;

/**
 * 归一到「最长合法前缀」：遇到真正非法的字符（字母 / 符号）就地截断，
 * **绝不跨过它把两侧数字拼起来**。`12.` 这种中间态原样放行，否则小数点一敲就被吃掉。
 *
 * @param raw               输入框原始文本
 * @param maxFractionDigits 小数位上限（与后端 `@Digits.fraction` / DDL 的 DECIMAL 标度对齐）
 */
export function sanitizeDecimalInput(raw: string | number | null | undefined, maxFractionDigits: number): string {
  const normalized = String(raw ?? '')
    .replace(FULLWIDTH_DIGITS, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(DECIMAL_SEPARATORS, '.');
  const m = normalized.match(new RegExp(`^\\d*(?:\\.\\d{0,${maxFractionDigits}})?`));
  return m ? m[0] : '';
}

/**
 * 归一后的文本 → 提交用数值。`''` / `'12.'` 这类中间态返回 `undefined`（让必填校验去报错），
 * 不返回 0 —— 0 会被「必须大于 0」的规则误报成「填了个 0」而不是「没填」。
 */
export function toDecimalValue(text: string): number | undefined {
  if (!/^\d+(?:\.\d+)?$/.test(text)) {
    return undefined;
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}
