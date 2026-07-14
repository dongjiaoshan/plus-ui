export default {
  // 路由国际化
  route: {
    dashboard: '首页',
    document: '项目文档'
  },
  // 定时任务重跑（DENGBO row7）
  jobRerun: {
    panel: {
      title: '手动重跑',
      tip: '失败可重跑；选择日期范围则按日逐日重算（无日期任务不选日期，直接重跑一次）'
    },
    field: {
      jobName: '任务',
      dateRange: '日期范围',
      status: '状态',
      triggerType: '触发方式'
    },
    placeholder: {
      jobName: '请选择任务',
      begin: '开始日期',
      end: '结束日期',
      status: '请选择状态',
      triggerType: '请选择触发方式'
    },
    action: {
      rerun: '重跑',
      search: '搜索',
      reset: '重置'
    },
    column: {
      jobName: '任务',
      targetDate: '目标日',
      status: '状态',
      costMs: '耗时',
      triggerType: '触发方式',
      runTime: '触发时间',
      errorMsg: '错误信息'
    },
    jobName: {
      'breed-aggregate': '养殖统计聚合',
      'warehouse-stat': '仓库统计聚合',
      'organic-warning': '有机证书到期预警'
    },
    status: {
      running: '执行中',
      success: '成功',
      fail: '失败'
    },
    trigger: {
      schedule: '定时',
      manual: '手动'
    },
    rule: {
      jobName: '请选择要重跑的任务'
    },
    confirm: {
      rerun: '确认重跑任务「{job}」？'
    },
    message: {
      rerunSuccess: '重跑已触发'
    }
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
    selectStore: '选择门店',
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
    refresh: '刷新',
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
    next: '下一步',
    yes: '是',
    no: '否'
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
      supplierType: '供应类型',
      liaisonName: '联系负责人',
      liaisonPhone: '负责人电话',
      address: '地址',
      businessStatus: '合作状态',
      settleType: '结算方式',
      dealCount: '交易次数',
      purchaseQty: '购入量',
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
      supplierType: '供应类型',
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
      supplierType: '请选择供应类型',
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
  // 公共图片库（IMG-LIB-001）
  image: {
    title: {
      add: '新增图片',
      edit: '编辑图片'
    },
    column: {
      preview: '预览',
      imageName: '主名',
      aliases: '别名',
      sortOrder: '排序',
      status: '状态',
      remark: '备注',
      updateTime: '更新时间'
    },
    field: {
      imageName: '主名',
      aliases: '别名',
      image: '图片',
      sortOrder: '排序',
      status: '状态',
      remark: '备注'
    },
    placeholder: {
      imageName: '与作物/商品名称一致，如 番茄',
      aliases: '别名逗号分隔，如 西红柿,tomato'
    },
    rule: {
      imageName: {
        required: '请输入图片主名'
      }
    },
    action: {
      rematch: '批量重新匹配',
      batchUpload: '批量上传'
    },
    confirm: {
      del: '确认删除选中的 {count} 条图片？',
      rematch: '将对所有自动匹配（未手动改图）的作物 / 商品按名称重新匹配图库，确认执行？'
    },
    rematch: {
      done: '重新匹配完成（{detail}）'
    },
    batch: {
      title: '批量上传并自动归档',
      tip: '直接拖入一批已命名的图片（如 番茄.jpg），系统按文件名（去扩展名）作为主名自动建库，并立即重新匹配回填作物 / 商品。同名重传即替换。',
      fileName: '文件名',
      imageName: '主名（自动）',
      count: '待导入 {count} 张',
      submit: '导入并归档',
      done: '已导入 {imported} 张 / 更新 {updated} 张，已重新匹配（{rematched}）'
    },
    noImage: '无图'
  },
  // 分类默认图（IMG-LIB-001）
  defaultImage: {
    title: '分类默认图配置',
    hint: '主数据无图时按归属类型兜底；图请先传 OSS 再保存。',
    global: '全局兜底',
    column: {
      category: '分类',
      image: '默认图'
    }
  },
  // 门店主数据（SYS-MD-002 + SYS-MD-FIX-002）
  store: {
    title: {
      add: '新增门店',
      edit: '编辑门店',
      view: '门店详情',
      setManager: '设置店长',
      bindUser: '门店人员选择'
    },
    bindUser: {
      title: '门店人员选择',
      candidateTitle: '系统人员',
      boundTitle: '已绑定人员',
      searchPlaceholder: '搜索姓名 / 账号',
      colNickName: '姓名',
      colUserName: '账号',
      colPhone: '手机号',
      addSelected: '加入',
      remove: '移除',
      boundHint: '点「确定」后保存绑定关系（全量覆盖当前门店人员）'
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
      lineCode: '品系编码',
      lineName: '品系名称',
      typeCode: '品种编码',
      typeName: '品种名称',
      parentCode: '父级编码',
      description: '描述',
      remark: '备注',
      motherCode: '母系编码',
      motherName: '母系名称',
      fatherCode: '父系编码',
      fatherName: '父系名称',
      cubCode: '仔代编码',
      offspringName: '仔代名称',
      createTime: '创建时间',
      createBy: '创建人',
      changeTime: '变更时间',
      changeBy: '变更人'
    },
    field: {
      breedStrain: '类型',
      breedStrainCode: '编码',
      breedStrainName: '名称',
      lineCode: '品系编码',
      lineName: '品系名称',
      typeCode: '品种编码',
      typeName: '品种名称',
      parentCode: '父级编码',
      description: '描述',
      remark: '备注',
      motherCode: '母系编码',
      fatherCode: '父系编码',
      cubCode: '仔代编码',
      createTimeRange: '创建时间',
      changeTimeRange: '变更日期'
    },
    placeholder: {
      breedStrainCode: '请输入编码（字母/数字/下划线/连字符）',
      breedStrainName: '请输入名称',
      lineCode: '请输入品系编码（字母/数字/下划线/连字符）',
      lineName: '请输入品系名称',
      typeCode: '请输入品种编码（字母/数字/下划线/连字符）',
      typeName: '请输入品种名称',
      parentCode: '请输入父级编码（仅品系填）',
      motherCode: '请选择母系',
      fatherCode: '请选择父系',
      cubCode: '请选择仔代',
      autoFillName: '选码后自动带出'
    },
    option: {
      type: '品种',
      strain: '品系'
    },
    rule: {
      breedStrain: { required: '请选择类型' },
      breedStrainCode: {
        required: '编码不能为空',
        pattern: '编码仅允许字母、数字、下划线、连字符',
        len2: '品种编码必须为 2 位数字',
        len1to2: '品系编码须为1-2位数字'
      },
      breedStrainName: { required: '名称不能为空' },
      motherCode: { required: '请选择母系' },
      fatherCode: { required: '请选择父系' },
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
      sow: '母猪生产配置',
      fatten: '育肥生产配置',
      slaughter: '出栏配置',
      cycle: '生产周期',
      boar: '精液公猪',
      med: '药品疫苗周期'
    },
    unit: {
      day: '天'
    },
    sow: {
      sow_reserve_to_breed_days: '后备-配种天数',
      sow_wean_to_breed_days: '断奶-配种天数',
      sow_return_to_breed_days: '返情-配种天数',
      sow_empty_to_breed_days: '空怀-配种天数',
      sow_abort_to_breed_days: '流产-配种天数',
      sow_breed_to_farrow_days: '配种-分娩天数',
      sow_farrow_to_wean_days: '分娩-断奶天数'
    },
    fatten: {
      index: '序号',
      startAge: '起始日龄',
      endAge: '截止日龄',
      recordGrowth: '是否记录生长记录',
      addStage: '新增日龄阶段',
      ruleRequired: '第 {row} 行：起始 / 截止日龄不能为空',
      ruleRange: '第 {row} 行：截止日龄不能小于起始日龄'
    },
    slaughter: {
      slaughterAge: '出栏日龄'
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
      noAutoTrigger: '配置仅决定建议时间，不自动改状态',
      customOverridesDefault: '"自定义值"留空时业务读取走默认值'
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
      pigType: '猪只类型',
      currentStatus: '当前状态',
      pigBreedCode: '品种',
      pigStrainCode: '品系',
      birthDate: '出生日期',
      introduceDate: '引种日期',
      barnId: '栋舍',
      penId: '栏位',
      barn: '栋舍',
      pen: '栏位',
      motherEar: '母系耳号',
      fatherEar: '父系耳号',
      parity: '胎次',
      matingCount: '配种次数',
      lastMatingDate: '上次配种日',
      enterFattenAt: '入栏时间',
      statusStartedAt: '进入状态时间',
      statusStartedDate: '进入状态日期',
      endReason: '终止原因',
      remark: '备注',
      liveBornCount: '活仔数',
      weanedCount: '断奶仔猪数',
      avgLitterSize: '窝均仔数'
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
      motherEar: '请输入母系耳号',
      barnName: '请输入栋舍名称',
      penName: '请输入栏位名称'
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
        changeTime: '发生日期',
        eventType: '事件',
        transition: '状态变化',
        relatedEventId: '关联业务 ID',
        recorder: '业务人'
      },
      historyCol: {
        durationDays: '停留天数'
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
        id: '流水 ID',
        changeBy: '变更人'
      },
      field: {
        earNo: '耳号',
        eventType: '事件类型',
        newStatus: '变更后状态',
        changeBy: '变更人'
      },
      placeholder: {
        earNo: '请输入耳号',
        changeBy: '请输入变更人姓名'
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
      farmInfo: '农场栋舍信息配置',
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
    proto: {
      pageTitle: '农场栋舍管理',
      penDetailTitle: '栏位详情',
      createBarn: '新建栋舍',
      penDetail: '栏位详情',
      back: '返回',
      empty: '暂无栏位',
      col: {
        bigPenCount: '大栏数量',
        limitPenCount: '限位栏数量',
        bedCount: '产床数量',
        scatterPenCount: '散栏数量',
        nurseryPenCount: '保育栏数量',
        liveCount: '当前猪只存栏数量',
        updateTime: '更新时间',
        updateBy: '更新人员',
        bigSeq: '大栏序号',
        headCount: '猪只头数',
        stallNo: '限位栏号',
        bedNo: '产床号',
        earNo: '猪只耳号',
        pigletCount: '仔猪数'
      },
      field: {
        bigPenCount: '大栏数量',
        limitPenCount: '限位栏数量',
        bedCount: '产床数量',
        scatterPenCount: '散栏数量',
        nurseryPenCount: '保育栏数量'
      },
      placeholder: {
        bigPenCount: '请输入大栏数量',
        limitPenCount: '请输入限位栏数量',
        bedCount: '请输入产床数量',
        scatterPenCount: '请输入散栏数量',
        nurseryPenCount: '请输入保育栏数量'
      },
      rule: {
        countRequired: '请输入数量（不小于 0）'
      },
      tab: {
        big: '大栏',
        stall: '限位栏',
        farrow: '产床',
        scatter: '散栏',
        nurseryPen: '保育栏'
      },
      confirmDelPen: '是否确认删除栏位「{name}」？删除前需先转走该栏内所有存栏猪只。'
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
      locationSort: '排序',
      locationDesc: '描述',
      capacity: '容量',
      locationStatus: '状态',
      createTime: '创建时间',
      updateTime: '更新时间'
    },
    field: {
      locationCode: '库位编码',
      locationName: '库位名称',
      locationType: '库位类型',
      locationThumb: '库位图片',
      locationImg: '原图',
      locationSort: '排序',
      locationDesc: '库位描述',
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
      locationDesc: '请输入库位描述（选填）',
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
      productCount: '库存产品品类',
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
      production: '生产记录',
      flow: '业务流水',
      inout: '出入库记录',
      goodsView: '商品详情',
      goodsBaseInfo: '商品属性',
      productAdd: '新增产品',
      productEdit: '编辑产品',
      goodsAdd: '新增商品',
      goodsEdit: '编辑商品'
    },
    column: {
      productId: '产品编码',
      productName: '产品名称',
      productType: '产品类型',
      productAttr: '产品属性',
      productWorkshop: '生产车间',
      storeLocation: '存储仓库',
      belongType: '产品类别',
      productThumb: '产品图片',
      productUnit: '单位',
      productSpec: '规格',
      productAlias: '产品别名',
      productStatus: '状态',
      createTime: '创建时间',
      updateTime: '更新时间',
      index: '序号',
      goodsType: '商品类型',
      goodsAttr: '商品属性',
      goodsId: '商品编码',
      goodsName: '商品名称',
      goodsThumb: '商品图片',
      goodsBelongType: '商品类别',
      supplierName: '供应商'
    },
    field: {
      productId: '产品编码',
      productName: '产品名称',
      productType: '产品类型',
      productUnit: '单位',
      productSpec: '规格',
      productAlias: '产品别名',
      belongType: '产品类别',
      goodsBelongType: '商品类别',
      buyClass: '商品类别',
      productAttr: '产品属性',
      productWorkshop: '生产车间',
      productMaterial: '原材料产品',
      materialNum: '其它产品打包计量规则',
      productThumb: '产品图片',
      productImg: '详情图',
      imageOssId: '主图（自动匹配）',
      imageOssIdTip: '留空则按产品名称从公共图库自动匹配；手动上传后不再自动覆盖',
      productStatus: '状态',
      isDelivery: '是否发货产品',
      isBuyOut: '是否买断',
      isBuyOutSupport: '是否支持外购',
      storeLocation: '存储仓库',
      updateBy: '更新人员',
      supplierId: '供应商',
      productDesc: '产品描述',
      remark: '备注',
      goodsId: '商品编码',
      goodsName: '商品名称',
      goodsType: '商品类型',
      goodsAttr: '商品属性',
      goodsThumb: '商品图片',
      goodsDesc: '商品描述',
      supplierName: '供应商'
    },
    placeholder: {
      productId: '例 P0001 / SP-PORK-001（用户手填）',
      productUnit: '例 kg / 个 / 盒',
      productSpec: '例 500g/包',
      productAlias: '选填，产品别名',
      productMaterial: '关联原材料产品 ID',
      productMaterialSelect: '请选择关联的原材料产品',
      buyClass: '请选择商品类别（如字典空请到字典管理添加）',
      supplierId: '请选择供应商',
      storeLocation: '请选择存储库位'
    },
    rule: {
      productType: { required: '请选择产品类型' },
      productId: { required: '产品编码不能为空' },
      productName: { required: '产品名称不能为空' },
      productUnit: { required: '产品单位不能为空' },
      belongType: { required: '自产产品的产品类别不能为空' },
      supplierId: { required: '外购产品必须选择供应商' },
      productSpec: { required: '生产产品必须填写规格' },
      storeLocation: { required: '请选择存储仓库' },
      productAttr: { required: '请选择产品属性' },
      productWorkshop: { required: '请选择生产车间' }
    },
    tip: {
      buyClassEmpty: '暂无商品类别字典，请到「系统管理 → 字典管理 → djs_buy_class」添加',
      materialEmpty: '暂无原材料产品，请先新增「产品属性=原材料」的产品'
    },
    button: {
      inbound: '入库'
    },
    inbound: {
      title: '商品入库',
      product: '入库商品',
      supplier: '供应商',
      location: '入库库位',
      locationPlaceholder: '请选择入库库位',
      locationType: '库位类型',
      locationTypeAll: '全部',
      quantity: '入库数量',
      confirm: '确认入库',
      locationRequired: '请选择入库库位',
      locationLocked: '已锁定为配置库位',
      quantityRequired: '请输入入库数量',
      remark: '备注'
    },
    production: {
      produceDate: '生产日期',
      produceDatePlaceholder: '请选择生产日期',
      produceType: '生产类型',
      produceTypePlaceholder: '请选择类型',
      typeProduce: '生产',
      typeReturn: '退料',
      produceNum: '生产数量',
      produceUnit: '单位',
      standardWeight: '标准重量',
      produceWeight: '实际重量',
      diffWeight: '差异重量'
    },
    flow: {
      bizDate: '业务日期',
      bizDatePlaceholder: '请选择业务日期',
      bizDateStart: '开始日期',
      bizDateEnd: '结束日期',
      bizType: '业务类型',
      bizNum: '数量',
      bizUnit: '单位',
      typeInStock: '入库',
      typePickOut: '领用出库',
      typeBackendOut: '后台出库',
      supplierName: '供应商',
      operatorName: '操作人'
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
      blockNo: '地块编号',
      locationName: '存储库位',
      belongType: '产品类别'
    },
    column: {
      locationName: '存储库位',
      productName: '产品名称',
      productCode: '产品编码',
      productStock: '当前库存',
      productUnit: '单位',
      earNo: '耳号',
      whiteBarNo: '白条流水号',
      blockNo: '地块编号',
      latestCheckTime: '最新盘点',
      checkResult: '盘点结果'
    },
    action: {
      flowIn: '入库记录',
      flowOut: '出库记录',
      checkRecord: '盘点记录',
      productOut: '产品出库',
      pigTransfer: '猪肉转移',
      viewDetail: '查看详情'
    },
    outDialog: {
      title: '产品出库',
      currentStock: '当前库存',
      outDate: '出库日期',
      outDatePlaceholder: '请选择出库日期',
      quantity: '出库量',
      quantityPlaceholder: '请输入出库量',
      measureUnit: '计量单位',
      stockOutDest: '出库去向',
      stockOutDestPlaceholder: '请选择出库去向',
      confirm: '确定',
      rule: {
        outDate: '请选择出库日期',
        quantity: '请输入出库量',
        stockOutDest: '请选择出库去向'
      }
    },
    transferDialog: {
      title: '猪肉转移',
      fromLocation: '源库位',
      toLocation: '目标库位',
      frozenLocation: '冻品库',
      currentStock: '当前库存',
      transferDate: '转移日期',
      transferDatePlaceholder: '请选择转移日期',
      quantity: '转移量',
      quantityPlaceholder: '请输入转移量',
      measureUnit: '计量单位',
      confirm: '确定',
      rule: {
        transferDate: '请选择转移日期',
        quantity: '请输入转移量'
      }
    },
    recordDialog: {
      title: '出入库/盘点记录',
      checkId: '盘点单号',
      sysStock: '系统库存',
      checkStock: '实盘库存',
      diffStock: '差异',
      checkBy: '盘点人',
      lossRecord: '损耗记录',
      lossDate: '损耗日期',
      lossType: '损耗类型',
      lossLocation: '损耗位置',
      lossWeight: '损耗量',
      feedRecord: '饲料饲喂记录',
      feedDate: '饲喂日期',
      feedLocation: '饲喂位置',
      feedWeight: '饲喂量'
    }
  },
  // 种植看板（PLT-DASH-001 富图看板）
  plantDashboard: {
    title: '种植看板',
    refresh: '刷新',
    lastRefresh: '最近刷新',
    land: {
      title: '土地总览',
      idle: '空闲地块数',
      monthPending: '当月待种植地块数',
      planted: '已种植',
      currentArea: '当前种植面积(亩)',
      annualYield: '当年预计产量(吨)'
    },
    today: {
      title: '今日工作',
      empty: '(已废弃，可删 - 今日工作改固定6格无空态)',
      planting: '种植',
      harvest: '采摘',
      idleMgmt: '空地管理',
      plantMgmt: '种植管理',
      disaster: '灾害损失',
      pickActivity: '采摘活动',
      unitPlot: '地块'
    },
    cert: {
      title: '有机证书情况一览',
      plotMinDays: '(已废弃，可删)',
      cropMinDays: '(已废弃，可删)',
      cropNoCert: '作物无证书品类数',
      cropReserved: '(已废弃，可删)',
      cropCertExpiryDate: '果蔬有机证到期日',
      cropCertDaysToExpiry: '果蔬有机证书到期天数',
      cropCertCategoryCount: '果蔬有机证书品类数'
    },
    cropStat: {
      title: '实时种植物统计',
      plotCount: '种植地块数',
      expectedYield: '预计产量(Kg)'
    },
    gantt: {
      plantTitle: '种植计划',
      pickTitle: '采摘计划',
      progress: '进度'
    }
  },
  // 种植 - 片区（PLT-MD-001）
  // 种植总览（FIX-PLT-AD-OVERVIEW-001）
  plantOverview: {
    title: '种植总览',
    empty: '暂无作物数据',
    breadcrumbHome: '首页',
    breadcrumbPlant: '种植管理',
    kpi: {
      idlePlotCount: '空地块数',
      plantedPlotCount: '已种植地块数',
      harvestedTotalTon: '已采摘总量(吨)',
      expectedTotalTon: '预计总产量(吨)',
      remainingExpectedTon: '剩余预计总产量(吨)'
    },
    card: {
      currentPlanted: '当前已种地块',
      currentPlantedArea: '当前已种面积(亩)',
      planGroup: '计划',
      doneGroup: '已完成',
      plotCount: '地块数',
      area: '面积(亩)',
      expectedYield: '预计产量(kg)',
      doneArea: '已种面积(亩)',
      donePlotCount: '已种地数',
      harvestYield: '已摘产量(kg)',
      completionRate: '计划完成率'
    },
    detail: {
      title: '作物详情',
      back: '返回',
      export: '导出',
      col: {
        cropName: '作物名称',
        plotCode: '地块编号',
        plotName: '种植地块',
        plantStatus: '种植状态',
        harvestStatus: '采摘状态',
        planSeason: '种植季',
        planPlantDate: '计划种植日期',
        plantDate: '种植日期',
        plantTeamName: '种植班组',
        beginHarvestdate: '实际开始采摘日期',
        endHarvestdate: '实际结束采摘日期',
        earliestHarvestdate: '最早起始采摘时间',
        lastHarvestdate: '最晚截止采摘时间',
        plotArea: '地块面积(亩)',
        expectedYield: '预计产量(kg)',
        actualYield: '实际采收量(kg)'
      }
    }
  },
  plantZone: {
    title: { add: '新增片区', edit: '编辑片区' },
    column: { zoneCode: '片区编码', zoneName: '片区名称', zoneDesc: '说明', zoneBelong: '所属大区', zoneStatus: '状态', createTime: '创建时间', plotCount: '管理地块数量', updateTime: '更新时间', updateByName: '更新人员' },
    field: { zoneCode: '片区编码', zoneName: '片区名称', zoneDesc: '片区说明', zoneBelong: '所属大区', zoneStatus: '状态' },
    filter: { zoneBelong: '所属大区', zoneName: '片区名称', updateTime: '更新时间', updateBy: '更新人员' },
    placeholder: {
      zoneCode: '请输入片区编码（如 Z001 / EAST-01）',
      zoneName: '请输入片区名称',
      zoneDesc: '片区说明（可选）',
      zoneBelong: '所属大区（可选，例 东部）',
      search: '搜索片区名称',
      updateBy: '请选择更新人员'
    },
    action: { edit: '修改信息', disable: '禁用', enable: '启用', del: '删除' },
    rule: { zoneCode: { required: '片区编码不能为空' }, zoneName: { required: '片区名称不能为空' } },
    confirm: { del: '是否确认删除选中的 {count} 个片区？仅当片区下无种植/采摘状态地块时可删，删除后将一并删除该片区下的空地地块。' },
    empty: '暂无片区数据，请新建片区开始'
  },
  // 种植 - 地块（PLT-MD-001）
  plantPlot: {
    title: { add: '新增地块', edit: '编辑地块', view: '地块详情', baseInfo: '基础信息', zoneInfo: '片区信息' },
    zoneEmpty: '未关联片区',
    tab: { basic: '基础信息', location: '位置面积', soil: '土壤环境', planting: '种植信息', farmwork: '农事信息', cert: '认证信息' },
    planting: {
      plantDate: '种植日期',
      cropImage: '作物图片',
      cropName: '作物名称',
      cropCode: '作物编码',
      plantByName: '种植班组',
      expectedYield: '预计亩产',
      earliestHarvestdate: '预计最早采摘日期',
      lastHarvestdate: '预计最晚采摘日期',
      actualYield: '实际亩产',
      beginHarvestdate: '采摘开始日期',
      endHarvestdate: '采摘结束日期',
      harvestByName: '采摘班组'
    },
    farmwork: {
      farmDate: '农事日期',
      farmType: '农事类型',
      plotName: '作业地块',
      farmByName: '作业人',
      remark: '说明'
    },
    cert: {
      organicNo: '证书编号',
      organicCompany: '证书单位',
      organicValid: '有效期',
      isWarning: '是否预警'
    },
    column: {
      plotCode: '地块编码',
      plotName: '地块名称',
      zoneBelong: '所属大区',
      zoneName: '所属片区',
      plotType: '土地类型',
      soilType: '土壤类型',
      soilFertility: '土壤肥力',
      plotStatus: '地块状态',
      plotArea: '面积',
      isLease: '租赁',
      plotImage: '地块图片',
      historyPlantCount: '历史种植次数',
      maxYieldCrop: '最高亩产作物',
      maxYieldPerMu: '最高亩作物产量',
      plotRemark: '地块备注',
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
      plotImage: '图片',
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
    tip: { statusNotIdle: '地块 [{names}] 处于种植/采摘状态，不允许删除' },
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
      createTime: '创建时间',
      plotCount: '覆盖地块数',
      updateTime: '更新时间',
      updateByName: '更新人'
    },
    field: {
      organicNo: '证书编号',
      organicCompany: '颁发单位',
      organicValid: '有效期至',
      organicImagePreview: '缩略图',
      organicImageUrl: '证书图片',
      zone: '所属片区',
      relatedPlots: '关联地块',
      isWarning: '预警状态'
    },
    placeholder: {
      organicNo: '请输入证书编号（如 GB-2026-001）',
      organicCompany: '颁发单位（如 南京国环）',
      organicValid: '请选择有效期到期日',
      zone: '请选择片区（筛选下方地块）',
      search: '搜索地块编码 / 名称'
    },
    tip: {
      crossZone: '可切换片区分次选择，已关联地块跨片区保留。'
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
      createTime: '创建时间',
      updateTime: '更新时间',
      updateByName: '更新人'
    },
    field: {
      cropCertNo: '证书编号',
      cropCertCompany: '颁发单位',
      cropCertValid: '有效期至',
      cropId: '关联作物',
      relatedCrops: '关联作物',
      cropImagePreview: '缩略图',
      cropImageUrl: '证书图片',
      isWarning: '预警状态'
    },
    relate: {
      title: '关联作物',
      action: '关联作物',
      unselected: '未关联作物',
      selected: '已关联作物',
      search: '搜索作物编码 / 名称'
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
    title: { add: '新增作物', edit: '编辑作物', view: '作物详情', baseInfo: '基础信息' },
    tab: { basic: '基础信息', growth: '生长周期', yield: '产量品质', planting: '种植信息', farmwork: '农事信息' },
    label: {
      varietyOrigin: '品种来源',
      qualityDesc: '作物说明',
      relatedProduct: '关联产品编号',
      historyPlantCount: '历史种植次数',
      avgYield: '平均亩产(kg/亩)',
      maxYield: '最大亩产(kg/亩)',
      updateTime: '更新时间',
      updateByName: '更新人员'
    },
    search: {
      varietyOrigin: '品种来源',
      hasOrganic: '有机证书',
      organicWarning: '是否预警',
      updateTime: '更新时间',
      updateBy: '更新人员'
    },
    option: {
      yes: '是',
      no: '否',
      warningYes: '预警',
      warningNo: '正常'
    },
    planting: {
      plantDate: '种植日期',
      plotName: '种植地块',
      plotCode: '地块编码',
      plantTeamName: '种植班组',
      predictedPer: '预计亩产(kg)',
      earliestHarvestDate: '预计最早采摘日期',
      actualPer: '实际亩产(kg)',
      pickStartDate: '采摘开始日期',
      pickEndDate: '采摘结束日期',
      pickTeamName: '采摘班组',
      empty: '暂无种植记录'
    },
    farmwork: {
      farmDate: '农事日期',
      farmType: '农事类型',
      plotName: '作业地块',
      teamName: '作业人',
      remark: '说明',
      empty: '暂无农事记录'
    },
    sub: { index: '序号' },
    column: {
      cropCode: '作物编码',
      cropName: '作物名称',
      cropImage: '作物图片',
      varietyName: '品种名',
      cropFamily: '科属',
      plantingSeason: '种植季节',
      cycle: '生长周期',
      predictedPer: '预计亩产(kg/亩)',
      pickUnitPrice: '绩效单价',
      createTime: '创建时间'
    },
    field: {
      cropCode: '作物编码',
      cropName: '作物名称',
      cropImagePreview: '缩略图',
      cropImageUrl: '作物图片',
      imageOssId: '主图（自动匹配）',
      imageOssIdTip: '留空则按作物名称从公共图库自动匹配；手动上传后不再自动覆盖',
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
      pickUnitPrice: '绩效单价(元/斤)'
    },
    placeholder: {
      cropCode: '请输入作物编码（如 C001）',
      cropName: '请输入作物名称（如 白菜）',
      varietyName: '品种名（如 京白菜 4 号）',
      varietyOrigin: '请输入品种来源/供应商',
      cropFamily: '请选择作物科属',
      relatedProduct: '请选择关联产品',
      plantingSeason: '多选种植季节',
      sowingPeriod: '例：3 月上旬 - 4 月下旬',
      qualityDesc: '品质描述',
      hasOrganic: '请选择是否有机证书',
      organicWarning: '请选择证书是否预警',
      updateBy: '请输入更新人员ID'
    },
    rule: { cropCode: { required: '作物编码不能为空' }, cropName: { required: '作物名称不能为空' }, maxCycle: { gtMin: '生长最大周期必须大于生长最小周期' } },
    confirm: { del: '是否确认删除选中的 {count} 个作物？' }
  },
  // 种植 - 班组（PLT-MD-002）
  plantTeam: {
    pageTitle: '班组管理',
    title: { add: '新增班组', edit: '编辑班组', member: '成员管理 - {teamName}' },
    column: {
      teamName: '班组名称',
      leader: '班组负责人',
      leaderPhone: '负责人联系方式',
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
      teamName: '请输入班组名称',
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
      colAction: '操作',
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
      earliestHarvestdate: '最早采摘日期',
      lastHarvestdate: '最晚采摘日期',
      plantStatus: '种植计划状态',
      harvestStatus: '采摘状态',
      plantTime: '计划种植时间',
      plantActualDate: '种植日期',
      beginHarvestdate: '开始采摘日期',
      endHarvestdate: '结束采摘日期',
      plantDate: '计划种植时间',
      plotCode: '地块编码',
      plotName: '地块名称',
      plotArea: '地块面积',
      plantMonth: '种植月份',
      plantPeriod: '上中下旬',
      plantBy: '种植班组',
      harvestBy: '采摘班组',
      expectedYield: '预计产量(kg)',
      planMonth: '计划月份',
      planDate: '计划日期',
      updateTime: '计划更新时间',
      createBy: '计划编制人'
    },
    column: {
      planNo: '计划号',
      planYear: '计划年份',
      planSeason: '季节',
      crop: '作物',
      cropName: '种植农作物',
      cropImage: '作物图片',
      plantingPeriod: '计划种植日期',
      plantDate: '种植开始日期',
      earliestBegindate: '计划最早开始日期',
      lastBegindate: '计划最晚开始日期',
      totalArea: '种植面积',
      totalPlot: '种植地块数量',
      earliestHarvestdate: '最早采摘',
      lastHarvestdate: '最晚采摘',
      expectedYield: '预计产量(kg)',
      actualYield: '实际产量(kg)',
      yieldRate: '产量达标率',
      finishedPlot: '已完成种植地块数量',
      completionRate: '计划完成率(%)',
      plantStatus: '种植计划状态',
      updateTime: '计划更新时间',
      createBy: '计划编制人',
      createByName: '计划编制人',
      action: '操作'
    },
    placeholder: {
      planSeason: '请选择种植季节',
      planYear: '请选择计划年份',
      plantDate: '例：4 月上旬（可选填）',
      team: '请选择班组',
      planDateFilter: '请选择计划日期范围',
      crop: '请选择农作物',
      cropNameInput: '请输入农作物名称',
      updateTime: '请选择计划更新时间',
      createBy: '请选择计划编制人',
      createByInput: '请输入计划编制人姓名',
      planMonth: '请选择计划月份'
    },
    unit: { mu: '亩', month: '月' },
    kpi: {
      idlePlot: '当前空地块数',
      plantedPlot: '当年已完成种植地块数',
      plannedPlot: '当年计划种植地块数',
      plotUsageFreq: '当年计划地块使用频次',
      cropVarietyCount: '当年计划种植作物品种数'
    },
    query: {
      planDate: '计划日期',
      planDatePlaceholder: '请输入计划日期',
      cropId: '种植农作物',
      cropIdPlaceholder: '请选择农作物',
      updateTime: '计划更新时间',
      updateTimePlaceholder: '请选择计划更新时间',
      createBy: '计划编制人',
      createByPlaceholder: '请选择计划编制人'
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
      },
      rotationCount: '{n}次轮作计划',
      viewPlotPlans: '查看',
      plotPlan: {
        title: '{plot}（{year}年）计划明细',
        plantTime: '计划种植时间',
        crop: '计划种植作物',
        earliestHarvestdate: '最早采摘日期',
        lastHarvestdate: '最晚采摘日期',
        plantStatus: '种植状态',
        harvestStatus: '采摘状态'
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
      title: '采摘计划甘特图',
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
      harvestStatus: '采摘状态',
      cropName: '作物名称'
    },
    placeholder: {
      planSeason: '请选择季节',
      harvestStatus: '请选择采摘状态',
      team: '采摘班组',
      cropName: '请选择农作物',
      cropNameInput: '请输入作物名称'
    },
    column: {
      planNo: '计划号',
      planYear: '年份',
      planSeason: '季节',
      crop: '作物',
      cropImage: '作物图片',
      cropName: '作物名称',
      plotCount: '地块数',
      planEarliest: '最早采摘日期',
      planLatest: '最晚采摘日期',
      totalAcreage: '当前种植亩数',
      demandQty: '预计需求量',
      actualYield: '当年已采摘量',
      plotTotalCount: '当年种植地块总数',
      disasterLoss: '预计灾害损失量',
      actualBegin: '实际开始',
      actualEnd: '实际结束',
      expectedYield: '预计净产量',
      activityPlotCount: '采摘活动地块数',
      planPlantArea: '计划种植亩数',
      currentPlantedArea: '当前已种植亩数',
      action: '操作'
    },
    action: { adjust: '调整' },
    adjust: {
      title: '调整采摘计划',
      backToList: '返回列表',
      tip: '按地块设置计划最早采摘日期（计划最晚按作物采摘周期自动算）、是否游客采摘活动、采摘班组；实际采摘起止由小程序采收录入回写、此处只读；保存后立即生效。',
      activityYes: '游客采摘',
      activityNo: '常规',
      activityOptYes: '是',
      activityOptNo: '否',
      paramsMissing: '缺少 planId / cropId 参数',
      saveSuccess: '已更新 {count} 行明细',
      toggleSuccess: '已更新',
      col: {
        cropName: '作物名称',
        plotCode: '地块编码',
        plotName: '种植地块',
        plotArea: '地块面积',
        isPick: '是否采摘活动',
        harvestStatus: '采摘状态',
        plantDate: '种植日期',
        plantTeam: '种植班组',
        planEarliest: '最早采摘日期',
        planLatest: '最晚采摘日期',
        beginHarvestdate: '实际开始采摘日期',
        endHarvestdate: '实际结束采摘日期',
        harvestBy: '采摘班组',
        standardYield: '预计净产量(kg)',
        actualYield: '实际采收量(kg)',
        lossYield: '灾害预计损失量(kg)'
      },
      filter: {
        isPick: '是否采摘活动',
        harvestStatus: '采摘状态'
      },
      placeholder: {
        isPick: '请选择是否采摘活动',
        harvestStatus: '请选择采摘状态'
      },
      action: {
        setSchedule: '设置采摘计划',
        setActivity: '设为采摘活动',
        unsetActivity: '取消采摘活动'
      },
      dialog: {
        title: '设置计划',
        beginDate: '开始采摘日期',
        endDate: '结束采摘日期',
        beginRequired: '请选择开始采摘日期',
        dateOrder: '结束采摘日期不得早于开始采摘日期'
      }
    }
  },
  pickActivity: {
    pageTitle: '采摘活动',
    field: {
      activityDate: '活动日期',
      cropName: '作物名称'
    },
    placeholder: {
      activityDate: '请选择活动日期',
      crop: '请选择作物',
      cropName: '请输入作物名称'
    },
    column: {
      activityDate: '活动日期',
      cropName: '作物名称',
      plotCount: '活动地块数',
      todayPickWeight: '今日采摘重量',
      saleWeight: '销售重量',
      vegFreshWeight: '毛菜处理间量',
      platformWeight: '果蔬月台量',
      lossWeight: '损耗量',
      feedWeight: '饲料饲喂量',
      expectedYield: '预计总产量',
      cumulativePickWeight: '累计已采重量'
    }
  },
  // 东角山业务模块占位
  matPick: {
    tab: {
      'package': '包材',
      whiteBar: '白条',
      pork: '猪肉',
      vegetable: '果蔬',
      egg: '鸡蛋',
      dryGood: '干货',
      other: '其他'
    },
    column: {
      productCode: '产品编码',
      locationName: '存储库位',
      productName: '产品名称',
      currentStock: '当前库存',
      productUnit: '单位',
      earNo: '耳号',
      whiteBarNo: '白条号',
      plotCode: '地块编号',
      todayPicked: '今日出库',
      todayReturned: '今日退回',
      todayLoss: '今日损耗',
      todayFeed: '今日饲喂'
    },
    action: {
      pick: '领用出库',
      'return': '退回入库',
      loss: '当日损耗',
      feed: '饲料饲喂'
    },
    field: {
      keyword: '关键字',
      productName: '产品名称',
      locationName: '存储库位',
      currentStock: '当前库存',
      quantity: '数量',
      pickQuantity: '领用量',
      remark: '备注',
      basket: '源篮子'
    },
    placeholder: {
      keyword: '产品名称/库位/耳号/地块编号',
      remark: '请输入备注',
      basket: '请选择领用的耳号/白条源篮子'
    },
    basketOption: '{code}（余 {stock} {unit}）',
    button: {
      cancel: '取消',
      confirm: '确定'
    },
    rule: {
      quantityRequired: '请输入数量',
      basketRequired: '请选择源篮子'
    },
    message: {
      success: '操作成功',
      stockInsufficient: '库存不足，数量不能超过当前库存',
      noFinishedProduct: '该原材料没有对应的生产产品，无法领用，请先创建对应的生产产品',
      noPickedRemaining: '对应地块/耳号今日无领用剩余量，无法录入损耗',
      lossExceedRemaining: '损耗数量不能超过今日领用剩余（{remaining}）'
    }
  },
  stockOverview: {
    action: {
      detail: '详情'
    },
    field: {
      dateRange: '日期范围'
    },
    column: {
      statDate: '日期',
      productCount: '汇总产品数量'
    },
    detail: {
      title: '库存明细',
      productName: '产品名称',
      productNamePlaceholder: '请输入产品名称',
      location: '存储库位',
      locationPlaceholder: '请选择存储库位',
      search: '搜索',
      reset: '重置',
      export: '导出',
      image: '产品图片',
      productCode: '产品编码',
      productNameCol: '产品名称',
      productUnit: '单位',
      locationCol: '存储库位',
      beginStock: '期初库存',
      inboundQty: '入库量',
      outboundQty: '出库量',
      shippedQty: '已发货',
      lossQty: '损耗量',
      feedQty: '饲料饲喂量',
      endStock: '期末库存'
    }
  },
  warehouseStat: {
    search: '查询',
    reset: '重置',
    field: { dateRange: '统计日期', monthRange: '统计月份', start: '开始', end: '结束' },
    daily: {
      statDate: '统计日期',
      slaughterCount: '屠宰头数',
      slaughterWeight: '送宰总重',
      avgSlaughterWeight: '送宰均重',
      arriveWeight: '接收重量',
      slaughterRate: '屠宰率(%)',
      barTotalWeight: '白条总重',
      avgBarWeight: '白条均重',
      barYieldRate: '白条出品率(%)',
      cutBarCount: '分割白条数',
      precoolLoss: '预冷损耗',
      cutProductWeight: '分割产品总重',
      cutBarWeight: '分割白条总重',
      cutRate: '分割率(%)',
      cutLoss: '分割间损耗',
      vegWeighWeight: '毛菜称量总重',
      vegLoss: '毛菜损耗',
      vegLossRate: '毛菜损耗率(%)',
      sendPlatformWeight: '发往月台果蔬总重',
      receivePlatformWeight: '月台接收果蔬总重',
      transportLossRate: '路损率(%)',
      prodPickWeight: '果蔬生产领用总重',
      prodLossWeight: '果蔬生产损耗总重',
      netVegLossRate: '净菜损耗率(%)'
    },
    crop: {
      statDate: '统计日期',
      cropName: '作物',
      image: '作物图片',
      pickWeight: '采摘量',
      feedWeight: '饲喂量',
      vegHandleRate: '毛菜处理率(%)',
      receiveWeight: '接收量',
      sendPlatformWeight: '发往月台量',
      transportLossRate: '路损率(%)',
      outWeight: '出库量',
      netVegLossRate: '净菜损耗率(%)'
    },
    monthly: {
      statMonth: '统计月份',
      slaughterCount: '屠宰头数',
      slaughterRate: '屠宰率(%)',
      barYieldRate: '白条出品率(%)',
      cutYieldRate: '分割出品率(%)'
    }
  },
  lossOverview: {
    action: {
      detail: '详情'
    },
    field: {
      dateRange: '损耗日期'
    },
    column: {
      lossDate: '日期',
      productCount: '损耗产品数量'
    },
    detail: {
      title: '当日损耗明细',
      productName: '产品名称',
      productNamePlaceholder: '请输入产品名称',
      lossType: '损耗类型',
      lossTypePlaceholder: '请选择损耗类型',
      search: '查询',
      reset: '重置',
      lossDate: '记录时间',
      image: '产品图片',
      productCode: '产品编码',
      productNameCol: '产品名称',
      productUnit: '单位',
      lossTypeCol: '损耗类型',
      lossWeight: '损耗量'
    }
  },
  feedRecord: {
    action: {
      search: '查询',
      reset: '重置',
      export: '导出'
    },
    field: {
      dateRange: '日期范围',
      startDate: '开始日期',
      endDate: '结束日期',
      cropName: '作物搜索',
      cropNamePlaceholder: '请输入作物名称',
      feedType: '提供位置',
      feedTypePlaceholder: '请选择提供位置'
    },
    column: {
      feedDate: '日期',
      cropImage: '作物图片',
      cropName: '作物名称',
      feedWeight: '饲喂饲料量',
      feedType: '提供位置',
      operator: '操作人'
    }
  },
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
      preview: '预览',
      uploadTip: '支持 {types} 格式，单张不超过 {max}MB'
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
        whiteBarNo: '白条流水号',
        earNo: '猪只耳号',
        pickupTime: '白条领用时间',
        cutStartTime: '分割开始时间',
        cutDoneTime: '出库完成时间',
        pickupWeight: '领用重量 (kg)',
        dripLoss: '滴水损失 (kg)',
        acidRemoveMinutes: '排酸时长 (分钟)',
        cutStatus: '状态',
        outType: '出库类型',
        operator: '操作人',
        location: '入冻品库位',
        isHalf: '是否半扇',
        remark: '备注',
        outsourceBar: '普通白条',
        supplierName: '供应商',
        headSkinYieldRate: '头皮肉出品率',
        whiteBarYieldRate: '白条出品率',
        precoolLossWeight: '预冷损耗量 (kg)',
        precoolLossRate: '预冷损耗率',
        coldStorageMinutes: '冷库停留 (分钟)',
        cutProductTotalWeight: '分割品总重 (kg)',
        cutLossWeight: '分割损耗 (kg)',
        pickupAction: '白条领用',
        cutOutAction: '分割出库',
        cutDoneAction: '分割完成',
        selectBar: '待领用白条',
        selectBarPlaceholder: '请选择待领用白条',
        selectLocation: '请选择冻品库位',
        partItems: '分割部位',
        selectProduct: '分割成品',
        partWeight: '重量 (kg)',
        partSpec: '规格',
        addPart: '+ 添加部位',
        partItemsRequired: '请至少填写一行有效的分割成品和重量',
        proof: '凭证',
        dripLossRequired: '请填写滴水损失',
        dripLossAutoHint: '滴水损耗由系统自动计算（白条入库重量 − 出库重量），无需手动录入',
        pickupSuccess: '白条领用成功',
        cutOutSuccess: '分割出库成功',
        cutDoneSuccess: '分割完成'
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
        belongType: '产品类别',
        changeQuantity: '数量',
        productUnit: '单位',
        location: '存储库位',
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
        productName: '商品名称',
        productCode: '商品编码',
        buyClass: '商品类别',
        supplier: '供应商',
        storeLocation: '存储仓库',
        productThumb: '商品图片',
        unit: '单位',
        productSpec: '规格',
        currentStock: '当前库存',
        lastInTime: '最后入库时间',
        lastPurchaser: '采购人',
        monthInTotal: '当月累计采购量',
        inbound: '采购入库',
        inboundQuantity: '入库量'
      },
      packEntry: {
        meatTitle: '肉品打包',
        otherTitle: '产品打包',
        vegTitle: '果蔬打包',
        giftTitle: '礼盒打包',
        cutTitle: '白条分割管理',
        otherProductTab: '普通产品',
        otherGiftTab: '礼盒',
        source: '来源产品',
        sourceVeg: '来源地块/蔬菜',
        plot: '地块',
        noPlotInfo: '无地块信息',
        vegMaterialFallback: '未匹配到领用原料对应成品，已展示全部果蔬成品',
        noPlotSource: '当前无可打包的地块来源',
        sourcePlaceholder: '请选择来源过程产品',
        sourceRequired: '请选择来源过程产品',
        targetProduct: '目标产品',
        targetProductPlaceholder: '请选择目标产品',
        targetProductRequired: '请选择目标产品',
        giftBox: '礼盒',
        packBoxCount: '打包盒数',
        packBoxCountRequired: '打包盒数必填且 ≥ 1',
        box: '盒',
        productWeight: '产品重量',
        productWeightRequired: '重量必填且 > 0',
        productUnit: '计量单位',
        productUnitRequired: '请选择计量单位',
        unitPiece: '个',
        productSpec: '规格',
        productSpecPlaceholder: '如 250g/包',
        location: '入库库位',
        locationPlaceholder: '请选择存储库位',
        locationRequired: '请选择存储库位',
        store: '需求门店',
        storePlaceholder: '请选择需求门店',
        sendDest: '发送位置',
        sendDestPlatform: '发货月台',
        sendDestMail: '邮寄',
        sendDestGift: '礼盒',
        demandStores: '门店需求',
        selectProductFirst: '请先选择产品加载门店需求',
        copiesUnit: '份',
        packCopies: '打包份数',
        copiesExceed: '超出剩余可打包份数 {max} 份',
        demandCopiesExceed: '超出该门店剩余需求份数 {max} 份',
        storeRequired: '请先选择门店',
        storeDemandFulfilled: '该门店需求已全部打包',
        remainingCopiesLabel: '剩余可打包份数',
        noDemand: '该产品当前无未发货门店需求',
        confirmPrintTrace: '确认并打印追溯码',
        traceCodeTitle: '追溯码',
        print: '打印',
        noTraceCode: '已提交，但未生成追溯码（猪肉链暂无追溯码生成入口）',
        proof: '凭证图',
        remark: '备注',
        submitSuccess: '打包提交成功',
        packFailedTitle: '打包失败',
        cannotSubmit: '无法提交',
        cutHint: '选择已领用的白条分割单，录入各分割产品重量后确认入库；全部称重完成后点「白条完成分割」。',
        cutRecord: '分割单（猪只耳号）',
        cutRecordPlaceholder: '请选择待称重/称重中的分割单',
        cutRecordRequired: '请选择分割单',
        parts: '分割产品',
        cutProduct: '分割产品',
        cutProductPlaceholder: '请选择分割产品',
        cutPart: '部位',
        cutPartPlaceholder: '请选择部位',
        cutPartRequired: '请选择部位',
        addPart: '新增分割产品',
        partsRequired: '请至少录入一个分割产品重量',
        confirmCutOut: '确认入库',
        cutOutSuccess: '分割出库入库成功',
        cutOutExceed: '分割产品重量超出剩余可分割重量（剩余 {remaining}kg）',
        finishCut: '白条完成分割',
        finishCutShort: '分割完成',
        finishCutConfirm: '确认该白条已完成分割？',
        dripLoss: '滴水损失',
        dripLossRequired: '请填写滴水损失（无填 0）',
        dripLossAutoHint: '滴水损耗由系统自动计算（白条入库重量 − 出库重量），无需手动录入',
        finishCutSuccess: '白条已完成分割',
        pickupToCut: '领用进分割车间',
        pickupToShip: '发货领用',
        bar: '白条（猪只耳号）',
        barPlaceholder: '请选择待领用白条',
        barRequired: '请选择待领用白条',
        cutWorkshop: '出库位置（分割车间）',
        isHalf: '分割方式',
        whole: '整只',
        half: '半扇',
        confirmPickup: '确认出库',
        pickupSuccess: '白条已领用进分割车间',
        barCardTitle: '白条（整只）',
        whiteBarNoLabel: '白条流水号',
        inTimeLabel: '入库时间',
        agingDurationLabel: '排酸时长',
        inWeightLabel: '入库重量',
        marketingWeightLabel: '出栏重量',
        outputWeightLabel: '白条入库重量',
        whiteBarWeightShort: '白条重量',
        remainWeightLabel: '剩余重量',
        burnProductsLabel: '燎毛产出',
        noEarSource: '当前无可打包的猪肉来源耳号',
        pickupWeightExceed: '领用称重不应大于该白条入库重量（{weight}kg）',
        vegWeightExceed: '打包重量超过领用剩余重量（{remain}kg），请重新称重',
        pigAssignLabel: '猪只指定',
        noBars: '暂无待领用白条',
        agingHour: '小时',
        agingMinute: '分',
        confirmShipOut: '确认发货出库',
        shipOutSuccess: '白条/猪肉已发货出库',
        specLabel: '规格',
        demandLabel: '需求量',
        materialStockLabel: '领用剩余重量',
        packDone: '打包完成',
        noProduct: '暂无产品',
        operation: '操作',
        weightPlaceholder: '产品重量',
        sendType: '发送方式',
        earNo: '猪只耳号',
        earNoShort: '耳号',
        remainShort: '剩余',
        inLocation: '入库位置',
        noCuttable: '暂无待分割白条',
        cutProductRequired: '请选择分割产品',
        cutStatusPendingPickup: '待领用',
        cutStatusPicked: '已领用',
        cutStatusCutting: '称重中',
        cutStatusDone: '已完成',
        outLocation: '出库位置',
        outToCut: '分割车间',
        outToShip: '发货月台',
        outToWarehouse: '仓库出库',
        outDest: '出库去向',
        outDestPlaceholder: '请选择出库去向',
        outDestRequired: '请选择出库去向',
        warehouseOutSuccess: '白条/猪肉已仓库出库',
        outLocationRequired: '请选择出库位置',
        packNo: '打包序号',
        pickupPageTitle: '白条领用',
        shipSourceNotFound: '该白条暂无可发货来源（请确认已完成燎毛入库）',
        shipStore: '发货门店',
        shipStorePlaceholder: '请选择发货门店',
        shipStoreRequired: '请选择发货门店',
        vegDailyLoss: '当日损耗',
        vegLossPicked: '领用',
        vegLossPacked: '打包',
        vegLossReturned: '退回',
        vegLossFeed: '饲喂',
        vegLossValue: '损耗',
        vegLossUnit: 'kg',
        vegLossHint: '损耗 = 领用(物资领用出库) − 打包(果蔬打包入库) − 退回 − 饲喂（按自然日统计；饲喂取自物资领用模块，V1 暂无该操作恒 0）'
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
        returnDate: '退货日期',
        returnCategory: '退货归属',
        storeId: '退货门店',
        productId: '产品 ID',
        productName: '产品名称',
        returnProduct: '退货产品',
        returnProductCode: '产品码',
        productUnit: '单位',
        productMaterialName: '物料名称',
        weightDiff: '重量差异',
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
        confirmSuccess: '退货已确认',
        viewDetail: '查看详情',
        productKindCount: '退货品种数',
        returnWeightTotal: '退货重量',
        confirmWeightTotal: '确认重量',
        weightDiffTotal: '重量差异',
        detailDialogTitle: '退货明细'
      },
      check: {
        checkId: '盘点单号',
        locationName: '盘点库位',
        checkWarehouse: '盘点库位',
        checkDate: '盘点日期',
        checkStatus: '状态',
        lineCount: '明细数',
        goodsCount: '库存产品数',
        abnormalCount: '产品异常数',
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
        productCode: '产品码',
        productUnit: '单位',
        lossWeight: '损耗重量 (kg)',
        sysStock: '盘点前库存',
        checkStock: '实盘量',
        diffStock: '差异量',
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
        inMode: '入库方式',
        matType: '物资类型',
        productType: '产品类型',
        productCode: '产品编码',
        productName: '产品名称',
        blockNo: '地块编号',
        belongType: '产品类别',
        changeQuantity: '入库量',
        productUnit: '单位',
        location: '入库库位',
        earNo: '耳号',
        operator: '操作人',
        createTime: '创建时间',
        remark: '备注'
      },
      flowOut: {
        flowNo: '流水号',
        flowDate: '业务时间',
        flowType: '类型',
        outMode: '出库方式',
        matType: '物资类型',
        productType: '产品类型',
        stockOutDest: '出库去向',
        productCode: '产品编码',
        productName: '产品名称',
        blockNo: '地块编号',
        belongType: '产品类别',
        changeQuantity: '出库量',
        productUnit: '单位',
        location: '出库库位',
        earNo: '耳号',
        operator: '操作人',
        createTime: '创建时间',
        remark: '备注'
      },
      whiteBarShipment: {
        produceTime: '发货日期',
        productCode: '产品编码',
        productName: '产品名称',
        earNo: '猪只耳号',
        outMethod: '出库方式',
        outDest: '出库去向',
        storeName: '门店',
        productWeight: '出库量',
        productUnit: '单位',
        operator: '操作人'
      },
      outsourcePig: {
        title: {
          add: '新增外购生猪'
        },
        column: {
          purchaseDate: '采购日期',
          arriveTime: '到场时间',
          pigMarkNo: '生猪标号',
          pigWeight: '生猪重量',
          supplier: '供应商',
          buyer: '采购人'
        },
        field: {
          pigMarkNo: '生猪标号',
          purchaseDate: '采购日期',
          slaughterDate: '屠宰日期',
          arriveTime: '到场时间',
          pigWeight: '生猪重量',
          supplier: '供应商',
          buyer: '采购人'
        },
        placeholder: {
          pigMarkNo: '请输入生猪标号',
          purchaseDate: '请选择采购日期',
          slaughterDate: '请选择屠宰日期',
          arriveTime: '请选择到场时间',
          pigWeight: '请输入生猪重量',
          supplier: '请选择供应商',
          buyer: '请选择采购人'
        },
        rule: {
          purchaseDate: {
            required: '请选择采购日期'
          },
          slaughterDate: {
            required: '请选择屠宰日期'
          },
          pigWeight: {
            required: '请输入生猪重量'
          },
          supplier: {
            required: '请选择供应商'
          }
        },
        confirm: {
          del: '确认删除该外购生猪记录？'
        }
      },
      production: {
        title: {
          itemList: '产品明细'
        },
        column: {
          produceDate: '生产日期',
          produceNo: '生产单号',
          productName: '产品名称',
          belongType: '产品类别',
          productSpec: '规格',
          productSort: '产品序号',
          productWeight: '产品重量',
          productUnit: '产品单位',
          materialConsume: '原材料消耗量',
          materialConsumeQty: '原材料消耗量',
          materialName: '原材料',
          materialUnit: '原材料单位',
          itemCount: '件数',
          damageCount: '损坏量',
          storeDemandCount: '需求门店数',
          hasDamage: '是否存在损坏',
          isDamaged2: '是否损坏',
          storeName: '需求门店',
          deliverDest: '去向',
          packStatus: '打包状态',
          earNo: '来源耳号',
          plotName: '来源地块',
          produceTime: '生产时间',
          isDeliveryCheck: '已清点',
          isArrivalConfirm: '已到货',
          createByName: '录入人',
          remark: '备注'
        },
        dest: {
          platform: '发货月台',
          gift: '礼盒'
        },
        button: {
          traceCode: '追溯码'
        },
        text: {
          noTrace: '暂无追溯码'
        },
        damage: {
          view: '查看损坏',
          viewTitle: '损坏详情',
          evidence: '损坏凭证',
          noEvidence: '暂无损坏凭证图',
          remark: '损坏备注',
          loading: '加载中…'
        }
      }
    }
  },
  // 仓库看板
  warehouse: {
    dashboard: {
      title: '仓库总览',
      demandBar: '今日需求',
      productionBar: '今日生产',
      lastRefresh: '最近刷新 {time}',
      refresh: '刷新',
      // DJS-FIX-WMS-RALN 看板对齐原型补键（今日需求/今日生产 8 项 + 退货切换 + 趋势系列 + 单位）
      kpiDemandPork: '猪肉产品',
      kpiDemandOffal: '红白脏产品',
      kpiDemandEgg: '鸡蛋需求量',
      kpiDemandDryGood: '干货需求量',
      kpiDemandVegetableKinds: '果蔬需求品类',
      kpiSlaughterPig: '送宰猪只',
      kpiWhiteBarWeight: '白条总重',
      kpiCutBar: '分割白条',
      kpiCutProductWeight: '分割猪只产品',
      kpiVegReceiveKinds: '果蔬接收品种',
      kpiVegReceiveWeight: '果蔬接收总重',
      kpiVegProductKinds: '果蔬产品种类',
      kpiVegProductWeight: '果蔬产品总重',
      returnTabPork: '猪肉产品',
      returnTabVeg: '果蔬产品',
      seriesWhiteBarHead: '白条头数',
      seriesPorkWeight: '猪肉产品重量',
      seriesVegWeight: '果蔬产品重量',
      seriesPorkLoss: '猪肉产品损耗率',
      seriesVegLoss: '果蔬产品损耗率',
      unitHead: '头',
      unitKg: 'kg',
      unitKind: '种',
      unitPiece: '个',
      unitBox: '盒',
      // 横条 1：今日需求 6 项
      kpiDemandWhiteBar: '白条需求量',
      kpiDemandVegetable: '蔬菜需求量',
      kpiDemandGiftBox: '礼盒需求量',
      kpiDemandOther: '其他需求量',
      kpiDemandOrders: '需求单数',
      kpiDemandTotal: '需求总量',
      // 横条 2：今日生产 5 项
      kpiProductionCount: '生产笔数',
      kpiProductionWeight: '生产重量(kg)',
      kpiInbound: '入库笔数',
      kpiOutbound: '出库笔数',
      kpiLoss: '损耗量(kg)',
      // 6 图标题
      chartDemandPie: '需求业态占比',
      chartReturnRing: '退货构成',
      chartProductionTrend: '生产趋势（近 7 日，kg）',
      chartCheckPie: '盘点结果分布',
      chartLocationRing: '库位健康度（当月）',
      chartLossTrend: '损耗趋势（近 7 日，kg）',
      seriesProduction: '生产重量',
      seriesLoss: '损耗量',
      noData: '暂无数据',
      // 库位概览
      locationOverview: '各库位概况（Top 20）',
      colLocation: '存储库位',
      colType: '类型',
      colStock: '当前库存',
      colStatus: '状态',
      statusNormal: '正常',
      statusAbnormal: '异常',
      emptyLocation: '暂无库位数据'
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
      searchProductName: '需求产品',
      productType: '需求产品类型',
      storeName: '需求门店',
      productSpec: '规格',
      demandQuantity: '需求量',
      'demandQuantity.required': '需求量不能为空',
      productUnit: '单位',
      'productUnit.required': '单位不能为空',
      rawMaterial: '原材料描述',
      materialQty: '原材料计算量',
      demandRemark: '需求备注',
      demandExplain: '需求说明',
      demandStatus: '需求状态',
      expectedArriveDate: '期望到货日',
      beginDate: '开始日期',
      endDate: '结束日期',
      demandDateRange: '需求日期',
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
      productType: '需求产品类型',
      storeId: '门店',
      productName: '产品',
      giftSku: '礼盒 SKU',
      productSpec: '规格',
      demandQuantity: '需求量',
      productUnit: '单位',
      rawMaterial: '原材料',
      demandStatus: '需求状态',
      shippedCount: '已发货',
      storeCount: '需求门店数量',
      materialQty: '原材料计算量',
      materialUnit: '原材料单位',
      confirmRate: '需求确认率',
      lastConfirmTime: '需求最终确认时间',
      expectedArriveDate: '期望到货',
      createByName: '创建人',
      createTime: '创建时间',
      actions: '操作'
    },
    groupStatus: {
      PENDING: '待确认',
      ALL_CONFIRMED: '已全部确认',
      PARTIAL: '部分确认'
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
      history: '状态历史',
      detail: '详情',
      viewDemand: '查看需求',
      selectAllPage: '全选本页',
      batchConfirm: '批量确认需求'
    },
    detail: {
      title: '产品需求详情',
      storeCount: '共 {count} 家门店',
      storeName: '门店',
      demandQuantity: '需求量',
      demandCount: '需求单数',
      empty: '暂无门店需求'
    },
    confirm: {
      del: '确认删除选中的 {count} 条需求？仅 DRAFT/CANCELLED 态可删',
      submit: '确认提交需求 {no} 到仓库审核？',
      confirm: '确认锁定需求 {no}？',
      startProduction: '确认开始排产需求 {no}？开始后不可取消',
      batchConfirm: '确认锁定选中的 {count} 条需求？将确认这些分组下所有待确认门店需求单'
    },
    message: {
      batchConfirmSuccess: '已批量确认需求 {count} 条',
      batchConfirmPartial: '批量确认完成：成功 {success} 条，失败 {failed} 条'
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
    },
    cart: {
      title: '新增{type}需求',
      titleGeneric: '新增需求',
      candidateTitle: '产品选择',
      cartTitle: '需求产品',
      searchPlaceholder: '搜索产品名称 / 编码',
      emptyProducts: '该业态暂无可选产品',
      emptyCart: '右侧购物车为空，请从左侧选择产品加入',
      qtyToAdd: '需求量',
      opAdd: '操作',
      add: '加入',
      remove: '移除',
      itemCount: '共 {count} 项',
      qtyRequired: '请先填写需求量再加入',
      submit: '提交需求（{count} 项）',
      submitAllSuccess: '已提交 {count} 条需求',
      submitPartial: '成功 {ok} 条，失败 {fail} 条：{names}，请重新提交失败项',
      submitAllFailed: '提交失败：{names}'
    },
    // 需求确认页（0613-11，从需求管理列表「查看需求」下钻）
    confirmPage: {
      title: '需求确认',
      yes: '是',
      no: '否',
      empty: '暂无需求订单',
      confirmDelete: '确认删除该需求订单？删除后置「已删除」终态',
      filter: {
        productName: '需求产品名称',
        productNamePh: '请输入需求产品名称',
        storeId: '需求门店',
        storePh: '请选择需求门店',
        demandStatus: '需求状态',
        statusPh: '请选择需求状态'
      },
      // 状态筛选下拉门店视角 4 态裁剪（value 映射原始仓库码，详见 confirm/index.vue 注释）
      storeStatus: {
        SUBMITTED: '待确认',
        CONFIRMED: '已确认',
        SHIPPED: '已发货',
        ARRIVED: '确认到店'
      },
      pigTip: {
        prefix: '当前可出栏猪只',
        suffix: '头'
      },
      column: {
        productName: '产品名称',
        productSpec: '产品规格',
        demandDate: '需求日期',
        demandQuantity: '总需求量',
        productUnit: '单位',
        storeName: '需求门店',
        demandRemark: '需求备注',
        demandStatus: '需求状态',
        confirmerTime: '需求最终确认时间',
        demandConfirmer: '需求确认人',
        pigAssigned: '是否指定猪只',
        actions: '操作'
      },
      action: {
        adjust: '调整'
      },
      adjust: {
        title: '调整',
        demandQuantity: '需求量'
      }
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
    tab: {
      white_bar: '白条产品',
      pork: '猪肉产品',
      vegetable: '果蔬产品',
      dry_good: '干货产品',
      egg: '鸡蛋产品',
      gift_box: '礼盒产品',
      other: '其他产品'
    },
    create: {
      productType: '产品类型',
      operation: '操作',
      cartTitle: '需求产品',
      cartEmpty: '请在左侧选择产品并填写需求量',
      emptyProducts: '该类型下暂无产品',
      productName: '产品名称',
      productImage: '产品图片',
      availablePigs: '可出栏猪只头数',
      unit: '单位',
      demandQuantity: '需求量',
      mailing: '个人邮寄',
      remark: '备注：',
      remarkPh: '请输入备注信息',
      confirm: '确认下单',
      spec: '规格',
      materialStock: '原材料库存',
      remainPlot: '剩余地块',
      expectYield: '预计产量',
      earliestPick: '最早可采摘日期',
      latestPick: '最晚可采摘日期',
      demandStore: '需求门店',
      demandStorePh: '请选择门店',
      productNamePh: '请输入产品名称',
      search: '查询'
    },
    cart: {
      title: '新增需求'
    },
    filter: {
      store: '门店',
      storePlaceholder: '请选择门店'
    },
    tip: {
      selectStoreFirst: '请先在顶部选择门店再新增需求',
      mailingListPending: '个人邮寄子地址清单接口暂未提供'
    },
    field: {
      demandNo: '需求单号',
      demandDate: '需求日期',
      'demandDate.required': '需求日期不能为空',
      productDemandDate: '产品需求日期',
      storeId: '提单门店',
      'storeId.required': '提单门店不能为空',
      productId: '产品',
      'productId.required': '产品不能为空',
      productName: '产品名称',
      'productName.required': '产品名称不能为空',
      productType: '需求产品类型',
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
      productName: '产品名称',
      productSpec: '产品规格',
      demandQuantity: '需求量',
      productUnit: '单位',
      demandType: '需求类型',
      demandRemark: '备注',
      expectedWeight: '预计到店重量',
      demandStatus: '需求状态',
      damagedCount: '损坏数量',
      confirmerTime: '需求确认时间',
      demandConfirmer: '需求确认人',
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
      receive: '确认收货',
      detail: '详情',
      del: '删除',
      viewList: '查看列表',
      productDetail: '产品明细',
      selectAllPage: '全选本页',
      batchReceive: '批量确认到店'
    },
    damage: {
      detailTitle: '产品明细',
      markTitle: '记为损坏',
      editTitle: '修改损坏凭证',
      markAction: '记为损坏',
      editAction: '修改',
      produceNo: '生产单号',
      materialName: '原材料名称',
      materialConsume: '原材料量',
      materialUnit: '原材料单位',
      isDamaged: '是否损坏',
      earNo: '来源耳号',
      plotName: '来源地块',
      evidence: '损坏凭证',
      evidenceRequired: '请至少上传一张损坏凭证',
      remark: '损坏备注',
      remarkPh: '请输入损坏备注（选填）'
    },
    confirm: {
      del: '确认删除选中的 {count} 条需求？仅未确认需求可删',
      receive: '确认已收到「{name}」的货物？',
      batchReceive: '确认将选中的 {count} 条已发货需求确认到店？'
    },
    message: {
      batchReceiveSuccess: '已批量确认到店 {count} 条',
      batchReceivePartial: '批量确认完成：成功 {success} 条，失败 {failed} 条'
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
  storeTrace: {
    tab: {
      veg: '果蔬追溯',
      pork: '猪肉追溯'
    },
    // 追溯码打印弹框（录重量 + 结构化标签卡 + 二维码）
    label: {
      dialogTitle: '追溯码打印',
      preview: '预览',
      weight: '产品重量(kg)',
      weightPlaceholder: '请输入产品重量(kg)',
      confirmPrint: '确认并打印',
      cancel: '取消',
      productCode: '产品编码',
      serialNo: '生产编码',
      packCode: '打包编码',
      produceDate: '生产日期',
      productName: '产品名称',
      productWeight: '产品重量',
      plotNo: '地块编号',
      earNo: '猪只耳号',
      storeName: '销售门店',
      weightUnit: 'kg',
      weightUnitGram: 'g',
      noCode: '该行无追溯码可打印',
      scanHint: '扫码查看溯源',
      traceCaption: '东角山有机追溯码',
      sizeHint: '实际打印尺寸 3cm × 3cm',
      printFailed: '生成打印文件失败，请重试'
    },
    veg: {
      arrivalDate: '到店日期',
      produceNo: '生产编号',
      serialNo: '序号',
      productName: '产品名称',
      productSpec: '产品规格',
      actualWeight: '实际重量',
      plotName: '来源地块',
      pickTime: '采摘时间',
      platformReceiveTime: '月台接收时间',
      shipTime: '发货时间',
      print: '追溯码打印',
      noCode: '该行无追溯码可打印'
    },
    pork: {
      pickPig: '追溯猪只',
      noPig: '暂无当天确认收货白条',
      remainOf: '剩余{remain}/到货{arrived}kg',
      exhaustedTag: '已用完',
      exhausted: '该白条剩余可打包重量已用完，不能再选',
      overWeight: '本次打包重量超过白条剩余可打包重量（剩余{remain}kg）',
      pickCut: '选择追溯部位',
      opPanel: '操作',
      pigId: '猪只ID',
      pigSex: '猪只性别',
      pigBreed: '猪只品种',
      ageDays: '猪只日龄',
      daysUnit: '日龄',
      weight: '产品重量',
      weightPlaceholder: '请输入产品重量(g)',
      genPrint: '追溯码打印',
      genOk: '生码成功：{code}',
      tracePig: '追溯猪只',
      traceProduct: '追溯产品',
      productName: '产品名称',
      codeListTitle: '已生成追溯码',
      codeNo: '追溯码',
      pigEarNo: '猪只耳号',
      codeProductName: '产品名称',
      remark: '备注',
      creatorName: '生成人',
      createTime: '生成时间',
      codeDate: '生成日期',
      sourceCol: '生成来源',
      sourceWarehouse: '仓库',
      sourceStore: '门店',
      reprint: '补打',
      noCode: '该行无追溯码可补打'
    }
  },
  storeReturn: {
    export: {
      failed: '导出失败，请稍后重试'
    },
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
      remark: '备注',
      receivedQty: '仓库实收量',
      receivedWeight: '仓库实收重量(kg)'
    },
    column: {
      returnNo: '退回单号',
      returnDirection: '退回方向',
      storeName: '退回门店',
      productType: '退货产品类型',
      productCode: '产品代码',
      productName: '产品名称',
      productSpec: '规格',
      locationName: '入库库位',
      returnQuantity: '退回量',
      unit: '单位',
      goodsWeight: '货物重量',
      receivedQty: '仓库实收量',
      receivedWeight: '仓库实收重量',
      returnStatus: '退货状态',
      returnReason: '退回原因',
      traceCode: '追溯码',
      memberId: '会员ID',
      returnDate: '退回日期',
      operatorName: '经手人',
      createTime: '创建时间'
    },
    tab: {
      pork: '猪肉产品',
      vegetable: '果蔬产品'
    },
    subCategory: {
      pork: '猪肉产品',
      white_bar: '白条产品'
    },
    mainTab: {
      operation: '退回操作',
      record: '退回记录'
    },
    action: {
      confirm: '确认入库'
    },
    operation: {
      title: '退回操作',
      returnWeight: '退回产品重量(KG)',
      weightPlaceholder: '请输入退回重量(KG)',
      emptyCandidates: '请先选择门店；猪肉为固定清单，果蔬为该门店当天已确认到店的需求产品',
      submit: '确认提交',
      submitConfirm: '确认提交 {n} 条退回？',
      quantityPlaceholder: '请输入退回量',
      vegBothRequired: '果蔬「{name}」需同时填写退回量和退回产品重量'
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
      returnQuantityMin: '退回数量必须大于 0',
      receivedQty: '请输入仓库实收量',
      receivedQtyMin: '仓库实收量必须大于 0'
    },
    tip: {
      editLock: '产品 / 入库库位 / 退回数量为入库驱动字段，建后不可修改',
      pendingOnly: '只能对待确认（pending）状态的退回记录确认入库'
    },
    dialog: {
      add: '新增退回',
      edit: '编辑退回',
      confirm: '仓库确认实收'
    },
    confirm: {
      delete: '确认删除退回单 {no}？'
    }
  },
  // 门店经营流水盘点（STORE-LEDGER-001，原型 门店管理>门店盘点 重建）
  storeLedger: {
    field: {
      store: '门店',
      dateFrom: '盘点日期起',
      dateTo: '盘点日期止'
    },
    column: {
      index: '序号',
      storeName: '门店',
      ledgerDate: '盘点日期',
      lineCount: '产品数',
      operatorName: '盘点人',
      checkTime: '盘点时间',
      productName: '产品名称',
      unit: '单位',
      openingQty: '期初库存',
      inboundQty: '当日入库',
      saleQty: '销售量',
      giftQty: '赠送量',
      returnQty: '退货量',
      returnedQty: '退回量',
      whReturnQty: '退回量',
      lossQty: '损耗量',
      closingQty: '期末库存',
      category: '类别'
    },
    category: {
      pork: '猪肉',
      white_bar: '白条产品',
      inbound: '新到货',
      stock: '昨日库存'
    },
    belongTab: {
      pork: '猪肉产品',
      veg: '果蔬产品',
      other: '其他产品'
    },
    action: {
      newEntry: '新增当日盘点',
      detail: '查看详情',
      edit: '修改',
      todayExists: '今日已有盘点记录，如需更正请点击列表中的「修改」'
    },
    detail: {
      title: '{store} {date} 盘点明细',
      titleByDate: '当日盘点明细 - {date}'
    },
    entry: {
      title: '新增当日盘点',
      editTitle: '修改盘点 - {date}',
      storePlaceholder: '请选择门店',
      datePlaceholder: '请选择盘点日期',
      emptyCandidates: '该门店当日暂无可盘产品（仅显示昨日盘点尚有库存的产品，以及已确认收货的需求产品）',
      submit: '盘点完成',
      submitConfirm: '确认提交 {n} 个产品的盘点数据？',
      editConfirm: '确认更正 {n} 个产品的盘点数据？'
    }
  },
  // 门店产品管理（STORE-LEDGER-001，门店域入口）
  storeProduct: {
    field: {
      productName: '产品名称',
      productType: '产品类型',
      productStatus: '产品状态'
    },
    column: {
      image: '产品图片',
      productType: '产品类型',
      productName: '产品名称',
      supplier: '供应商',
      productSpec: '规格',
      unit: '单位',
      productStatus: '产品状态',
      updateTime: '更新时间',
      updateBy: '更新人'
    },
    detail: {
      title: '产品详情',
      productCode: '产品编码',
      history: '盘点历史',
      noHistory: '暂无盘点历史'
    }
  },
  // 种植灾害记录（PLT-WORK-003，admin 只读独立子页）
  plantDisaster: {
    column: {
      recordNo: '灾害记录号',
      farmDate: '发生日期',
      disasterType: '灾害类型',
      plotName: '地块名称',
      plotCode: '地块编号',
      plotZone: '地块片区',
      cropName: '作物',
      lossRate: '损失率',
      lossYield: '预计损失产量',
      isWarning: '预警',
      teamName: '处理班组',
      createTime: '登记时间'
    },
    field: {
      recordNo: '灾害记录号',
      dateRange: '发生日期',
      plot: '地块名称',
      plotCode: '地块编号',
      plotZone: '地块片区',
      disasterType: '灾害类型',
      isWarning: '是否预警',
      crop: '作物',
      team: '记录班组'
    },
    placeholder: {
      crop: '请输入作物信息',
      team: '请选择记录班组'
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
      plotName: '地块名称',
      plotCode: '地块编号',
      plotZone: '地块片区',
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
      farmType: '农事类型',
      crop: '作物',
      plot: '地块名称',
      plotCode: '地块编号',
      plotZone: '地块片区',
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
    pageTitle: '绩效管理',
    toolbar: {
      statMonth: '结算月份',
      pickMonth: '请选择月份',
      generate: '生成结算',
      hint: '按采摘量 × 作物单价快照生成，重复生成会覆盖该月数据'
    },
    field: {
      statMonth: '月份',
      team: '班组'
    },
    column: {
      statMonth: '绩效月份',
      team: '班组名称',
      teamMemberCount: '班组人数',
      farmCount: '农事处理总数',
      pickWeight: '采摘总产量',
      amount: '采摘绩效总额',
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
    emptyHint: '还没有绩效数据。请在上方选择结算月份点「生成结算」，系统按当月各班组采摘量 × 作物单价快照自动计算后即会显示。',
    detail: {
      title: '绩效详情',
      tabYield: '产量绩效',
      tabFarm: '农事记录',
      rule: '绩效规则',
      cropName: '作物',
      cropPickWeight: '采摘量',
      cropUnitPrice: '单价',
      cropAmount: '绩效额',
      totalAmount: '合计',
      recordNo: '记录号',
      farmType: '农事类型',
      plot: '地块',
      farmDate: '农事日期',
      farmCount: '共 {count} 条农事记录'
    }
  },
  storeDashboard: {
    title: {
      home: '门店总览',
      saleOrderGroup: '销售订单',
      memberGroup: '会员信息',
      monthProductStructure: '当月订单产品结构',
      monthTop10ByOrder: '当月热门产品排行 TOP10（按订单数）',
      memberOrderTrend: '近十日订单数与新会员趋势',
      saleAvgPriceTrend: '销售额与客单价趋势'
    },
    kpi: {
      todaySale: '今日销售额',
      monthSale: '本月累计销售额',
      todayOrder: '今日订单数',
      monthOrder: '本月累计订单数',
      totalMembers: '会员总数',
      todayNewMembers: '今日新增会员数',
      repeatCustomer: '老客复购数',
      monthAvgPrice: '本月客单价',
      amountUnit: '元',
      orderUnit: '单',
      memberUnit: '人'
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
      saleQty: '销售量',
      returnQty: '退货量',
      newMembers: '新增会员',
      avgPrice: '客单价'
    },
    axis: {
      saleAmount: '销售额（元）',
      avgPrice: '客单价（元）',
      orderCount: '订单数（单）',
      newMembers: '新增会员（人）'
    },
    chart: {
      noData: '暂无数据'
    },
    action: {
      refresh: '刷新'
    },
    empty: {
      top10: '当月暂无销售记录',
      trend: '近期暂无销售记录'
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
      serialNo: '序号',
      scanHint: '微信扫码查看全链路溯源'
    }
  },
  // 公开追溯 H5 落地页（C 端顾客扫码访问，TRACE-H5）
  tracePublic: {
    state: {
      loading: '加载中…',
      notFound: '未查询到该追溯码',
      missingCode: '缺少追溯码',
      loadFailed: '加载失败，请稍后重试'
    },
    title: {
      pork: '猪肉追溯',
      veg: '蔬果追溯',
      grow: '生长追溯',
      cert: '有机检验证书',
      cropCert: '果蔬有机检验证书',
      plotCert: '地块有机检验证书',
      plotRecords: '作物农事记录'
    },
    product: {
      title: '产品信息',
      noImage: '暂无图',
      name: '名称',
      weight: '重量',
      spec: '规格',
      code: '编码',
      description: '产品描述',
      plotNo: '地块编号',
      variety: '品种',
      growthDays: '生长天数',
      harvestDate: '采摘日期',
      daysUnit: '天'
    },
    pig: {
      title: '猪只追溯',
      earNo: '耳号',
      sex: '性别',
      weight: '体重',
      breed: '品种',
      farm: '农场',
      barn: '栋舍',
      birth: '出生',
      ageDays: '日龄',
      market: '出栏',
      daysUnit: '天',
      photo: '猪只照片'
    },
    timeline: {
      title: '流程处理时间轴',
      empty: '暂无流程记录',
      weightUnit: 'kg'
    },
    growEntry: {
      growth: '生长记录：{n} 次',
      medication: '疫苗保健：{n} 次',
      view: '查看详情'
    },
    pedigree: {
      title: '父系 / 母系信息',
      sire: '父系',
      dam: '母系',
      earNo: '耳号',
      breed: '品种',
      ageDays: '日龄',
      parity: '胎次',
      parityValue: '第 {n} 胎',
      daysUnit: '天'
    },
    quarantine: {
      title: '检验检疫',
      certNo: '检疫证号',
      agency: '检疫机构'
    },
    store: {
      title: '销售门店',
      name: '门店名称',
      address: '门店地址'
    },
    grow: {
      tabGrowth: '生长记录',
      tabMedication: '疫苗保健记录',
      ageDays: '日龄',
      weight: '体重',
      backfat: '背膘',
      operator: '操作人',
      reason: '原因',
      daysUnit: '天',
      weightUnit: 'kg',
      backfatUnit: 'mm',
      emptyGrowth: '暂无生长记录',
      emptyMedication: '暂无疫苗保健记录'
    },
    plot: {
      title: '地块信息',
      plotName: '地块',
      zoneName: '片区',
      area: '面积',
      areaUnit: '亩'
    },
    entry: {
      farmRecords: '作物农事记录',
      cropCert: '果蔬有机检验证书',
      plotCert: '地块有机检验证书',
      plotRecords: '地块种植记录'
    },
    cert: {
      issuer: '颁发机构',
      certNo: '证书编号',
      validity: '有效期',
      validTo: '至',
      empty: '暂无有机认证证书'
    },
    plotRecords: {
      title: '作物农事记录',
      empty: '暂无农事记录'
    },
    content: {
      marketing: '营销出栏',
      singe: '屠宰完成',
      whiteBarIn: '白条入库',
      whiteBarPick: '白条出库(领用)',
      slaughter: '屠宰',
      acid: '排酸',
      inStock: '入库',
      ship: '发货',
      arrival: '到店',
      sowing: '播种',
      harvest: '采摘',
      vegHandle: '毛菜处理',
      pack: '打包'
    },
    medType: {
      health: '保健',
      treatment: '治疗',
      vaccine: '疫苗'
    },
    workType: {
      tillageBreak: '翻耕',
      tillagePrepare: '整地',
      fertilize: '施肥',
      transplant: '移栽',
      waterFertilize: '水肥',
      irrigation: '浇灌',
      weed: '除草',
      pestControl: '病虫防治',
      pruning: '整枝绑蔓',
      rotation: '退茬',
      disaster: '灾害损失',
      harvestActivity: '采摘活动'
    },
    pigSex: {
      female: '母',
      male: '公'
    },
    pigBreed: {
      black: '黑猪'
    }
  }
};
