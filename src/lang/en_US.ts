export default {
  // 路由国际化
  route: {
    dashboard: 'Dashboard',
    document: 'Document'
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
      motherCode: 'Maternal Line Code',
      motherName: 'Maternal Line Name',
      fatherCode: 'Paternal Line Code',
      fatherName: 'Paternal Line Name',
      cubCode: 'Cub Code',
      offspringName: 'Offspring Name',
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
      motherCode: 'Maternal Line Code',
      fatherCode: 'Paternal Line Code',
      cubCode: 'Cub Code',
      createTimeRange: 'Created At'
    },
    placeholder: {
      breedStrainCode: 'Enter code (letters / digits / underscore / hyphen)',
      breedStrainName: 'Enter name',
      parentCode: 'Enter parent code (strain only)',
      motherCode: 'Select maternal line',
      fatherCode: 'Select paternal line',
      cubCode: 'Select cub'
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
        len1: 'Strain code must be exactly 1 digit'
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
      createTime: 'Created',
      updateTime: 'Updated'
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
      locationThumb: 'Upload thumbnail (single, ≤ 10MB)',
      locationImg: 'Upload images (up to 5, ≤ 10MB each)',
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
      productCount: 'Products',
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
      giftComponents: 'Gift box list'
    },
    giftEmpty: 'No components in this gift box',
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
      createTime: 'Created',
      updateTime: 'Updated',
      index: 'No.'
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
      imageOssId: 'Main Image (auto)',
      imageOssIdTip: 'Leave empty to auto-match from the shared library by product name; manual upload is never auto-overridden',
      productStatus: 'Status',
      isDelivery: 'Is delivery',
      isBuyOut: 'Buy-out',
      supplierId: 'Supplier',
      productDesc: 'Description',
      remark: 'Remark',
      giftComponents: 'Gift components',
      componentProduct: 'Component product',
      componentProductName: 'Component product',
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
      blockNo: 'Plot No.'
    },
    column: {
      locationName: 'Location',
      productName: 'Product',
      productStock: 'Stock',
      productUnit: 'Unit',
      earNo: 'Ear No.',
      blockNo: 'Plot No.',
      latestCheckTime: 'Last check',
      checkResult: 'Check result'
    },
    action: {
      flowIn: 'Inbound',
      flowOut: 'Outbound',
      checkRecord: 'Check log'
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
    title: { add: 'Add Plot', edit: 'Edit Plot', view: 'Plot Detail', baseInfo: 'Basic Info', zoneInfo: 'Zone Info' },
    zoneEmpty: 'No zone linked',
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
    title: { add: 'Add Crop', edit: 'Edit Crop', view: 'Crop Detail', baseInfo: 'Basic Info', related: 'Related Info' },
    organicEmpty: 'Organic certification details not available yet (backend aggregation pending)',
    tab: { basic: 'Basic', growth: 'Growth Cycle', yield: 'Yield & Quality' },
    column: {
      cropCode: 'Code',
      cropName: 'Name',
      varietyName: 'Variety',
      cropFamily: 'Family',
      plantingSeason: 'Season',
      cycle: 'Cycle',
      predictedPer: 'Predicted Yield',
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
      plantDate: 'Plant Start Date',
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
      tip: 'Set the plan earliest harvest date per plot (plan latest is auto-derived from the crop pick cycle), visitor pick flag and harvest team. Actual harvest start/end are written back by the mini-program and read-only here. Saves immediately.',
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
        adjustNotImpl: 'Stock adjustment will be available in a future release — flowNo={flowNo}'
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
      packEntry: {
        meatTitle: 'Meat Packing',
        otherTitle: 'Other Product Packing',
        vegTitle: 'Vegetable Packing',
        giftTitle: 'Gift Box Packing',
        cutTitle: 'White Bar Cutting',
        otherProductTab: 'Products',
        otherGiftTab: 'Gift Box',
        source: 'Source Product',
        sourceVeg: 'Source Plot/Vegetable',
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
        proof: 'Proof Images',
        remark: 'Remark',
        submitSuccess: 'Packing submitted',
        cutHint: 'Pick a picked cut record, enter part weights and confirm inbound; click "Finish Cut" when all parts are weighed.',
        cutRecord: 'Cut Record (Ear No)',
        cutRecordPlaceholder: 'Select a picked/cutting record',
        cutRecordRequired: 'Cut record is required',
        parts: 'Cut Parts',
        cutPart: 'Part',
        cutPartPlaceholder: 'Select part',
        cutPartRequired: 'Part is required',
        addPart: 'Add Part',
        partsRequired: 'Enter at least one part weight',
        confirmCutOut: 'Confirm Inbound',
        cutOutSuccess: 'Cut output stored',
        finishCut: 'Finish Cut',
        dripLoss: 'Drip Loss',
        dripLossRequired: 'Enter drip loss (0 if none)',
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
        confirmPickup: 'Confirm Pickup',
        pickupSuccess: 'Bar picked to cutting',
        confirmShipOut: 'Confirm Ship Out',
        shipOutSuccess: 'White bar / pork shipped out'
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
        confirmSuccess: 'Return confirmed'
      },
      check: {
        checkId: 'Check No.',
        locationName: 'Location',
        checkWarehouse: 'Location',
        checkDate: 'Check Date',
        checkStatus: 'Status',
        lineCount: 'Lines',
        goodsCount: 'Goods',
        abnormalCount: 'Abnormal',
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
        sysStock: 'System Qty',
        checkStock: 'Actual Qty',
        diffStock: 'Diff',
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
        productCode: 'Product Code',
        productName: 'Product',
        blockNo: 'Block No.',
        belongType: 'Category',
        changeQuantity: 'Quantity',
        productUnit: 'Unit',
        location: 'Location',
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
        stockOutDest: 'Out Dest',
        productCode: 'Product Code',
        productName: 'Product',
        blockNo: 'Block No.',
        belongType: 'Category',
        changeQuantity: 'Quantity',
        productUnit: 'Unit',
        location: 'Location',
        earNo: 'Ear No.',
        operator: 'Operator',
        createTime: 'Created',
        remark: 'Remark'
      },
      outsourcePig: {
        title: {
          add: 'New Outsourced Pig'
        },
        column: {
          purchaseDate: 'Purchase Date',
          arriveTime: 'Arrival Time',
          pigMarkNo: 'Pig Mark No.',
          pigWeight: 'Pig Weight (kg)',
          supplier: 'Supplier',
          buyer: 'Buyer'
        },
        field: {
          pigMarkNo: 'Pig Mark No.',
          purchaseDate: 'Purchase Date',
          slaughterDate: 'Slaughter Date',
          arriveTime: 'Arrival Time',
          pigWeight: 'Pig Weight (kg)',
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
          productSpec: 'Spec',
          productSort: 'Product Seq',
          productWeight: 'Product Weight',
          storeName: 'Store'
        },
        button: {
          traceCode: 'Trace Code'
        },
        text: {
          noTrace: 'No trace code'
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
      candidateTitle: 'Product Candidates',
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
      availablePigs: 'Available pigs',
      unit: 'Unit',
      demandQuantity: 'Quantity',
      mailing: 'Personal mailing',
      remark: 'Remark:',
      remarkPh: 'Enter remark',
      confirm: 'Confirm demand',
      spec: 'Spec',
      materialStock: 'Raw Material Stock',
      remainPlot: 'Remaining Plots',
      expectYield: 'Expected Yield',
      earliestPick: 'Earliest Pick Date',
      latestPick: 'Latest Pick Date',
      demandStore: 'Demand Store',
      demandStorePh: 'Select store'
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
      storeId: 'Store',
      'storeId.required': 'Store is required',
      productId: 'Product',
      'productId.required': 'Product is required',
      productName: 'Product name',
      'productName.required': 'Product name is required',
      productType: 'Type',
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
      viewList: 'View List'
    },
    confirm: {
      del: 'Delete {count} selected demand(s)? Only unconfirmed demands can be deleted',
      receive: 'Confirm receipt of "{name}"?'
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
      noPig: 'No traceable pig (slaughtered fattening pigs)',
      pickCut: 'Select Cut',
      opPanel: 'Operation',
      pigId: 'Pig ID',
      pigSex: 'Sex',
      pigBreed: 'Breed',
      ageDays: 'Age (days)',
      daysUnit: 'days',
      weight: 'Product Weight',
      weightPlaceholder: 'Enter product weight (kg)',
      genPrint: 'Print Trace Code',
      genOk: 'Code generated: {code}',
      tracePig: 'Traced Pig',
      traceProduct: 'Traced Product',
      productName: 'Product Name'
    }
  },
  storeReturn: {
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
      remark: 'Remark'
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
      emptyCandidates: 'Select a store first; this store has no linked products',
      submit: 'Submit',
      submitConfirm: 'Submit {n} returns?',
      quantityPlaceholder: 'Enter return quantity'
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
      receivedQty: 'Received quantity is required'
    },
    tip: {
      editLock: 'Product / Inbound Location / Quantity drive the inbound and cannot be changed after creation'
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
      closingQty: 'Closing'
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
      emptyCandidates: 'No linked products for this store. Configure sellable products in Product Mgmt first.',
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
      plotName: 'Plot',
      plotCode: 'Plot Code',
      cropName: 'Crop',
      lossRate: 'Loss Rate',
      lossYield: 'Loss Yield',
      isWarning: 'Warning',
      teamName: 'Work Team',
      createTime: 'Created At'
    },
    field: {
      recordNo: 'Record No.',
      dateRange: 'Date Range',
      plot: 'Plot',
      disasterType: 'Disaster Type',
      isWarning: 'Warning'
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
      plotName: 'Plot',
      plotCode: 'Plot Code',
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
      plot: 'Plot',
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
    pageTitle: 'Team Performance',
    toolbar: {
      statMonth: 'Settle Month',
      pickMonth: 'Select month',
      generate: 'Generate',
      hint: 'Computed by harvest weight x crop unit-price snapshot; re-generating overwrites the month'
    },
    field: {
      statMonth: 'Month',
      team: 'Team',
      crop: 'Crop'
    },
    column: {
      statMonth: 'Month',
      team: 'Team',
      crop: 'Crop',
      pickWeight: 'Harvest Total',
      unitPrice: 'Performance Unit Price',
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
      recordNo: 'Record No.',
      farmType: 'Farm Type',
      plot: 'Plot',
      farmDate: 'Farm Date',
      farmCount: '{count} farm records'
    }
  },
  // Plant dashboard (PLT-DASH-001)
  plantDashboard: {
    title: {
      overview: 'Land Overview',
      todayFarm: 'Today Farm Work',
      monthCompletion: 'Monthly Plan Completion Rate',
      gantt: 'Plant / Harvest Gantt'
    },
    kpi: {
      idle: 'Idle Plots',
      planting: 'Planting',
      harvesting: 'Harvesting',
      pending: 'Pending Plots',
      total: 'Total Plots',
      totalArea: 'Total Area',
      areaUnit: 'mu',
      todayFarmTotal: 'Today Farm Total',
      farmUnit: ''
    },
    chart: {
      completionRate: 'Completion',
      cropAxis: 'Crop',
      plantSegment: 'Plant',
      pickSegment: 'Harvest',
      noData: 'No Data'
    },
    action: {
      refresh: 'Refresh',
      lastRefresh: 'Last Refresh'
    }
  },
  storeDashboard: {
    title: {
      home: 'Store Overview',
      top10Donut: "Today Hot TOP10 Products",
      top10: "Today Hot TOP10 Ranking",
      saleReturnTrend: 'Sales & Return Qty Trend',
      saleAmountTrend: 'Sales Amount Trend'
    },
    kpi: {
      todaySale: 'Today Sales',
      monthSale: 'Monthly Sales',
      todayOrder: 'Today Orders',
      monthOrder: 'Monthly Orders',
      totalMembers: 'Members',
      todayNewMembers: 'New Members Today',
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
      avgPrice: 'Avg Price'
    },
    axis: {
      saleAmount: 'Sales (CNY)',
      avgPrice: 'Avg Price (CNY)'
    },
    chart: {
      noData: 'No data'
    },
    action: {
      refresh: 'Refresh'
    },
    empty: {
      top10: 'No sales records today',
      trend: 'No sales records in last 10 days'
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
      serialNo: 'No.'
    }
  }
};
