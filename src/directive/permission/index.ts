import { Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { permMatch } from '@/utils/permission';
/**
 * 操作权限处理
 */
export const hasPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { permissions } = useUserStore();
    // 「其他角色」按钮权限校验
    const { value } = binding;
    if (value && value instanceof Array && value.length > 0) {
      // 已授权限里只要有一条（含通配，对齐后端 Sa-Token）覆盖按钮要求的任一权限即放行
      const hasPermission = permissions.some((granted: string) => value.some((required: string) => permMatch(granted, required)));
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
        return false;
      }
    } else {
      throw new Error("check perms! Like v-has-permi=\"['system:user:add','system:user:edit']\"");
    }
  }
};

/**
 * 角色权限处理
 */
export const hasRoles: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const { roles } = useUserStore();
    if (value && value instanceof Array && value.length > 0) {
      const hasRole = roles.some((role: string) => {
        return role === 'superadmin' || role === 'admin' || value.includes(role);
      });
      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el);
        return false;
      }
    } else {
      throw new Error("check roles! Like v-has-roles=\"['admin','test']\"");
    }
  }
};
