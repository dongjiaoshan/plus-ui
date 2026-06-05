export default {
  // 路由国际化
  route: {
    dashboard: '首页',
    document: '项目文档'
  },
  // 功能选择页（首页）国际化
  home: {
    title: '东角山有机生态农场系统',
    subtitle: '请选择要进入的业务板块',
    board: {
      breed: '养殖管理',
      plant: '种植管理',
      warehouse: '仓库管理',
      store: '门店管理',
      system: '系统管理',
      empty: '当前账号未分配任何板块，请联系管理员'
    }
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
    copyright: '© 2026 东角山有机生态农场 版权所有'
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
    view: '查看',
    edit: '编 辑',
    delete: '删 除',
    del: '删除',
    operate: '操作',
    back: '返 回',
    createTime: '创建时间',
    updateByName: '更新人',
    opSuccess: '操作成功',
    search: '搜索',
    reset: '重置',
    add: '新增',
    save: '保存',
    empty: '暂无数据',
    tip: '提示',
    deleteSuccess: '删除成功',
    disable: '停用',
    enable: '启用',
    disabled: '已停用',
    to: '至',
    prev: '上一步',
    next: '下一步'
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
    },
    must_be_breed_type: '引种只能选择种猪类供应商',
    deal: {
      dealDate: '交易日期',
      dealProduct: '交易商品',
      dealQuantity: '交易量',
      dealUnit: '单位',
      empty: '暂无交易明细'
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
        breeding: '配种 / 分娩明细',
        med: '用药 / 治疗',
        growth: '生长曲线',
        health: '健康记录'
      },
      historyEmpty: '暂无状态变更记录',
      historyInit: '初始',
      duration: '停留 {days} 天',
      relatedEvent: '关联业务事件 ID：{id}',
      healthPlaceholder: '健康记录将在后续版本接入后展示',
      performanceEmpty: '该母猪暂无生产指标（数据由系统汇总写入）',
      performanceDataHint: '该数据来自 t_farm_sow_performance，由分娩 / 断奶事件回写或夜间批处理生成。',
      growthEmpty: '暂无生长测量记录',
      relatedNotFound: '未找到耳号为 {earNo} 的猪只',
      breedingEmpty: '暂无配种 / 分娩 / 断奶记录',
      medEmpty: '暂无用药 / 治疗记录',
      breedingCol: {
        changeTime: '发生时间',
        eventType: '事件',
        transition: '状态变化',
        relatedEventId: '关联业务 ID'
      },
      medCol: {
        useDate: '用药日期',
        medicineName: '药品',
        medicineType: '用药类型',
        medicineDosage: '剂量',
        medicineWay: '用药方式',
        medicineReason: '用药原因',
        operatorName: '操作人'
      }
    },
    exportTodo: '导出能力将在后续版本中接入'
  },
  // 养殖事件台账（admin 只读：引种 / 仔猪耳标 / 事件台账 / 生长记录）
  breedEvent: {
    sex: {
      female: '母',
      male: '公',
      femaleOption: '母 F',
      maleOption: '公 M'
    },
    intro: {
      readonlyTip: '引种登记为只读历史。新增请到小程序端的「引种登记」录入（饲养员在猪舍扫码 + 拍凭证）。',
      type: {
        external: '外部引种',
        internal: '内部调拨'
      },
      column: {
        introduceNo: '引种单号',
        introduceType: '引种方式',
        introduceDate: '引种日期',
        pigCount: '猪只数',
        startEarNo: '起始耳号',
        pigSex: '性别',
        pigBreedCode: '品种',
        pigStrainCode: '品系',
        supplierCode: '供应商编码',
        supplierName: '供应商',
        supplierId: '供应商 ID',
        remark: '备注',
        createTime: '创建时间'
      },
      field: {
        introduceNo: '引种单号',
        introduceType: '引种方式',
        pigSex: '性别'
      },
      placeholder: {
        introduceNo: '前缀如 INT2026'
      }
    },
    eartag: {
      readonlyTip: '仔猪耳标为只读历史。新增请到小程序端的「仔猪批量耳标」录入。',
      column: {
        pigletEarNo: '仔猪耳号',
        pigletSex: '性别',
        motherEarNo: '母猪耳号',
        fatherEarNo: '父猪耳号',
        farrowDate: '分娩日期',
        farrowId: '分娩 ID',
        birthWeight: '出生重 (kg)',
        tagDate: '打标日期',
        remark: '备注'
      },
      field: {
        pigletEarNo: '仔猪耳号',
        motherEarNo: '母猪耳号',
        pigletSex: '性别'
      },
      placeholder: {
        pigletEarNo: '完整耳号',
        motherEarNo: '完整耳号'
      }
    },
    ledger: {
      readonlyTip: '事件台账 · 状态机统一流水（t_farm_status_record，所有事件自动写入）。各事件录入请到小程序端对应表单。',
      transitionInit: '初始',
      column: {
        changeTime: '变更时间',
        earNo: '耳号',
        eventType: '事件',
        transition: '状态变化',
        durationDays: '停留天数',
        relatedEventId: '关联业务 ID',
        pigId: '猪只 ID',
        id: '流水 ID'
      },
      field: {
        earNo: '耳号',
        eventType: '事件类型',
        newStatus: '变更后状态'
      },
      placeholder: {
        earNo: '精确匹配'
      }
    },
    growth: {
      tip: '生长记录：mp 端饲养员录体重；admin 端可补录背膘 / 背高（专业设备）。删除窗口：录入后 3 天内可删，超期不可删。',
      column: {
        id: 'ID',
        earNo: '耳号',
        measureDate: '测量日期',
        weight: '体重',
        backfatThickness: '背膘',
        backHeight: '背高',
        barnName: '栋舍',
        penName: '栏位',
        remark: '备注',
        createTime: '录入时间',
        action: '操作'
      },
      field: {
        earNo: '耳号',
        beginDate: '起始日期',
        endDate: '结束日期'
      },
      placeholder: {
        earNo: '如 260520-001'
      },
      form: {
        title: '新增生长记录（admin 端可录背膘 / 背高）',
        pig: '猪只',
        pigPlaceholder: '按耳号搜索选择',
        measureDate: '测量日期',
        measureDatePlaceholder: '选择测量日期',
        weight: '体重 (kg)',
        backfatThickness: '背膘厚 (mm)',
        backfatHint: '可选，admin 端专业设备测得',
        backHeight: '背高 (cm)',
        backHeightHint: '可选',
        remark: '备注'
      },
      rule: {
        pig: '请选择猪只',
        measureDate: '请选择测量日期',
        weight: '请输入体重 (kg)'
      },
      msg: {
        added: '生长记录已录入',
        delConfirm: '确定删除耳号 [{earNo}] 在 {date} 的生长记录？（录入后 3 天内可删，超期会失败）',
        delConfirmTitle: '删除确认',
        delSuccess: '删除成功'
      }
    }
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
      medicineName: '药品',
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
    readonlyTip:
      '领用台账为只读历史，记录所有领用 / 退回 / 损耗动作。新增请到小程序端的「药品领用」录入（饲养员在猪舍扫码 + 拍凭证）。台账软删不回滚库存（已发生的对账不可逆）。',
    type: {
      use: '领用',
      return: '退回',
      loss: '损耗'
    },
    column: {
      medicineId: '药品 ID',
      batchId: '批次 ID',
      medicineName: '药品',
      batchNo: '批号',
      usageType: '类型',
      usageQty: '数量',
      useDate: '业务日期',
      earNo: '耳号',
      penCode: '栏位',
      remark: '备注',
      createBy: '操作员',
      createTime: '创建时间'
    },
    field: {
      usageType: '类型',
      useDateFrom: '日期 ≥',
      useDateTo: '日期 ≤'
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条领用记录？已发生的库存动作不会回滚。'
    }
  },
  // 用药治疗台账（BRD-MED-003）
  medRecord: {
    readonlyTip:
      '用药治疗流水：单只 + 批量（master/detail）。admin 端只查不录；新增主要走小程序端「用药治疗」入口（批次仅显示 3 天内已领的）。台账软删不回滚库存。',
    column: {
      useDate: '用药日期',
      earNo: '耳号',
      drugType: '记录类型',
      medicineType: '用药类型',
      medicineReason: '用药原因',
      medicineWay: '用药方式',
      medicineName: '药品',
      batchNo: '批号',
      batchId: '批次 ID',
      medicineDosage: '剂量',
      operatorName: '操作人',
      remark: '备注',
      createTime: '创建时间'
    },
    field: {
      earNo: '耳号',
      medicineType: '用药类型',
      drugType: '记录类型',
      beginDate: '开始日期',
      endDate: '结束日期'
    },
    confirm: {
      del: '是否确认删除选中的 {count} 条用药记录？'
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
      createTime: '创建时间',
      updateTime: '更新时间'
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
      locationThumb: '点击上传缩略图（单张，≤ 10MB）',
      locationImg: '点击上传原图（最多 5 张，≤ 10MB/张）',
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
    },
    summary: {
      locationCount: '库位数',
      productCount: '产品数',
      currentStock: '当前库存',
      todayIn: '今日入库',
      todayOut: '今日出库',
      lastCheck: '最近盘点',
      noCheck: '暂无盘点'
    }
  },
  // 商品主数据 / 自产 / 外购 / 礼盒（WMS-MD-002，共表 3 形态）
  // 注：与 D11+ TRC-CORE-001 "产品列表（生产追溯，serial 码）" 区分，本 namespace 是 SKU 主数据
  product: {
    title: {
      add: '新增商品',
      edit: '编辑商品',
      view: '产品详情',
      baseInfo: '产品属性',
      giftComponents: '礼盒清单'
    },
    giftEmpty: '该礼盒暂无组件',
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
      createTime: '创建时间',
      updateTime: '更新时间',
      index: '序号'
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
      componentProductName: '组件产品',
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
    },
    action: {
      flowIn: '入库记录',
      flowOut: '出库记录',
      checkRecord: '盘点记录'
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
    title: { add: '新增地块', edit: '编辑地块', view: '地块详情', baseInfo: '基础信息', zoneInfo: '片区信息' },
    zoneEmpty: '未关联片区',
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
      createTime: '创建时间',
      updateTime: '更新时间'
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
      drainCondition: '排水',
      currentCropName: '当前作物'
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
  // 种植 - 土地有机认证（PLT-MD-003）
  plantPlotOrganic: {
    title: { add: '新增土地有机证书', edit: '编辑土地有机证书' },
    column: {
      organicNo: '证书编号',
      organicCompany: '颁发单位',
      organicValid: '有效期',
      image: '证书图',
      relatedPlots: '关联地块',
      warning: '预警状态',
      createTime: '创建时间'
    },
    field: {
      organicNo: '证书编号',
      organicCompany: '颁发单位',
      organicValid: '有效期至',
      organicImagePreview: '缩略图',
      organicImageUrl: '证书图片',
      relatedPlots: '关联地块',
      isWarning: '预警状态'
    },
    placeholder: {
      organicNo: '请输入证书编号（如 GB-2026-001）',
      organicCompany: '颁发单位（如 南京国环）',
      organicValid: '请选择有效期到期日',
      search: '搜索地块编码 / 名称'
    },
    rule: {
      organicNo: { required: '证书编号不能为空' },
      organicCompany: { required: '颁发单位不能为空' },
      organicValid: { required: '请选择证书有效期到期日' }
    },
    warning: { yes: '即将到期', no: '正常' },
    confirm: {
      del: '是否确认删除选中的 {count} 张证书？将同时清除该证书与地块的关联关系。',
      scan: '将立即扫描所有有机证书，标记 60 天内到期为预警状态，是否继续？'
    },
    unselected: '未关联地块',
    selected: '已关联地块',
    scan_warning: '立即扫描预警',
    scan_done: '扫描完成'
  },
  // 种植 - 果蔬有机认证（PLT-MD-003）
  plantCropOrganic: {
    title: { add: '新增果蔬有机证书', edit: '编辑果蔬有机证书' },
    column: {
      cropCertNo: '证书编号',
      cropCertCompany: '颁发单位',
      cropCertValid: '有效期',
      cropName: '关联作物',
      image: '证书图',
      warning: '预警状态',
      createTime: '创建时间'
    },
    field: {
      cropCertNo: '证书编号',
      cropCertCompany: '颁发单位',
      cropCertValid: '有效期至',
      cropId: '关联作物',
      cropImagePreview: '缩略图',
      cropImageUrl: '证书图片',
      isWarning: '预警状态'
    },
    placeholder: {
      cropCertNo: '请输入证书编号',
      cropCertCompany: '颁发单位',
      cropCertValid: '请选择有效期到期日',
      cropId: '请选择关联作物'
    },
    rule: {
      cropCertNo: { required: '证书编号不能为空' },
      cropCertCompany: { required: '颁发单位不能为空' },
      cropCertValid: { required: '请选择证书有效期到期日' },
      cropId: { required: '请选择关联作物' }
    },
    warning: { yes: '即将到期', no: '正常' },
    confirm: { del: '是否确认删除选中的 {count} 张证书？' }
  },
  // 种植 - 作物（PLT-MD-001）
  plantCrop: {
    title: { add: '新增作物', edit: '编辑作物', view: '作物详情', baseInfo: '基础信息', related: '关联信息' },
    organicEmpty: '有机认证明细暂未提供（后端聚合待补）',
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
  // 种植 - 计划（PLT-PLAN-001）
  plantPlan: {
    pageTitle: '种植计划',
    field: {
      planNo: '计划号',
      planYear: '年份',
      planSeason: '季节',
      crop: '作物',
      cropId: '作物',
      totalArea: '总面积',
      totalPlot: '地块数',
      earliestHarvestdate: '最早采摘',
      lastHarvestdate: '最晚采摘',
      plantStatus: '计划状态',
      harvestStatus: '采摘状态',
      plantDate: '计划种植时间',
      plotCode: '地块编码',
      plotName: '地块名称',
      plotArea: '地块面积',
      plantMonth: '种植月份',
      plantPeriod: '上中下旬',
      plantBy: '种植班组',
      harvestBy: '采摘班组',
      expectedYield: '预计产量'
    },
    column: {
      planNo: '计划号',
      planYear: '年份',
      planSeason: '季节',
      crop: '作物',
      totalArea: '总面积(亩)',
      totalPlot: '地块数',
      earliestHarvestdate: '最早采摘',
      lastHarvestdate: '最晚采摘',
      plantStatus: '状态',
      action: '操作'
    },
    placeholder: {
      planSeason: '请选择种植季节',
      plantDate: '例：4 月上旬（可选填）',
      team: '请选择班组'
    },
    action: {
      detail: '详情'
    },
    edit: {
      btn: {
        edit: '编辑',
        save: '保存',
        cancel: '取消'
      },
      title: '编辑种植计划',
      locked: '不可改',
      detailsTip: '只能改班组（plot / 月份 / 上中下旬 已锁）',
      saveSuccess: '种植计划已更新',
      lockTip: {
        done: '计划已完成，不允许修改',
        cancelled: '计划已取消，不允许修改',
        other: '当前状态不支持修改'
      }
    },
    confirm: { del: '是否确认删除选中的 {count} 个种植计划？' },
    wizard: {
      title: '新建种植计划',
      backToList: '返回列表',
      step1: '选择年份与季节',
      step2: '选择作物',
      step3: '选择地块与时间',
      submit: '创建计划',
      cropSearch: '搜索作物名称 / 编码 / 品种',
      cropEmpty: '暂无作物，请先在"作物管理"维护',
      plotPickerHint: '按片区分组展示所有地块；勾选要安排种植的地块后填月份、上中下旬、班组',
      zoneEmpty: '暂无地块，请先在"地块管理"维护',
      selectedSummary: '已选 {count} 个地块',
      resumeConfirm: '检测到未提交的计划草稿，是否恢复？',
      resumeYes: '恢复草稿',
      resumeNo: '新建',
      tip: {
        step1Required: '请填写年份和季节',
        step2Required: '请选择 1 个作物',
        step3Required: '请至少选择 1 个地块',
        submitSuccess: '种植计划已创建'
      },
      col: {
        plotCode: '地块编码',
        plotName: '地块名称',
        plotArea: '面积',
        month: '月份',
        period: '上中下旬',
        plantBy: '种植班组',
        harvestBy: '采摘班组',
        selected: '选择',
        selectHint: '勾选后该地块加入本次计划'
      },
      placeholder: {
        month: '月',
        period: '上/中/下旬',
        team: '选班组'
      }
    },
    dict: {
      period: { early: '上旬', mid: '中旬', late: '下旬' }
    },
    detail: {
      title: '种植计划详情',
      detailsTitle: '地块明细',
      missingId: '缺少计划 ID'
    },
    gantt: {
      title: '双甘特图（计划 vs 实际）',
      v1Note: 'V1 简化版',
      empty: '暂无明细，无法绘制甘特图',
      legend: { plan: '计划范围', actual: '实际执行' }
    }
  },
  pickPlan: {
    pageTitle: '采摘计划',
    field: {
      planYear: '计划年份',
      planSeason: '计划季节',
      harvestStatus: '采摘状态'
    },
    placeholder: {
      planSeason: '请选择季节',
      harvestStatus: '请选择采摘状态',
      team: '采摘班组'
    },
    column: {
      planNo: '计划号',
      planYear: '年份',
      planSeason: '季节',
      crop: '作物',
      plotCount: '地块数',
      planEarliest: '计划最早',
      planLatest: '计划最晚',
      actualBegin: '实际开始',
      actualEnd: '实际结束',
      expectedYield: '预计产量',
      actualYield: '实际产量',
      activityPlotCount: '游客活动地块',
      action: '操作'
    },
    action: { adjust: '调整' },
    adjust: {
      title: '调整采摘计划',
      backToList: '返回列表',
      tip: '按地块设置实际采摘起止日期、是否游客采摘活动、采摘班组；保存后立即生效。',
      activityYes: '游客采摘',
      activityNo: '常规',
      paramsMissing: '缺少 planId / cropId 参数',
      saveSuccess: '已更新 {count} 行明细',
      col: {
        plotCode: '地块编码',
        plotName: '地块名称',
        plotArea: '面积',
        planEarliest: '计划最早',
        planLatest: '计划最晚',
        beginHarvestdate: '实际开始采摘',
        endHarvestdate: '实际结束采摘',
        isPick: '游客采摘',
        harvestBy: '采摘班组',
        harvestStatus: '采摘状态'
      }
    }
  },
  pickActivity: {
    pageTitle: '采摘活动',
    field: {
      activityNo: '活动编码',
      activityName: '活动名称',
      activityStatus: '活动状态',
      activityDate: '活动日期',
      cropId: '作物',
      totalPlot: '涉及地块数',
      totalYield: '当日采摘汇总(kg)',
      visitorCount: '参与游客人数',
      remark: '备注'
    },
    placeholder: {
      activityNo: '编码模糊匹配',
      activityName: '名称模糊匹配',
      dateFrom: '开始日期',
      dateTo: '结束日期'
    },
    column: {
      activityNo: '活动编码',
      activityName: '活动名称',
      activityDate: '活动日期',
      activityStatus: '状态',
      crop: '作物',
      totalPlot: '地块数',
      totalYield: '采摘量',
      visitorCount: '游客人数',
      action: '操作'
    },
    action: { summary: '汇总结束' },
    dialog: {
      addTitle: '新增采摘活动',
      editTitle: '编辑采摘活动'
    },
    rule: {
      activityNameRequired: '请填写活动名称',
      activityDateRequired: '请选择活动日期',
      cropRequired: '请选择作物'
    },
    confirm: {
      del: '确认删除采摘活动「{name}」？',
      summary: '汇总后将状态置为「已结束」，并从采摘明细聚合当日产量回填，是否继续？'
    },
    tip: {
      addSuccess: '采摘活动已创建',
      updateSuccess: '采摘活动已更新',
      summarySuccess: '汇总完成，当日采摘 {yield} kg'
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
      },
      pigCut: {
        title: '分割记录',
        cutId: '分割单号',
        barId: '白条编号',
        earNo: '猪只耳号',
        pickupTime: '白条领用时间',
        cutStartTime: '分割开始时间',
        cutDoneTime: '出库完成时间',
        pickupWeight: '领用重量 (kg)',
        dripLoss: '滴水损失 (kg)',
        acidRemoveMinutes: '排酸时长 (分钟)',
        cutStatus: '状态',
        operator: '操作人',
        location: '入冻品库位',
        isHalf: '是否半扇',
        remark: '备注'
      },
      vegHandle: {
        title: '毛菜处理',
        plot: '地块',
        crop: '作物',
        pickStartTime: '采摘开始时间',
        pickEndTime: '采摘结束时间',
        pickedWeight: '已摘 (kg)',
        handledWeight: '处理后 (kg)',
        feedWeight: '饲料 (kg)',
        sendPlatformWeight: '发往月台 (kg)',
        stockInWeight: '入库 (kg)',
        lossWeight: '损耗 (kg)',
        handleStatus: '处理状态',
        statusPending: '待处理',
        statusProcessing: '处理中',
        statusDone: '已完成',
        recordType: '记录类型',
        recordTypePick: '采收',
        recordTypeHandle: '处理',
        recordWeight: '本次重量 (kg)',
        handleTarget: '处理目标',
        location: '入库库位',
        operator: '处理人',
        handleTime: '处理时间',
        remark: '备注',
        recordsDialogTitle: '处理流水明细',
        detail: '详情'
      },
      stockFlow: {
        title: '出入库流水',
        flowNo: '流水号',
        flowDate: '业务时间',
        flowType: '类型',
        inoutType: '出入',
        matType: '物资类型',
        productName: '产品',
        productCode: '产品码',
        belongType: '归属',
        changeQuantity: '数量',
        productUnit: '单位',
        location: '库位',
        earNo: '耳号',
        plot: '地块',
        stockOutDest: '出库去向',
        operator: '操作人',
        remark: '备注',
        adjust: '调账',
        adjustHint: '流水调账 (D11 完整实现)',
        adjustNotImpl: '调账功能将在后续版本中提供 (flowNo={flowNo})'
      },
      matPack: {
        title: '包材流水'
      },
      purchaseIn: {
        title: '采购入库',
        flowNo: '入库单号',
        flowDate: '入库时间',
        product: '物资',
        productPlaceholder: '请选择物资',
        productRequired: '请选择物资',
        location: '库位',
        locationPlaceholder: '请选择库位',
        locationRequired: '请选择库位',
        quantity: '入库数量',
        quantityRequired: '入库数量必填且 > 0',
        unit: '单位',
        operator: '操作人',
        remark: '备注',
        dialogTitle: '新增采购入库',
        submitSuccess: '入库成功'
      },
      shipment: {
        title: '发货流水',
        shipmentNo: '发货单号',
        shipDate: '发货日期',
        productType: '业态',
        demandId: '关联需求',
        storeId: '目的门店',
        shipQuantity: '发货数量',
        shipUnit: '单位',
        deliverType: '发货方式',
        shipmentStatus: '状态',
        checker: '清点员',
        checkTime: '清点时间',
        remark: '备注'
      },
      return: {
        title: '退货管理',
        returnNo: '退货单号',
        applyTime: '申请时间',
        storeId: '退货门店',
        productId: '产品 ID',
        productName: '产品名称',
        returnWeight: '退货重量',
        confirmWeight: '确认重量',
        confirmUser: '确认人',
        confirmTime: '确认时间',
        isConfirm: '是否确认',
        returnReason: '退货原因',
        returnDirection: '退货方向',
        returnStatus: '退货状态',
        remark: '备注',
        confirm: '确认',
        confirmed: '已确认',
        productIdRequired: '产品 ID 不能为空',
        returnWeightRequired: '退货重量必填且 > 0',
        confirmWeightRequired: '确认重量必填且 > 0',
        dialogAddTitle: '新增退货',
        dialogEditTitle: '编辑退货',
        confirmDialogTitle: '确认退货',
        confirmStockHint: '门店→仓库方向：确认后将自动联动 stock_flow（return_in 入库）',
        confirmPlaceholderHint: '其他方向 V1 仅录入占位，不联动 stock_flow（V2 实现）',
        addSuccess: '退货已新增',
        editSuccess: '退货已编辑',
        deleteConfirm: '确认删除退货单【{no}】？',
        deleteSuccess: '退货已删除',
        confirmSuccess: '退货已确认'
      },
      check: {
        checkId: '盘点单号',
        locationName: '盘点库位',
        checkDate: '盘点日期',
        checkStatus: '状态',
        lineCount: '明细数',
        diffSum: '盈亏计',
        createTime: '创建时间',
        detail: '详情',
        complete: '完成盘点',
        cancel: '取消盘点',
        createTitle: '新建盘点单',
        lockHint: '新建后该库位将进入盘点锁定，期间禁止出入库',
        locationPlaceholder: '请选择盘点库位',
        locationRequired: '请选择盘点库位',
        checkDatePlaceholder: '请选择盘点日期',
        checkDateRequired: '请选择盘点日期',
        remark: '备注',
        detailTitle: '盘点明细',
        productName: '产品',
        productUnit: '单位',
        sysStock: '系统量',
        checkStock: '实盘量',
        diffStock: '差异',
        checkResultType: '结果',
        diffReason: '差异原因',
        checkBy: '盘点人',
        createSuccess: '盘点单已创建，库位已锁定',
        completeConfirm: '确认完成盘点单 {no}？将写入差异流水并回写库存',
        completeSuccess: '盘点已完成',
        cancelConfirm: '确认取消盘点单 {no}？将仅解锁库位、不回写库存',
        cancelSuccess: '盘点已取消'
      },
      flowIn: {
        flowNo: '流水号',
        flowDate: '业务时间',
        flowType: '类型',
        matType: '物资类型',
        productCode: '产品码',
        productName: '产品',
        belongType: '归属',
        changeQuantity: '数量',
        productUnit: '单位',
        location: '库位',
        earNo: '耳号',
        operator: '操作人',
        remark: '备注'
      },
      flowOut: {
        flowNo: '流水号',
        flowDate: '业务时间',
        flowType: '类型',
        matType: '物资类型',
        stockOutDest: '出库去向',
        productCode: '产品码',
        productName: '产品',
        belongType: '归属',
        changeQuantity: '数量',
        productUnit: '单位',
        location: '库位',
        earNo: '耳号',
        operator: '操作人',
        remark: '备注'
      }
    }
  },
  // 仓库 dashboard 占位版（DJS-FIX-ADMIN-W22-006）
  warehouse: {
    dashboard: {
      todayDemand: '今日需求量',
      todayDemandUnit: '白条业态',
      todayProduction: '今日生产',
      todayProductionUnit: '件入库',
      stockCheck: '最近盘点（正常 / 异常 / 计损）',
      monthAbnormalLocation: '当月异常库位 {count} 处',
      locationOverview: '库位概览（Top 20）',
      refresh: '刷新',
      colLocation: '库位',
      colType: '类型',
      colStock: '当前库存',
      colStatus: '状态',
      statusNormal: '正常',
      statusAbnormal: '异常',
      emptyLocation: '暂无库位数据',
      fullVersionHint: '更多可视化图表（趋势折线 / 出入库饼图 / 业态对比）将在后续版本中提供。'
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
    summary: {
      loading: '加载中…',
      loadFailed: '业态摘要加载失败，请刷新重试',
      whiteBar: '当前可出栏育肥猪 {count} 头',
      vegetable: '当前种植 {plot} 地块 / 预计待产量 {yield} kg / 最早采摘 {pickDate} / 当前库存 {stock} kg',
      giftBox: '当前礼盒库存 {count} 盒',
      other: '当前原料库存 {stock} kg'
    },
    assignPig: {
      title: '指定猪只 - {no}（需 {required} 头）',
      selectedTip: '已选 {selected} / {required} 头',
      confirmBtn: '确认指定（{count} 头）',
      assignSuccess: '已指定 {count} 头',
      assignedTitle: '已指定（{count}）',
      overLimit: '最多指定 {required} 头，请先取消多余勾选',
      emptyAvailable: '当前没有可出栏育肥猪',
      confirmRemove: '确认移除耳号 {earNo}？',
      column: {
        earNo: '耳号',
        pigSex: '性别',
        pigBreed: '品种品系',
        ageDays: '日龄（天）',
        lastBackfat: '最新背膘 (mm)'
      }
    },
    history: {
      title: '状态流转历史',
      operator: '操作人',
      remark: '备注',
      empty: '暂无状态变更记录'
    },
    kpi: {
      pigDemand: '今日猪需求',
      assigned: '已调配',
      vegDemand: '今日果蔬需求',
      otherDemand: '其他需求',
      unitHead: '头',
      unitSpecies: '品种',
      unitItem: '条'
    }
  },
  // 门店端发起需求（STR-DEMAND-001，复用 WMS demand 表）
  storeDemand: {
    not_found_msg: '需求单不存在或已删除',
    productType: {
      white_bar: '白条',
      vegetable: '蔬菜',
      gift_box: '礼盒',
      other: '其他'
    },
    filter: {
      store: '门店',
      storePlaceholder: '请选择门店'
    },
    tip: {
      selectStoreFirst: '请先在顶部选择门店再新增需求'
    },
    field: {
      demandNo: '需求单号',
      demandDate: '需求日期',
      'demandDate.required': '需求日期不能为空',
      storeId: '提单门店',
      'storeId.required': '提单门店不能为空',
      productId: '产品',
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
      endDate: '结束日期'
    },
    column: {
      demandNo: '需求单号',
      demandDate: '需求日期',
      productName: '产品',
      demandQuantity: '需求量',
      productUnit: '单位',
      demandStatus: '状态',
      expectedArriveDate: '期望到货',
      createTime: '创建时间',
      actions: '操作'
    },
    placeholder: {
      demandNoAuto: '提交后自动生成',
      storeId: '请选择提单门店',
      productId: '请选择产品（按业态过滤）',
      demandQuantity: '请输入需求量',
      productUnit: '如 头 / kg / 盒',
      rawMaterial: '如 "需要 5 头猪"',
      demandExplain: '如 "25 号之前每天 1 头猪送到矿业 / 背膘不要太厚"'
    },
    form: {
      addTitle: '新增需求',
      editTitle: '编辑需求',
      detailTitle: '需求详情'
    },
    action: {
      edit: '编辑',
      cancel: '撤回',
      assignPig: '指定猪只',
      detail: '详情'
    },
    confirm: {
      del: '确认删除选中的 {count} 条需求？仅未确认需求可删'
    },
    prompt: {
      cancelRemark: '请输入撤回原因（可选）',
      cancelRemarkPh: '如下错单 / 门店临时取消等'
    },
    assignPig: {
      title: '指定猪只 - {no}（需 {required} 头）',
      selectedTip: '已选 {selected} / {required} 头',
      confirmBtn: '确认指定（{count} 头）',
      assignSuccess: '已指定 {count} 头',
      assignedTitle: '已指定（{count}）',
      overLimit: '最多指定 {required} 头，请先取消多余勾选',
      emptyAvailable: '当前没有可出栏育肥猪',
      column: {
        earNo: '耳号',
        pigSex: '性别',
        pigBreed: '品种品系',
        ageDays: '日龄（天）',
        lastBackfat: '最新背膘 (mm)'
      }
    }
  },
  // 门店经营（产品关联 + 销售明细，STR-OP-001）
  storeOperation: {
    relation: {
      store: '门店',
      storePlaceholder: '请选择门店',
      save: '保存关联',
      allSku: '全部产品',
      linkedSku: '已关联产品',
      filterPlaceholder: '搜索产品名称'
    },
    sale: {
      store: '门店',
      storePlaceholder: '请选择门店',
      source: '数据来源',
      saleDateFrom: '销售日期起',
      saleDateTo: '销售日期止',
      sourceManual: '手录',
      sourceExcel: 'Excel导入',
      import: '导入',
      downloadTemplate: '下载模板',
      importTitle: '导入销售流水',
      file: '选择文件',
      uploadHint: '将 Excel 文件拖到此处，或点击选择',
      importTip: '仅支持导入该门店已配置「产品关联」的 SKU；列：产品名称 / 销售日期 / 销售数量 / 销售总额',
      confirmImport: '开始导入',
      importFail: '导入失败',
      confirmDel: '确认删除选中的 {count} 条销售流水？',
      column: {
        storeName: '门店',
        productName: '产品名称',
        saleDate: '销售日期',
        saleQty: '销售数量',
        saleUnit: '单位',
        saleAmount: '销售总额',
        source: '数据来源',
        operator: '录入人',
        createTime: '创建时间'
      },
      form: {
        title: '手录销售流水',
        store: '门店',
        product: '产品',
        productPlaceholder: '请选择产品',
        selectStoreFirst: '请先选择门店',
        noRelation: '该门店暂无产品关联，请先在「产品关联」配置',
        unit: '单位',
        unitAuto: '选择产品后自动带出',
        saleDate: '销售日期',
        saleQty: '销售数量',
        saleAmount: '销售总额',
        remark: '备注',
        storeRequired: '请选择门店',
        productRequired: '请选择产品',
        saleDateRequired: '请选择销售日期',
        saleDateFuture: '销售日期不能晚于今天',
        saleQtyRequired: '请输入销售数量',
        saleAmountRequired: '请输入销售总额'
      }
    }
  },
  // 门店盘点（STR-STOCK-001，admin only）
  storeCheck: {
    field: {
      checkId: '盘点单号',
      store: '门店',
      checkStatus: '状态',
      checkDateFrom: '盘点日期起',
      checkDateTo: '盘点日期止'
    },
    column: {
      checkId: '盘点单号',
      storeName: '门店',
      checkDate: '盘点日期',
      checkStatus: '状态',
      lineCount: '明细数',
      diffSum: '盈亏计',
      createTime: '创建时间'
    },
    action: {
      detail: '详情',
      complete: '完成',
      cancel: '取消'
    },
    confirm: {
      complete: '确认完成盘点单「{id}」？完成后将记录差异并解锁门店，不可再修改。',
      cancel: '确认取消盘点单「{id}」？取消后解锁门店，已录差异不回写库存。'
    },
    form: {
      title: '新建盘点单',
      lockHint: '新建后该门店即进入「进行中」并被锁定，盘点期间该门店该产品的销售出库将被拒绝，完成或取消后解锁。',
      store: '门店',
      storePlaceholder: '请选择门店',
      checkDate: '盘点日期',
      checkDatePlaceholder: '请选择盘点日期',
      remark: '备注',
      submit: '新建并录实盘',
      storeRequired: '请选择门店',
      checkDateRequired: '请选择盘点日期'
    },
    detail: {
      title: '盘点单详情',
      checkId: '盘点单号',
      store: '门店',
      checkDate: '盘点日期',
      checkStatus: '状态',
      entryTitle: '录入实盘',
      product: '产品',
      productPlaceholder: '请选择产品',
      productRequired: '请选择产品',
      checkStock: '实盘量',
      checkStockRequired: '请输入实盘量',
      diffReason: '差异原因',
      diffReasonPlaceholder: '选填',
      entrySubmit: '录入',
      complete: '完成盘点',
      empty: '暂无实盘明细',
      noCheckId: '盘点单号加载中，请稍后重试',
      noLineToComplete: '请先录入至少一条实盘明细',
      confirmRemoveLine: '确认删除产品「{name}」的实盘明细？',
      column: {
        productName: '产品',
        productUnit: '单位',
        sysStock: '系统量',
        checkStock: '实盘量',
        diffStock: '差异',
        checkResultType: '结果',
        diffReason: '差异原因'
      }
    }
  },
  // 门店会员档案 + 手录消费（STR-MEMBER-001，V1 只做档案 + 手录，不做营销分析）
  storeMember: {
    kpi: {
      monthlyMember: '本月新增会员',
      monthlyConsumption: '本月录入消费记录'
    },
    field: {
      phone: '手机号',
      memberName: '会员姓名',
      memberLevel: '会员等级',
      store: '所属门店'
    },
    column: {
      memberNo: '会员编号',
      memberName: '会员姓名',
      phone: '手机号',
      memberLevel: '会员等级',
      joinDate: '入会日期',
      storeName: '所属门店',
      memberTags: '会员标签',
      memberStatus: '状态',
      createTime: '创建时间'
    },
    status: {
      normal: '正常',
      disabled: '停用'
    },
    action: {
      consumeRecord: '消费记录'
    },
    confirm: {
      delete: '确认删除会员「{name}」？删除后档案与消费记录将隐藏。'
    },
    form: {
      addTitle: '新增会员',
      editTitle: '编辑会员',
      memberName: '会员姓名',
      memberNamePlaceholder: '请输入会员姓名',
      memberNameRequired: '请输入会员姓名',
      phone: '手机号',
      phonePlaceholder: '请输入手机号',
      phoneRequired: '请输入手机号',
      phoneInvalid: '手机号格式不正确',
      memberLevel: '会员等级',
      memberLevelPlaceholder: '请选择会员等级',
      joinDate: '入会日期',
      joinDatePlaceholder: '请选择入会日期',
      store: '所属门店',
      storePlaceholder: '请选择门店（选填）',
      memberTags: '会员标签',
      memberTagsPlaceholder: '逗号分隔，如 常客,亲子',
      memberStatus: '状态',
      remark: '备注'
    },
    consume: {
      title: '会员「{name}」消费记录',
      add: '录入消费',
      entryTitle: '录入消费记录',
      consumeDate: '消费日期',
      consumeDatePlaceholder: '请选择消费日期',
      consumeDateRequired: '请选择消费日期',
      sku: '商品SKU',
      skuPlaceholder: '商品名称 / 编码（自由填写）',
      quantity: '数量',
      amountManual: '金额(元)',
      notes: '备注',
      operator: '录入人',
      createTime: '创建时间',
      empty: '暂无消费记录'
    }
  },
  // 门店白条分割（STR-SPLIT-001，admin only 复用 inhouse 表 source='store'）
  storeSplit: {
    field: {
      cutPart: '部位',
      produceDateStart: '生产日期起',
      produceDateEnd: '生产日期止'
    },
    column: {
      cutPart: '部位',
      productName: '产品',
      productWeight: '重量(kg)',
      produceDate: '生产日期',
      source: '来源',
      createByName: '录入人',
      createTime: '创建时间'
    },
    tag: {
      store: '门店再分'
    },
    form: {
      title: '门店再分录入',
      hint: '将仓库已分割入库的白条 / 部位品在门店端再分一次，按部位反查标准产品入门店库位。',
      cutPart: '分割部位',
      cutPartPlaceholder: '请选择分割部位',
      cutPartRequired: '请选择分割部位',
      productWeight: '再分重量',
      productWeightRequired: '请输入再分重量',
      productWeightMin: '再分重量须大于 0',
      location: '入库库位',
      locationPlaceholder: '请选择库位（选填）',
      whiteBarId: '源白条',
      whiteBarIdPlaceholder: '源白条标识（选填，溯源用）',
      remark: '备注',
      submit: '提交'
    }
  },
  // 门店退回管理（STR-RETURN-001，门店域薄实现，admin only）
  storeReturn: {
    field: {
      returnNo: '退回单号',
      returnDirection: '退回方向',
      store: '退回门店',
      product: '产品',
      location: '入库库位',
      returnQuantity: '退回数量',
      returnReason: '退回原因',
      traceCode: '追溯码',
      member: '会员',
      returnDate: '退回日期',
      returnDateFrom: '退回日期起',
      returnDateTo: '退回日期止',
      remark: '备注'
    },
    column: {
      returnNo: '退回单号',
      returnDirection: '退回方向',
      storeName: '退回门店',
      productName: '产品',
      locationName: '入库库位',
      returnQuantity: '退回数量',
      returnReason: '退回原因',
      traceCode: '追溯码',
      memberId: '会员ID',
      returnDate: '退回日期',
      operatorName: '经手人',
      createTime: '创建时间'
    },
    placeholder: {
      returnDirection: '请选择退回方向',
      store: '请选择退回门店（顾客退回必填）',
      product: '请选择产品',
      location: '请选择退回入库库位',
      returnReason: '请输入退回原因',
      traceCode: '已贴追溯码，如有',
      member: '会员退回填会员ID，可空',
      returnDate: '请选择退回日期'
    },
    rule: {
      returnDirection: '请选择退回方向',
      product: '请选择产品',
      location: '请选择退回入库库位',
      returnQuantity: '请输入退回数量',
      returnQuantityMin: '退回数量必须大于 0'
    },
    tip: {
      editLock: '产品 / 入库库位 / 退回数量为入库驱动字段，建后不可修改'
    },
    dialog: {
      add: '新增退回',
      edit: '编辑退回'
    },
    confirm: {
      delete: '确认删除退回单 {no}？'
    }
  },
  // 种植灾害记录（PLT-WORK-003，admin 只读独立子页）
  plantDisaster: {
    column: {
      recordNo: '灾害记录号',
      farmDate: '发生日期',
      disasterType: '灾害类型',
      plotName: '地块',
      plotCode: '地块编码',
      cropName: '作物',
      lossRate: '损失率',
      lossYield: '损失产量',
      isWarning: '预警',
      teamName: '处理班组',
      createTime: '登记时间'
    },
    field: {
      recordNo: '灾害记录号',
      dateRange: '发生日期',
      plot: '地块',
      disasterType: '灾害类型',
      isWarning: '是否预警'
    },
    tag: {
      warning: '预警',
      normal: '正常'
    },
    action: {
      detail: '详情'
    },
    empty: '暂无灾害记录',
    detail: {
      title: '灾害记录详情',
      remark: '备注',
      proof: '现场凭证',
      noProof: '无凭证图',
      notFound: '记录不存在'
    }
  },
  plantWork: {
    tab: {
      tillage: '整地',
      irrigate: '浇灌',
      fertilize: '施肥',
      weed: '除草',
      disaster: '灾害'
    },
    column: {
      recordNo: '记录号',
      farmDate: '农事日期',
      farmType: '农事类型',
      plotName: '地块',
      plotCode: '地块编码',
      cropName: '作物',
      teamName: '处理班组',
      remark: '备注',
      createTime: '登记时间',
      disasterType: '灾害类型',
      lossRate: '损失率',
      lossYield: '损失产量'
    },
    field: {
      recordNo: '记录号',
      dateRange: '农事日期',
      plot: '地块',
      team: '处理班组'
    },
    action: {
      detail: '详情'
    },
    empty: '暂无农事记录',
    detail: {
      title: '农事记录详情',
      tillageType: '整地类型',
      tillageMethod: '整地方式',
      transplantPlotName: '转移地块',
      transplantPercent: '移栽百分比',
      remark: '备注',
      proof: '现场凭证',
      noProof: '无凭证图',
      notFound: '记录不存在'
    }
  },
  // 种植 - 班组绩效（PLT-PERF-001）
  plantPerformance: {
    pageTitle: '班组绩效',
    toolbar: {
      statMonth: '结算月份',
      pickMonth: '请选择月份',
      generate: '生成结算',
      hint: '按采摘量 × 作物单价快照生成，重复生成会覆盖该月数据'
    },
    field: {
      statMonth: '月份',
      team: '班组',
      crop: '作物'
    },
    column: {
      statMonth: '月份',
      team: '班组',
      crop: '作物',
      pickWeight: '采摘总量',
      unitPrice: '单价快照',
      amount: '应付金额',
      action: '操作'
    },
    action: {
      detail: '工作详情'
    },
    confirm: {
      generate: '将重新生成 {month} 月结算，已有数据会被覆盖，是否继续？'
    },
    tip: {
      monthRequired: '请先选择结算月份',
      generateSuccess: '结算生成成功，共 {count} 条'
    },
    detail: {
      title: '绩效详情',
      tabYield: '产量绩效',
      tabFarm: '农事记录',
      rule: '绩效规则',
      recordNo: '记录号',
      farmType: '农事类型',
      plot: '地块',
      farmDate: '农事日期',
      farmCount: '共 {count} 条农事记录'
    }
  },
  // 种植首页 dashboard（PLT-DASH-001）
  plantDashboard: {
    title: {
      overview: '土地总览',
      todayFarm: '今日农事',
      monthCompletion: '当月种植任务完成率',
      gantt: '种植 / 采摘进度甘特图'
    },
    kpi: {
      idle: '空闲地块',
      planting: '种植中',
      harvesting: '采摘中',
      pending: '待种地块',
      total: '地块总数',
      totalArea: '土地总面积',
      areaUnit: '亩',
      todayFarmTotal: '今日农事总数',
      farmUnit: '条'
    },
    chart: {
      completionRate: '完成率',
      cropAxis: '作物',
      plantSegment: '种植',
      pickSegment: '采摘',
      noData: '暂无数据'
    },
    action: {
      refresh: '刷新',
      lastRefresh: '最近刷新'
    }
  },
  storeDashboard: {
    title: {
      home: '门店首页',
      productStructure: '当日产品结构（按业态）',
      top10: '当月 TOP10 产品排行',
      trend: '近 10 日趋势'
    },
    kpi: {
      todaySale: '今日销售额',
      monthSale: '本月累计销售额',
      todayOrder: '今日订单数',
      monthOrder: '本月订单数',
      pendingShip: '待发货',
      pendingPurchase: '待采购',
      amountUnit: '元',
      orderUnit: '单'
    },
    column: {
      productType: '业态',
      qty: '需求量',
      productName: '产品名称',
      saleAmount: '销售额',
      saleQty: '销售数量',
      date: '日期',
      orderCount: '订单数',
      avgPrice: '客单价'
    },
    filter: {
      store: '门店',
      allStores: '全部门店'
    },
    legend: {
      orderCount: '订单数',
      productSale: '销售额',
      saleAmount: '销售额',
      avgPrice: '客单价'
    },
    axis: {
      saleAmount: '销售额（元）',
      avgPrice: '客单价（元）'
    },
    chart: {
      noData: '暂无数据'
    },
    action: {
      refresh: '刷新'
    },
    empty: {
      productStructure: '当日暂无产品结构数据',
      top10: '当月暂无销售记录',
      trend: '近 10 日暂无销售记录'
    }
  },
  warehouseTrace: {
    tab: {
      pork: '猪肉',
      veg: '果蔬',
      gift: '礼盒'
    },
    giftPlaceholder: '礼盒追溯 V1 预留，子码下钻待后续版本开放',
    field: {
      produceCode: '追溯码',
      codeType: '类型',
      productName: '产品名',
      productSpec: '规格',
      pigEarNo: '猪只耳号',
      plotName: '地块',
      farmName: '农场',
      storeName: '门店',
      harvestDate: '采收日期',
      plantDays: '种植天数',
      creatorName: '生成人',
      createTime: '生成时间',
      remark: '备注',
      beginDate: '开始时间',
      endDate: '结束时间'
    },
    column: {
      produceCode: '追溯码',
      codeType: '类型',
      productName: '产品名',
      pigEarNo: '猪只耳号',
      storeName: '门店',
      farmName: '农场',
      creatorName: '生成人',
      createTime: '生成时间'
    },
    action: {
      detail: '详情',
      print: '打印',
      batchPrint: '批量打印'
    },
    detail: {
      title: '追溯码详情',
      groupBasic: '基本信息',
      groupRelation: '关联信息',
      groupImage: '产品图',
      groupTimeline: '追溯链时间轴'
    },
    timeline: {
      empty: '暂无追溯事件',
      operator: '操作人'
    },
    print: {
      empty: '所选追溯码无可打印数据',
      failed: '生成打印文件失败，请重试'
    },
    pdf: {
      title: '产品追溯码',
      serialNo: '序号'
    }
  }
};
