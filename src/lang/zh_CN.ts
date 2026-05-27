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
    back: '返 回',
    createTime: '创建时间',
    opSuccess: '操作成功'
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
      supplierCode: '供应商编码',
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
      remark: '备注',
      updateTimeRange: '更新时间',
      updateBy: '更新人员'
    },
    group: {
      basic: '基本信息',
      contact: '联系信息',
      qualification: '资质信息',
      finance: '财务信息',
      remark: '其它'
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
      employeeCount: '员工数量',
      updateBy: '更新人员',
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
      remark: '备注',
      updateTimeRange: '更新时间',
      updateBy: '更新人员'
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
      shortName: { required: '门店简称不能为空' },
      storeType: { required: '请选择门店类型' },
      posSystemId: { required: '收银系统 ID 不能为空' },
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
      createTime: '创建时间',
      createBy: '创建人'
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
      cubCode: '仔代编码',
      createTimeRange: '创建时间'
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
    tab: {
      all: '全部',
      sow: '母猪',
      boar: '公猪',
      piglet: '仔猪',
      fattening: '育肥'
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
      barn: '栋舍',
      pen: '栏位',
      motherEar: '母猪耳号',
      fatherEar: '父猪耳号',
      parity: '胎次',
      matingCount: '配种次数',
      lastMatingDate: '上次配种日',
      enterFattenAt: '入栏时间',
      statusStartedAt: '进入状态时间',
      endReason: '终止原因',
      remark: '备注'
    },
    perf: {
      totalBorn: '产仔总数',
      totalLiveBorn: '健仔数',
      totalWeaned: '断奶头数',
      avgBornWeight: '平均出生重 (kg)',
      avgWeanedWeight: '平均断奶重 (kg)',
      lastUpdateDate: '最近更新'
    },
    growth: {
      measureDate: '测量日',
      weight: '体重 (kg)',
      backfatThickness: '背膘 (mm)',
      backHeight: '背高 (cm)',
      operatorName: '操作人'
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
      creator: '建档人',
      tab: {
        overview: '概览',
        basic: '基础信息',
        performance: '生产指标',
        history: '养殖记录',
        growth: '生长曲线',
        health: '健康记录'
      },
      historyEmpty: '暂无状态变更记录',
      historyInit: '初始',
      duration: '停留 {days} 天',
      relatedEvent: '关联业务事件 ID：{id}',
      healthPlaceholder: '健康记录将由 BRD-MED-003 接入后展示',
      performanceEmpty: '该母猪暂无生产指标（数据由 BRD-DASH-001 定时任务汇总写入）',
      performanceDataHint: '该数据来自 t_farm_sow_performance，由分娩 / 断奶事件回写或夜间批处理生成。',
      growthEmpty: '暂无生长测量记录',
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
  // 药品领用台账（BRD-MED-002）
  medUsage: {
    title: {
      add: '新增领用 / 退回 / 损耗'
    },
    type: {
      use: '领用',
      return: '退回',
      loss: '损耗'
    },
    column: {
      medicineId: '药品 ID',
      batchId: '批次 ID',
      usageType: '类型',
      usageQty: '数量',
      useDate: '业务日期',
      pigId: '关联猪只',
      relatedPenId: '关联栏位',
      remark: '备注',
      createBy: '操作员',
      createTime: '创建时间'
    },
    field: {
      medicineId: '药品 ID',
      batchId: '批次',
      usageType: '类型',
      usageQty: '数量',
      useDate: '业务日期',
      useDateFrom: '日期 ≥',
      useDateTo: '日期 ≤',
      pigId: '关联猪只',
      relatedPenId: '关联栏位',
      remark: '备注'
    },
    placeholder: {
      batchId: '请搜索批次（按批次号）',
      useDate: '请选择业务日期'
    },
    rule: {
      batchId: { required: '请选择批次' },
      usageType: { required: '请选择类型' },
      usageQty: { required: '数量必须大于 0' },
      useDate: { required: '请选择业务日期' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条领用记录？已发生的库存动作不会回滚。'
    }
  },
  // 库位（WMS-MD-001）
  location: {
    title: {
      add: '新增库位',
      edit: '编辑库位'
    },
    column: {
      locationCode: '库位编码',
      locationName: '库位名称',
      locationType: '类型',
      locationThumb: '图片',
      capacity: '容量',
      locationStatus: '状态',
      createTime: '创建时间'
    },
    field: {
      locationCode: '库位编码',
      locationName: '库位名称',
      locationType: '库位类型',
      locationThumb: '缩略图',
      locationImg: '原图',
      locationStatus: '状态',
      capacity: '容量',
      remark: '备注'
    },
    placeholder: {
      locationCode: '请输入库位编码（如 L0001 / FROZEN-01）',
      locationName: '请输入库位名称',
      locationType: '请选择库位类型',
      locationThumb: 'OSS objectName 单张',
      locationImg: 'OSS objectName 多张逗号分隔',
      capacity: '请输入容量（kg / m³）'
    },
    rule: {
      locationCode: { required: '库位编码不能为空' },
      locationName: { required: '库位名称不能为空' },
      locationType: { required: '请选择库位类型' },
      locationStatus: { required: '请选择状态' }
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条库位？删除前需先确保库位无在用库存。'
    }
  },
  // 产品 / 商品 / 礼盒（WMS-MD-002，共表 3 形态）
  product: {
    title: {
      add: '新增商品',
      edit: '编辑商品'
    },
    column: {
      productId: '编码',
      productName: '名称',
      productType: '类型',
      productAttr: '产品属性',
      productWorkshop: '生产车间',
      belongType: '归属',
      productThumb: '图片',
      productUnit: '单位',
      productSpec: '规格',
      productStatus: '状态',
      createTime: '创建时间'
    },
    field: {
      productId: '产品编码',
      productName: '产品名称',
      productType: '产品类型',
      productUnit: '单位',
      productSpec: '规格',
      belongType: '归属类型',
      buyClass: '外购类',
      productAttr: '产品属性',
      productWorkshop: '生产车间',
      productMaterial: '原材料 ID',
      materialNum: '原材料计算量',
      productThumb: '缩略图',
      productImg: '详情图',
      productStatus: '状态',
      isDelivery: '是否发货产品',
      isBuyOut: '是否买断',
      supplierId: '供应商',
      productDesc: '产品描述',
      remark: '备注',
      giftComponents: '礼盒组件',
      componentProduct: '组件产品',
      componentCount: '数量',
      componentUnit: '单位',
      componentSort: '排序'
    },
    placeholder: {
      productId: '例 P0001 / SP-PORK-001（用户手填）',
      productUnit: '例 kg / 个 / 盒',
      productSpec: '例 500g/包',
      productMaterial: '关联原材料产品 ID',
      buyClass: '请选择外购类（如字典空请到字典管理添加）',
      supplierId: '请选择供应商'
    },
    rule: {
      productType: { required: '请选择产品类型' },
      productId: { required: '产品编码不能为空' },
      productName: { required: '产品名称不能为空' },
      productUnit: { required: '产品单位不能为空' },
      belongType: { required: '自产产品归属类型不能为空' },
      supplierId: { required: '外购产品必须选择供应商' },
      giftComponents: { required: '礼盒至少需要 1 个组件' }
    },
    tip: {
      buyClassEmpty: '暂无外购类字典，请到「系统管理 → 字典管理 → djs_buy_class」添加'
    },
    action: {
      addComponent: '添加组件'
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条商品？删除前需先确保无库存且未被作为原材料引用。'
    }
  },
  // 库存查询（WMS-MD-001，只读列表）
  stock: {
    field: {
      productName: '产品名称',
      earNo: '耳号',
      isEnd: '是否完成'
    },
    column: {
      locationName: '库位',
      productName: '产品名称',
      productStock: '当前库存',
      productUnit: '单位',
      earNo: '耳号',
      isEnd: '是否完成',
      latestCheckTime: '最新盘点',
      checkResult: '盘点结果',
      operatorName: '操作人',
      createTime: '创建时间'
    }
  },
  // 种植 - 片区（PLT-MD-001）
  plantZone: {
    title: { add: '新增片区', edit: '编辑片区' },
    column: { zoneCode: '片区编码', zoneName: '片区名称', zoneDesc: '说明', zoneBelong: '所属大区', zoneStatus: '状态', createTime: '创建时间' },
    field: { zoneCode: '片区编码', zoneName: '片区名称', zoneDesc: '片区说明', zoneBelong: '所属大区', zoneStatus: '状态' },
    placeholder: {
      zoneCode: '请输入片区编码（如 Z001 / EAST-01）',
      zoneName: '请输入片区名称',
      zoneDesc: '片区说明（可选）',
      zoneBelong: '所属大区（可选，例 东部）',
      search: '搜索片区名称'
    },
    rule: { zoneCode: { required: '片区编码不能为空' }, zoneName: { required: '片区名称不能为空' } },
    confirm: { del: '是否确认删除选中的 {count} 个片区？删除前需确保片区下无关联地块。' },
    empty: '暂无片区数据，请新建片区开始'
  },
  // 种植 - 地块（PLT-MD-001）
  plantPlot: {
    title: { add: '新增地块', edit: '编辑地块', view: '地块详情' },
    tab: { basic: '基础信息', location: '位置面积', soil: '土壤环境' },
    column: {
      plotCode: '地块编码',
      plotName: '地块名称',
      zoneName: '所属片区',
      plotType: '类型',
      soilType: '土壤类型',
      soilFertility: '土壤肥力',
      plotStatus: '状态',
      plotArea: '面积',
      isLease: '租赁',
      plotImage: '图片',
      createTime: '创建时间'
    },
    field: {
      plotCode: '地块编码',
      plotName: '地块名称',
      zoneId: '所属片区',
      plotType: '地块类型',
      plotStatus: '地块状态',
      plotArea: '面积（亩）',
      isLease: '是否租赁',
      plotRemark: '地块备注',
      plotImagePreview: '缩略图',
      plotImageUrl: '地块图片',
      plotLocationDesc: '位置描述',
      plotLocationX: '经度',
      plotLocationY: '纬度',
      soilType: '土壤类型',
      soilFertility: '土壤肥力',
      soilPh: '土壤 PH',
      terrainCondition: '地势',
      lightCondition: '光照',
      drainCondition: '排水'
    },
    placeholder: {
      plotCode: '请输入地块编码（如 P001 / EAST-01）',
      plotName: '请输入地块名称',
      zoneId: '请选择所属片区',
      plotType: '请选择地块类型',
      plotStatus: '请选择地块状态',
      plotArea: '请输入面积（亩）',
      plotRemark: '地块业务备注（可选）',
      plotLocationDesc: '位置文字描述（可选）',
      soilType: '请选择土壤类型',
      soilFertility: '请选择土壤肥力',
      soilPh: 'PH 值（0-14）',
      terrainCondition: '请选择地势',
      lightCondition: '请选择光照',
      drainCondition: '请选择排水'
    },
    rule: {
      plotCode: { required: '地块编码不能为空' },
      plotName: { required: '地块名称不能为空' },
      zoneId: { required: '请选择所属片区' },
      plotArea: { required: '地块面积必填' }
    },
    confirm: { del: '是否确认删除选中的 {count} 个地块？' },
    empty: '当前片区下暂无地块',
    selectZoneFirst: '请先选择左侧片区，再操作地块'
  },
  // 种植 - 作物（PLT-MD-001）
  plantCrop: {
    title: { add: '新增作物', edit: '编辑作物', view: '作物详情' },
    tab: { basic: '基础信息', growth: '生长周期', yield: '产量品质' },
    column: {
      cropCode: '作物编码',
      cropName: '作物名称',
      varietyName: '品种名',
      cropFamily: '科属',
      plantingSeason: '种植季节',
      cycle: '生长周期',
      predictedPer: '预计亩产',
      pickUnitPrice: '采摘单价',
      createTime: '创建时间'
    },
    field: {
      cropCode: '作物编码',
      cropName: '作物名称',
      cropImagePreview: '缩略图',
      cropImageUrl: '作物图片',
      varietyName: '品种名',
      varietyOrigin: '品种来源',
      cropFamily: '作物科属',
      relatedProduct: '关联产品',
      plantingSeason: '种植季节',
      sowingPeriod: '适宜播种期',
      maxCycle: '生长最大周期(天)',
      minCycle: '生长最小周期(天)',
      fertilizationInterval: '施肥间隔(天)',
      irrigationInterval: '浇灌间隔(天)',
      predictedPer: '预计亩产(kg/亩)',
      qualityDesc: '品质描述',
      pickUnitPrice: '采摘单价(元/斤)'
    },
    placeholder: {
      cropCode: '请输入作物编码（如 C001）',
      cropName: '请输入作物名称（如 白菜）',
      varietyName: '品种名（如 京白菜 4 号）',
      varietyOrigin: '品种来源/供应商（V1 自由文本）',
      cropFamily: '请选择作物科属',
      plantingSeason: '多选种植季节',
      sowingPeriod: '例：3 月上旬 - 4 月下旬',
      qualityDesc: '品质描述'
    },
    rule: { cropCode: { required: '作物编码不能为空' }, cropName: { required: '作物名称不能为空' } },
    confirm: { del: '是否确认删除选中的 {count} 个作物？' }
  },
  // 种植 - 班组（PLT-MD-002）
  plantTeam: {
    pageTitle: '班组管理',
    title: { add: '新增班组', edit: '编辑班组', member: '成员管理 - {teamName}' },
    column: {
      teamName: '班组名称',
      leader: '班组负责人',
      teamStatus: '状态',
      memberCount: '成员数',
      remark: '备注',
      createTime: '创建时间'
    },
    field: {
      teamName: '班组名称',
      teamStatus: '状态',
      remark: '备注'
    },
    placeholder: {
      teamName: '请输入班组名称（如 果蔬班 / 薯类班）',
      remark: '备注'
    },
    rule: {
      teamName: { required: '班组名称不能为空' }
    },
    confirm: {
      del: '是否确认删除选中的班组？',
      removeMember: '是否将成员【{nickName}】调出班组？'
    },
    member: {
      currentTitle: '当前成员',
      candidateTitle: '候选员工（种植部，未分配班组）',
      noLeader: '未指定',
      isLeader: '负责人',
      colNickName: '姓名',
      colPhone: '手机号',
      colDept: '部门',
      addBtn: '加入班组',
      removeBtn: '调出',
      setLeaderBtn: '设为负责人',
      noSelection: '请先选择候选员工',
      emptyMembers: '该班组暂无成员',
      emptyCandidates: '暂无候选员工'
    },
    tip: {
      addSuccess: '成员加入成功',
      removeSuccess: '成员已调出',
      setLeaderSuccess: '已设为班组负责人'
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
    },
    warehouse: {
      pigBurn: {
        title: '燎毛记录',
        burnId: '燎毛单号',
        earNo: '猪只耳号',
        burnTime: '燎毛时间',
        arriveWeight: '到场重量 (kg)',
        burnWeight: '燎毛后重量 (kg)',
        lossWeight: '损耗 (kg)',
        burnStatus: '状态',
        operator: '操作人',
        location: '入库位',
        remark: '备注'
      }
    }
  },
  demand: {
    not_found_msg: '需求单不存在或已删除',
    productType: {
      white_bar: '白条',
      vegetable: '蔬菜',
      gift_box: '礼盒',
      other: '其他'
    },
    field: {
      demandNo: '需求单号',
      demandDate: '需求日期',
      'demandDate.required': '需求日期不能为空',
      storeId: '提单门店',
      'storeId.required': '提单门店不能为空',
      productId: '产品 ID',
      'productId.required': '产品不能为空',
      productName: '产品名称',
      'productName.required': '产品名称不能为空',
      productType: '业态',
      productSpec: '规格',
      demandQuantity: '需求量',
      'demandQuantity.required': '需求量不能为空',
      productUnit: '单位',
      'productUnit.required': '单位不能为空',
      rawMaterial: '原材料描述',
      materialQty: '原材料计算量',
      demandRemark: '需求备注',
      demandExplain: '需求说明',
      demandStatus: '状态',
      expectedArriveDate: '期望到货日',
      beginDate: '开始日期',
      endDate: '结束日期',
      productionDestination: '排产去向'
    },
    productionDestination: {
      white_bar: '分割间 + 肉品打包间',
      vegetable: '菜品打包间',
      gift_box: '礼盒打包',
      other: '其他产品打包'
    },
    column: {
      demandNo: '需求单号',
      demandDate: '需求日期',
      storeId: '门店',
      productName: '产品',
      giftSku: '礼盒 SKU',
      productSpec: '规格',
      demandQuantity: '需求量',
      productUnit: '单位',
      rawMaterial: '原材料',
      demandStatus: '状态',
      shippedCount: '已发货',
      expectedArriveDate: '期望到货',
      createByName: '创建人',
      createTime: '创建时间',
      actions: '操作'
    },
    placeholder: {
      demandNoAuto: '保存后自动生成',
      storeId: '请选择提单门店',
      productId: '请选择产品（按业态过滤）',
      demandQuantity: '请输入需求量',
      productUnit: '如 头 / kg / 盒',
      rawMaterial: '如 "需要 5 头猪"',
      demandExplain: '如 "25 号之前每天 1 头猪送到矿业 / 背膘不要太厚"'
    },
    form: {
      addTitle: '新增需求',
      editTitle: '编辑需求'
    },
    action: {
      submit: '提交',
      confirm: '确认',
      startProduction: '开始排产',
      cancel: '取消',
      assignPig: '指定猪只',
      history: '状态历史'
    },
    confirm: {
      del: '确认删除选中的 {count} 条需求？仅 DRAFT/CANCELLED 态可删',
      submit: '确认提交需求 {no} 到仓库审核？',
      confirm: '确认锁定需求 {no}？',
      startProduction: '确认开始排产需求 {no}？开始后不可取消'
    },
    prompt: {
      cancelRemark: '请输入取消原因（可选）',
      cancelRemarkPh: '如客户撤单 / 库存不足等'
    },
    assignPig: {
      title: '指定猪只 - {no}',
      earNos: '耳号清单',
      placeholder: '每行一个耳号，或用逗号 / 空格分隔，如：\n01A12605001\n01A12605002',
      hint: '工人会按指定耳号顺序进入燎毛 / 分割工序，仅白条业态需指定',
      assigned: '已指定',
      assignBtn: '指定 {count} 头',
      confirmRemove: '确认移除耳号 {earNo}？'
    },
    history: {
      title: '状态流转历史',
      operator: '操作人',
      remark: '备注',
      empty: '暂无状态变更记录'
    }
  }
};
