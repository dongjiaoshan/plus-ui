import { useUserStore } from '@/store/modules/user';

/**
 * 通配权限匹配：判断「已授予的权限串 granted」是否覆盖「按钮要求的权限串 required」。
 *
 * 对齐后端 Sa-Token vagueMatch 语义（菜单级 RBAC，DJS-PERM-MENU 系列）：`*` 匹配任意字符（含冒号）。
 * 例：granted=`djs:warehouse:product:*` 覆盖 required=`djs:warehouse:product:add`；granted=`*:*:*` 覆盖一切。
 * 无 `*` 时退化为精确相等，向后兼容旧的逐按钮授权。
 */
export const permMatch = (granted: string, required: string): boolean => {
  if (granted === '*:*:*' || granted === required) return true;
  if (!granted.includes('*')) return false;
  // 把 granted 当作通配模式：转义字面段，`*` → `.*`
  const pattern = granted
    .split('*')
    .map((seg) => seg.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${pattern}$`).test(required);
};

/**
 * 字符权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export const checkPermi = (value: any) => {
  if (value && value instanceof Array && value.length > 0) {
    const permissions = useUserStore().permissions;
    const permissionDatas: string[] = value;
    // 已授权限里只要有一条（含通配）覆盖按钮要求的任一权限即放行
    return permissions.some((granted) => permissionDatas.some((required) => permMatch(granted, required)));
  } else {
    console.error(`need roles! Like checkPermi="['system:user:add','system:user:edit']"`);
    return false;
  }
};

/**
 * 角色权限校验
 * @param {Array} value 校验值
 * @returns {Boolean}
 */
export const checkRole = (value: any): boolean => {
  if (value && value instanceof Array && value.length > 0) {
    const roles = useUserStore().roles;
    const permissionRoles = value;
    const super_admin = 'admin';

    const hasRole = roles.some((role) => {
      return super_admin === role || permissionRoles.includes(role);
    });

    if (!hasRole) {
      return false;
    }
    return true;
  } else {
    console.error(`need roles! Like checkRole="['admin','editor']"`);
    return false;
  }
};
