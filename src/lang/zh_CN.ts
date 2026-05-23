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
        export: '导出',
        view: '查看'
      }
    }
  },
  // 通用文案
  common: {
    confirm: '确 定',
    cancel: '取 消',
    close: '关 闭',
    detail: '详 情',
    edit: '编 辑',
    delete: '删 除',
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
  // 供应商管理（SYS-MD-003 + SYS-MD-FIX-002）
  supplier: {
    title: {
      add: '新增供应商',
      edit: '编辑供应商',
      view: '供应商详情',
      deals: '交易明细'
    },
    column: {
      supplierCode: '供应商编码',
      supplierName: '供应商名称',
      supplierType: '类型',
      liaisonName: '联系负责人',
      liaisonPhone: '负责人电话',
      address: '地址',
      businessStatus: '合作状态',
      settleType: '结算方式',
      dealCount: '交易次数',
      purchaseQty: '购入数量',
      remark: '备注',
      createTime: '创建时间'
    },
    field: {
      supplierName: '供应商名称',
      licenseNo: '营业执照编号',
      licenseImage: '营业执照图片',
      businessLicenseNo: '经营许可证编号',
      cooperationStartDate: '合作开始日期',
      supplierType: '类型',
      liaisonName: '联系负责人',
      liaisonPhone: '负责人电话',
      address: '地址',
      businessStatus: '合作状态',
      settleType: '结算方式',
      bankName: '开户行',
      bankAccount: '银行账户',
      remark: '备注'
    },
    placeholder: {
      supplierName: '请输入供应商名称',
      licenseNo: '请输入营业执照编号',
      businessLicenseNo: '请输入经营许可证编号',
      cooperationStartDate: '请选择合作开始日期',
      supplierType: '请选择类型',
      liaisonName: '请输入联系负责人',
      liaisonPhone: '请输入负责人电话',
      address: '请输入地址',
      businessStatus: '请选择合作状态',
      settleType: '请选择结算方式',
      bankName: '请输入开户行名称',
      bankAccount: '请输入银行账户'
    },
    rule: {
      supplierName: { required: '供应商名称不能为空' },
      supplierType: { required: '请选择供应商类型' },
      businessStatus: { required: '请选择合作状态' },
      liaisonPhone: { pattern: '请输入合法的电话号码' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条供应商记录？'
    },
    empty: {
      deals: '暂无交易记录'
    }
  },
  // 门店主数据（SYS-MD-002 + SYS-MD-FIX-002）
  store: {
    title: {
      add: '新增门店',
      edit: '编辑门店',
      view: '门店详情',
      setManager: '设置店长'
    },
    column: {
      storeCode: '门店编码',
      storeName: '门店名称',
      shortName: '门店简称',
      storeType: '门店类型',
      managerName: '店长姓名',
      managerPhone: '店长电话',
      openDate: '开业日期',
      businessStatus: '合作状态',
      address: '门店地址',
      remark: '备注',
      createTime: '创建时间',
      updateTime: '更新时间'
    },
    field: {
      storeCode: '门店编码',
      storeName: '门店名称',
      shortName: '门店简称',
      openDate: '开业日期',
      storeType: '门店类型',
      businessStatus: '合作状态',
      address: '门店地址',
      managerName: '店长姓名',
      managerPhone: '店长电话',
      manager: '店长',
      posSystemId: '收银系统 ID',
      image: '门店图片',
      remark: '备注'
    },
    placeholder: {
      storeName: '请输入门店名称',
      shortName: '请输入门店简称',
      openDate: '请选择开业日期',
      storeType: '请选择门店类型',
      businessStatus: '请选择合作状态',
      managerName: '请输入店长姓名',
      managerPhone: '请输入手机号',
      address: '请输入门店地址',
      posSystemId: '请输入收银系统 ID',
      searchUser: '搜索店长（昵称 / 手机号）'
    },
    option: {
      direct: '直营',
      franchise: '加盟',
      cooperating: '合作中',
      terminated: '已终止'
    },
    rule: {
      storeName: { required: '门店名称不能为空' },
      businessStatus: { required: '请选择合作状态' },
      managerPhone: { pattern: '请输入合法的手机号' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条门店记录？',
      clearManager: '是否确认清空当前店长？'
    },
    tip: {
      managerHint: '请通过"设置店长"按钮关联系统用户'
    }
  },
  // 育种配置（BRD-MD-001）— 品种/品系/配种关系，4 tab 单页
  breeding: {
    tab: {
      type: '品种',
      typeConfig: '品种配种',
      strain: '品系',
      strainConfig: '品系配种'
    },
    title: {
      addType: '新增品种',
      editType: '编辑品种',
      addStrain: '新增品系',
      editStrain: '编辑品系',
      addTypeConfig: '新增品种配种',
      editTypeConfig: '编辑品种配种',
      addStrainConfig: '新增品系配种',
      editStrainConfig: '编辑品系配种'
    },
    column: {
      breedStrainCode: '编码',
      breedStrainName: '名称',
      parentCode: '父级编码',
      description: '描述',
      remark: '备注',
      motherCode: '母本编码',
      fatherCode: '父本编码',
      cubCode: '仔代编码',
      createTime: '创建时间'
    },
    field: {
      breedStrain: '类型',
      breedStrainCode: '编码',
      breedStrainName: '名称',
      parentCode: '父级编码',
      description: '描述',
      remark: '备注',
      motherCode: '母本编码',
      fatherCode: '父本编码',
      cubCode: '仔代编码'
    },
    placeholder: {
      breedStrainCode: '请输入编码（字母/数字/下划线/连字符）',
      breedStrainName: '请输入名称',
      parentCode: '请输入父级编码（仅品系填）',
      motherCode: '请选择母本',
      fatherCode: '请选择父本',
      cubCode: '请选择仔代'
    },
    option: {
      type: '品种',
      strain: '品系'
    },
    rule: {
      breedStrain: { required: '请选择类型' },
      breedStrainCode: { required: '编码不能为空', pattern: '编码仅允许字母、数字、下划线、连字符' },
      breedStrainName: { required: '名称不能为空' },
      motherCode: { required: '请选择母本' },
      fatherCode: { required: '请选择父本' },
      cubCode: { required: '请选择仔代' }
    },
    tip: {
      cubMustExistFirst: '仔代品种必须先到「品种 / 品系」tab 录入后才能在此选择'
    },
    confirm: {
      delInfo: '是否确认删除选中的 {count} 条品种/品系记录？',
      delConfig: '是否确认删除选中的 {count} 条配种关系？'
    }
  },
  // 生产配置（BRD-MD-003）— 3 tab 单页：生产周期 / 精液公猪 / 药品周期
  // v1.2 关键：无定时任务 / 无自动流转 —— 配置只决定"建议时间"，状态转换全靠 BRD-EVENT-* 事件触发
  productionConfig: {
    tab: {
      cycle: '生产周期',
      boar: '精液公猪',
      med: '药品疫苗周期'
    },
    title: {
      addCycle: '新增生产周期项',
      editCycle: '编辑生产周期项',
      addBoar: '新增公猪配置',
      editBoar: '编辑公猪配置',
      addMed: '新增药品周期',
      editMed: '编辑药品周期'
    },
    column: {
      configKey: '业务键',
      defaultValue: '默认值',
      customValue: '自定义值',
      unit: '单位',
      description: '说明',
      boarId: '公猪ID',
      spermQualityThreshold: '精液密度阈值',
      breedingIntervalDays: '采精间隔(天)',
      medType: '药品类型',
      eventTrigger: '触发时机',
      daysOffset: '天数偏移',
      remark: '备注',
      createTime: '创建时间'
    },
    field: {
      configKey: '业务键',
      defaultValue: '默认值',
      customValue: '自定义值',
      unit: '单位',
      description: '说明',
      boarId: '公猪ID',
      spermQualityThreshold: '精液密度阈值(亿/mL)',
      breedingIntervalDays: '采精间隔(天)',
      medType: '药品类型',
      eventTrigger: '触发时机',
      daysOffset: '天数偏移',
      remark: '备注'
    },
    placeholder: {
      configKey: '请输入业务键(如 gestation_days)',
      defaultValue: '业内默认值(天)',
      customValue: '客户自定义值(留空=沿用默认)',
      unit: '默认 天',
      description: '请输入业务含义说明',
      boarId: 'V1 留空=通用配置',
      spermQualityThreshold: '请输入精液密度阈值',
      breedingIntervalDays: '请输入采精间隔天数',
      medType: '请选择药品类型',
      eventTrigger: '请选择触发时机',
      daysOffset: '正数=事件后/负数=事件前'
    },
    rule: {
      configKey: { required: '业务键不能为空' },
      defaultValue: { required: '默认值不能为空' },
      spermQualityThreshold: { required: '精液密度阈值不能为空' },
      breedingIntervalDays: { required: '采精间隔天数不能为空' },
      medType: { required: '请选择药品类型' },
      eventTrigger: { required: '请选择触发时机' },
      daysOffset: { required: '天数偏移不能为空' }
    },
    tip: {
      noAutoTrigger: 'v1.2：配置只决定建议时间，不会自动改状态，状态变化全靠业务事件触发',
      customOverridesDefault: '"自定义值"留空时业务读取走默认值',
      seedKeys: '已 seed 6 项：妊娠 114 / 哺乳 28 / 保育 35 / 育肥 120 / 发情周期 21 / 断奶到配种 7'
    },
    confirm: {
      delCycle: '是否确认删除选中的 {count} 条生产周期配置？',
      delBoar: '是否确认删除选中的 {count} 条公猪配置？',
      delMed: '是否确认删除选中的 {count} 条药品周期配置？'
    }
  },
  // 猪只主表 + 状态机（BRD-CORE-001）— 10 lifecycle / 11 UI events / END + end_reason 终态聚合
  pig: {
    action: {
      fireEvent: '触发事件'
    },
    sex: {
      male: '公',
      female: '母'
    },
    column: {
      earNo: '耳号',
      earTag: '耳号全版',
      pigSex: '性别',
      pigType: '类型',
      currentStatus: '当前状态',
      pigBreedCode: '品种',
      pigStrainCode: '品系',
      birthDate: '出生日期',
      introduceDate: '引种日期',
      barnId: '栋舍',
      penId: '栏位',
      motherEar: '母猪耳号',
      fatherEar: '父猪耳号',
      parity: '胎次',
      statusStartedAt: '进入状态时间',
      endReason: '终止原因',
      remark: '备注'
    },
    placeholder: {
      earNo: '请输入耳号',
      barnId: '请输入栋舍 ID',
      penId: '请输入栏位 ID',
      motherEar: '请输入母猪耳号'
    },
    event: {
      empty: '当前状态下无可触发事件',
      target: '目标事件',
      placeholderHint: 'BRD-EVENT-* 业务表单尚未接管 — 此处仅供 boss/调试强制触发，不收集真实 payload',
      payloadFields: '该事件所需 payload 字段（前端占位，未真实收集）',
      dialogTitle: '触发猪只状态事件',
      fireAnyway: '强制触发',
      fireSuccess: '事件已触发',
      breed: '配种',
      farrow: '分娩',
      wean: '断奶',
      oestrus: '查情',
      null_return: '返空（流产 / 返情 / 空怀）',
      die: '死亡',
      eliminate: '淘汰',
      castrate: '阉割',
      transfer: '转栏',
      slaughter: '出栏',
      intro: '引种',
      payloadDesc: {
        oestrus: 'Boolean — 是否确认妊娠（true=进入 PH，false=留 PZ）',
        nullReturn: 'String — abort=流产 / return=返情 / idle=空怀',
        transferBarn: 'Long — 新栋舍 ID（可选）',
        transferPen: 'Long — 新栏位 ID（可选）'
      }
    },
    detail: {
      title: '猪只详情 — {earNo}',
      tab: {
        overview: '概览',
        history: '状态变更',
        health: '健康记录'
      },
      historyEmpty: '暂无状态变更记录',
      historyInit: '初始',
      duration: '停留 {days} 天',
      relatedEvent: '关联业务事件 ID：{id}',
      healthPlaceholder: '健康记录将由 BRD-MED-003 接入后展示',
      relatedNotFound: '未找到耳号为 {earNo} 的猪只'
    },
    exportTodo: '导出能力将在 BRD-LIST-001 中接入'
  },
  // 农场 / 栋舍 / 栏位（BRD-MD-002）— 单农场（ADR-0001），左侧树两层：栋舍 → 栏位
  farm: {
    section: {
      farmInfo: '农场信息',
      tree: '栋舍 / 栏位',
      detail: '详情',
      barnDetail: '栋舍详情',
      penDetail: '栏位详情'
    },
    action: {
      editContact: '编辑联系信息',
      addBarn: '添加栋舍',
      addPen: '添加栏位'
    },
    title: {
      editContact: '编辑农场联系信息',
      addBarn: '新增栋舍',
      editBarn: '编辑栋舍',
      addPen: '新增栏位',
      editPen: '编辑栏位'
    },
    field: {
      farmName: '农场名称',
      farmCode: '农场编码',
      farmStatus: '农场状态',
      contactName: '联系人',
      contactPhone: '联系电话',
      address: '地址',
      barn: '所属栋舍',
      barnCode: '栋舍编码',
      barnName: '栋舍名称',
      barnType: '栋舍类型',
      barnStatus: '栋舍状态',
      penCode: '栏位编码',
      penName: '栏位名称',
      penType: '栏位类型',
      penStatus: '栏位状态',
      capacity: '容量',
      currentCount: '当前存栏',
      remark: '备注'
    },
    placeholder: {
      treeFilter: '搜索栋舍 / 栏位名称',
      contactName: '请输入联系人',
      contactPhone: '请输入联系电话',
      barnCode: '请输入栋舍编码（字母/数字/下划线/连字符/点号）',
      barnName: '请输入栋舍名称',
      barnType: '请选择栋舍类型',
      penCode: '请输入栏位编码（字母/数字/下划线/连字符/点号）',
      penName: '请输入栏位名称',
      penType: '请选择栏位类型'
    },
    rule: {
      barnCode: { required: '栋舍编码不能为空', pattern: '编码仅允许字母、数字、下划线、连字符、点号' },
      barnName: { required: '栋舍名称不能为空' },
      barnType: { required: '请选择栋舍类型' },
      barnStatus: { required: '请选择栋舍状态' },
      penCode: { required: '栏位编码不能为空', pattern: '编码仅允许字母、数字、下划线、连字符、点号' },
      penName: { required: '栏位名称不能为空' },
      penType: { required: '请选择栏位类型' },
      penStatus: { required: '请选择栏位状态' },
      contactPhone: { pattern: '请输入合法的手机号' }
    },
    confirm: {
      delBarn: '是否确认删除栋舍「{name}」？删除前需先转走该栋下所有存栏猪只。',
      delPen: '是否确认删除栏位「{name}」？删除前需先转走该栏内所有存栏猪只。'
    },
    tag: {
      enabled: '启用',
      disabled: '停用'
    },
    tip: {
      selectNode: '请在左侧选择一个栋舍或栏位查看详情',
      selectBarnFirst: '请先在左侧选中一个栋舍，再添加栏位',
      emptyTree: '暂无栋舍数据，请点击右上角"添加栋舍"开始'
    }
  },
  // 药品库（BRD-MED-001）
  medicine: {
    title: {
      add: '新增药品',
      edit: '编辑药品'
    },
    column: {
      medicineCode: '药品编码',
      medicineName: '药品名称',
      medicineType: '类型',
      spec: '规格',
      unit: '单位',
      currentStock: '当前库存',
      withdrawDays: '休药期(天)',
      manufacturer: '生产厂家',
      expireDate: '过期日期',
      medStatus: '状态',
      createTime: '创建时间'
    },
    field: {
      medicineCode: '药品编码',
      medicineName: '药品名称',
      medicineType: '药品类型',
      supplierId: '供应商',
      approvalNo: '批准文号',
      batchNo: '批号',
      expireDate: '过期日期',
      withdrawDays: '休药期(天)',
      unit: '单位',
      currentStock: '当前库存',
      spec: '规格',
      manufacturer: '生产厂家',
      storageCondition: '储存条件',
      medStatus: '状态',
      remark: '备注'
    },
    placeholder: {
      medicineCode: '请输入药品编码（字母/数字/连字符）',
      medicineName: '请输入药品名称',
      medicineType: '请选择药品类型',
      supplierId: '请搜索或选择供应商',
      approvalNo: '请输入批准文号',
      batchNo: '请输入批号',
      expireDate: '请选择过期日期',
      withdrawDays: '请输入休药期天数',
      unit: '瓶 / 盒 / 克 等',
      currentStock: '请输入当前库存',
      spec: '如：10ml × 100 支 / 盒',
      manufacturer: '请输入生产厂家',
      storageCondition: '如：2-8℃ 冷藏 避光'
    },
    rule: {
      medicineCode: { required: '药品编码不能为空' },
      medicineName: { required: '药品名称不能为空' },
      medicineType: { required: '请选择药品类型' },
      medStatus: { required: '请选择状态' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条药品记录？删除后下游用药 / 领用记录将无法回溯。'
    }
  },
  // 药品批次（BRD-MED-001）
  medBatch: {
    title: {
      add: '新增批次',
      edit: '编辑批次'
    },
    column: {
      medicineId: '药品 ID',
      batchNo: '批次编码',
      productionDate: '生产日期',
      expiryDate: '过期日期',
      quantity: '库存',
      unitPrice: '进货单价',
      remark: '备注',
      createTime: '创建时间'
    },
    field: {
      medicineId: '所属药品',
      batchNo: '批次编码',
      productionDate: '生产日期',
      expiryDate: '过期日期',
      quantity: '库存',
      unitPrice: '进货单价',
      remark: '备注'
    },
    placeholder: {
      medicineId: '请搜索或选择药品',
      batchNo: '请输入批次编码',
      productionDate: '请选择生产日期',
      expiryDate: '请选择过期日期',
      quantity: '请输入库存',
      unitPrice: '请输入单价'
    },
    rule: {
      medicineId: { required: '请选择所属药品' },
      batchNo: { required: '批次编码不能为空' },
      quantity: { required: '库存不能为空' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条批次记录？'
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
