export default {
  // 路由国际化
  route: {
    dashboard: 'Dashboard',
    document: 'Document'
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
    social: {
      wechat: 'Wechat Login',
      maxkey: 'MaxKey Login',
      topiam: 'TopIam Login',
      gitee: 'Gitee Login',
      github: 'Github Login'
    }
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
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    createTime: 'Created at',
    opSuccess: 'Operation succeeded',
    search: 'Search',
    reset: 'Reset',
    add: 'Add',
    save: 'Save',
    empty: 'No data',
    tip: 'Tip',
    deleteSuccess: 'Deleted',
    to: 'to',
    prev: 'Prev',
    next: 'Next'
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
      supplierType: 'Type',
      liaisonName: 'Liaison',
      liaisonPhone: 'Phone',
      address: 'Address',
      businessStatus: 'Cooperation',
      settleType: 'Settle type',
      dealCount: 'Deals',
      purchaseQty: 'Purchased qty',
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
      supplierType: 'Type',
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
      supplierType: 'Select type',
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
    must_be_breed_type: 'Introduction only accepts breed-type suppliers'
  },
  // Store master data (SYS-MD-002 + SYS-MD-FIX-002)
  store: {
    title: {
      add: 'Add store',
      edit: 'Edit store',
      view: 'Store details',
      setManager: 'Set manager'
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
    },
    tip: {
      managerHint: 'Use the "Set manager" button to bind a system user'
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
      parentCode: 'Parent Code',
      description: 'Description',
      remark: 'Remark',
      motherCode: 'Mother Code',
      fatherCode: 'Father Code',
      cubCode: 'Cub Code',
      createTime: 'Created At',
      createBy: 'Created By'
    },
    field: {
      breedStrain: 'Type',
      breedStrainCode: 'Code',
      breedStrainName: 'Name',
      parentCode: 'Parent Code',
      description: 'Description',
      remark: 'Remark',
      motherCode: 'Mother Code',
      fatherCode: 'Father Code',
      cubCode: 'Cub Code',
      createTimeRange: 'Created At'
    },
    placeholder: {
      breedStrainCode: 'Enter code (letters / digits / underscore / hyphen)',
      breedStrainName: 'Enter name',
      parentCode: 'Enter parent code (strain only)',
      motherCode: 'Select mother',
      fatherCode: 'Select father',
      cubCode: 'Select cub'
    },
    option: {
      type: 'Breed Type',
      strain: 'Strain'
    },
    rule: {
      breedStrain: { required: 'Type is required' },
      breedStrainCode: { required: 'Code is required', pattern: 'Code allows letters, digits, underscore, hyphen only' },
      breedStrainName: { required: 'Name is required' },
      motherCode: { required: 'Mother is required' },
      fatherCode: { required: 'Father is required' },
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
      cycle: 'Production Cycle',
      boar: 'Sperm / Boar',
      med: 'Med Schedule'
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
      noAutoTrigger: 'v1.2: Config only decides suggested time; state changes are event-driven',
      customOverridesDefault: 'Empty "Custom" means business reads default value',
      seedKeys: 'Seeded 6 items: gestation 114 / lactation 28 / nursery 35 / fattening 120 / oestrus 21 / weaning-to-breeding 7'
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
      pigType: 'Type',
      currentStatus: 'Current state',
      pigBreedCode: 'Breed',
      pigStrainCode: 'Strain',
      birthDate: 'Birth date',
      introduceDate: 'Introduce date',
      barnId: 'Barn',
      penId: 'Pen',
      barn: 'Barn',
      pen: 'Pen',
      motherEar: 'Mother ear',
      fatherEar: 'Father ear',
      parity: 'Parity',
      matingCount: 'Mating count',
      lastMatingDate: 'Last mating date',
      enterFattenAt: 'Enter fatten at',
      statusStartedAt: 'Status since',
      endReason: 'End reason',
      remark: 'Remark'
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
      motherEar: 'Enter mother ear no.'
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
      healthPlaceholder: 'Health log will be wired in BRD-MED-003',
      performanceEmpty: 'No performance data yet (filled by BRD-DASH-001 cron)',
      performanceDataHint: 'Data sourced from t_farm_sow_performance, populated by farrow / wean events or nightly job.',
      growthEmpty: 'No growth measurements',
      relatedNotFound: 'No pig found with ear no. {earNo}',
      breedingEmpty: 'No breeding / farrow / wean records',
      medEmpty: 'No medication / treatment records',
      breedingCol: {
        changeTime: 'Time',
        eventType: 'Event',
        transition: 'State change',
        relatedEventId: 'Related ID'
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
    exportTodo: 'Export will be wired in BRD-LIST-001'
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
        id: 'Log ID'
      },
      field: {
        earNo: 'Ear No.',
        eventType: 'Event type',
        newStatus: 'New state'
      },
      placeholder: {
        earNo: 'Exact match'
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
      farmInfo: 'Farm Info',
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
      capacity: 'Capacity',
      locationStatus: 'Status',
      createTime: 'Created'
    },
    field: {
      locationCode: 'Code',
      locationName: 'Name',
      locationType: 'Type',
      locationThumb: 'Thumbnail',
      locationImg: 'Images',
      locationStatus: 'Status',
      capacity: 'Capacity',
      remark: 'Remark'
    },
    placeholder: {
      locationCode: 'e.g. L0001 / FROZEN-01',
      locationName: 'Location name',
      locationType: 'Pick type',
      locationThumb: 'OSS objectName (single)',
      locationImg: 'OSS objectNames comma-separated',
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
    }
  },
  // Warehouse commodity master data / self-produce / purchase / gift box (WMS-MD-002, 3-form shared table)
  // Note: distinguished from D11+ TRC-CORE-001 "Product list (traceability serial)" — this namespace is SKU master
  product: {
    title: {
      add: 'New commodity',
      edit: 'Edit commodity'
    },
    column: {
      productId: 'Code',
      productName: 'Name',
      productType: 'Type',
      productAttr: 'Attribute',
      productWorkshop: 'Workshop',
      belongType: 'Belong',
      productThumb: 'Image',
      productUnit: 'Unit',
      productSpec: 'Spec',
      productStatus: 'Status',
      createTime: 'Created'
    },
    field: {
      productId: 'Product code',
      productName: 'Product name',
      productType: 'Product type',
      productUnit: 'Unit',
      productSpec: 'Spec',
      belongType: 'Belong type',
      buyClass: 'Purchase class',
      productAttr: 'Attribute',
      productWorkshop: 'Workshop',
      productMaterial: 'Material ID',
      materialNum: 'Material amount',
      productThumb: 'Thumb',
      productImg: 'Images',
      productStatus: 'Status',
      isDelivery: 'Is delivery',
      isBuyOut: 'Buy-out',
      supplierId: 'Supplier',
      productDesc: 'Description',
      remark: 'Remark',
      giftComponents: 'Gift components',
      componentProduct: 'Component product',
      componentCount: 'Count',
      componentUnit: 'Unit',
      componentSort: 'Sort'
    },
    placeholder: {
      productId: 'e.g. P0001 / SP-PORK-001 (manual)',
      productUnit: 'e.g. kg / pcs / box',
      productSpec: 'e.g. 500g/pack',
      productMaterial: 'Related raw material product ID',
      buyClass: 'Choose purchase class (add via dict manager if empty)',
      supplierId: 'Choose supplier'
    },
    rule: {
      productType: { required: 'Please select product type' },
      productId: { required: 'Product code is required' },
      productName: { required: 'Product name is required' },
      productUnit: { required: 'Product unit is required' },
      belongType: { required: 'Self-produce belong type is required' },
      supplierId: { required: 'Supplier is required for purchased products' },
      giftComponents: { required: 'Gift box requires at least one component' }
    },
    tip: {
      buyClassEmpty: 'No purchase class yet — add via System → Dict → djs_buy_class'
    },
    action: {
      addComponent: 'Add component'
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
      isEnd: 'Done'
    },
    column: {
      locationName: 'Location',
      productName: 'Product',
      productStock: 'Stock',
      productUnit: 'Unit',
      earNo: 'Ear No.',
      isEnd: 'Done',
      latestCheckTime: 'Last check',
      checkResult: 'Check result',
      operatorName: 'Operator',
      createTime: 'Created'
    }
  },
  // Planting - Zone (PLT-MD-001)
  plantZone: {
    title: { add: 'Add Zone', edit: 'Edit Zone' },
    column: { zoneCode: 'Code', zoneName: 'Name', zoneDesc: 'Description', zoneBelong: 'Belong', zoneStatus: 'Status', createTime: 'Created' },
    field: { zoneCode: 'Zone Code', zoneName: 'Zone Name', zoneDesc: 'Description', zoneBelong: 'Belong Region', zoneStatus: 'Status' },
    placeholder: {
      zoneCode: 'Enter zone code (e.g. Z001 / EAST-01)',
      zoneName: 'Enter zone name',
      zoneDesc: 'Description (optional)',
      zoneBelong: 'Belong region (optional)',
      search: 'Search zone name'
    },
    rule: { zoneCode: { required: 'Zone code is required' }, zoneName: { required: 'Zone name is required' } },
    confirm: { del: 'Are you sure to delete {count} zones? Ensure no associated plots exist.' },
    empty: 'No zones yet. Create one to get started.'
  },
  // Planting - Plot (PLT-MD-001)
  plantPlot: {
    title: { add: 'Add Plot', edit: 'Edit Plot', view: 'Plot Detail' },
    tab: { basic: 'Basic', location: 'Location & Area', soil: 'Soil & Environment' },
    column: {
      plotCode: 'Code',
      plotName: 'Name',
      zoneName: 'Zone',
      plotType: 'Type',
      soilType: 'Soil',
      soilFertility: 'Fertility',
      plotStatus: 'Status',
      plotArea: 'Area',
      isLease: 'Lease',
      plotImage: 'Image',
      createTime: 'Created'
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
      drainCondition: 'Drainage'
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
      createTime: 'Created'
    },
    field: {
      organicNo: 'Cert No.',
      organicCompany: 'Issuer',
      organicValid: 'Valid Until',
      organicImagePreview: 'Thumbnail',
      organicImageUrl: 'Cert Images',
      relatedPlots: 'Related Plots',
      isWarning: 'Warning Status'
    },
    placeholder: {
      organicNo: 'Enter cert number (e.g. GB-2026-001)',
      organicCompany: 'Issuer (e.g. CNCA)',
      organicValid: 'Pick expiry date',
      search: 'Search plot code / name'
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
      createTime: 'Created'
    },
    field: {
      cropCertNo: 'Cert No.',
      cropCertCompany: 'Issuer',
      cropCertValid: 'Valid Until',
      cropId: 'Crop',
      cropImagePreview: 'Thumbnail',
      cropImageUrl: 'Cert Images',
      isWarning: 'Warning Status'
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
    title: { add: 'Add Crop', edit: 'Edit Crop', view: 'Crop Detail' },
    tab: { basic: 'Basic', growth: 'Growth Cycle', yield: 'Yield & Quality' },
    column: {
      cropCode: 'Code',
      cropName: 'Name',
      varietyName: 'Variety',
      cropFamily: 'Family',
      plantingSeason: 'Season',
      cycle: 'Cycle',
      predictedPer: 'Predicted Yield',
      pickUnitPrice: 'Unit Price',
      createTime: 'Created'
    },
    field: {
      cropCode: 'Crop Code',
      cropName: 'Crop Name',
      cropImagePreview: 'Thumbnail',
      cropImageUrl: 'Crop Images',
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
      pickUnitPrice: 'Pick Unit Price (yuan/jin)'
    },
    placeholder: {
      cropCode: 'Enter crop code (e.g. C001)',
      cropName: 'Enter crop name',
      varietyName: 'Variety name',
      varietyOrigin: 'Origin / supplier (free text in V1)',
      cropFamily: 'Select family',
      plantingSeason: 'Select seasons',
      sowingPeriod: 'e.g. early Mar - late Apr',
      qualityDesc: 'Quality description'
    },
    rule: { cropCode: { required: 'Crop code is required' }, cropName: { required: 'Crop name is required' } },
    confirm: { del: 'Delete {count} crops?' }
  },
  // Plant - Work team (PLT-MD-002)
  plantTeam: {
    pageTitle: 'Work team',
    title: { add: 'Add team', edit: 'Edit team', member: 'Members - {teamName}' },
    column: {
      teamName: 'Team name',
      leader: 'Leader',
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
      teamName: 'e.g. Fruit & Veg Team / Tuber Team',
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
      earliestHarvestdate: 'Earliest Harvest',
      lastHarvestdate: 'Last Harvest',
      plantStatus: 'Plan Status',
      harvestStatus: 'Harvest Status',
      plantDate: 'Planned Plant Date',
      plotCode: 'Plot Code',
      plotName: 'Plot Name',
      plotArea: 'Plot Area',
      plantMonth: 'Plant Month',
      plantPeriod: 'Period',
      plantBy: 'Plant Team',
      harvestBy: 'Harvest Team',
      expectedYield: 'Expected Yield'
    },
    column: {
      planNo: 'Plan No.',
      planYear: 'Year',
      planSeason: 'Season',
      crop: 'Crop',
      totalArea: 'Total Area (mu)',
      totalPlot: 'Plots',
      earliestHarvestdate: 'Earliest Harvest',
      lastHarvestdate: 'Last Harvest',
      plantStatus: 'Status',
      action: 'Actions'
    },
    placeholder: {
      planSeason: 'Select planting season',
      plantDate: 'e.g. early April (optional)',
      team: 'Select team'
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
      title: 'Dual Gantt (Plan vs Actual)',
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
      harvestStatus: 'Harvest Status'
    },
    placeholder: {
      planSeason: 'Pick a season',
      harvestStatus: 'Pick a harvest status',
      team: 'Harvest team'
    },
    column: {
      planNo: 'Plan No',
      planYear: 'Year',
      planSeason: 'Season',
      crop: 'Crop',
      plotCount: 'Plots',
      planEarliest: 'Plan Earliest',
      planLatest: 'Plan Latest',
      actualBegin: 'Actual Begin',
      actualEnd: 'Actual End',
      expectedYield: 'Expected Yield',
      actualYield: 'Actual Yield',
      activityPlotCount: 'Visitor Plots',
      action: 'Action'
    },
    action: { adjust: 'Adjust' },
    adjust: {
      title: 'Adjust Pick Plan',
      backToList: 'Back',
      tip: 'Adjust actual harvest dates, visitor pick flag and harvest team per plot. Saves immediately.',
      activityYes: 'Visitor',
      activityNo: 'Normal',
      paramsMissing: 'planId / cropId missing',
      saveSuccess: '{count} rows updated',
      col: {
        plotCode: 'Plot Code',
        plotName: 'Plot Name',
        plotArea: 'Area',
        planEarliest: 'Plan Earliest',
        planLatest: 'Plan Latest',
        beginHarvestdate: 'Actual Begin',
        endHarvestdate: 'Actual End',
        isPick: 'Visitor Pick',
        harvestBy: 'Harvest Team',
        harvestStatus: 'Status'
      }
    }
  },
  pickActivity: {
    pageTitle: 'Pick Activity',
    field: {
      activityNo: 'Activity No',
      activityName: 'Activity Name',
      activityStatus: 'Status',
      activityDate: 'Date',
      cropId: 'Crop',
      totalPlot: 'Plots',
      totalYield: 'Total Yield (kg)',
      visitorCount: 'Visitors',
      remark: 'Remark'
    },
    placeholder: {
      activityNo: 'fuzzy match',
      activityName: 'fuzzy match',
      dateFrom: 'From',
      dateTo: 'To'
    },
    column: {
      activityNo: 'Activity No',
      activityName: 'Name',
      activityDate: 'Date',
      activityStatus: 'Status',
      crop: 'Crop',
      totalPlot: 'Plots',
      totalYield: 'Yield',
      visitorCount: 'Visitors',
      action: 'Action'
    },
    action: { summary: 'Summarize' },
    dialog: {
      addTitle: 'Add Pick Activity',
      editTitle: 'Edit Pick Activity'
    },
    rule: {
      activityNameRequired: 'Name required',
      activityDateRequired: 'Date required',
      cropRequired: 'Crop required'
    },
    confirm: {
      del: 'Delete activity "{name}"?',
      summary: 'Summarize will set status to "ended" and backfill total yield. Continue?'
    },
    tip: {
      addSuccess: 'Activity created',
      updateSuccess: 'Activity updated',
      summarySuccess: 'Summarized: today {yield} kg'
    }
  },
  // Dongjiaoshan business modules placeholder
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
      preview: 'Preview'
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
        earNo: 'Pig Ear No',
        pickupTime: 'Pickup Time',
        cutStartTime: 'Cut Start Time',
        cutDoneTime: 'Cut Done Time',
        pickupWeight: 'Pickup Weight (kg)',
        dripLoss: 'Drip Loss (kg)',
        acidRemoveMinutes: 'Acid-Remove (min)',
        cutStatus: 'Status',
        operator: 'Operator',
        location: 'Frozen Location',
        isHalf: 'Half Bar?',
        remark: 'Remark'
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
        belongType: 'Belong',
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
        adjustNotImpl: 'Adjust not implemented yet (D11 WMS-FLOW-001) — flowNo={flowNo}'
      },
      matPack: {
        title: 'Package Flow'
      },
      purchaseIn: {
        title: 'Purchase In',
        flowNo: 'Inbound No',
        flowDate: 'Inbound Time',
        product: 'Product',
        productPlaceholder: 'Select product',
        productRequired: 'Product is required',
        location: 'Location',
        locationPlaceholder: 'Select location',
        locationRequired: 'Location is required',
        quantity: 'Quantity',
        quantityRequired: 'Quantity is required and must be > 0',
        unit: 'Unit',
        operator: 'Operator',
        remark: 'Remark',
        dialogTitle: 'New Purchase In',
        submitSuccess: 'Inbound submitted'
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
        storeId: 'Store',
        productId: 'Product ID',
        productName: 'Product Name',
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
        confirmSuccess: 'Return confirmed'
      }
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
      productType: 'Category',
      productSpec: 'Spec',
      demandQuantity: 'Quantity',
      'demandQuantity.required': 'Quantity is required',
      productUnit: 'Unit',
      'productUnit.required': 'Unit is required',
      rawMaterial: 'Raw Material',
      materialQty: 'Material Qty',
      demandRemark: 'Remark',
      demandExplain: 'Explanation',
      demandStatus: 'Status',
      expectedArriveDate: 'Expected Arrive',
      beginDate: 'Begin Date',
      endDate: 'End Date',
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
      storeId: 'Store',
      productName: 'Product',
      giftSku: 'Gift SKU',
      productSpec: 'Spec',
      demandQuantity: 'Quantity',
      productUnit: 'Unit',
      rawMaterial: 'Raw Material',
      demandStatus: 'Status',
      shippedCount: 'Shipped',
      expectedArriveDate: 'Expected',
      createByName: 'Creator',
      createTime: 'Created',
      actions: 'Actions'
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
      history: 'History'
    },
    confirm: {
      del: 'Delete {count} demand(s)? Only DRAFT/CANCELLED allowed',
      submit: 'Submit demand {no} to warehouse review?',
      confirm: 'Lock demand {no}?',
      startProduction: 'Start production for demand {no}? Cannot cancel after.'
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
    }
  }
};
