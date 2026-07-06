export default {
  // 路由国际化
  route: {
    dashboard: 'Dashboard',
    document: 'Document'
  },
  // 定时任务重跑（DENGBO row7）
  jobRerun: {
    panel: {
      title: 'Manual rerun',
      tip: 'Failed jobs can be rerun; pick a date range to recompute day by day (dateless jobs run once without a range).'
    },
    field: {
      jobName: 'Job',
      dateRange: 'Date range',
      status: 'Status',
      triggerType: 'Trigger'
    },
    placeholder: {
      jobName: 'Select a job',
      begin: 'Start date',
      end: 'End date',
      status: 'Select status',
      triggerType: 'Select trigger'
    },
    action: {
      rerun: 'Rerun',
      search: 'Search',
      reset: 'Reset'
    },
    column: {
      jobName: 'Job',
      targetDate: 'Target date',
      status: 'Status',
      costMs: 'Cost',
      triggerType: 'Trigger',
      runTime: 'Run time',
      errorMsg: 'Error'
    },
    jobName: {
      'breed-aggregate': 'Breeding stats aggregate',
      'warehouse-stat': 'Warehouse stats aggregate',
      'organic-warning': 'Organic cert expiry warning'
    },
    status: {
      running: 'Running',
      success: 'Success',
      fail: 'Failed'
    },
    trigger: {
      schedule: 'Scheduled',
      manual: 'Manual'
    },
    rule: {
      jobName: 'Please select a job to rerun'
    },
    confirm: {
      rerun: 'Rerun job "{job}"?'
    },
    message: {
      rerunSuccess: 'Rerun triggered'
    }
  },
  // 功能选择页（首页）国际化
  home: {
    title: 'Dongjiaoshan Organic Farm System',
    subtitle: 'Select a module to enter',
    board: {
      breed: 'Breeding',
      plant: 'Planting',
      warehouse: 'Warehouse',
      store: 'Store',
      system: 'System',
      empty: 'No module assigned to this account. Please contact the administrator.'
    }
  },
  // 登录页面国际化
  login: {
    selectPlaceholder: 'Please select/enter a company name',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    logging: 'Logging...',
    code: 'Verification Code',
    rememberPassword: 'Remember me',
    switchRegisterPage: 'Sign up now',
    rule: {
      tenantId: {
        required: 'Please enter your tenant id'
      },
      username: {
        required: 'Please enter your account'
      },
      password: {
        required: 'Please enter your password'
      },
      code: {
        required: 'Please enter a verification code'
      }
    },
    copyright: '© 2026 Dongjiaoshan Organic Farm. All Rights Reserved.'
  },
  // 注册页面国际化
  register: {
    selectPlaceholder: 'Please select/enter a company name',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    register: 'Register',
    registering: 'Registering...',
    registerSuccess: 'Congratulations, your {username} account has been registered!',
    code: 'Verification Code',
    switchLoginPage: 'Log in with an existing account',
    rule: {
      tenantId: {
        required: 'Please enter your tenant id'
      },
      username: {
        required: 'Please enter your account',
        length: 'The length of the user account must be between {min} and {max}'
      },
      password: {
        required: 'Please enter your password',
        length: 'The user password must be between {min} and {max} in length',
        pattern: "Can't contain illegal characters: {strings}"
      },
      code: {
        required: 'Please enter a verification code'
      },
      confirmPassword: {
        required: 'Please enter your password again',
        equalToPassword: 'The password entered twice is inconsistent'
      }
    }
  },
  // 导航栏国际化
  navbar: {
    full: 'Full Screen',
    language: 'Language',
    dashboard: 'Dashboard',
    document: 'Document',
    message: 'Message',
    layoutSize: 'Layout Size',
    selectTenant: 'Select Tenant',
    selectStore: 'Select Store',
    layoutSetting: 'Layout Setting',
    personalCenter: 'Personal Center',
    logout: 'Logout'
  },
  // BizTable generic list component
  biz: {
    table: {
      empty: 'No data',
      column: {
        action: 'Action'
      },
      search: {
        submit: 'Search',
        reset: 'Reset',
        inputPrefix: 'Enter ',
        selectPrefix: 'Select ',
        startDate: 'Start date',
        endDate: 'End date'
      },
      action: {
        add: 'Add',
        edit: 'Edit',
        del: 'Delete',
        batchDel: 'Batch delete',
        export: 'Export',
        view: 'View'
      }
    }
  },
  // Common text
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    detail: 'Detail',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    del: 'Delete',
    operate: 'Operate',
    back: 'Back',
    createTime: 'Created at',
    updateByName: 'Updated by',
    opSuccess: 'Operation succeeded',
    search: 'Search',
    reset: 'Reset',
    refresh: 'Refresh',
    add: 'Add',
    save: 'Save',
    empty: 'No data',
    tip: 'Tip',
    deleteSuccess: 'Deleted',
    disable: 'Disable',
    enable: 'Enable',
    disabled: 'Disabled',
    to: 'to',
    prev: 'Prev',
    next: 'Next',
    yes: 'Yes',
    no: 'No'
  },
  // Supplier master data (SYS-MD-003 + SYS-MD-FIX-002)
  supplier: {
    title: {
      add: 'Add supplier',
      edit: 'Edit supplier',
      view: 'Supplier details',
      deals: 'Deal records'
    },
    column: {
      supplierCode: 'Supplier code',
      supplierName: 'Supplier name',
      supplierType: 'Supply type',
      liaisonName: 'Liaison',
      liaisonPhone: 'Phone',
      address: 'Address',
      businessStatus: 'Cooperation',
      settleType: 'Settle type',
      dealCount: 'Deals',
      purchaseQty: 'Purchased amount',
      remark: 'Remark',
      createTime: 'Created at'
    },
    field: {
      supplierCode: 'Supplier code',
      supplierName: 'Supplier name',
      licenseNo: 'License No.',
      licenseImage: 'License image',
      businessLicenseNo: 'Business permit No.',
      cooperationStartDate: 'Cooperation start',
      supplierType: 'Supply type',
      liaisonName: 'Liaison',
      liaisonPhone: 'Phone',
      address: 'Address',
      businessStatus: 'Cooperation',
      settleType: 'Settle type',
      bankName: 'Bank name',
      bankAccount: 'Bank account',
      remark: 'Remark',
      updateTimeRange: 'Updated at',
      updateBy: 'Updated by'
    },
    group: {
      basic: 'Basic info',
      contact: 'Contact',
      qualification: 'Qualification',
      finance: 'Finance',
      remark: 'Other'
    },
    placeholder: {
      supplierName: 'Enter supplier name',
      licenseNo: 'Enter license number',
      businessLicenseNo: 'Enter business permit number',
      cooperationStartDate: 'Select cooperation start date',
      supplierType: 'Select supply type',
      liaisonName: 'Enter liaison name',
      liaisonPhone: 'Enter phone',
      address: 'Enter address',
      businessStatus: 'Select cooperation status',
      settleType: 'Select settle type',
      bankName: 'Enter bank name',
      bankAccount: 'Enter bank account'
    },
    rule: {
      supplierName: { required: 'Supplier name is required' },
      supplierType: { required: 'Please select supplier type' },
      businessStatus: { required: 'Please select cooperation status' },
      liaisonPhone: { pattern: 'Please enter a valid phone' }
    },
    confirm: {
      del: 'Delete the selected {count} supplier record(s)?'
    },
    empty: {
      deals: 'No deal records yet'
    },
    must_be_breed_type: 'Introduction only accepts breed-type suppliers',
    deal: {
      dealDate: 'Deal Date',
      dealProduct: 'Product',
      dealQuantity: 'Quantity',
      dealUnit: 'Unit',
      empty: 'No deal records'
    }
  },
  // Shared image library (IMG-LIB-001)
  image: {
    title: {
      add: 'Add Image',
      edit: 'Edit Image'
    },
    column: {
      preview: 'Preview',
      imageName: 'Name',
      aliases: 'Aliases',
      sortOrder: 'Sort',
      status: 'Status',
      remark: 'Remark',
      updateTime: 'Update Time'
    },
    field: {
      imageName: 'Name',
      aliases: 'Aliases',
      image: 'Image',
      sortOrder: 'Sort',
      status: 'Status',
      remark: 'Remark'
    },
    placeholder: {
      imageName: 'Match crop/product name, e.g. Tomato',
      aliases: 'Comma-separated aliases, e.g. tomato,xihongshi'
    },
    rule: {
      imageName: {
        required: 'Please enter image name'
      }
    },
    action: {
      rematch: 'Re-match All',
      batchUpload: 'Batch Upload'
    },
    confirm: {
      del: 'Delete the selected {count} image(s)?',
      rematch: 'Re-match all auto-matched (not manually overridden) crops / products by name. Continue?'
    },
    rematch: {
      done: 'Re-match done ({detail})'
    },
    batch: {
      title: 'Batch Upload & Auto-archive',
      tip: 'Drop a batch of named images (e.g. Tomato.jpg). The file name (without extension) becomes the image name automatically, then crops / products are re-matched. Re-uploading the same name replaces it.',
      fileName: 'File Name',
      imageName: 'Name (auto)',
      count: '{count} to import',
      submit: 'Import & Archive',
      done: 'Imported {imported} / Updated {updated}, re-matched ({rematched})'
    },
    noImage: 'No image'
  },
  // Category default image (IMG-LIB-001)
  defaultImage: {
    title: 'Category Default Image',
    hint: 'Fallback by belong type when master data has no image; upload to OSS first then save.',
    global: 'Global',
    column: {
      category: 'Category',
      image: 'Default Image'
    }
  },
  // Store master data (SYS-MD-002 + SYS-MD-FIX-002)
  store: {
    title: {
      add: 'Add store',
      edit: 'Edit store',
      view: 'Store details',
      setManager: 'Set manager',
      bindUser: 'Store staff'
    },
    bindUser: {
      title: 'Store staff',
      candidateTitle: 'System users',
      boundTitle: 'Bound staff',
      searchPlaceholder: 'Search name / account',
      colNickName: 'Name',
      colUserName: 'Account',
      colPhone: 'Phone',
      addSelected: 'Add',
      remove: 'Remove',
      boundHint: 'Click Confirm to save bindings (full overwrite of this store)'
    },
    column: {
      storeCode: 'Store code',
      storeName: 'Store name',
      shortName: 'Short name',
      storeType: 'Store type',
      managerName: 'Manager',
      managerPhone: 'Manager phone',
      openDate: 'Open date',
      businessStatus: 'Cooperation',
      address: 'Address',
      employeeCount: 'Employees',
      updateBy: 'Updated by',
      remark: 'Remark',
      createTime: 'Created at',
      updateTime: 'Updated at'
    },
    field: {
      storeCode: 'Store code',
      storeName: 'Store name',
      shortName: 'Short name',
      openDate: 'Open date',
      storeType: 'Store type',
      businessStatus: 'Cooperation',
      address: 'Address',
      managerName: 'Manager name',
      managerPhone: 'Manager phone',
      manager: 'Manager',
      posSystemId: 'POS system ID',
      image: 'Store image',
      remark: 'Remark',
      updateTimeRange: 'Updated at',
      updateBy: 'Updated by'
    },
    placeholder: {
      storeName: 'Enter store name',
      shortName: 'Enter short name',
      openDate: 'Select open date',
      storeType: 'Select store type',
      businessStatus: 'Select cooperation status',
      managerName: 'Enter manager name',
      managerPhone: 'Enter phone',
      address: 'Enter address',
      posSystemId: 'Enter POS system ID',
      searchUser: 'Search user (nickname / phone)'
    },
    option: {
      direct: 'Direct',
      franchise: 'Franchise',
      cooperating: 'Cooperating',
      terminated: 'Terminated'
    },
    rule: {
      storeName: { required: 'Store name is required' },
      shortName: { required: 'Short name is required' },
      storeType: { required: 'Store type is required' },
      posSystemId: { required: 'POS system ID is required' },
      businessStatus: { required: 'Cooperation status is required' },
      managerPhone: { pattern: 'Please enter a valid phone' }
    },
    confirm: {
      del: 'Delete the selected {count} store record(s)?',
      clearManager: 'Clear the current manager?'
    }
  },
  // Breeding configuration (BRD-MD-001) — type / strain / mating relations, 4-tab single page
  breeding: {
    tab: {
      type: 'Breed Type',
      typeConfig: 'Type Mating',
      strain: 'Strain',
      strainConfig: 'Strain Mating'
    },
    title: {
      addType: 'Add Breed Type',
      editType: 'Edit Breed Type',
      addStrain: 'Add Strain',
      editStrain: 'Edit Strain',
      addTypeConfig: 'Add Type Mating',
      editTypeConfig: 'Edit Type Mating',
      addStrainConfig: 'Add Strain Mating',
      editStrainConfig: 'Edit Strain Mating'
    },
    column: {
      breedStrainCode: 'Code',
      breedStrainName: 'Name',
      lineCode: 'Strain Code',
      lineName: 'Strain Name',
      typeCode: 'Breed Code',
      typeName: 'Breed Name',
      parentCode: 'Parent Code',
      description: 'Description',
      remark: 'Remark',
      motherCode: 'Maternal Line Code',
      motherName: 'Maternal Line Name',
      fatherCode: 'Paternal Line Code',
      fatherName: 'Paternal Line Name',
      cubCode: 'Cub Code',
      offspringName: 'Offspring Name',
      createTime: 'Created At',
      createBy: 'Created By',
      changeTime: 'Change Time',
      changeBy: 'Changed By'
    },
    field: {
      breedStrain: 'Type',
      breedStrainCode: 'Code',
      breedStrainName: 'Name',
      lineCode: 'Strain Code',
      lineName: 'Strain Name',
      typeCode: 'Breed Code',
      typeName: 'Breed Name',
      parentCode: 'Parent Code',
      description: 'Description',
      remark: 'Remark',
      motherCode: 'Maternal Line Code',
      fatherCode: 'Paternal Line Code',
      cubCode: 'Cub Code',
      createTimeRange: 'Created At',
      changeTimeRange: 'Change Date'
    },
    placeholder: {
      breedStrainCode: 'Enter code (letters / digits / underscore / hyphen)',
      breedStrainName: 'Enter name',
      lineCode: 'Enter strain code (letters / digits / underscore / hyphen)',
      lineName: 'Enter strain name',
      typeCode: 'Enter breed code (letters / digits / underscore / hyphen)',
      typeName: 'Enter breed name',
      parentCode: 'Enter parent code (strain only)',
      motherCode: 'Select maternal line',
      fatherCode: 'Select paternal line',
      cubCode: 'Select cub',
      autoFillName: 'Auto-filled by code'
    },
    option: {
      type: 'Breed Type',
      strain: 'Strain'
    },
    rule: {
      breedStrain: { required: 'Type is required' },
      breedStrainCode: {
        required: 'Code is required',
        pattern: 'Code allows letters, digits, underscore, hyphen only',
        len2: 'Breed code must be exactly 2 digits',
        len1to2: 'Strain code must be 1-2 digits'
      },
      breedStrainName: { required: 'Name is required' },
      motherCode: { required: 'Maternal line is required' },
      fatherCode: { required: 'Paternal line is required' },
      cubCode: { required: 'Cub is required' }
    },
    tip: {
      cubMustExistFirst: 'Cub must be registered on the Type / Strain tab before being selected here'
    },
    confirm: {
      delInfo: 'Confirm deletion of {count} breed-info record(s)?',
      delConfig: 'Confirm deletion of {count} mating relation(s)?'
    }
  },
  // Production Config (BRD-MD-003) — single-page with 3 tabs: cycle / boar / medicine schedule
  // v1.2 key: NO timer / NO auto-transition — config only decides "suggested time", state changes by events
  productionConfig: {
    tab: {
      sow: 'Sow Production',
      fatten: 'Fattening Production',
      slaughter: 'Slaughter Config',
      cycle: 'Production Cycle',
      boar: 'Sperm / Boar',
      med: 'Med Schedule'
    },
    unit: {
      day: 'day(s)'
    },
    sow: {
      sow_reserve_to_breed_days: 'Reserve → Breed (days)',
      sow_wean_to_breed_days: 'Wean → Breed (days)',
      sow_return_to_breed_days: 'Return-to-estrus → Breed (days)',
      sow_empty_to_breed_days: 'Empty → Breed (days)',
      sow_abort_to_breed_days: 'Abort → Breed (days)',
      sow_breed_to_farrow_days: 'Breed → Farrow (days)',
      sow_farrow_to_wean_days: 'Farrow → Wean (days)'
    },
    fatten: {
      index: 'No.',
      startAge: 'Start Age',
      endAge: 'End Age',
      recordGrowth: 'Record Growth',
      addStage: 'Add Age Stage',
      ruleRequired: 'Row {row}: start / end age is required',
      ruleRange: 'Row {row}: end age cannot be less than start age'
    },
    slaughter: {
      slaughterAge: 'Slaughter Age'
    },
    title: {
      addCycle: 'Add Cycle Item',
      editCycle: 'Edit Cycle Item',
      addBoar: 'Add Boar Config',
      editBoar: 'Edit Boar Config',
      addMed: 'Add Med Schedule',
      editMed: 'Edit Med Schedule'
    },
    column: {
      configKey: 'Key',
      defaultValue: 'Default',
      customValue: 'Custom',
      unit: 'Unit',
      description: 'Description',
      boarId: 'Boar ID',
      spermQualityThreshold: 'Sperm Threshold',
      breedingIntervalDays: 'Interval (days)',
      medType: 'Med Type',
      eventTrigger: 'Trigger',
      daysOffset: 'Days Offset',
      remark: 'Remark',
      createTime: 'Created At'
    },
    field: {
      configKey: 'Key',
      defaultValue: 'Default',
      customValue: 'Custom',
      unit: 'Unit',
      description: 'Description',
      boarId: 'Boar ID',
      spermQualityThreshold: 'Sperm Density Threshold (10^8/mL)',
      breedingIntervalDays: 'Sperm Interval (days)',
      medType: 'Med Type',
      eventTrigger: 'Trigger Event',
      daysOffset: 'Days Offset',
      remark: 'Remark'
    },
    placeholder: {
      configKey: 'e.g. gestation_days',
      defaultValue: 'Industry default (days)',
      customValue: 'Empty = use default',
      unit: 'Default: days',
      description: 'Business meaning',
      boarId: 'V1 empty = generic config',
      spermQualityThreshold: 'Enter sperm density threshold',
      breedingIntervalDays: 'Enter interval days',
      medType: 'Select med type',
      eventTrigger: 'Select trigger event',
      daysOffset: 'Positive = after / Negative = before'
    },
    rule: {
      configKey: { required: 'Key is required' },
      defaultValue: { required: 'Default is required' },
      spermQualityThreshold: { required: 'Sperm density threshold is required' },
      breedingIntervalDays: { required: 'Sperm interval is required' },
      medType: { required: 'Med type is required' },
      eventTrigger: { required: 'Trigger event is required' },
      daysOffset: { required: 'Days offset is required' }
    },
    tip: {
      noAutoTrigger: 'Config only decides suggested time; it does not auto-change state',
      customOverridesDefault: 'Empty "Custom" means business reads default value'
    },
    confirm: {
      delCycle: 'Confirm deletion of {count} cycle config(s)?',
      delBoar: 'Confirm deletion of {count} boar config(s)?',
      delMed: 'Confirm deletion of {count} med schedule(s)?'
    }
  },
  // Pig master + state machine (BRD-CORE-001) — 10 lifecycle / 11 UI events / END + end_reason
  pig: {
    action: {
      fireEvent: 'Fire event'
    },
    tab: {
      all: 'All',
      sow: 'Sow',
      boar: 'Boar',
      piglet: 'Piglet',
      fattening: 'Fattening'
    },
    sex: {
      male: 'Male',
      female: 'Female'
    },
    column: {
      earNo: 'Ear No.',
      earTag: 'Ear tag',
      pigSex: 'Sex',
      pigType: 'Pig Type',
      currentStatus: 'Current state',
      pigBreedCode: 'Breed',
      pigStrainCode: 'Strain',
      birthDate: 'Birth date',
      introduceDate: 'Introduce date',
      barnId: 'Barn',
      penId: 'Pen',
      barn: 'Barn',
      pen: 'Pen',
      motherEar: 'Maternal Ear Tag',
      fatherEar: 'Sire ear',
      parity: 'Parity',
      matingCount: 'Mating count',
      lastMatingDate: 'Last mating date',
      enterFattenAt: 'Enter fatten at',
      statusStartedAt: 'Status since',
      statusStartedDate: 'Status start date',
      endReason: 'End reason',
      remark: 'Remark',
      liveBornCount: 'Live Born',
      weanedCount: 'Weaned Piglets',
      avgLitterSize: 'Avg Litter Size'
    },
    perf: {
      totalBorn: 'Total born',
      totalLiveBorn: 'Live born',
      totalWeaned: 'Weaned',
      avgBornWeight: 'Avg born wt (kg)',
      avgWeanedWeight: 'Avg wean wt (kg)',
      lastUpdateDate: 'Last update'
    },
    growth: {
      measureDate: 'Measure date',
      weight: 'Weight (kg)',
      backfatThickness: 'Backfat (mm)',
      backHeight: 'Back height (cm)',
      operatorName: 'Operator'
    },
    placeholder: {
      earNo: 'Enter ear number',
      barnId: 'Enter barn id',
      penId: 'Enter pen id',
      motherEar: 'Enter maternal ear tag',
      barnName: 'Enter barn name',
      penName: 'Enter pen name'
    },
    event: {
      empty: 'No available events for current state',
      target: 'Target event',
      placeholderHint: 'BRD-EVENT-* business forms not yet wired — boss / debug only, no real payload collected',
      payloadFields: 'Required payload fields (UI placeholder, not collected)',
      dialogTitle: 'Fire pig state event',
      fireAnyway: 'Fire anyway',
      fireSuccess: 'Event fired',
      breed: 'Breed',
      farrow: 'Farrow',
      wean: 'Wean',
      oestrus: 'Oestrus check',
      null_return: 'Null return (abort / return / idle)',
      die: 'Die',
      eliminate: 'Eliminate',
      castrate: 'Castrate',
      transfer: 'Transfer',
      slaughter: 'Slaughter',
      intro: 'Introduce',
      payloadDesc: {
        oestrus: 'Boolean — confirm pregnancy (true → PH, false → keep PZ)',
        nullReturn: 'String — abort / return / idle',
        transferBarn: 'Long — new barn id (optional)',
        transferPen: 'Long — new pen id (optional)'
      }
    },
    detail: {
      title: 'Pig detail — {earNo}',
      creator: 'Created by',
      tab: {
        overview: 'Overview',
        basic: 'Basic info',
        performance: 'Performance',
        history: 'History',
        breeding: 'Breeding / farrow',
        med: 'Medication',
        growth: 'Growth curve',
        health: 'Health'
      },
      historyEmpty: 'No state changes',
      historyInit: 'Initial',
      duration: '{days} day(s)',
      relatedEvent: 'Related event ID: {id}',
      healthPlaceholder: 'Health log will be available in a future release',
      performanceEmpty: 'No performance data yet (populated by system aggregation)',
      performanceDataHint: 'Data sourced from t_farm_sow_performance, populated by farrow / wean events or nightly job.',
      growthEmpty: 'No growth measurements',
      relatedNotFound: 'No pig found with ear no. {earNo}',
      breedingEmpty: 'No breeding / farrow / wean records',
      medEmpty: 'No medication / treatment records',
      breedingCol: {
        changeTime: 'Time',
        eventType: 'Event',
        transition: 'State change',
        relatedEventId: 'Related ID',
        recorder: 'Recorder'
      },
      historyCol: {
        durationDays: 'Duration days'
      },
      medCol: {
        useDate: 'Use date',
        medicineName: 'Medicine',
        medicineType: 'Use type',
        medicineDosage: 'Dosage',
        medicineWay: 'Method',
        medicineReason: 'Reason',
        operatorName: 'Operator'
      }
    },
    exportTodo: 'Export will be available in a future release'
  },
  // Breed event ledgers (admin read-only: introduce / piglet ear-tag / event ledger / growth)
  breedEvent: {
    sex: {
      female: 'F',
      male: 'M',
      femaleOption: 'Female (F)',
      maleOption: 'Male (M)'
    },
    intro: {
      readonlyTip:
        'Introduction records are read-only history. Create entries in the mini-program "Introduction" (worker scans + photo in the barn).',
      type: {
        external: 'External',
        internal: 'Internal transfer'
      },
      column: {
        introduceNo: 'Introduce No.',
        introduceType: 'Type',
        introduceDate: 'Introduce date',
        pigCount: 'Pig count',
        startEarNo: 'Start ear no.',
        pigSex: 'Sex',
        pigBreedCode: 'Breed',
        pigStrainCode: 'Strain',
        supplierCode: 'Supplier code',
        supplierName: 'Supplier',
        supplierId: 'Supplier ID',
        remark: 'Remark',
        createTime: 'Created'
      },
      field: {
        introduceNo: 'Introduce No.',
        introduceType: 'Type',
        pigSex: 'Sex'
      },
      placeholder: {
        introduceNo: 'Prefix e.g. INT2026'
      }
    },
    eartag: {
      readonlyTip: 'Piglet ear-tag records are read-only history. Create entries in the mini-program "Piglet batch ear-tag".',
      column: {
        pigletEarNo: 'Piglet ear no.',
        pigletSex: 'Sex',
        motherEarNo: 'Mother ear no.',
        fatherEarNo: 'Father ear no.',
        farrowDate: 'Farrow date',
        farrowId: 'Farrow ID',
        birthWeight: 'Birth wt (kg)',
        tagDate: 'Tag date',
        remark: 'Remark'
      },
      field: {
        pigletEarNo: 'Piglet ear no.',
        motherEarNo: 'Mother ear no.',
        pigletSex: 'Sex'
      },
      placeholder: {
        pigletEarNo: 'Full ear no.',
        motherEarNo: 'Full ear no.'
      }
    },
    ledger: {
      readonlyTip:
        'Event ledger · unified state-machine log (t_farm_status_record, all events auto-written). Create each event in the matching mini-program form.',
      transitionInit: 'Initial',
      column: {
        changeTime: 'Change time',
        earNo: 'Ear No.',
        eventType: 'Event',
        transition: 'State change',
        durationDays: 'Days',
        relatedEventId: 'Related ID',
        pigId: 'Pig ID',
        id: 'Log ID',
        changeBy: 'Changed By'
      },
      field: {
        earNo: 'Ear No.',
        eventType: 'Event type',
        newStatus: 'New state',
        changeBy: 'Changed By'
      },
      placeholder: {
        earNo: 'Enter ear No.',
        changeBy: 'Enter the name of the person who made the change'
      }
    },
    growth: {
      tip: 'Growth records: worker enters weight in mini-program; admin may add backfat / back height (pro equipment). Delete window: within 3 days of entry.',
      column: {
        id: 'ID',
        earNo: 'Ear No.',
        measureDate: 'Measure date',
        weight: 'Weight',
        backfatThickness: 'Backfat',
        backHeight: 'Back height',
        barnName: 'Barn',
        penName: 'Pen',
        remark: 'Remark',
        createTime: 'Entered',
        action: 'Action'
      },
      field: {
        earNo: 'Ear No.',
        beginDate: 'Begin date',
        endDate: 'End date'
      },
      placeholder: {
        earNo: 'e.g. 260520-001'
      },
      form: {
        title: 'New growth record (admin may enter backfat / back height)',
        pig: 'Pig',
        pigPlaceholder: 'Search by ear no.',
        measureDate: 'Measure date',
        measureDatePlaceholder: 'Pick measure date',
        weight: 'Weight (kg)',
        backfatThickness: 'Backfat (mm)',
        backfatHint: 'Optional, measured by pro equipment',
        backHeight: 'Back height (cm)',
        backHeightHint: 'Optional',
        remark: 'Remark'
      },
      rule: {
        pig: 'Please select a pig',
        measureDate: 'Please pick measure date',
        weight: 'Please enter weight (kg)'
      },
      msg: {
        added: 'Growth record saved',
        delConfirm: 'Delete growth record of ear [{earNo}] on {date}? (deletable within 3 days of entry)',
        delConfirmTitle: 'Delete confirm',
        delSuccess: 'Deleted'
      }
    }
  },
  // Farm / Barn / Pen (BRD-MD-002) — single farm (ADR-0001), 2-level tree: Barn → Pen
  farm: {
    section: {
      farmInfo: 'Farm & Barn Info Config',
      tree: 'Barns / Pens',
      detail: 'Detail',
      barnDetail: 'Barn Detail',
      penDetail: 'Pen Detail'
    },
    action: {
      editContact: 'Edit Contact',
      addBarn: 'Add Barn',
      addPen: 'Add Pen'
    },
    title: {
      editContact: 'Edit Farm Contact',
      addBarn: 'Add Barn',
      editBarn: 'Edit Barn',
      addPen: 'Add Pen',
      editPen: 'Edit Pen'
    },
    field: {
      farmName: 'Farm Name',
      farmCode: 'Farm Code',
      farmStatus: 'Farm Status',
      contactName: 'Contact',
      contactPhone: 'Phone',
      address: 'Address',
      barn: 'Owning Barn',
      barnCode: 'Barn Code',
      barnName: 'Barn Name',
      barnType: 'Barn Type',
      barnStatus: 'Barn Status',
      penCode: 'Pen Code',
      penName: 'Pen Name',
      penType: 'Pen Type',
      penStatus: 'Pen Status',
      capacity: 'Capacity',
      currentCount: 'Current Count',
      remark: 'Remark'
    },
    placeholder: {
      treeFilter: 'Search barn / pen name',
      contactName: 'Enter contact name',
      contactPhone: 'Enter contact phone',
      barnCode: 'Enter barn code (letters / digits / underscore / hyphen / dot)',
      barnName: 'Enter barn name',
      barnType: 'Select barn type',
      penCode: 'Enter pen code (letters / digits / underscore / hyphen / dot)',
      penName: 'Enter pen name',
      penType: 'Select pen type'
    },
    rule: {
      barnCode: { required: 'Barn code is required', pattern: 'Code allows letters, digits, underscore, hyphen, dot only' },
      barnName: { required: 'Barn name is required' },
      barnType: { required: 'Barn type is required' },
      barnStatus: { required: 'Barn status is required' },
      penCode: { required: 'Pen code is required', pattern: 'Code allows letters, digits, underscore, hyphen, dot only' },
      penName: { required: 'Pen name is required' },
      penType: { required: 'Pen type is required' },
      penStatus: { required: 'Pen status is required' },
      contactPhone: { pattern: 'Invalid mobile number' }
    },
    confirm: {
      delBarn: 'Delete barn "{name}"? All active pigs in this barn must be transferred first.',
      delPen: 'Delete pen "{name}"? All active pigs in this pen must be transferred first.'
    },
    tag: {
      enabled: 'Enabled',
      disabled: 'Disabled'
    },
    proto: {
      pageTitle: 'Barn Management',
      penDetailTitle: 'Pen Detail',
      createBarn: 'New Barn',
      penDetail: 'Pen Detail',
      back: 'Back',
      empty: 'No pens',
      col: {
        bigPenCount: 'Big Pens',
        limitPenCount: 'Stalls',
        bedCount: 'Farrowing Beds',
        scatterPenCount: 'Scatter pens',
        nurseryPenCount: 'Nursery pens',
        liveCount: 'Current Stock',
        updateTime: 'Updated At',
        updateBy: 'Updated By',
        bigSeq: 'Big Pen No.',
        headCount: 'Pig Count',
        stallNo: 'Stall No.',
        bedNo: 'Bed No.',
        earNo: 'Ear No.',
        pigletCount: 'Piglets'
      },
      field: {
        bigPenCount: 'Big Pen Count',
        limitPenCount: 'Stall Count',
        bedCount: 'Farrowing Bed Count',
        scatterPenCount: 'Scatter Pen Count',
        nurseryPenCount: 'Nursery Pen Count'
      },
      placeholder: {
        bigPenCount: 'Enter big pen count',
        limitPenCount: 'Enter stall count',
        bedCount: 'Enter farrowing bed count',
        scatterPenCount: 'Enter scatter pen count',
        nurseryPenCount: 'Enter nursery pen count'
      },
      rule: {
        countRequired: 'Enter a count (>= 0)'
      },
      tab: {
        big: 'Big Pen',
        stall: 'Stall',
        farrow: 'Farrowing Bed',
        scatter: 'Scatter',
        nurseryPen: 'Nursery'
      },
      confirmDelPen: 'Delete pen "{name}"? All active pigs in this pen must be transferred first.'
    },
    tip: {
      selectNode: 'Select a barn or pen on the left to view details',
      selectBarnFirst: 'Select a barn on the left first, then add a pen',
      emptyTree: 'No barns yet — click "Add Barn" at the top-right to start'
    }
  },
  // Medicine library (BRD-MED-001)
  medicine: {
    title: {
      add: 'New Medicine',
      edit: 'Edit Medicine'
    },
    column: {
      medicineCode: 'Code',
      medicineName: 'Name',
      medicineType: 'Type',
      spec: 'Spec',
      unit: 'Unit',
      currentStock: 'Stock',
      withdrawDays: 'Withdraw (d)',
      manufacturer: 'Manufacturer',
      expireDate: 'Expire Date',
      medStatus: 'Status',
      createTime: 'Created'
    },
    field: {
      medicineCode: 'Code',
      medicineName: 'Name',
      medicineType: 'Type',
      supplierId: 'Supplier',
      approvalNo: 'Approval No.',
      batchNo: 'Batch No.',
      expireDate: 'Expire Date',
      withdrawDays: 'Withdraw (days)',
      unit: 'Unit',
      currentStock: 'Current Stock',
      spec: 'Spec',
      manufacturer: 'Manufacturer',
      storageCondition: 'Storage Condition',
      medStatus: 'Status',
      remark: 'Remark'
    },
    placeholder: {
      medicineCode: 'Code (letters/digits/-)',
      medicineName: 'Medicine name',
      medicineType: 'Pick type',
      supplierId: 'Search supplier',
      approvalNo: 'Approval number',
      batchNo: 'Batch number',
      expireDate: 'Expire date',
      withdrawDays: 'Withdraw days',
      unit: 'bottle / box / g',
      currentStock: 'Current stock',
      spec: 'e.g. 10ml × 100 / box',
      manufacturer: 'Manufacturer',
      storageCondition: 'e.g. 2-8℃ refrigerated'
    },
    rule: {
      medicineCode: { required: 'Code is required' },
      medicineName: { required: 'Name is required' },
      medicineType: { required: 'Pick a type' },
      medStatus: { required: 'Pick a status' }
    },
    confirm: {
      del: 'Delete {count} medicine record(s)? Downstream usage records will lose trace.'
    }
  },
  // Medicine batches (BRD-MED-001)
  medBatch: {
    title: {
      add: 'New Batch',
      edit: 'Edit Batch'
    },
    column: {
      medicineId: 'Medicine ID',
      medicineName: 'Medicine',
      batchNo: 'Batch No.',
      productionDate: 'Production',
      expiryDate: 'Expiry',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      remark: 'Remark',
      createTime: 'Created'
    },
    field: {
      medicineId: 'Medicine',
      batchNo: 'Batch No.',
      productionDate: 'Production Date',
      expiryDate: 'Expiry Date',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      remark: 'Remark'
    },
    placeholder: {
      medicineId: 'Search medicine',
      batchNo: 'Batch number',
      productionDate: 'Production date',
      expiryDate: 'Expiry date',
      quantity: 'Quantity',
      unitPrice: 'Unit price'
    },
    rule: {
      medicineId: { required: 'Pick a medicine' },
      batchNo: { required: 'Batch No. is required' },
      quantity: { required: 'Quantity is required' }
    },
    confirm: {
      del: 'Delete {count} batch record(s)?'
    }
  },
  // Medicine usage ledger (BRD-MED-002)
  medUsage: {
    readonlyTip:
      'Usage ledger is read-only history of all pick / return / loss actions. Create entries in the mini-program "Medicine pick" (worker scans + photo in the barn). Soft-delete does NOT revert stock (settled records are irreversible).',
    type: { use: 'Use', return: 'Return', loss: 'Loss' },
    column: {
      medicineId: 'Medicine ID',
      batchId: 'Batch ID',
      medicineName: 'Medicine',
      batchNo: 'Batch no.',
      usageType: 'Type',
      usageQty: 'Qty',
      useDate: 'Date',
      earNo: 'Ear No.',
      penCode: 'Pen',
      remark: 'Remark',
      createBy: 'Operator',
      createTime: 'Created'
    },
    field: {
      usageType: 'Type',
      useDateFrom: 'Date ≥',
      useDateTo: 'Date ≤'
    },
    confirm: {
      del: 'Delete {count} usage record(s)? Stock changes will NOT be reverted.'
    }
  },
  // Medicine treatment ledger (BRD-MED-003)
  medRecord: {
    readonlyTip:
      'Medication treatment log: single + batch (master/detail). Admin is read-only; create entries in the mini-program "Medication treatment" (only batches picked within 3 days are shown). Soft-delete does NOT revert stock.',
    column: {
      useDate: 'Use date',
      earNo: 'Ear No.',
      drugType: 'Record type',
      medicineType: 'Use type',
      medicineReason: 'Reason',
      medicineWay: 'Method',
      medicineName: 'Medicine',
      batchNo: 'Batch no.',
      batchId: 'Batch ID',
      medicineDosage: 'Dosage',
      operatorName: 'Operator',
      remark: 'Remark',
      createTime: 'Created'
    },
    field: {
      earNo: 'Ear No.',
      medicineType: 'Use type',
      drugType: 'Record type',
      beginDate: 'Begin date',
      endDate: 'End date'
    },
    confirm: {
      del: 'Delete {count} medication record(s)?'
    }
  },
  // Warehouse location (WMS-MD-001)
  location: {
    title: {
      add: 'New location',
      edit: 'Edit location'
    },
    column: {
      locationCode: 'Code',
      locationName: 'Name',
      locationType: 'Type',
      locationThumb: 'Image',
      locationSort: 'Sort',
      locationDesc: 'Description',
      capacity: 'Capacity',
      locationStatus: 'Status',
      createTime: 'Created',
      updateTime: 'Updated'
    },
    field: {
      locationCode: 'Code',
      locationName: 'Name',
      locationType: 'Type',
      locationThumb: 'Location Image',
      locationImg: 'Images',
      locationSort: 'Sort',
      locationDesc: 'Description',
      locationStatus: 'Status',
      capacity: 'Capacity',
      remark: 'Remark'
    },
    placeholder: {
      locationCode: 'e.g. L0001 / FROZEN-01',
      locationName: 'Location name',
      locationType: 'Pick type',
      locationThumb: 'Upload thumbnail (single, ≤ 10MB)',
      locationImg: 'Upload images (up to 5, ≤ 10MB each)',
      locationDesc: 'Enter location description (optional)',
      capacity: 'Capacity (kg / m³)'
    },
    rule: {
      locationCode: { required: 'Code is required' },
      locationName: { required: 'Name is required' },
      locationType: { required: 'Type is required' },
      locationStatus: { required: 'Status is required' }
    },
    confirm: {
      del: 'Delete {count} location(s)? Make sure they have no active stock.'
    },
    summary: {
      locationCount: 'Locations',
      productCount: 'Product Categories',
      currentStock: 'Current stock',
      todayIn: 'In today',
      todayOut: 'Out today',
      lastCheck: 'Last check',
      noCheck: 'No check yet'
    }
  },
  // Warehouse commodity master data / self-produce / purchase / gift box (WMS-MD-002, 3-form shared table)
  // Note: distinguished from D11+ TRC-CORE-001 "Product list (traceability serial)" — this namespace is SKU master
  product: {
    title: {
      add: 'New commodity',
      edit: 'Edit commodity',
      view: 'Product detail',
      baseInfo: 'Product info',
      production: 'Production Records',
      flow: 'Transaction Flow',
      inout: 'Stock In/Out Records',
      goodsView: 'Goods detail',
      goodsBaseInfo: 'Goods info',
      productAdd: 'New product',
      productEdit: 'Edit product',
      goodsAdd: 'New goods',
      goodsEdit: 'Edit goods'
    },
    column: {
      productId: 'Product Code',
      productName: 'Product Name',
      productType: 'Type',
      productAttr: 'Attribute',
      productWorkshop: 'Workshop',
      storeLocation: 'Store Location',
      belongType: 'Category',
      productThumb: 'Product Image',
      productUnit: 'Unit',
      productSpec: 'Spec',
      productAlias: 'Product Alias',
      productStatus: 'Status',
      createTime: 'Created',
      updateTime: 'Updated',
      index: 'No.',
      goodsType: 'Goods type',
      goodsAttr: 'Goods attribute',
      goodsId: 'Goods Code',
      goodsName: 'Goods Name',
      goodsThumb: 'Goods Image',
      goodsBelongType: 'Goods Category',
      supplierName: 'Supplier'
    },
    field: {
      productId: 'Product code',
      productName: 'Product name',
      productType: 'Product type',
      productUnit: 'Unit',
      productSpec: 'Spec',
      productAlias: 'Product Alias',
      belongType: 'Category',
      goodsBelongType: 'Goods Category',
      buyClass: 'Category',
      productAttr: 'Attribute',
      productWorkshop: 'Workshop',
      productMaterial: 'Raw Material Product',
      materialNum: 'Other-product packing measure',
      productThumb: 'Product Image',
      productImg: 'Images',
      imageOssId: 'Main Image (auto)',
      imageOssIdTip: 'Leave empty to auto-match from the shared library by product name; manual upload is never auto-overridden',
      productStatus: 'Status',
      isDelivery: 'Is delivery',
      isBuyOut: 'Buy-out',
      isBuyOutSupport: 'Support Purchase',
      storeLocation: 'Store Location',
      updateBy: 'Updated By',
      supplierId: 'Supplier',
      productDesc: 'Description',
      remark: 'Remark',
      goodsId: 'Goods code',
      goodsName: 'Goods name',
      goodsType: 'Goods type',
      goodsAttr: 'Goods attribute',
      goodsThumb: 'Goods Image',
      goodsDesc: 'Goods Description',
      supplierName: 'Supplier'
    },
    placeholder: {
      productId: 'e.g. P0001 / SP-PORK-001 (manual)',
      productUnit: 'e.g. kg / pcs / box',
      productSpec: 'e.g. 500g/pack',
      productAlias: 'Optional, product alias',
      productMaterial: 'Related raw material product ID',
      productMaterialSelect: 'Select the related raw material product',
      buyClass: 'Choose category (add via dict manager if empty)',
      supplierId: 'Choose supplier',
      storeLocation: 'Select storage location'
    },
    rule: {
      productType: { required: 'Please select product type' },
      productId: { required: 'Product code is required' },
      productName: { required: 'Product name is required' },
      productUnit: { required: 'Product unit is required' },
      belongType: { required: 'Self-produce category is required' },
      supplierId: { required: 'Supplier is required for purchased products' },
      productSpec: { required: 'Spec is required for production products' },
      storeLocation: { required: 'Please select storage location' },
      productAttr: { required: 'Please select product attribute' },
      productWorkshop: { required: 'Please select workshop' }
    },
    tip: {
      buyClassEmpty: 'No category yet — add via System → Dict → djs_buy_class',
      materialEmpty: 'No raw material product yet — first add a product with attribute = Raw material'
    },
    button: {
      inbound: 'Inbound'
    },
    inbound: {
      title: 'Goods inbound',
      product: 'Goods',
      supplier: 'Supplier',
      location: 'Inbound location',
      locationPlaceholder: 'Select inbound location',
      locationType: 'Location Type',
      locationTypeAll: 'All',
      quantity: 'Inbound quantity',
      confirm: 'Confirm inbound',
      locationRequired: 'Please select inbound location',
      locationLocked: 'Locked to configured location',
      quantityRequired: 'Please enter inbound quantity',
      remark: 'Remark'
    },
    production: {
      produceDate: 'Produce Date',
      produceDatePlaceholder: 'Select produce date',
      produceType: 'Produce Type',
      produceTypePlaceholder: 'Select type',
      typeProduce: 'Produce',
      typeReturn: 'Return',
      produceNum: 'Produce Qty',
      produceUnit: 'Unit',
      standardWeight: 'Standard Weight',
      produceWeight: 'Actual Weight',
      diffWeight: 'Diff Weight'
    },
    flow: {
      bizDate: 'Biz Date',
      bizDatePlaceholder: 'Select biz date',
      bizDateStart: 'Start Date',
      bizDateEnd: 'End Date',
      bizType: 'Biz Type',
      bizNum: 'Quantity',
      bizUnit: 'Unit',
      typeInStock: 'Inbound',
      typePickOut: 'Pick Out',
      typeBackendOut: 'Backend Out',
      supplierName: 'Supplier',
      operatorName: 'Operator'
    },
    confirm: {
      del: 'Delete {count} product(s)? Make sure none has active stock or is referenced as raw material.'
    }
  },
  // Warehouse stock query (WMS-MD-001, read-only)
  stock: {
    field: {
      productName: 'Product',
      earNo: 'Ear No.',
      blockNo: 'Plot No.',
      locationName: 'Location',
      belongType: 'Category'
    },
    column: {
      locationName: 'Location',
      productName: 'Product',
      productCode: 'Product Code',
      productStock: 'Stock',
      productUnit: 'Unit',
      earNo: 'Ear No.',
      whiteBarNo: 'Bar Serial No.',
      blockNo: 'Plot No.',
      latestCheckTime: 'Last check',
      checkResult: 'Check result'
    },
    action: {
      flowIn: 'Inbound',
      flowOut: 'Outbound',
      checkRecord: 'Check log',
      productOut: 'Stock Out',
      pigTransfer: 'Pork Transfer',
      viewDetail: 'View Detail'
    },
    outDialog: {
      title: 'Product Stock Out',
      currentStock: 'Current Stock',
      outDate: 'Out Date',
      outDatePlaceholder: 'Select out date',
      quantity: 'Out Qty',
      quantityPlaceholder: 'Enter out qty',
      measureUnit: 'Unit',
      stockOutDest: 'Destination',
      stockOutDestPlaceholder: 'Select destination',
      confirm: 'Confirm',
      rule: {
        outDate: 'Please select out date',
        quantity: 'Please enter out qty',
        stockOutDest: 'Please select destination'
      }
    },
    transferDialog: {
      title: 'Pork Transfer',
      fromLocation: 'From Location',
      toLocation: 'To Location',
      frozenLocation: 'Frozen Warehouse',
      currentStock: 'Current Stock',
      transferDate: 'Transfer Date',
      transferDatePlaceholder: 'Select transfer date',
      quantity: 'Transfer Qty',
      quantityPlaceholder: 'Enter transfer qty',
      measureUnit: 'Unit',
      confirm: 'Confirm',
      rule: {
        transferDate: 'Please select transfer date',
        quantity: 'Please enter transfer qty'
      }
    },
    recordDialog: {
      title: 'Stock Records',
      checkId: 'Check No.',
      sysStock: 'System Stock',
      checkStock: 'Counted Stock',
      diffStock: 'Difference',
      checkBy: 'Checked By',
      lossRecord: 'Loss Records',
      lossDate: 'Loss Date',
      lossType: 'Loss Type',
      lossLocation: 'Loss Location',
      lossWeight: 'Loss Qty',
      feedRecord: 'Feed Records',
      feedDate: 'Feed Date',
      feedLocation: 'Feed Location',
      feedWeight: 'Feed Qty'
    }
  },
  // Planting - Zone (PLT-MD-001)
  // Plant Overview (FIX-PLT-AD-OVERVIEW-001)
  plantDashboard: {
    title: 'Plant Dashboard',
    refresh: 'Refresh',
    lastRefresh: 'Last refresh',
    land: {
      title: 'Land Overview',
      idle: 'Idle Plots',
      monthPending: 'Pending Plots (This Month)',
      planted: 'Planted',
      currentArea: 'Current Planting Area (mu)',
      annualYield: 'Annual Expected Yield (t)'
    },
    today: {
      title: "Today's Work",
      empty: '(deprecated, removable)',
      planting: 'Planting',
      harvest: 'Harvest',
      idleMgmt: 'Idle Land Mgmt',
      plantMgmt: 'Crop Mgmt',
      disaster: 'Disaster Loss',
      pickActivity: 'Pick Activity',
      unitPlot: 'plots'
    },
    cert: {
      title: 'Organic Certificate Overview',
      plotMinDays: '(deprecated, removable)',
      cropMinDays: '(deprecated, removable)',
      cropNoCert: 'Crops Without Cert',
      cropReserved: '(deprecated, removable)',
      cropCertExpiryDate: 'Crop Cert Expiry Date',
      cropCertDaysToExpiry: 'Crop Cert Days to Expiry',
      cropCertCategoryCount: 'Crop Cert Categories'
    },
    cropStat: {
      title: 'Real-time Crop Statistics',
      plotCount: 'Planting Plots',
      expectedYield: 'Expected Yield (kg)'
    },
    gantt: {
      plantTitle: 'Planting Plan',
      pickTitle: 'Harvest Plan',
      progress: 'Progress'
    }
  },
  plantOverview: {
    title: 'Plant Overview',
    empty: 'No crop data',
    breadcrumbHome: 'Home',
    breadcrumbPlant: 'Plant Management',
    kpi: {
      idlePlotCount: 'Idle Plots',
      plantedPlotCount: 'Planted Plots',
      harvestedTotalTon: 'Harvested Total (t)',
      expectedTotalTon: 'Expected Total (t)',
      remainingExpectedTon: 'Remaining Expected (t)'
    },
    card: {
      currentPlanted: 'Planted Plots',
      currentPlantedArea: 'Planted Area (mu)',
      planGroup: 'Plan',
      doneGroup: 'Completed',
      plotCount: 'Plots',
      area: 'Area (mu)',
      expectedYield: 'Expected Yield (kg)',
      doneArea: 'Planted Area (mu)',
      donePlotCount: 'Planted Plots',
      harvestYield: 'Harvested Yield (kg)',
      completionRate: 'Completion Rate'
    },
    detail: {
      title: 'Crop Detail',
      back: 'Back',
      export: 'Export',
      col: {
        cropName: 'Crop Name',
        plotCode: 'Plot No.',
        plotName: 'Plot',
        plantStatus: 'Planting Status',
        harvestStatus: 'Harvest Status',
        planSeason: 'Season',
        planPlantDate: 'Planned Date',
        plantDate: 'Plant Date',
        plantTeamName: 'Planting Team',
        beginHarvestdate: 'Harvest Start',
        endHarvestdate: 'Harvest End',
        earliestHarvestdate: 'Earliest Harvest',
        lastHarvestdate: 'Latest Harvest',
        plotArea: 'Plot Area (mu)',
        expectedYield: 'Expected Yield (kg)',
        actualYield: 'Actual Yield (kg)'
      }
    }
  },
  plantZone: {
    title: { add: 'Add Zone', edit: 'Edit Zone' },
    column: { zoneCode: 'Code', zoneName: 'Name', zoneDesc: 'Description', zoneBelong: 'Belong', zoneStatus: 'Status', createTime: 'Created', plotCount: 'Managed Plots', updateTime: 'Update Time', updateByName: 'Updated By' },
    field: { zoneCode: 'Zone Code', zoneName: 'Zone Name', zoneDesc: 'Description', zoneBelong: 'Belong Region', zoneStatus: 'Status' },
    filter: { zoneBelong: 'Region', zoneName: 'Zone Name', updateTime: 'Update Time', updateBy: 'Updated By' },
    placeholder: {
      zoneCode: 'Enter zone code (e.g. Z001 / EAST-01)',
      zoneName: 'Enter zone name',
      zoneDesc: 'Description (optional)',
      zoneBelong: 'Belong region (optional)',
      search: 'Search zone name',
      updateBy: 'Select updater'
    },
    action: { edit: 'Edit', disable: 'Disable', enable: 'Enable', del: 'Delete' },
    rule: { zoneCode: { required: 'Zone code is required' }, zoneName: { required: 'Zone name is required' } },
    confirm: { del: 'Delete {count} zones? Only zones without planting/harvesting plots can be deleted; their idle plots will be removed together.' },
    empty: 'No zones yet. Create one to get started.'
  },
  // Planting - Plot (PLT-MD-001)
  plantPlot: {
    title: { add: 'Add Plot', edit: 'Edit Plot', view: 'Plot Detail', baseInfo: 'Basic Info', zoneInfo: 'Zone Info' },
    zoneEmpty: 'No zone linked',
    tab: { basic: 'Basic', location: 'Location & Area', soil: 'Soil & Environment', planting: 'Planting', farmwork: 'Farm Work', cert: 'Certification' },
    planting: {
      plantDate: 'Planting Date',
      cropImage: 'Crop Image',
      cropName: 'Crop Name',
      cropCode: 'Crop Code',
      plantByName: 'Planting Team',
      expectedYield: 'Est. Yield/mu',
      earliestHarvestdate: 'Est. Earliest Harvest',
      lastHarvestdate: 'Est. Latest Harvest',
      actualYield: 'Actual Yield/mu',
      beginHarvestdate: 'Harvest Start',
      endHarvestdate: 'Harvest End',
      harvestByName: 'Harvest Team'
    },
    farmwork: {
      farmDate: 'Work Date',
      farmType: 'Work Type',
      plotName: 'Plot',
      farmByName: 'Worker',
      remark: 'Note'
    },
    cert: {
      organicNo: 'Cert No.',
      organicCompany: 'Issuer',
      organicValid: 'Valid Until',
      isWarning: 'Warning'
    },
    column: {
      plotCode: 'Code',
      plotName: 'Name',
      zoneBelong: 'Region',
      zoneName: 'Zone',
      plotType: 'Land Type',
      soilType: 'Soil',
      soilFertility: 'Fertility',
      plotStatus: 'Plot Status',
      plotArea: 'Area',
      isLease: 'Lease',
      plotImage: 'Plot Image',
      historyPlantCount: 'Planting Count',
      maxYieldCrop: 'Top-Yield Crop',
      maxYieldPerMu: 'Top Yield/mu',
      plotRemark: 'Remark',
      createTime: 'Created',
      updateTime: 'Updated'
    },
    field: {
      plotCode: 'Plot Code',
      plotName: 'Plot Name',
      zoneId: 'Zone',
      plotType: 'Plot Type',
      plotStatus: 'Plot Status',
      plotArea: 'Area (mu)',
      isLease: 'Leased',
      plotRemark: 'Plot Remark',
      plotImage: 'Image',
      plotImagePreview: 'Thumbnail',
      plotImageUrl: 'Plot Images',
      plotLocationDesc: 'Location Description',
      plotLocationX: 'Longitude',
      plotLocationY: 'Latitude',
      soilType: 'Soil Type',
      soilFertility: 'Soil Fertility',
      soilPh: 'Soil PH',
      terrainCondition: 'Terrain',
      lightCondition: 'Light',
      drainCondition: 'Drainage',
      currentCropName: 'Current Crop'
    },
    placeholder: {
      plotCode: 'Enter plot code (e.g. P001)',
      plotName: 'Enter plot name',
      zoneId: 'Select zone',
      plotType: 'Select plot type',
      plotStatus: 'Select plot status',
      plotArea: 'Area in mu',
      plotRemark: 'Business remark (optional)',
      plotLocationDesc: 'Location description (optional)',
      soilType: 'Select soil type',
      soilFertility: 'Select soil fertility',
      soilPh: 'PH 0-14',
      terrainCondition: 'Select terrain',
      lightCondition: 'Select light',
      drainCondition: 'Select drainage'
    },
    rule: {
      plotCode: { required: 'Plot code is required' },
      plotName: { required: 'Plot name is required' },
      zoneId: { required: 'Please select a zone' },
      plotArea: { required: 'Area is required' }
    },
    confirm: { del: 'Delete {count} plots?' },
    tip: { statusNotIdle: 'Plot [{names}] is in planting/harvesting status and cannot be deleted' },
    empty: 'No plots in current zone',
    selectZoneFirst: 'Please select a zone on the left first'
  },
  // Planting - Plot Organic Certificate (PLT-MD-003)
  plantPlotOrganic: {
    title: { add: 'Add Plot Organic Cert', edit: 'Edit Plot Organic Cert' },
    column: {
      organicNo: 'Cert No.',
      organicCompany: 'Issuer',
      organicValid: 'Valid Until',
      image: 'Image',
      relatedPlots: 'Related Plots',
      warning: 'Warning',
      createTime: 'Created',
      plotCount: 'Plot Count',
      updateTime: 'Update Time',
      updateByName: 'Updated By'
    },
    field: {
      organicNo: 'Cert No.',
      organicCompany: 'Issuer',
      organicValid: 'Valid Until',
      organicImagePreview: 'Thumbnail',
      organicImageUrl: 'Cert Images',
      zone: 'Zone',
      relatedPlots: 'Related Plots',
      isWarning: 'Warning Status'
    },
    placeholder: {
      organicNo: 'Enter cert number (e.g. GB-2026-001)',
      organicCompany: 'Issuer (e.g. CNCA)',
      organicValid: 'Pick expiry date',
      zone: 'Select a zone to filter plots below',
      search: 'Search plot code / name'
    },
    tip: {
      crossZone: 'Switch zones to pick in batches; already-linked plots are kept across zones.'
    },
    rule: {
      organicNo: { required: 'Cert number is required' },
      organicCompany: { required: 'Issuer is required' },
      organicValid: { required: 'Expiry date is required' }
    },
    warning: { yes: 'Expiring', no: 'Normal' },
    confirm: {
      del: 'Delete {count} certificates? Related plot associations will be removed.',
      scan: 'Scan all certificates and mark expiring (≤ 60 days) as warning, continue?'
    },
    unselected: 'Available plots',
    selected: 'Linked plots',
    scan_warning: 'Scan now',
    scan_done: 'Scan completed'
  },
  // Planting - Crop Organic Certificate (PLT-MD-003)
  plantCropOrganic: {
    title: { add: 'Add Crop Organic Cert', edit: 'Edit Crop Organic Cert' },
    column: {
      cropCertNo: 'Cert No.',
      cropCertCompany: 'Issuer',
      cropCertValid: 'Valid Until',
      cropName: 'Crop',
      image: 'Image',
      warning: 'Warning',
      createTime: 'Created',
      updateTime: 'Update Time',
      updateByName: 'Updated By'
    },
    field: {
      cropCertNo: 'Cert No.',
      cropCertCompany: 'Issuer',
      cropCertValid: 'Valid Until',
      cropId: 'Crop',
      relatedCrops: 'Related Crops',
      cropImagePreview: 'Thumbnail',
      cropImageUrl: 'Cert Images',
      isWarning: 'Warning Status'
    },
    relate: {
      title: 'Relate Crops',
      action: 'Relate Crops',
      unselected: 'Unrelated Crops',
      selected: 'Related Crops',
      search: 'Search crop code / name'
    },
    placeholder: {
      cropCertNo: 'Enter cert number',
      cropCertCompany: 'Issuer',
      cropCertValid: 'Pick expiry date',
      cropId: 'Select related crop'
    },
    rule: {
      cropCertNo: { required: 'Cert number is required' },
      cropCertCompany: { required: 'Issuer is required' },
      cropCertValid: { required: 'Expiry date is required' },
      cropId: { required: 'Please select related crop' }
    },
    warning: { yes: 'Expiring', no: 'Normal' },
    confirm: { del: 'Delete {count} certificates?' }
  },
  // Planting - Crop (PLT-MD-001)
  plantCrop: {
    title: { add: 'Add Crop', edit: 'Edit Crop', view: 'Crop Detail', baseInfo: 'Basic Info' },
    tab: { basic: 'Basic', growth: 'Growth Cycle', yield: 'Yield & Quality', planting: 'Planting Records', farmwork: 'Farm Work' },
    label: {
      varietyOrigin: 'Variety Source',
      qualityDesc: 'Crop Description',
      relatedProduct: 'Related Product No.',
      historyPlantCount: 'Planting Times',
      avgYield: 'Avg Yield (kg/mu)',
      maxYield: 'Max Yield (kg/mu)',
      updateTime: 'Update Time',
      updateByName: 'Updated By'
    },
    search: {
      varietyOrigin: 'Variety Source',
      hasOrganic: 'Organic Cert',
      organicWarning: 'Warning',
      updateTime: 'Update Time',
      updateBy: 'Updated By'
    },
    option: {
      yes: 'Yes',
      no: 'No',
      warningYes: 'Warning',
      warningNo: 'Normal'
    },
    planting: {
      plantDate: 'Plant Date',
      plotName: 'Plot',
      plotCode: 'Plot Code',
      plantTeamName: 'Planting Team',
      predictedPer: 'Expected Yield (kg)',
      earliestHarvestDate: 'Earliest Harvest Date',
      actualPer: 'Actual Yield (kg)',
      pickStartDate: 'Pick Start Date',
      pickEndDate: 'Pick End Date',
      pickTeamName: 'Harvest Team',
      empty: 'No planting records'
    },
    farmwork: {
      farmDate: 'Farm Date',
      farmType: 'Farm Type',
      plotName: 'Plot',
      teamName: 'Operator',
      remark: 'Note',
      empty: 'No farm-work records'
    },
    sub: { index: 'No.' },
    column: {
      cropCode: 'Code',
      cropName: 'Name',
      cropImage: 'Crop Image',
      varietyName: 'Variety',
      cropFamily: 'Family',
      plantingSeason: 'Season',
      cycle: 'Cycle',
      predictedPer: 'Predicted Yield (kg/mu)',
      pickUnitPrice: 'Performance Unit Price',
      createTime: 'Created'
    },
    field: {
      cropCode: 'Crop Code',
      cropName: 'Crop Name',
      cropImagePreview: 'Thumbnail',
      cropImageUrl: 'Crop Images',
      imageOssId: 'Main Image (auto)',
      imageOssIdTip: 'Leave empty to auto-match from the shared library by crop name; manual upload is never auto-overridden',
      varietyName: 'Variety Name',
      varietyOrigin: 'Variety Origin',
      cropFamily: 'Crop Family',
      relatedProduct: 'Related Product',
      plantingSeason: 'Planting Season',
      sowingPeriod: 'Sowing Period',
      maxCycle: 'Max Cycle (days)',
      minCycle: 'Min Cycle (days)',
      fertilizationInterval: 'Fertilization Interval (days)',
      irrigationInterval: 'Irrigation Interval (days)',
      predictedPer: 'Predicted Yield (kg/mu)',
      qualityDesc: 'Quality Description',
      pickUnitPrice: 'Performance Unit Price (yuan/jin)'
    },
    placeholder: {
      cropCode: 'Enter crop code (e.g. C001)',
      cropName: 'Enter crop name',
      varietyName: 'Variety name',
      varietyOrigin: 'Origin / supplier (free text in V1)',
      cropFamily: 'Select family',
      relatedProduct: 'Select related product',
      plantingSeason: 'Select seasons',
      sowingPeriod: 'e.g. early Mar - late Apr',
      qualityDesc: 'Quality description',
      hasOrganic: 'Select organic cert status',
      organicWarning: 'Select cert warning status',
      updateBy: 'Enter updater ID'
    },
    rule: { cropCode: { required: 'Crop code is required' }, cropName: { required: 'Crop name is required' }, maxCycle: { gtMin: 'Max growth cycle must be greater than min growth cycle' } },
    confirm: { del: 'Delete {count} crops?' }
  },
  // Plant - Work team (PLT-MD-002)
  plantTeam: {
    pageTitle: 'Work team',
    title: { add: 'Add team', edit: 'Edit team', member: 'Members - {teamName}' },
    column: {
      teamName: 'Team name',
      leader: 'Leader',
      leaderPhone: 'Leader Phone',
      teamStatus: 'Status',
      memberCount: 'Members',
      remark: 'Remark',
      createTime: 'Created at'
    },
    field: {
      teamName: 'Team name',
      teamStatus: 'Status',
      remark: 'Remark'
    },
    placeholder: {
      teamName: 'Enter team name',
      remark: 'Remark'
    },
    rule: {
      teamName: { required: 'Team name is required' }
    },
    confirm: {
      del: 'Delete the selected team(s)?',
      removeMember: 'Remove [{nickName}] from this team?'
    },
    member: {
      currentTitle: 'Current members',
      candidateTitle: 'Candidates (Plant dept, unassigned)',
      noLeader: 'Not set',
      isLeader: 'Leader',
      colNickName: 'Name',
      colPhone: 'Phone',
      colDept: 'Department',
      colAction: 'Action',
      addBtn: 'Add to team',
      removeBtn: 'Remove',
      setLeaderBtn: 'Set as leader',
      noSelection: 'Please select candidate user(s)',
      emptyMembers: 'No members yet',
      emptyCandidates: 'No candidate user'
    },
    tip: {
      addSuccess: 'Members added',
      removeSuccess: 'Member removed',
      setLeaderSuccess: 'Leader set'
    }
  },
  // Plant - Plan (PLT-PLAN-001)
  plantPlan: {
    pageTitle: 'Planting Plan',
    field: {
      planNo: 'Plan No.',
      planYear: 'Year',
      planSeason: 'Season',
      crop: 'Crop',
      cropId: 'Crop',
      totalArea: 'Total Area',
      totalPlot: 'Plot Count',
      earliestHarvestdate: 'Earliest Harvest Date',
      lastHarvestdate: 'Last Harvest Date',
      plantStatus: 'Planting Plan Status',
      harvestStatus: 'Harvest Status',
      plantTime: 'Plant Time',
      plantActualDate: 'Plant Date',
      beginHarvestdate: 'Harvest Start Date',
      endHarvestdate: 'Harvest End Date',
      plantDate: 'Planned Plant Date',
      plotCode: 'Plot Code',
      plotName: 'Plot Name',
      plotArea: 'Plot Area',
      plantMonth: 'Plant Month',
      plantPeriod: 'Period',
      plantBy: 'Plant Team',
      harvestBy: 'Harvest Team',
      expectedYield: 'Expected Yield (kg)',
      planMonth: 'Plan Month',
      planDate: 'Plan Date',
      updateTime: 'Updated Time',
      createBy: 'Created By'
    },
    column: {
      planNo: 'Plan No.',
      planYear: 'Plan Year',
      planSeason: 'Season',
      crop: 'Crop',
      cropName: 'Crop',
      cropImage: 'Crop Image',
      plantingPeriod: 'Planting Date',
      plantDate: 'Plant Start Date',
      earliestBegindate: 'Earliest Begin Date',
      lastBegindate: 'Latest Begin Date',
      totalArea: 'Planted Area',
      totalPlot: 'Plot Count',
      earliestHarvestdate: 'Earliest Harvest',
      lastHarvestdate: 'Last Harvest',
      expectedYield: 'Expected Yield (kg)',
      actualYield: 'Actual Yield (kg)',
      finishedPlot: 'Finished Plots',
      completionRate: 'Completion Rate (%)',
      plantStatus: 'Planting Plan Status',
      updateTime: 'Updated Time',
      createBy: 'Created By',
      createByName: 'Created By',
      action: 'Actions'
    },
    placeholder: {
      planSeason: 'Select planting season',
      planYear: 'Select Plan Year',
      plantDate: 'e.g. early April (optional)',
      team: 'Select team',
      planDateFilter: 'Select plan date range',
      crop: 'Select crop',
      cropNameInput: 'Enter crop name',
      updateTime: 'Select updated time',
      createBy: 'Select creator',
      createByInput: 'Enter creator name',
      planMonth: 'Select plan month'
    },
    unit: { mu: 'mu', month: 'Mo.' },
    kpi: {
      idlePlot: 'Idle Plots (Now)',
      plantedPlot: 'Planted Plots (This Year)',
      plannedPlot: 'Planned Plots (This Year)',
      plotUsageFreq: 'Plot Usage Freq (This Year)',
      cropVarietyCount: 'Crop Varieties (This Year)'
    },
    query: {
      planDate: 'Plan Date',
      planDatePlaceholder: 'Enter plan date',
      cropId: 'Crop',
      cropIdPlaceholder: 'Select crop',
      updateTime: 'Updated Time',
      updateTimePlaceholder: 'Select updated time',
      createBy: 'Created By',
      createByPlaceholder: 'Select creator'
    },
    action: {
      detail: 'Details'
    },
    edit: {
      btn: {
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel'
      },
      title: 'Edit Planting Plan',
      locked: 'Read-only',
      detailsTip: 'Only team can be changed (plot / month / period are locked)',
      saveSuccess: 'Planting plan updated',
      lockTip: {
        done: 'Plan is completed; editing not allowed',
        cancelled: 'Plan is cancelled; editing not allowed',
        other: 'Status does not support editing'
      }
    },
    confirm: { del: 'Confirm deleting {count} planting plan(s)?' },
    wizard: {
      title: 'Create Planting Plan',
      backToList: 'Back to List',
      step1: 'Year & Season',
      step2: 'Select Crop',
      step3: 'Plots & Time',
      submit: 'Create Plan',
      cropSearch: 'Search by name / code / variety',
      cropEmpty: 'No crops; please maintain in Crop Management first',
      plotPickerHint: 'Plots grouped by zone; check the plots to plan, then set month, period, teams',
      zoneEmpty: 'No plots; please maintain in Plot Management first',
      selectedSummary: 'Selected: {count} plot(s)',
      resumeConfirm: 'A pending draft is detected. Resume?',
      resumeYes: 'Resume',
      resumeNo: 'Start Fresh',
      tip: {
        step1Required: 'Year and season are required',
        step2Required: 'Please select a crop',
        step3Required: 'Please select at least 1 plot',
        submitSuccess: 'Planting plan created'
      },
      col: {
        plotCode: 'Plot Code',
        plotName: 'Plot Name',
        plotArea: 'Area',
        month: 'Month',
        period: 'Period',
        plantBy: 'Plant Team',
        harvestBy: 'Harvest Team',
        selected: 'Pick',
        selectHint: 'Tick to include this plot'
      },
      placeholder: {
        month: 'Mo.',
        period: 'Early/Mid/Late',
        team: 'Team'
      },
      rotationCount: '{n} rotation plan(s)',
      viewPlotPlans: 'View',
      plotPlan: {
        title: '{plot} ({year}) Plan Details',
        plantTime: 'Plant Time',
        crop: 'Crop',
        earliestHarvestdate: 'Earliest Harvest Date',
        lastHarvestdate: 'Latest Harvest Date',
        plantStatus: 'Planting Status',
        harvestStatus: 'Harvest Status'
      }
    },
    dict: {
      period: { early: 'Early', mid: 'Mid', late: 'Late' }
    },
    detail: {
      title: 'Plan Detail',
      detailsTitle: 'Plot Details',
      missingId: 'Missing plan id'
    },
    gantt: {
      title: 'Harvest Plan Gantt',
      v1Note: 'V1 simplified',
      empty: 'No details; gantt unavailable',
      legend: { plan: 'Plan range', actual: 'Actual' }
    }
  },
  pickPlan: {
    pageTitle: 'Pick Plan',
    field: {
      planYear: 'Plan Year',
      planSeason: 'Season',
      harvestStatus: 'Harvest Status',
      cropName: 'Crop'
    },
    placeholder: {
      planSeason: 'Pick a season',
      harvestStatus: 'Pick a harvest status',
      team: 'Harvest team',
      cropName: 'Select a crop',
      cropNameInput: 'Enter crop name'
    },
    column: {
      planNo: 'Plan No',
      planYear: 'Year',
      planSeason: 'Season',
      crop: 'Crop',
      cropImage: 'Image',
      cropName: 'Crop',
      plotCount: 'Plots',
      planEarliest: 'Earliest Harvest Date',
      planLatest: 'Latest Harvest Date',
      totalAcreage: 'Planted Acreage',
      demandQty: 'Demand (Est.)',
      actualYield: 'Picked (This Year)',
      plotTotalCount: 'Plots (This Year)',
      disasterLoss: 'Disaster Loss (Est.)',
      actualBegin: 'Actual Begin',
      actualEnd: 'Actual End',
      expectedYield: 'Net Expected Yield',
      activityPlotCount: 'Activity Plots',
      planPlantArea: 'Planned Acreage',
      currentPlantedArea: 'Planted (Actual)',
      action: 'Action'
    },
    action: { adjust: 'Adjust' },
    adjust: {
      title: 'Adjust Pick Plan',
      backToList: 'Back',
      tip: 'Set the plan earliest harvest date per plot (plan latest is auto-derived from the crop pick cycle), visitor pick flag and harvest team. Actual harvest start/end are written back by the mini-program and read-only here. Saves immediately.',
      activityYes: 'Visitor',
      activityNo: 'Normal',
      activityOptYes: 'Yes',
      activityOptNo: 'No',
      paramsMissing: 'planId / cropId missing',
      saveSuccess: '{count} rows updated',
      toggleSuccess: 'Updated',
      col: {
        cropName: 'Crop',
        plotCode: 'Plot Code',
        plotName: 'Plot',
        plotArea: 'Area',
        isPick: 'Is Activity',
        harvestStatus: 'Status',
        plantDate: 'Planting Date',
        plantTeam: 'Planting Team',
        planEarliest: 'Earliest Harvest Date',
        planLatest: 'Latest Harvest Date',
        beginHarvestdate: 'Actual Start',
        endHarvestdate: 'Actual End',
        harvestBy: 'Harvest Team',
        standardYield: 'Net Expected Yield (kg)',
        actualYield: 'Actual Yield (kg)',
        lossYield: 'Expected Disaster Loss (kg)'
      },
      filter: {
        isPick: 'Is Activity',
        harvestStatus: 'Status'
      },
      placeholder: {
        isPick: 'Select activity flag',
        harvestStatus: 'Select status'
      },
      action: {
        setSchedule: 'Set Schedule',
        setActivity: 'Set as Activity',
        unsetActivity: 'Unset Activity'
      },
      dialog: {
        title: 'Set Schedule',
        beginDate: 'Start Date',
        endDate: 'End Date',
        beginRequired: 'Please select a start date',
        dateOrder: 'End date must not be before start date'
      }
    }
  },
  pickActivity: {
    pageTitle: 'Pick Activity',
    field: {
      activityDate: 'Activity Date',
      cropName: 'Crop'
    },
    placeholder: {
      activityDate: 'Select activity date',
      crop: 'Select crop',
      cropName: 'Enter crop name'
    },
    column: {
      activityDate: 'Activity Date',
      cropName: 'Crop',
      plotCount: 'Plots',
      todayPickWeight: 'Today Picked (kg)',
      saleWeight: 'Sale (kg)',
      vegFreshWeight: 'Veg Fresh Room (kg)',
      platformWeight: 'Platform (kg)',
      lossWeight: 'Loss (kg)',
      feedWeight: 'Feed (kg)',
      expectedYield: 'Expected Yield (kg)',
      cumulativePickWeight: 'Cumulative Picked (kg)'
    }
  },
  // Dongjiaoshan business modules placeholder
  matPick: {
    tab: {
      'package': 'Packaging',
      whiteBar: 'White Carcass',
      pork: 'Pork',
      vegetable: 'Vegetables',
      egg: 'Eggs',
      dryGood: 'Dry Goods',
      other: 'Other'
    },
    column: {
      productCode: 'Product Code',
      locationName: 'Location',
      productName: 'Product Name',
      currentStock: 'Current Stock',
      productUnit: 'Unit',
      earNo: 'Ear No.',
      whiteBarNo: 'White Bar No.',
      plotCode: 'Plot No.',
      todayPicked: 'Picked Today',
      todayReturned: 'Returned Today',
      todayLoss: 'Loss Today',
      todayFeed: 'Fed Today'
    },
    action: {
      pick: 'Pick Out',
      'return': 'Return In',
      loss: 'Daily Loss',
      feed: 'Feed'
    },
    field: {
      keyword: 'Keyword',
      productName: 'Product Name',
      locationName: 'Location',
      currentStock: 'Current Stock',
      quantity: 'Quantity',
      remark: 'Remark'
    },
    placeholder: {
      keyword: 'Product name / location / ear no. / plot no.',
      remark: 'Enter remark'
    },
    button: {
      cancel: 'Cancel',
      confirm: 'Confirm'
    },
    rule: {
      quantityRequired: 'Quantity is required'
    },
    message: {
      success: 'Operation succeeded'
    }
  },
  stockOverview: {
    action: {
      detail: 'Detail'
    },
    field: {
      dateRange: 'Date Range'
    },
    column: {
      statDate: 'Date',
      productCount: 'Product Count'
    },
    detail: {
      title: 'Stock Detail',
      productName: 'Product Name',
      productNamePlaceholder: 'Enter product name',
      location: 'Location',
      locationPlaceholder: 'Select location',
      search: 'Search',
      reset: 'Reset',
      export: 'Export',
      image: 'Image',
      productCode: 'Product Code',
      productNameCol: 'Product Name',
      productUnit: 'Unit',
      locationCol: 'Location',
      beginStock: 'Begin Stock',
      inboundQty: 'Inbound',
      outboundQty: 'Outbound',
      lossQty: 'Loss',
      feedQty: 'Feed',
      endStock: 'End Stock'
    }
  },
  warehouseStat: {
    search: 'Search',
    reset: 'Reset',
    field: { dateRange: 'Stat Date', monthRange: 'Stat Month', start: 'Start', end: 'End' },
    daily: {
      statDate: 'Stat Date',
      slaughterCount: 'Slaughter Count',
      slaughterWeight: 'Slaughter Weight',
      avgSlaughterWeight: 'Avg Slaughter Weight',
      arriveWeight: 'Arrive Weight',
      slaughterRate: 'Slaughter Rate(%)',
      barTotalWeight: 'Bar Total Weight',
      avgBarWeight: 'Avg Bar Weight',
      barYieldRate: 'Bar Yield Rate(%)',
      cutBarCount: 'Cut Bar Count',
      precoolLoss: 'Precool Loss',
      cutProductWeight: 'Cut Product Weight',
      cutBarWeight: 'Cut Bar Weight',
      cutRate: 'Cut Rate(%)',
      cutLoss: 'Cut Loss',
      vegWeighWeight: 'Veg Weigh Weight',
      vegLoss: 'Veg Loss',
      vegLossRate: 'Veg Loss Rate(%)',
      sendPlatformWeight: 'Send Platform Weight',
      receivePlatformWeight: 'Receive Platform Weight',
      transportLossRate: 'Transport Loss Rate(%)',
      prodPickWeight: 'Prod Pick Weight',
      prodLossWeight: 'Prod Loss Weight',
      prodConsumeWeight: 'Prod Consume Weight',
      netVegLossRate: 'Net Veg Loss Rate(%)'
    },
    crop: {
      statDate: 'Stat Date',
      cropName: 'Crop',
      image: 'Image',
      pickWeight: 'Pick Weight',
      feedWeight: 'Feed Weight',
      vegHandleRate: 'Veg Handle Rate(%)',
      receiveWeight: 'Receive Weight',
      sendPlatformWeight: 'Send Platform Weight',
      transportLossRate: 'Transport Loss Rate(%)',
      outWeight: 'Out Weight',
      netVegLossRate: 'Net Veg Loss Rate(%)'
    },
    monthly: {
      statMonth: 'Stat Month',
      slaughterCount: 'Slaughter Count',
      slaughterRate: 'Slaughter Rate(%)',
      barYieldRate: 'Bar Yield Rate(%)',
      cutYieldRate: 'Cut Yield Rate(%)'
    }
  },
  lossOverview: {
    action: {
      detail: 'Detail'
    },
    field: {
      dateRange: 'Loss Date'
    },
    column: {
      lossDate: 'Date',
      productCount: 'Loss Product Count'
    },
    detail: {
      title: 'Daily Loss Detail',
      productName: 'Product Name',
      productNamePlaceholder: 'Enter product name',
      lossType: 'Loss Type',
      lossTypePlaceholder: 'Select loss type',
      search: 'Search',
      reset: 'Reset',
      lossDate: 'Record Time',
      image: 'Image',
      productCode: 'Product Code',
      productNameCol: 'Product Name',
      productUnit: 'Unit',
      lossTypeCol: 'Loss Type',
      lossWeight: 'Loss Weight'
    }
  },
  feedRecord: {
    action: {
      search: 'Search',
      reset: 'Reset',
      export: 'Export'
    },
    field: {
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      cropName: 'Crop',
      cropNamePlaceholder: 'Enter crop name',
      feedType: 'Source',
      feedTypePlaceholder: 'Select source'
    },
    column: {
      feedDate: 'Date',
      cropImage: 'Crop Image',
      cropName: 'Crop Name',
      feedWeight: 'Feed Weight',
      feedType: 'Source',
      operator: 'Operator'
    }
  },
  djs: {
    placeholder: {
      title: '{domain} Module',
      subtitle: 'Placeholder — business features will be implemented in later tickets'
    },
    oss: {
      upload: 'Upload',
      uploading: 'Uploading...',
      uploadSuccess: 'Upload succeeded',
      uploadFailed: 'Upload failed',
      retry: 'Retry',
      remove: 'Remove',
      fileTooLarge: 'File exceeds the {max}MB limit',
      typeNotAllowed: 'File type not allowed; allowed: {types}',
      reachLimit: 'Limit reached: {limit} files',
      preview: 'Preview',
      uploadTip: 'Supports {types}; up to {max}MB each'
    },
    warehouse: {
      pigBurn: {
        title: 'Singe Records',
        burnId: 'Singe No',
        earNo: 'Pig Ear No',
        burnTime: 'Singe Time',
        arriveWeight: 'Arrive Weight (kg)',
        burnWeight: 'Post-Singe Weight (kg)',
        lossWeight: 'Loss (kg)',
        burnStatus: 'Status',
        operator: 'Operator',
        location: 'Location',
        remark: 'Remark'
      },
      pigCut: {
        title: 'Pig Cut Records',
        cutId: 'Cut No',
        barId: 'White-Bar No',
        whiteBarNo: 'White-Bar Serial',
        earNo: 'Pig Ear No',
        pickupTime: 'Pickup Time',
        cutStartTime: 'Cut Start Time',
        cutDoneTime: 'Cut Done Time',
        pickupWeight: 'Pickup Weight (kg)',
        dripLoss: 'Drip Loss (kg)',
        acidRemoveMinutes: 'Acid-Remove (min)',
        cutStatus: 'Status',
        outType: 'Out Type',
        operator: 'Operator',
        location: 'Frozen Location',
        isHalf: 'Half Bar?',
        remark: 'Remark',
        outsourceBar: 'Outsourced Bar',
        supplierName: 'Supplier',
        headSkinYieldRate: 'Head-Skin Yield',
        whiteBarYieldRate: 'White-Bar Yield',
        precoolLossWeight: 'Pre-cool Loss (kg)',
        precoolLossRate: 'Pre-cool Loss Rate',
        coldStorageMinutes: 'Cold Storage (min)',
        cutProductTotalWeight: 'Cut Total (kg)',
        cutLossWeight: 'Cut Loss (kg)',
        pickupAction: 'Pickup Bar',
        cutOutAction: 'Cut Out',
        cutDoneAction: 'Cut Done',
        selectBar: 'Available Bar',
        selectBarPlaceholder: 'Select an available white-bar',
        selectLocation: 'Select frozen location',
        partItems: 'Cut Parts',
        selectProduct: 'Cut Product',
        partWeight: 'Weight (kg)',
        partSpec: 'Spec',
        addPart: '+ Add Part',
        partItemsRequired: 'Please fill at least one valid product and weight',
        proof: 'Proof',
        dripLossRequired: 'Please enter drip loss',
        dripLossAutoHint: 'Drip loss is auto-calculated (white-bar in-weight − out-weight); no manual entry needed',
        pickupSuccess: 'Bar picked up',
        cutOutSuccess: 'Cut-out submitted',
        cutDoneSuccess: 'Cut completed'
      },
      vegHandle: {
        title: 'Vegetable Handle',
        plot: 'Plot',
        crop: 'Crop',
        pickStartTime: 'Pick Start Time',
        pickEndTime: 'Pick End Time',
        pickedWeight: 'Picked (kg)',
        handledWeight: 'Handled (kg)',
        feedWeight: 'Feed (kg)',
        sendPlatformWeight: 'Platform (kg)',
        stockInWeight: 'Stock-In (kg)',
        lossWeight: 'Loss (kg)',
        handleStatus: 'Status',
        statusPending: 'Pending',
        statusProcessing: 'Processing',
        statusDone: 'Done',
        recordType: 'Record Type',
        recordTypePick: 'Pick',
        recordTypeHandle: 'Handle',
        recordWeight: 'Record Weight (kg)',
        handleTarget: 'Target',
        location: 'Stock-In Location',
        operator: 'Operator',
        handleTime: 'Handle Time',
        remark: 'Remark',
        recordsDialogTitle: 'Handle Records',
        detail: 'Detail'
      },
      stockFlow: {
        title: 'Stock Flow',
        flowNo: 'Flow No',
        flowDate: 'Date',
        flowType: 'Type',
        inoutType: 'IN/OUT',
        matType: 'Mat Type',
        productName: 'Product',
        productCode: 'Code',
        belongType: 'Category',
        changeQuantity: 'Qty',
        productUnit: 'Unit',
        location: 'Location',
        earNo: 'Ear No',
        plot: 'Plot',
        stockOutDest: 'Out Dest',
        operator: 'Operator',
        remark: 'Remark',
        adjust: 'Adjust',
        adjustHint: 'Flow adjust (D11)',
        adjustNotImpl: 'Stock adjustment will be available in a future release — flowNo={flowNo}'
      },
      matPack: {
        title: 'Package Flow'
      },
      purchaseIn: {
        title: 'Purchase In',
        productName: 'Product Name',
        productCode: 'Product Code',
        buyClass: 'Category',
        supplier: 'Supplier',
        storeLocation: 'Warehouse',
        productThumb: 'Image',
        unit: 'Unit',
        productSpec: 'Spec',
        currentStock: 'Current Stock',
        lastInTime: 'Last Inbound Time',
        lastPurchaser: 'Purchaser',
        monthInTotal: 'Month Total Inbound',
        inbound: 'Purchase In',
        inboundQuantity: 'Inbound Qty'
      },
      packEntry: {
        meatTitle: 'Meat Packing',
        otherTitle: 'Product Packing',
        vegTitle: 'Vegetable Packing',
        giftTitle: 'Gift Box Packing',
        cutTitle: 'White Bar Cutting',
        otherProductTab: 'Products',
        otherGiftTab: 'Gift Box',
        source: 'Source Product',
        sourceVeg: 'Source Plot/Vegetable',
        plot: 'Plot',
        noPlotInfo: 'No plot info',
        vegMaterialFallback: 'No products matched the picked materials; showing all vegetable products',
        noPlotSource: 'No packable plot source available',
        sourcePlaceholder: 'Select source in-house product',
        sourceRequired: 'Source in-house product is required',
        targetProduct: 'Target Product',
        targetProductPlaceholder: 'Select target product',
        targetProductRequired: 'Target product is required',
        giftBox: 'Gift Box',
        packBoxCount: 'Box Count',
        packBoxCountRequired: 'Box count is required and ≥ 1',
        box: 'box(es)',
        productWeight: 'Weight',
        productWeightRequired: 'Weight is required and > 0',
        productUnit: 'Unit',
        productUnitRequired: 'Unit is required',
        unitPiece: 'piece',
        productSpec: 'Spec',
        productSpecPlaceholder: 'e.g. 250g/pack',
        location: 'Stock Location',
        locationPlaceholder: 'Select location',
        locationRequired: 'Location is required',
        store: 'Demand Store',
        storePlaceholder: 'Select demand store',
        sendDest: 'Send To',
        sendDestPlatform: 'Shipping Dock',
        sendDestMail: 'Mail',
        sendDestGift: 'Gift Box',
        demandStores: 'Store Demand',
        selectProductFirst: 'Select a product to load store demand',
        copiesUnit: '',
        packCopies: 'Pack Portions',
        copiesExceed: 'Exceeds remaining packable portions ({max})',
        demandCopiesExceed: 'Exceeds remaining store demand portions ({max})',
        storeRequired: 'Please select a store first',
        storeDemandFulfilled: 'This store\'s demand is fully packed',
        remainingCopiesLabel: 'Remaining packable copies',
        noDemand: 'No pending store demand for this product',
        confirmPrintTrace: 'Confirm & Print Trace Code',
        traceCodeTitle: 'Trace Code',
        print: 'Print',
        noTraceCode: 'Submitted, but no trace code generated (pork chain has no trace-code entry yet)',
        proof: 'Proof Images',
        remark: 'Remark',
        submitSuccess: 'Packing submitted',
        packFailedTitle: 'Pack failed',
        cannotSubmit: 'Cannot submit',
        cutHint: 'Pick a picked cut record, enter cut-product weights and confirm inbound; click "Finish Cut" when all are weighed.',
        cutRecord: 'Cut Record (Ear No)',
        cutRecordPlaceholder: 'Select a picked/cutting record',
        cutRecordRequired: 'Cut record is required',
        parts: 'Cut Products',
        cutProduct: 'Cut Product',
        cutProductPlaceholder: 'Select cut product',
        cutPart: 'Part',
        cutPartPlaceholder: 'Select part',
        cutPartRequired: 'Part is required',
        addPart: 'Add Cut Product',
        partsRequired: 'Enter at least one cut-product weight',
        confirmCutOut: 'Confirm Inbound',
        cutOutSuccess: 'Cut output stored',
        cutOutExceed: 'Cut-product weight exceeds the remaining cuttable weight ({remaining}kg left)',
        finishCut: 'Finish Cut',
        finishCutShort: 'Finish Cut',
        finishCutConfirm: 'Confirm this white bar has finished cutting?',
        dripLoss: 'Drip Loss',
        dripLossRequired: 'Enter drip loss (0 if none)',
        dripLossAutoHint: 'Drip loss is auto-calculated (white-bar in-weight − out-weight); no manual entry needed',
        finishCutSuccess: 'White bar cut finished',
        pickupToCut: 'Pick to Cutting',
        pickupToShip: 'Pick for Shipment',
        bar: 'White Bar (Ear No)',
        barPlaceholder: 'Select an available bar',
        barRequired: 'Bar is required',
        cutWorkshop: 'Out Location (Cutting)',
        isHalf: 'Cut Mode',
        whole: 'Whole',
        half: 'Half',
        confirmPickup: 'Confirm Out',
        pickupSuccess: 'Bar picked to cutting',
        barCardTitle: 'White Bar (Whole)',
        whiteBarNoLabel: 'Bar Serial No.',
        inTimeLabel: 'Inbound Time',
        agingDurationLabel: 'Aging Duration',
        inWeightLabel: 'Inbound Weight',
        marketingWeightLabel: 'Marketing Weight',
        outputWeightLabel: 'Output Weight',
        whiteBarWeightShort: 'Carcass wt ',
        remainWeightLabel: 'Remaining Weight',
        burnProductsLabel: 'Singe Output',
        noEarSource: 'No pork source ear No. available for packing',
        pickupWeightExceed: 'Pickup weight must not exceed the carcass marketing weight ({weight}kg)',
        vegWeightExceed: 'Pack weight exceeds requisition remaining weight ({remain}kg), please re-weigh',
        pigAssignLabel: 'Pig Assignment',
        noBars: 'No bars available',
        agingHour: 'h',
        agingMinute: 'm',
        confirmShipOut: 'Confirm Ship Out',
        shipOutSuccess: 'White bar / pork shipped out',
        specLabel: 'Spec',
        demandLabel: 'Demand',
        materialStockLabel: 'Requisition remaining weight',
        packDone: 'Packed',
        noProduct: 'No products',
        operation: 'Operation',
        weightPlaceholder: 'Product weight',
        sendType: 'Send method',
        earNo: 'Pig ear tag',
        earNoShort: 'Ear tag',
        remainShort: 'Remaining',
        inLocation: 'Inbound location',
        noCuttable: 'No carcasses to split',
        cutProductRequired: 'Please select a cut product',
        cutStatusPendingPickup: 'Pending pickup',
        cutStatusPicked: 'Picked',
        cutStatusCutting: 'Weighing',
        cutStatusDone: 'Done',
        outLocation: 'Out Location',
        outToCut: 'Cutting Workshop',
        outToShip: 'Shipping Dock',
        outToWarehouse: 'Warehouse Out',
        outDest: 'Out Destination',
        outDestPlaceholder: 'Select out destination',
        outDestRequired: 'Please select out destination',
        warehouseOutSuccess: 'White-bar/pork warehouse-out done',
        outLocationRequired: 'Please select out location',
        packNo: 'Pack No',
        pickupPageTitle: 'White-bar Pickup',
        shipSourceNotFound: 'No shippable source for this white-bar (confirm singeing & in-stock done)',
        shipStore: 'Ship Store',
        shipStorePlaceholder: 'Select ship store',
        shipStoreRequired: 'Please select ship store',
        vegDailyLoss: 'Daily Loss',
        vegLossPicked: 'Issued',
        vegLossPacked: 'Packed',
        vegLossReturned: 'Returned',
        vegLossFeed: 'Feed',
        vegLossValue: 'Loss',
        vegLossUnit: 'kg',
        vegLossHint: 'Loss = Issued (material pick-out) − Packed (veg pack-in) − Returned − Feed (by calendar day; Feed comes from the material-issue module, absent in V1 so always 0)'
      },
      shipment: {
        title: 'Shipment',
        shipmentNo: 'Shipment No',
        shipDate: 'Ship Date',
        productType: 'Type',
        demandId: 'Demand',
        storeId: 'Store',
        shipQuantity: 'Quantity',
        shipUnit: 'Unit',
        deliverType: 'Deliver Type',
        shipmentStatus: 'Status',
        checker: 'Checker',
        checkTime: 'Check Time',
        remark: 'Remark'
      },
      return: {
        title: 'Return Management',
        returnNo: 'Return No',
        applyTime: 'Apply Time',
        returnDate: 'Return Date',
        returnCategory: 'Category',
        storeId: 'Store',
        productId: 'Product ID',
        productName: 'Product Name',
        returnProduct: 'Return Product',
        returnProductCode: 'Product Code',
        productUnit: 'Unit',
        productMaterialName: 'Material Name',
        weightDiff: 'Weight Diff',
        returnWeight: 'Return Weight',
        confirmWeight: 'Confirm Weight',
        confirmUser: 'Confirm User',
        confirmTime: 'Confirm Time',
        isConfirm: 'Confirmed',
        returnReason: 'Reason',
        returnDirection: 'Direction',
        returnStatus: 'Status',
        remark: 'Remark',
        confirm: 'Confirm',
        confirmed: 'Confirmed',
        productIdRequired: 'Product ID is required',
        returnWeightRequired: 'Return weight is required and must be > 0',
        confirmWeightRequired: 'Confirm weight is required and must be > 0',
        dialogAddTitle: 'New Return',
        dialogEditTitle: 'Edit Return',
        confirmDialogTitle: 'Confirm Return',
        confirmStockHint: 'store_to_warehouse direction: stock_flow (return_in) will be triggered',
        confirmPlaceholderHint: 'Other directions: V1 placeholder, no stock_flow trigger',
        addSuccess: 'Return added',
        editSuccess: 'Return updated',
        deleteConfirm: 'Delete return [{no}]?',
        deleteSuccess: 'Return deleted',
        confirmSuccess: 'Return confirmed',
        viewDetail: 'View Detail',
        productKindCount: 'Return Kinds',
        returnWeightTotal: 'Return Weight',
        confirmWeightTotal: 'Confirmed Weight',
        weightDiffTotal: 'Weight Diff',
        detailDialogTitle: 'Return Detail'
      },
      check: {
        checkId: 'Check No.',
        locationName: 'Location',
        checkWarehouse: 'Location',
        checkDate: 'Check Date',
        checkStatus: 'Status',
        lineCount: 'Lines',
        goodsCount: 'Stock Products',
        abnormalCount: 'Product Abnormal',
        diffSum: 'Net Diff',
        createTime: 'Created',
        detail: 'Detail',
        complete: 'Complete',
        cancel: 'Cancel',
        createTitle: 'New Stock Check',
        lockHint: 'Creating will lock this location; in/out-bound blocked during check',
        locationPlaceholder: 'Select location',
        locationRequired: 'Location is required',
        checkDatePlaceholder: 'Select check date',
        checkDateRequired: 'Check date is required',
        remark: 'Remark',
        detailTitle: 'Check Detail',
        productName: 'Product',
        productCode: 'Product Code',
        productUnit: 'Unit',
        lossWeight: 'Loss Weight (kg)',
        sysStock: 'Stock Before Count',
        checkStock: 'Actual Qty',
        diffStock: 'Diff Qty',
        checkResultType: 'Result',
        diffReason: 'Diff Reason',
        checkBy: 'Checked By',
        createSuccess: 'Stock check created, location locked',
        completeConfirm: 'Complete check {no}? Diff flows written and stock updated',
        completeSuccess: 'Check completed',
        cancelConfirm: 'Cancel check {no}? Only unlock location, stock unchanged',
        cancelSuccess: 'Check cancelled'
      },
      flowIn: {
        flowNo: 'Flow No.',
        flowDate: 'Time',
        flowType: 'Type',
        inMode: 'Inbound Mode',
        matType: 'Material Type',
        productType: 'Product Type',
        productCode: 'Product Code',
        productName: 'Product',
        blockNo: 'Block No.',
        belongType: 'Category',
        changeQuantity: 'In Quantity',
        productUnit: 'Unit',
        location: 'In Location',
        earNo: 'Ear No.',
        operator: 'Operator',
        createTime: 'Created',
        remark: 'Remark'
      },
      flowOut: {
        flowNo: 'Flow No.',
        flowDate: 'Time',
        flowType: 'Type',
        outMode: 'Outbound Mode',
        matType: 'Material Type',
        productType: 'Product Type',
        stockOutDest: 'Out Dest',
        productCode: 'Product Code',
        productName: 'Product',
        blockNo: 'Block No.',
        belongType: 'Category',
        changeQuantity: 'Out Quantity',
        productUnit: 'Unit',
        location: 'Out Location',
        earNo: 'Ear No.',
        operator: 'Operator',
        createTime: 'Created',
        remark: 'Remark'
      },
      whiteBarShipment: {
        produceTime: 'Ship Date',
        productCode: 'Product Code',
        productName: 'Product',
        earNo: 'Ear No.',
        outMethod: 'Out Method',
        outDest: 'Out Dest',
        productWeight: 'Out Quantity',
        productUnit: 'Unit',
        operator: 'Operator'
      },
      outsourcePig: {
        title: {
          add: 'New Outsourced Pig'
        },
        column: {
          purchaseDate: 'Purchase Date',
          arriveTime: 'Arrival Time',
          pigMarkNo: 'Pig Mark No.',
          pigWeight: 'Pig Weight',
          supplier: 'Supplier',
          buyer: 'Buyer'
        },
        field: {
          pigMarkNo: 'Pig Mark No.',
          purchaseDate: 'Purchase Date',
          slaughterDate: 'Slaughter Date',
          arriveTime: 'Arrival Time',
          pigWeight: 'Pig Weight',
          supplier: 'Supplier',
          buyer: 'Buyer'
        },
        placeholder: {
          pigMarkNo: 'Enter pig mark no.',
          purchaseDate: 'Select purchase date',
          slaughterDate: 'Select slaughter date',
          arriveTime: 'Select arrival time',
          pigWeight: 'Enter pig weight',
          supplier: 'Select supplier',
          buyer: 'Select buyer'
        },
        rule: {
          purchaseDate: {
            required: 'Purchase date is required'
          },
          slaughterDate: {
            required: 'Slaughter date is required'
          },
          pigWeight: {
            required: 'Pig weight is required'
          },
          supplier: {
            required: 'Supplier is required'
          }
        },
        confirm: {
          del: 'Delete this outsourced pig record?'
        }
      },
      production: {
        title: {
          itemList: 'Product Items'
        },
        column: {
          produceDate: 'Produce Date',
          produceNo: 'Produce No.',
          productName: 'Product Name',
          belongType: 'Category',
          productSpec: 'Spec',
          productSort: 'Product Seq',
          productWeight: 'Product Weight',
          productUnit: 'Product Unit',
          materialConsume: 'Material Consumed',
          materialConsumeQty: 'Material Consumed',
          materialName: 'Material',
          materialUnit: 'Material Unit',
          itemCount: 'Items',
          damageCount: 'Damaged',
          storeDemandCount: 'Stores in Demand',
          hasDamage: 'Has Damage',
          isDamaged2: 'Damaged',
          storeName: 'Store',
          deliverDest: 'Destination',
          packStatus: 'Pack Status',
          earNo: 'Source Ear No.',
          plotName: 'Source Plot',
          produceTime: 'Produce Time',
          isDeliveryCheck: 'Checked',
          isArrivalConfirm: 'Arrived',
          createByName: 'Operator',
          remark: 'Remark'
        },
        dest: {
          platform: 'Platform',
          gift: 'Gift Box'
        },
        button: {
          traceCode: 'Trace Code'
        },
        text: {
          noTrace: 'No trace code'
        },
        damage: {
          view: 'View Damage',
          viewTitle: 'Damage Detail',
          evidence: 'Damage Evidence',
          noEvidence: 'No damage evidence images',
          remark: 'Damage Remark',
          loading: 'Loading…'
        }
      }
    }
  },
  // Warehouse dashboard
  warehouse: {
    dashboard: {
      title: 'Warehouse Overview',
      demandBar: "Today's Demand",
      productionBar: "Today's Production",
      lastRefresh: 'Last refresh {time}',
      refresh: 'Refresh',
      // DJS-FIX-WMS-RALN dashboard prototype-align keys
      kpiDemandPork: 'Pork Products',
      kpiDemandOffal: 'Offal Products',
      kpiDemandEgg: 'Egg Demand',
      kpiDemandDryGood: 'Dry Goods Demand',
      kpiDemandVegetableKinds: 'Veg Demand Kinds',
      kpiSlaughterPig: 'Slaughter Pigs',
      kpiWhiteBarWeight: 'White-bar Total Weight',
      kpiCutBar: 'Cut White-bars',
      kpiCutProductWeight: 'Cut Pork Product Weight',
      kpiVegReceiveKinds: 'Veg Received Kinds',
      kpiVegReceiveWeight: 'Veg Received Weight',
      kpiVegProductKinds: 'Veg Product Kinds',
      kpiVegProductWeight: 'Veg Product Weight',
      returnTabPork: 'Pork',
      returnTabVeg: 'Vegetable',
      seriesWhiteBarHead: 'White-bar Heads',
      seriesPorkWeight: 'Pork Product Weight',
      seriesVegWeight: 'Veg Product Weight',
      seriesPorkLoss: 'Pork Loss Rate',
      seriesVegLoss: 'Veg Loss Rate',
      unitHead: 'head',
      unitKg: 'kg',
      unitKind: 'kinds',
      unitPiece: 'pcs',
      unitBox: 'box',
      // Bar 1: today demand (6 metrics)
      kpiDemandWhiteBar: 'White-bar Demand',
      kpiDemandVegetable: 'Vegetable Demand',
      kpiDemandGiftBox: 'Gift-box Demand',
      kpiDemandOther: 'Other Demand',
      kpiDemandOrders: 'Demand Orders',
      kpiDemandTotal: 'Total Demand',
      // Bar 2: today production (5 metrics)
      kpiProductionCount: 'Production Count',
      kpiProductionWeight: 'Production Weight (kg)',
      kpiInbound: 'Inbound Count',
      kpiOutbound: 'Outbound Count',
      kpiLoss: 'Loss Qty (kg)',
      // 6 charts
      chartDemandPie: 'Demand by Segment',
      chartReturnRing: 'Return Composition',
      chartProductionTrend: 'Production Trend (last 7 days, kg)',
      chartCheckPie: 'Stock-check Result',
      chartLocationRing: 'Location Health (this month)',
      chartLossTrend: 'Loss Trend (last 7 days, kg)',
      seriesProduction: 'Production Weight',
      seriesLoss: 'Loss Qty',
      noData: 'No data',
      // Location overview
      locationOverview: 'Location Overview (Top 20)',
      colLocation: 'Location',
      colType: 'Type',
      colStock: 'Current Stock',
      colStatus: 'Status',
      statusNormal: 'Normal',
      statusAbnormal: 'Abnormal',
      emptyLocation: 'No location data'
    }
  },
  demand: {
    not_found_msg: 'Demand not found or deleted',
    productType: {
      white_bar: 'White Bar',
      vegetable: 'Vegetable',
      gift_box: 'Gift Box',
      other: 'Other'
    },
    field: {
      demandNo: 'Demand No',
      demandDate: 'Demand Date',
      'demandDate.required': 'Demand date is required',
      storeId: 'Store',
      'storeId.required': 'Store is required',
      productId: 'Product ID',
      'productId.required': 'Product is required',
      productName: 'Product Name',
      'productName.required': 'Product name is required',
      searchProductName: 'Demand Product',
      productType: 'Demand Product Type',
      storeName: 'Demand Store',
      productSpec: 'Spec',
      demandQuantity: 'Quantity',
      'demandQuantity.required': 'Quantity is required',
      productUnit: 'Unit',
      'productUnit.required': 'Unit is required',
      rawMaterial: 'Raw Material',
      materialQty: 'Material Qty',
      demandRemark: 'Remark',
      demandExplain: 'Explanation',
      demandStatus: 'Demand Status',
      expectedArriveDate: 'Expected Arrive',
      beginDate: 'Begin Date',
      endDate: 'End Date',
      demandDateRange: 'Demand Date',
      productionDestination: 'Production Destination'
    },
    productionDestination: {
      white_bar: 'Cutting + Meat Packing',
      vegetable: 'Vegetable Packing',
      gift_box: 'Gift-box Packing',
      other: 'Other Packing'
    },
    column: {
      demandNo: 'Demand No',
      demandDate: 'Demand Date',
      productType: 'Product Type',
      storeId: 'Store',
      productName: 'Product',
      giftSku: 'Gift SKU',
      productSpec: 'Spec',
      demandQuantity: 'Quantity',
      productUnit: 'Unit',
      rawMaterial: 'Raw Material',
      demandStatus: 'Demand Status',
      shippedCount: 'Shipped',
      storeCount: 'Stores',
      materialQty: 'Material Qty',
      confirmRate: 'Confirm Rate',
      lastConfirmTime: 'Last Confirm Time',
      expectedArriveDate: 'Expected',
      createByName: 'Creator',
      createTime: 'Created',
      actions: 'Actions'
    },
    groupStatus: {
      PENDING: 'Pending',
      ALL_CONFIRMED: 'All Confirmed',
      PARTIAL: 'Partial'
    },
    placeholder: {
      demandNoAuto: 'Auto-generated on save',
      storeId: 'Select store',
      productId: 'Select product (filtered by demand type)',
      demandQuantity: 'Enter quantity',
      productUnit: 'e.g. head / kg / box',
      rawMaterial: 'e.g. "need 5 pigs"',
      demandExplain: 'e.g. "1 pig per day to mining site by 25th"'
    },
    form: {
      addTitle: 'Add Demand',
      editTitle: 'Edit Demand'
    },
    action: {
      submit: 'Submit',
      confirm: 'Confirm',
      startProduction: 'Start Prod',
      cancel: 'Cancel',
      assignPig: 'Assign Pig',
      history: 'History',
      detail: 'Detail',
      viewDemand: 'View Demand',
      selectAllPage: 'Select all (page)',
      batchConfirm: 'Batch confirm demand'
    },
    detail: {
      title: 'Product Demand Detail',
      storeCount: '{count} stores',
      storeName: 'Store',
      demandQuantity: 'Demand Qty',
      demandCount: 'Demand Count',
      empty: 'No store demand'
    },
    confirm: {
      del: 'Delete {count} demand(s)? Only DRAFT/CANCELLED allowed',
      submit: 'Submit demand {no} to warehouse review?',
      confirm: 'Lock demand {no}?',
      startProduction: 'Start production for demand {no}? Cannot cancel after.',
      batchConfirm: 'Lock {count} selected demand group(s)? Confirms all pending store demands under them'
    },
    message: {
      batchConfirmSuccess: 'Batch confirmed {count} demand(s)',
      batchConfirmPartial: 'Batch confirm done: {success} succeeded, {failed} failed'
    },
    prompt: {
      cancelRemark: 'Cancel reason (optional)',
      cancelRemarkPh: 'e.g. customer withdrew / out of stock'
    },
    summary: {
      loading: 'Loading…',
      loadFailed: 'Failed to load summary, please refresh',
      whiteBar: '{count} fattening pigs available',
      vegetable: 'Planting on {plot} plots / expected yield {yield} kg / earliest pick {pickDate} / current stock {stock} kg',
      giftBox: 'Current gift-box stock: {count}',
      other: 'Current raw-material stock: {stock} kg'
    },
    assignPig: {
      title: 'Assign Pigs - {no} (need {required})',
      selectedTip: 'Selected {selected} / {required}',
      confirmBtn: 'Confirm ({count})',
      assignSuccess: 'Assigned {count} pigs',
      assignedTitle: 'Assigned ({count})',
      overLimit: 'At most {required} pigs allowed, please uncheck extras first',
      emptyAvailable: 'No available fattening pigs',
      confirmRemove: 'Remove ear no {earNo}?',
      column: {
        earNo: 'Ear No',
        pigSex: 'Sex',
        pigBreed: 'Breed/Strain',
        ageDays: 'Age (days)',
        lastBackfat: 'Last Backfat (mm)'
      }
    },
    history: {
      title: 'Status Transition History',
      operator: 'Operator',
      remark: 'Remark',
      empty: 'No status changes yet'
    },
    kpi: {
      pigDemand: 'Today Pig Demand',
      assigned: 'Assigned',
      vegDemand: 'Today Veg Demand',
      otherDemand: 'Other Demand',
      unitHead: 'head',
      unitSpecies: 'species',
      unitItem: 'item'
    },
    cart: {
      title: 'Add {type} Demand',
      titleGeneric: 'Add Demand',
      candidateTitle: 'Product Selection',
      cartTitle: 'Demand Products',
      searchPlaceholder: 'Search product name / code',
      emptyProducts: 'No selectable products for this category',
      emptyCart: 'Cart is empty, add products from the left',
      qtyToAdd: 'Quantity',
      opAdd: 'Action',
      add: 'Add',
      remove: 'Remove',
      itemCount: '{count} item(s)',
      qtyRequired: 'Enter a quantity before adding',
      submit: 'Submit Demand ({count})',
      submitAllSuccess: '{count} demand(s) submitted',
      submitPartial: '{ok} succeeded, {fail} failed: {names}. Please resubmit the failed items',
      submitAllFailed: 'Submit failed: {names}'
    },
    // Demand confirm page (0613-11, drilled from demand list "View Demand")
    confirmPage: {
      title: 'Demand Confirm',
      yes: 'Yes',
      no: 'No',
      empty: 'No demand orders',
      confirmDelete: 'Delete this demand order? It will be set to the DELETED terminal state',
      filter: {
        productName: 'Product Name',
        productNamePh: 'Enter product name',
        storeId: 'Store',
        storePh: 'Select store',
        demandStatus: 'Demand Status',
        statusPh: 'Select demand status'
      },
      // Store-view 4-state trimmed status filter (values map to raw warehouse codes; see confirm/index.vue)
      storeStatus: {
        SUBMITTED: 'To Confirm',
        CONFIRMED: 'Confirmed',
        SHIPPED: 'Shipped',
        ARRIVED: 'Arrived'
      },
      pigTip: {
        prefix: 'Available pigs for outbound',
        suffix: ''
      },
      column: {
        productName: 'Product Name',
        productSpec: 'Spec',
        demandDate: 'Demand Date',
        demandQuantity: 'Total Quantity',
        productUnit: 'Unit',
        storeName: 'Store',
        demandRemark: 'Remark',
        demandStatus: 'Status',
        confirmerTime: 'Final Confirm Time',
        demandConfirmer: 'Confirmed By',
        pigAssigned: 'Pig Assigned',
        actions: 'Action'
      },
      action: {
        adjust: 'Adjust'
      },
      adjust: {
        title: 'Adjust',
        demandQuantity: 'Quantity'
      }
    }
  },
  // Store-side demand (STR-DEMAND-001, reuses WMS demand table)
  storeDemand: {
    not_found_msg: 'Demand not found or deleted',
    productType: {
      white_bar: 'White bar',
      vegetable: 'Vegetable',
      gift_box: 'Gift box',
      other: 'Other'
    },
    tab: {
      white_bar: 'White bar',
      pork: 'Pork',
      vegetable: 'Vegetable',
      dry_good: 'Dry goods',
      egg: 'Egg',
      gift_box: 'Gift box',
      other: 'Other'
    },
    create: {
      productType: 'Product type',
      operation: 'Operation',
      cartTitle: 'Demand products',
      cartEmpty: 'Select products on the left and enter quantities',
      emptyProducts: 'No products under this type',
      productName: 'Product name',
      productImage: 'Product Image',
      availablePigs: 'Available pigs',
      unit: 'Unit',
      demandQuantity: 'Quantity',
      mailing: 'Personal mailing',
      remark: 'Remark:',
      remarkPh: 'Enter remark',
      confirm: 'Confirm Order',
      spec: 'Spec',
      materialStock: 'Raw Material Stock',
      remainPlot: 'Remaining Plots',
      expectYield: 'Expected Yield',
      earliestPick: 'Earliest Pick Date',
      latestPick: 'Latest Pick Date',
      demandStore: 'Demand Store',
      demandStorePh: 'Select store',
      productNamePh: 'Enter product name',
      search: 'Search'
    },
    cart: {
      title: 'New Demand'
    },
    filter: {
      store: 'Store',
      storePlaceholder: 'Select store'
    },
    tip: {
      selectStoreFirst: 'Select a store at the top before adding a demand',
      mailingListPending: 'Mailing sub-address list API is not available yet'
    },
    field: {
      demandNo: 'Demand No.',
      demandDate: 'Demand date',
      'demandDate.required': 'Demand date is required',
      productDemandDate: 'Product Demand Date',
      storeId: 'Store',
      'storeId.required': 'Store is required',
      productId: 'Product',
      'productId.required': 'Product is required',
      productName: 'Product name',
      'productName.required': 'Product name is required',
      productType: 'Demand Product Type',
      productSpec: 'Spec',
      demandQuantity: 'Quantity',
      'demandQuantity.required': 'Quantity is required',
      productUnit: 'Unit',
      'productUnit.required': 'Unit is required',
      rawMaterial: 'Raw material',
      materialQty: 'Material qty',
      demandRemark: 'Remark',
      demandExplain: 'Explanation',
      demandStatus: 'Status',
      expectedArriveDate: 'Expected arrival',
      beginDate: 'Begin date',
      endDate: 'End date'
    },
    column: {
      demandNo: 'Demand No.',
      demandDate: 'Demand date',
      productName: 'Product name',
      productSpec: 'Spec',
      demandQuantity: 'Quantity',
      productUnit: 'Unit',
      demandType: 'Demand type',
      demandRemark: 'Remark',
      expectedWeight: 'Expected weight',
      demandStatus: 'Status',
      damagedCount: 'Damaged qty',
      confirmerTime: 'Confirmed at',
      demandConfirmer: 'Confirmed by',
      expectedArriveDate: 'Expected arrival',
      createTime: 'Created',
      actions: 'Actions'
    },
    placeholder: {
      demandNoAuto: 'Auto-generated after submit',
      storeId: 'Select store',
      productId: 'Select product (filtered by type)',
      demandQuantity: 'Enter quantity',
      productUnit: 'e.g. head / kg / box',
      rawMaterial: 'e.g. "need 5 pigs"',
      demandExplain: 'e.g. "deliver 1 pig daily to the mine before the 25th"'
    },
    form: {
      addTitle: 'New demand',
      editTitle: 'Edit demand',
      detailTitle: 'Demand detail'
    },
    action: {
      edit: 'Edit',
      cancel: 'Withdraw',
      assignPig: 'Assign pigs',
      receive: 'Confirm receipt',
      detail: 'Detail',
      del: 'Delete',
      viewList: 'View List',
      productDetail: 'Product detail',
      selectAllPage: 'Select all (page)',
      batchReceive: 'Batch confirm arrival'
    },
    damage: {
      detailTitle: 'Product detail',
      markTitle: 'Mark as damaged',
      editTitle: 'Edit damage evidence',
      markAction: 'Mark damaged',
      editAction: 'Edit',
      produceNo: 'Produce No.',
      materialName: 'Material name',
      materialConsume: 'Material qty',
      materialUnit: 'Material unit',
      isDamaged: 'Damaged',
      earNo: 'Source ear No.',
      plotName: 'Source plot',
      evidence: 'Damage evidence',
      evidenceRequired: 'Upload at least one damage evidence image',
      remark: 'Damage remark',
      remarkPh: 'Enter damage remark (optional)'
    },
    confirm: {
      del: 'Delete {count} selected demand(s)? Only unconfirmed demands can be deleted',
      receive: 'Confirm receipt of "{name}"?',
      batchReceive: 'Confirm arrival for {count} selected shipped demand(s)?'
    },
    message: {
      batchReceiveSuccess: 'Batch confirmed arrival for {count} demand(s)',
      batchReceivePartial: 'Batch confirm done: {success} succeeded, {failed} failed'
    },
    prompt: {
      cancelRemark: 'Enter withdraw reason (optional)',
      cancelRemarkPh: 'e.g. wrong order / store cancelled'
    },
    assignPig: {
      title: 'Assign pigs - {no} (need {required})',
      selectedTip: 'Selected {selected} / {required}',
      confirmBtn: 'Confirm ({count})',
      assignSuccess: 'Assigned {count}',
      assignedTitle: 'Assigned ({count})',
      overLimit: 'At most {required}, please unselect extras',
      emptyAvailable: 'No pigs available for outbound',
      column: {
        earNo: 'Ear No.',
        pigSex: 'Sex',
        pigBreed: 'Breed',
        ageDays: 'Age (days)',
        lastBackfat: 'Backfat (mm)'
      }
    }
  },
  // Store operation (product relation + sale records, STR-OP-001)
  storeOperation: {
    relation: {
      store: 'Store',
      storePlaceholder: 'Select store',
      save: 'Save',
      allSku: 'All Products',
      linkedSku: 'Linked Products',
      filterPlaceholder: 'Search product name'
    },
    sale: {
      store: 'Store',
      storePlaceholder: 'Select store',
      source: 'Source',
      saleDateFrom: 'Sale Date From',
      saleDateTo: 'Sale Date To',
      sourceManual: 'Manual',
      sourceExcel: 'Excel Import',
      import: 'Import',
      downloadTemplate: 'Template',
      importTitle: 'Import Sale Records',
      file: 'File',
      uploadHint: 'Drop Excel file here or click to select',
      importTip: 'Only SKUs linked to this store can be imported; columns: Product Name / Sale Date / Qty / Amount',
      confirmImport: 'Import',
      importFail: 'Import failed',
      confirmDel: 'Delete {count} selected sale record(s)?',
      column: {
        storeName: 'Store',
        productName: 'Product',
        saleDate: 'Sale Date',
        saleQty: 'Qty',
        saleUnit: 'Unit',
        saleAmount: 'Amount',
        source: 'Source',
        operator: 'Operator',
        createTime: 'Created'
      },
      form: {
        title: 'Manual Sale Record',
        store: 'Store',
        product: 'Product',
        productPlaceholder: 'Select product',
        selectStoreFirst: 'Select store first',
        noRelation: 'No product linked for this store, configure in "Product Relation" first',
        unit: 'Unit',
        unitAuto: 'Auto-filled after selecting product',
        saleDate: 'Sale Date',
        saleQty: 'Qty',
        saleAmount: 'Amount',
        remark: 'Remark',
        storeRequired: 'Please select store',
        productRequired: 'Please select product',
        saleDateRequired: 'Please select sale date',
        saleDateFuture: 'Sale date cannot be in the future',
        saleQtyRequired: 'Please enter qty',
        saleAmountRequired: 'Please enter amount'
      }
    }
  },
  // Store stock check (STR-STOCK-001, admin only)
  storeCheck: {
    field: {
      checkId: 'Check No.',
      store: 'Store',
      checkStatus: 'Status',
      checkDateFrom: 'Check Date From',
      checkDateTo: 'Check Date To'
    },
    column: {
      checkId: 'Check No.',
      storeName: 'Store',
      checkDate: 'Check Date',
      checkStatus: 'Status',
      lineCount: 'Lines',
      diffSum: 'Net Diff',
      createTime: 'Created'
    },
    action: {
      detail: 'Detail',
      complete: 'Complete',
      cancel: 'Cancel'
    },
    confirm: {
      complete: 'Complete check "{id}"? Differences will be recorded and the store unlocked; no further edits.',
      cancel: 'Cancel check "{id}"? The store will be unlocked; recorded differences are not written back to stock.'
    },
    form: {
      title: 'New Check',
      lockHint:
        'After creation the store enters "In Progress" and is locked; sales-out of that product is rejected during the check, unlocked on complete or cancel.',
      store: 'Store',
      storePlaceholder: 'Select store',
      checkDate: 'Check Date',
      checkDatePlaceholder: 'Select check date',
      remark: 'Remark',
      submit: 'Create & Enter Counts',
      storeRequired: 'Please select store',
      checkDateRequired: 'Please select check date'
    },
    detail: {
      title: 'Check Detail',
      checkId: 'Check No.',
      store: 'Store',
      checkDate: 'Check Date',
      checkStatus: 'Status',
      entryTitle: 'Enter Count',
      product: 'Product',
      productPlaceholder: 'Select product',
      productRequired: 'Please select product',
      checkStock: 'Counted Qty',
      checkStockRequired: 'Please enter counted qty',
      diffReason: 'Diff Reason',
      diffReasonPlaceholder: 'Optional',
      entrySubmit: 'Add',
      complete: 'Complete',
      empty: 'No count lines yet',
      noCheckId: 'Check No. loading, please retry',
      noLineToComplete: 'Please enter at least one count line first',
      confirmRemoveLine: 'Delete count line for product "{name}"?',
      column: {
        productName: 'Product',
        productUnit: 'Unit',
        sysStock: 'System Qty',
        checkStock: 'Counted Qty',
        diffStock: 'Diff',
        checkResultType: 'Result',
        diffReason: 'Diff Reason'
      }
    }
  },
  // Store member archive + manual consumption (STR-MEMBER-001; V1 archive + manual entry only, no marketing analytics)
  storeMember: {
    kpi: {
      monthlyMember: 'New Members This Month',
      monthlyConsumption: 'Consumption Records This Month'
    },
    field: {
      phone: 'Phone',
      memberName: 'Member Name',
      memberLevel: 'Level',
      store: 'Store'
    },
    column: {
      memberNo: 'Member No.',
      memberName: 'Member Name',
      phone: 'Phone',
      memberLevel: 'Level',
      joinDate: 'Join Date',
      storeName: 'Store',
      memberTags: 'Tags',
      memberStatus: 'Status',
      createTime: 'Created At'
    },
    status: {
      normal: 'Active',
      disabled: 'Disabled'
    },
    action: {
      consumeRecord: 'Consumption'
    },
    confirm: {
      delete: 'Delete member "{name}"? Archive and consumption records will be hidden.'
    },
    form: {
      addTitle: 'Add Member',
      editTitle: 'Edit Member',
      memberName: 'Member Name',
      memberNamePlaceholder: 'Enter member name',
      memberNameRequired: 'Member name is required',
      phone: 'Phone',
      phonePlaceholder: 'Enter phone number',
      phoneRequired: 'Phone is required',
      phoneInvalid: 'Invalid phone number',
      memberLevel: 'Level',
      memberLevelPlaceholder: 'Select level',
      joinDate: 'Join Date',
      joinDatePlaceholder: 'Select join date',
      store: 'Store',
      storePlaceholder: 'Select store (optional)',
      memberTags: 'Tags',
      memberTagsPlaceholder: 'Comma-separated, e.g. regular,family',
      memberStatus: 'Status',
      remark: 'Remark'
    },
    consume: {
      title: 'Consumption of "{name}"',
      add: 'Add Record',
      entryTitle: 'Add Consumption Record',
      consumeDate: 'Consume Date',
      consumeDatePlaceholder: 'Select consume date',
      consumeDateRequired: 'Consume date is required',
      sku: 'SKU',
      skuPlaceholder: 'Product name / code (free text)',
      quantity: 'Qty',
      amountManual: 'Amount (CNY)',
      notes: 'Notes',
      operator: 'Operator',
      createTime: 'Created At',
      empty: 'No consumption records'
    }
  },
  // Store white-bar split (STR-SPLIT-001, admin only, reuse inhouse table source='store')
  storeSplit: {
    field: {
      cutPart: 'Cut Part',
      produceDateStart: 'Produce Date From',
      produceDateEnd: 'Produce Date To'
    },
    column: {
      cutPart: 'Cut Part',
      productName: 'Product',
      productWeight: 'Weight (kg)',
      produceDate: 'Produce Date',
      source: 'Source',
      createByName: 'Created By',
      createTime: 'Created Time'
    },
    tag: {
      store: 'Store Re-split'
    },
    form: {
      title: 'Store Re-split Entry',
      hint: 'Re-split a white-bar / cut product already stored from warehouse splitting, on the store side; resolve standard SKU by cut part.',
      cutPart: 'Cut Part',
      cutPartPlaceholder: 'Select cut part',
      cutPartRequired: 'Please select cut part',
      productWeight: 'Re-split Weight',
      productWeightRequired: 'Please enter re-split weight',
      productWeightMin: 'Re-split weight must be greater than 0',
      location: 'Location',
      locationPlaceholder: 'Select location (optional)',
      whiteBarId: 'Source White-bar',
      whiteBarIdPlaceholder: 'Source white-bar id (optional, for trace)',
      remark: 'Remark',
      submit: 'Submit'
    }
  },
  // Store return management (STR-RETURN-001, store-domain thin impl, admin only)
  storeTrace: {
    tab: {
      veg: 'Vegetable Trace',
      pork: 'Pork Trace'
    },
    label: {
      dialogTitle: 'Print Trace Label',
      weight: 'Product Weight (kg)',
      weightPlaceholder: 'Enter product weight (kg)',
      confirmPrint: 'Confirm & Print',
      cancel: 'Cancel',
      productCode: 'Product Code',
      serialNo: 'Production Code',
      packCode: 'Pack Code',
      produceDate: 'Production Date',
      productName: 'Product Name',
      productWeight: 'Product Weight',
      plotNo: 'Plot No.',
      earNo: 'Ear Tag',
      storeName: 'Sales Store',
      weightUnit: 'kg',
      weightUnitGram: 'g',
      noCode: 'No trace code to print for this row',
      scanHint: 'Scan to view traceability',
      traceCaption: 'Dongjiaoshan Product Trace Code',
      printFailed: 'Failed to generate print file, please retry'
    },
    veg: {
      arrivalDate: 'Arrival Date',
      produceNo: 'Produce No.',
      serialNo: 'Seq',
      productName: 'Product',
      productSpec: 'Spec',
      actualWeight: 'Actual Weight',
      plotName: 'Source Plot',
      pickTime: 'Pick Time',
      platformReceiveTime: 'Platform Receive',
      shipTime: 'Ship Time',
      print: 'Print Trace Code',
      noCode: 'No trace code to print'
    },
    pork: {
      pickPig: 'Traceable Pig',
      noPig: 'No white-bar received today',
      remainOf: 'left {remain}/arrived {arrived}kg',
      exhaustedTag: 'used up',
      exhausted: 'This white bar has no remaining weight to pack',
      overWeight: 'Pack weight exceeds remaining ({remain}kg)',
      pickCut: 'Select Cut',
      opPanel: 'Operation',
      pigId: 'Pig ID',
      pigSex: 'Sex',
      pigBreed: 'Breed',
      ageDays: 'Age (days)',
      daysUnit: 'days',
      weight: 'Product Weight',
      weightPlaceholder: 'Enter product weight (g)',
      genPrint: 'Print Trace Code',
      genOk: 'Code generated: {code}',
      tracePig: 'Traced Pig',
      traceProduct: 'Traced Product',
      productName: 'Product Name',
      codeListTitle: 'Generated Trace Codes',
      codeNo: 'Trace Code',
      pigEarNo: 'Pig Ear No.',
      codeProductName: 'Product Name',
      remark: 'Remark',
      creatorName: 'Created By',
      createTime: 'Created Time',
      codeDate: 'Generated Date',
      sourceCol: 'Source',
      sourceWarehouse: 'Warehouse',
      sourceStore: 'Store',
      reprint: 'Reprint',
      noCode: 'No trace code to reprint for this row'
    }
  },
  storeReturn: {
    export: {
      failed: 'Export failed, please try again later'
    },
    field: {
      returnNo: 'Return No.',
      returnDirection: 'Direction',
      store: 'Return Store',
      product: 'Product',
      location: 'Inbound Location',
      returnQuantity: 'Quantity',
      returnReason: 'Reason',
      traceCode: 'Trace Code',
      member: 'Member',
      returnDate: 'Return Date',
      returnDateFrom: 'Return Date From',
      returnDateTo: 'Return Date To',
      remark: 'Remark',
      receivedQty: 'Received Qty',
      receivedWeight: 'Received Weight (kg)'
    },
    column: {
      returnNo: 'Return No.',
      returnDirection: 'Direction',
      storeName: 'Return Store',
      productType: 'Return Type',
      productCode: 'Product Code',
      productName: 'Product',
      productSpec: 'Spec',
      locationName: 'Inbound Location',
      returnQuantity: 'Return Qty',
      unit: 'Unit',
      goodsWeight: 'Goods Weight',
      receivedQty: 'Received Qty',
      receivedWeight: 'Received Weight',
      returnStatus: 'Return Status',
      returnReason: 'Reason',
      traceCode: 'Trace Code',
      memberId: 'Member ID',
      returnDate: 'Return Date',
      operatorName: 'Operator',
      createTime: 'Created'
    },
    tab: {
      pork: 'Pork Products',
      vegetable: 'Produce Products'
    },
    mainTab: {
      operation: 'Return Entry',
      record: 'Return Records'
    },
    action: {
      confirm: 'Confirm Inbound'
    },
    operation: {
      title: 'Return Operation',
      returnWeight: 'Return Weight (KG)',
      weightPlaceholder: 'Enter return weight (KG)',
      emptyCandidates: 'Select a store first; pork is a fixed list, produce shows this store\'s demands confirmed-received today',
      submit: 'Submit',
      submitConfirm: 'Submit {n} returns?',
      quantityPlaceholder: 'Enter return quantity',
      vegBothRequired: 'Produce "{name}" requires both return quantity and return weight'
    },
    placeholder: {
      returnDirection: 'Select direction',
      store: 'Select store (required for customer return)',
      product: 'Select product',
      location: 'Select inbound location',
      returnReason: 'Enter return reason',
      traceCode: 'Attached trace code, if any',
      member: 'Member ID for member return, optional',
      returnDate: 'Select return date'
    },
    rule: {
      returnDirection: 'Direction is required',
      product: 'Product is required',
      location: 'Inbound location is required',
      returnQuantity: 'Quantity is required',
      returnQuantityMin: 'Quantity must be greater than 0',
      receivedQty: 'Received quantity is required',
      receivedQtyMin: 'Received quantity must be greater than 0'
    },
    tip: {
      editLock: 'Product / Inbound Location / Quantity drive the inbound and cannot be changed after creation',
      pendingOnly: 'Only pending returns can be confirmed for inbound'
    },
    dialog: {
      add: 'Add Return',
      edit: 'Edit Return',
      confirm: 'Confirm Received'
    },
    confirm: {
      delete: 'Confirm delete return {no}?'
    }
  },
  // Store daily operating ledger (STORE-LEDGER-001, rebuild of prototype Store Mgmt > Stock Check)
  storeLedger: {
    field: {
      store: 'Store',
      dateFrom: 'Date From',
      dateTo: 'Date To'
    },
    column: {
      index: 'No.',
      storeName: 'Store',
      ledgerDate: 'Check Date',
      lineCount: 'Products',
      operatorName: 'Operator',
      checkTime: 'Check Time',
      productName: 'Product',
      unit: 'Unit',
      openingQty: 'Opening',
      inboundQty: 'Inbound',
      saleQty: 'Sales',
      giftQty: 'Gift',
      returnQty: 'Return',
      returnedQty: 'Returned',
      whReturnQty: 'Return to WH',
      lossQty: 'Loss',
      closingQty: 'Closing',
      category: 'Category'
    },
    category: {
      pork: 'Pork',
      inbound: 'New Arrival',
      stock: 'Yesterday Stock'
    },
    action: {
      newEntry: 'New Daily Check',
      detail: 'Detail'
    },
    detail: {
      title: '{store} {date} Check Detail',
      titleByDate: 'Daily Check Detail - {date}'
    },
    entry: {
      title: 'New Daily Check',
      storePlaceholder: 'Select store',
      datePlaceholder: 'Select date',
      emptyCandidates: "No products to check for this store today (only products with remaining stock from yesterday's check, and products from confirmed-received demands).",
      submit: 'Finish Check',
      submitConfirm: 'Submit check data for {n} products?'
    }
  },
  // Store product management (STORE-LEDGER-001, store domain entry)
  storeProduct: {
    field: {
      productName: 'Product Name',
      productType: 'Product Type',
      productStatus: 'Status'
    },
    column: {
      image: 'Image',
      productType: 'Type',
      productName: 'Product Name',
      supplier: 'Supplier',
      productSpec: 'Spec',
      unit: 'Unit',
      productStatus: 'Status',
      updateTime: 'Updated',
      updateBy: 'Updated By'
    },
    detail: {
      title: 'Product Detail',
      productCode: 'Product Code',
      history: 'Check History',
      noHistory: 'No check history'
    }
  },
  // Plant disaster records (PLT-WORK-003, admin read-only sub-page)
  plantDisaster: {
    column: {
      recordNo: 'Record No.',
      farmDate: 'Date',
      disasterType: 'Disaster Type',
      plotName: 'Plot Name',
      plotCode: 'Plot Code',
      plotZone: 'Plot Zone',
      cropName: 'Crop',
      lossRate: 'Loss Rate',
      lossYield: 'Estimated Loss Yield',
      isWarning: 'Warning',
      teamName: 'Work Team',
      createTime: 'Created At'
    },
    field: {
      recordNo: 'Record No.',
      dateRange: 'Date Range',
      plot: 'Plot Name',
      plotCode: 'Plot Code',
      plotZone: 'Plot Zone',
      disasterType: 'Disaster Type',
      isWarning: 'Warning',
      crop: 'Crop',
      team: 'Work Team'
    },
    placeholder: {
      crop: 'Enter crop',
      team: 'Select work team'
    },
    tag: {
      warning: 'Warning',
      normal: 'Normal'
    },
    action: {
      detail: 'Detail'
    },
    empty: 'No disaster records',
    detail: {
      title: 'Disaster Record Detail',
      remark: 'Remark',
      proof: 'Proof Photos',
      noProof: 'No proof photo',
      notFound: 'Record not found'
    }
  },
  plantWork: {
    tab: {
      tillage: 'Tillage',
      irrigate: 'Irrigation',
      fertilize: 'Fertilize',
      weed: 'Weeding',
      disaster: 'Disaster'
    },
    column: {
      recordNo: 'Record No.',
      farmDate: 'Farm Date',
      farmType: 'Farm Work',
      plotName: 'Plot Name',
      plotCode: 'Plot Code',
      plotZone: 'Plot Zone',
      cropName: 'Crop',
      teamName: 'Work Team',
      remark: 'Remark',
      createTime: 'Created At',
      disasterType: 'Disaster Type',
      lossRate: 'Loss Rate',
      lossYield: 'Loss Yield'
    },
    field: {
      recordNo: 'Record No.',
      dateRange: 'Farm Date',
      farmType: 'Farm Type',
      crop: 'Crop',
      plot: 'Plot Name',
      plotCode: 'Plot Code',
      plotZone: 'Plot Zone',
      team: 'Work Team'
    },
    action: {
      detail: 'Detail'
    },
    empty: 'No farm records',
    detail: {
      title: 'Farm Record Detail',
      tillageType: 'Tillage Type',
      tillageMethod: 'Tillage Method',
      transplantPlotName: 'Transplant Plot',
      transplantPercent: 'Transplant %',
      remark: 'Remark',
      proof: 'Proof Photos',
      noProof: 'No proof photo',
      notFound: 'Record not found'
    }
  },
  // Plant - Team Performance (PLT-PERF-001)
  plantPerformance: {
    pageTitle: 'Performance Management',
    toolbar: {
      statMonth: 'Settle Month',
      pickMonth: 'Select month',
      generate: 'Generate',
      hint: 'Computed by harvest weight x crop unit-price snapshot; re-generating overwrites the month'
    },
    field: {
      statMonth: 'Month',
      team: 'Team'
    },
    column: {
      statMonth: 'Month',
      team: 'Team',
      teamMemberCount: 'Team Members',
      farmCount: 'Farm Ops Total',
      pickWeight: 'Harvest Total',
      amount: 'Performance Total',
      action: 'Action'
    },
    action: {
      detail: 'Work Detail'
    },
    confirm: {
      generate: 'Re-generate settlement for {month}? Existing data will be overwritten.'
    },
    tip: {
      monthRequired: 'Please select a settle month first',
      generateSuccess: 'Settlement generated, {count} rows'
    },
    detail: {
      title: 'Performance Detail',
      tabYield: 'Yield Performance',
      tabFarm: 'Farm Records',
      rule: 'Rule',
      cropName: 'Crop',
      cropPickWeight: 'Harvest',
      cropUnitPrice: 'Unit Price',
      cropAmount: 'Amount',
      totalAmount: 'Total',
      recordNo: 'Record No.',
      farmType: 'Farm Type',
      plot: 'Plot',
      farmDate: 'Farm Date',
      farmCount: '{count} farm records'
    }
  },
  storeDashboard: {
    title: {
      home: 'Store Overview',
      saleOrderGroup: 'Sales Orders',
      memberGroup: 'Member Info',
      monthProductStructure: 'Monthly Order Product Structure',
      monthTop10ByOrder: 'Monthly Hot TOP10 (by Orders)',
      memberOrderTrend: 'Orders & New Members (Last 10 Days)',
      saleAvgPriceTrend: 'Sales & Avg Price Trend'
    },
    kpi: {
      todaySale: 'Today Sales',
      monthSale: 'Monthly Sales',
      todayOrder: 'Today Orders',
      monthOrder: 'Monthly Orders',
      totalMembers: 'Total Members',
      todayNewMembers: 'New Members Today',
      repeatCustomer: 'Repeat Customers',
      monthAvgPrice: 'Monthly Avg Price',
      amountUnit: 'CNY',
      orderUnit: 'orders',
      memberUnit: 'people'
    },
    column: {
      productType: 'Category',
      qty: 'Demand Qty',
      productName: 'Product',
      saleAmount: 'Sales',
      saleQty: 'Sale Qty',
      date: 'Date',
      orderCount: 'Orders',
      avgPrice: 'Avg Price'
    },
    filter: {
      store: 'Store',
      allStores: 'All Stores'
    },
    legend: {
      orderCount: 'Orders',
      productSale: 'Sales',
      saleAmount: 'Sales',
      saleQty: 'Sale Qty',
      returnQty: 'Return Qty',
      newMembers: 'New Members',
      avgPrice: 'Avg Price'
    },
    axis: {
      saleAmount: 'Sales (CNY)',
      avgPrice: 'Avg Price (CNY)',
      orderCount: 'Orders',
      newMembers: 'New Members'
    },
    chart: {
      noData: 'No data'
    },
    action: {
      refresh: 'Refresh'
    },
    empty: {
      top10: 'No sales records this month',
      trend: 'No recent sales records'
    }
  },
  warehouseTrace: {
    tab: {
      pork: 'Pork',
      veg: 'Vegetable',
      gift: 'Gift Box'
    },
    giftPlaceholder: 'Gift-box trace is reserved for V1; sub-code drilldown opens in a later release',
    field: {
      produceCode: 'Trace Code',
      codeType: 'Type',
      productName: 'Product',
      productSpec: 'Spec',
      pigEarNo: 'Pig Ear No.',
      plotName: 'Plot',
      farmName: 'Farm',
      storeName: 'Store',
      harvestDate: 'Harvest Date',
      plantDays: 'Plant Days',
      creatorName: 'Creator',
      createTime: 'Create Time',
      remark: 'Remark',
      beginDate: 'Begin Time',
      endDate: 'End Time'
    },
    column: {
      produceCode: 'Trace Code',
      codeType: 'Type',
      productName: 'Product',
      pigEarNo: 'Pig Ear No.',
      storeName: 'Store',
      farmName: 'Farm',
      creatorName: 'Creator',
      createTime: 'Create Time'
    },
    action: {
      detail: 'Detail',
      print: 'Print',
      batchPrint: 'Batch Print'
    },
    detail: {
      title: 'Trace Code Detail',
      groupBasic: 'Basic Info',
      groupRelation: 'Related Info',
      groupImage: 'Product Image',
      groupTimeline: 'Trace Timeline'
    },
    timeline: {
      empty: 'No trace events',
      operator: 'Operator'
    },
    print: {
      empty: 'No printable data for selected codes',
      failed: 'Failed to generate print file, please retry'
    },
    pdf: {
      title: 'Product Trace Code',
      serialNo: 'No.',
      scanHint: 'Scan to view full traceability'
    }
  },
  // Public traceability H5 landing page (TRACE-H5)
  tracePublic: {
    state: {
      loading: 'Loading…',
      notFound: 'Trace code not found',
      missingCode: 'Missing trace code',
      loadFailed: 'Failed to load, please retry later'
    },
    title: {
      pork: 'Pork Traceability',
      veg: 'Vegetable Traceability',
      grow: 'Growth Records',
      cert: 'Organic Certificate',
      cropCert: 'Crop Organic Certificate',
      plotCert: 'Plot Organic Certificate',
      plotRecords: 'Farm Work Records'
    },
    product: {
      title: 'Product Info',
      noImage: 'No Image',
      name: 'Name',
      weight: 'Weight',
      spec: 'Spec',
      code: 'Code',
      description: 'Description',
      plotNo: 'Plot No.',
      variety: 'Variety',
      growthDays: 'Growth Days',
      harvestDate: 'Harvest Date',
      daysUnit: 'd'
    },
    pig: {
      title: 'Pig Traceability',
      earNo: 'Ear Tag',
      sex: 'Sex',
      weight: 'Weight',
      breed: 'Breed',
      farm: 'Farm',
      barn: 'Barn',
      birth: 'Birth',
      ageDays: 'Age',
      market: 'Market',
      daysUnit: 'd',
      photo: 'Pig Photo'
    },
    timeline: {
      title: 'Process Timeline',
      empty: 'No process records',
      weightUnit: 'kg'
    },
    growEntry: {
      growth: 'Growth records: {n}',
      medication: 'Vaccine & health: {n}',
      view: 'View details'
    },
    pedigree: {
      title: 'Sire / Dam Info',
      sire: 'Sire',
      dam: 'Dam',
      earNo: 'Ear Tag',
      breed: 'Breed',
      ageDays: 'Age',
      parity: 'Parity',
      parityValue: 'Parity {n}',
      daysUnit: 'd'
    },
    quarantine: {
      title: 'Quarantine',
      certNo: 'Cert No.',
      agency: 'Agency'
    },
    store: {
      title: 'Sales Store',
      name: 'Store Name',
      address: 'Address'
    },
    grow: {
      tabGrowth: 'Growth Records',
      tabMedication: 'Vaccine & Health',
      ageDays: 'Age',
      weight: 'Weight',
      backfat: 'Backfat',
      operator: 'Operator',
      reason: 'Reason',
      daysUnit: 'd',
      weightUnit: 'kg',
      backfatUnit: 'mm',
      emptyGrowth: 'No growth records',
      emptyMedication: 'No vaccine & health records'
    },
    plot: {
      title: 'Plot Info',
      plotName: 'Plot',
      zoneName: 'Zone',
      area: 'Area',
      areaUnit: 'mu'
    },
    entry: {
      farmRecords: 'Crop Farm Records',
      cropCert: 'Crop Organic Certificate',
      plotCert: 'Plot Organic Certificate',
      plotRecords: 'Plot Planting Records'
    },
    cert: {
      issuer: 'Issuer',
      certNo: 'Cert No.',
      validity: 'Validity',
      validTo: 'to',
      empty: 'No organic certificate'
    },
    plotRecords: {
      title: 'Crop Farm Records',
      empty: 'No farm records'
    },
    content: {
      marketing: 'Marketing',
      singe: 'Slaughter Done',
      whiteBarIn: 'White Bar In',
      whiteBarPick: 'White Bar Out (Pick)',
      slaughter: 'Slaughter',
      acid: 'Acid Discharge',
      inStock: 'In Stock',
      ship: 'Shipment',
      arrival: 'Arrival',
      sowing: 'Sowing',
      harvest: 'Harvest',
      vegHandle: 'Veg Handling',
      pack: 'Packing'
    },
    medType: {
      health: 'Health',
      treatment: 'Treatment',
      vaccine: 'Vaccine'
    },
    workType: {
      tillageBreak: 'Tillage',
      tillagePrepare: 'Soil Prep',
      fertilize: 'Fertilize',
      transplant: 'Transplant',
      waterFertilize: 'Fertigation',
      irrigation: 'Irrigation',
      weed: 'Weeding',
      pestControl: 'Pest Control',
      pruning: 'Pruning',
      rotation: 'Rotation',
      disaster: 'Disaster Loss',
      harvestActivity: 'Harvest'
    },
    pigSex: {
      female: 'Female',
      male: 'Male'
    },
    pigBreed: {
      black: 'Black Pig'
    }
  }
};
