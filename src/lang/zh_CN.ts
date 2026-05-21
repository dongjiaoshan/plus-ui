export default {
  // 路由国际化
  route: {
    dashboard: '首页',
    document: '项目文档'
  },
  // 登录页面国际化
  login: {
    selectPlaceholder: '请选择/输入公司名称',
    username: '用户名',
    password: '密码',
    login: '登 录',
    logging: '登 录 中...',
    code: '验证码',
    rememberPassword: '记住我',
    switchRegisterPage: '立即注册',
    rule: {
      tenantId: {
        required: '请输入您的租户编号'
      },
      username: {
        required: '请输入您的账号'
      },
      password: {
        required: '请输入您的密码'
      },
      code: {
        required: '请输入验证码'
      }
    },
    social: {
      wechat: '微信登录',
      maxkey: 'MaxKey登录',
      topiam: 'TopIam登录',
      gitee: 'Gitee登录',
      github: 'Github登录'
    }
  },
  // 注册页面国际化
  register: {
    selectPlaceholder: '请选择/输入公司名称',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    register: '注 册',
    registering: '注 册 中...',
    registerSuccess: '恭喜你，您的账号 {username} 注册成功！',
    code: '验证码',
    switchLoginPage: '使用已有账户登录',
    rule: {
      tenantId: {
        required: '请输入您的租户编号'
      },
      username: {
        required: '请输入您的账号',
        length: '用户账号长度必须介于 {min} 和 {max} 之间'
      },
      password: {
        required: '请输入您的密码',
        length: '用户密码长度必须介于 {min} 和 {max} 之间',
        pattern: '不能包含非法字符：{strings}'
      },
      code: {
        required: '请输入验证码'
      },
      confirmPassword: {
        required: '请再次输入您的密码',
        equalToPassword: '两次输入的密码不一致'
      }
    }
  },
  // 导航栏国际化
  navbar: {
    full: '全屏',
    language: '语言',
    dashboard: '首页',
    document: '项目文档',
    message: '消息',
    layoutSize: '布局大小',
    selectTenant: '选择租户',
    layoutSetting: '布局设置',
    personalCenter: '个人中心',
    logout: '退出登录'
  },
  // BizTable 通用列表组件
  biz: {
    table: {
      empty: '暂无数据',
      column: {
        action: '操作'
      },
      search: {
        submit: '搜索',
        reset: '重置',
        inputPrefix: '请输入',
        selectPrefix: '请选择',
        startDate: '开始日期',
        endDate: '结束日期'
      },
      action: {
        add: '新增',
        edit: '修改',
        del: '删除',
        batchDel: '批量删除',
        export: '导出'
      }
    }
  },
  // 通用文案
  common: {
    confirm: '确 定',
    cancel: '取 消',
    opSuccess: '操作成功'
  },
  // 人员管理（SYS-MD-001）
  person: {
    title: {
      add: '新增人员',
      edit: '编辑人员'
    },
    column: {
      personCode: '人员编码',
      name: '姓名',
      gender: '性别',
      phone: '联系电话',
      position: '岗位',
      status: '状态',
      hireDate: '入职日期',
      createTime: '创建时间'
    },
    field: {
      name: '姓名',
      gender: '性别',
      phone: '联系电话',
      idCard: '身份证号',
      position: '岗位',
      hireDate: '入职日期',
      status: '状态',
      remark: '备注'
    },
    placeholder: {
      name: '请输入姓名',
      gender: '请选择性别',
      phone: '请输入手机号',
      idCard: '请输入 15 / 18 位身份证号',
      position: '请输入岗位',
      hireDate: '请选择入职日期'
    },
    rule: {
      name: { required: '姓名不能为空' },
      phone: { pattern: '请输入合法的手机号' },
      idCard: { pattern: '请输入合法的身份证号' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条人员记录？'
    }
  },
  // 东角山业务模块占位
  djs: {
    placeholder: {
      title: '{domain} 模块',
      subtitle: '占位页 — 业务功能将在后续 ticket 中实现'
    },
    oss: {
      upload: '上传图片',
      uploading: '上传中...',
      uploadSuccess: '上传成功',
      uploadFailed: '上传失败',
      retry: '重试',
      remove: '删除',
      fileTooLarge: '文件大小超过 {max}MB 限制',
      typeNotAllowed: '不支持的文件类型，仅允许 {types}',
      reachLimit: '最多上传 {limit} 张',
      preview: '预览'
    }
  }
};
