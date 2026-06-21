/**
 * 由追溯码推导业态 type（供 TraceLabelDialog 二维码 URL /trace/{type}/{code} 用）。
 *
 * traceCode 格式 `T{yyyyMMdd}{PG|VG|GF}{seq6}`，第 10-11 位（slice 9..11）是业态码：
 *   PG → pork / VG → veg / GF → gift。解析不出兜底 'pork'。
 * 落地页会用后端 codeType 兜底覆盖，故此处尽力即可。
 */
export function traceTypeFromCode(code?: string): string {
  const seg = (code || '').slice(9, 11);
  return seg === 'VG' ? 'veg' : seg === 'GF' ? 'gift' : 'pork';
}
