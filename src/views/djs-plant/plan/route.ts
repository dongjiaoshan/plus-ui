// 种植计划三页（列表/向导/详情）在菜单 IA 重组后挂到「种植管理」分组父（plt-plan-mgmt）下，
// 实际注册路由路径为 /djs-plant/plt-plan-mgmt/plan/*。
// 7 处 router.push/replace 统一引用此常量，避免未来再调菜单分组时多处漏改。
export const PLAN_BASE = '/djs-plant/plt-plan-mgmt/plan';
