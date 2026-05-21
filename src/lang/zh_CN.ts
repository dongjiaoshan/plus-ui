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
  // 供应商管理（SYS-MD-003）
  supplier: {
    title: {
      add: '新增供应商',
      edit: '编辑供应商'
    },
    column: {
      supplierCode: '供应商编码',
      supplierName: '供应商名称',
      supplierType: '类型',
      contactName: '联系人',
      contactPhone: '联系电话',
      address: '地址',
      businessStatus: '状态',
      createTime: '创建时间'
    },
    field: {
      supplierName: '供应商名称',
      supplierType: '类型',
      contactName: '联系人',
      contactPhone: '联系电话',
      address: '地址',
      businessStatus: '状态',
      settleType: '结算方式',
      bankName: '开户行',
      bankAccount: '银行账户',
      remark: '备注'
    },
    placeholder: {
      supplierName: '请输入供应商名称',
      supplierType: '请选择类型',
      contactName: '请输入联系人',
      contactPhone: '请输入联系电话',
      address: '请输入地址',
      settleType: '请输入结算方式',
      bankName: '请输入开户行名称',
      bankAccount: '请输入银行账户'
    },
    rule: {
      supplierName: { required: '供应商名称不能为空' },
      supplierType: { required: '请选择供应商类型' },
      businessStatus: { required: '请选择业务状态' },
      contactPhone: { pattern: '请输入合法的联系电话' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条供应商记录？'
    }
  },
  // 门店主数据（SYS-MD-002）
  store: {
    title: {
      add: '新增门店',
      edit: '编辑门店'
    },
    column: {
      storeCode: '门店编码',
      storeName: '门店名称',
      storeType: '门店类型',
      businessStatus: '经营状态',
      address: '门店地址',
      contactName: '联系人',
      contactPhone: '联系电话',
      createTime: '创建时间'
    },
    field: {
      storeCode: '门店编码',
      storeName: '门店名称',
      storeType: '门店类型',
      businessStatus: '经营状态',
      address: '门店地址',
      contactName: '联系人',
      contactPhone: '联系电话',
      remark: '备注'
    },
    placeholder: {
      storeName: '请输入门店名称',
      storeType: '请选择门店类型',
      contactName: '请输入联系人',
      contactPhone: '请输入手机号',
      address: '请输入门店地址'
    },
    option: {
      direct: '直营',
      franchise: '加盟',
      cooperating: '合作中',
      terminated: '已终止'
    },
    rule: {
      storeName: { required: '门店名称不能为空' },
      businessStatus: { required: '请选择经营状态' },
      contactPhone: { pattern: '请输入合法的手机号' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条门店记录？'
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
