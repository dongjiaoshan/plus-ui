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
    opSuccess: 'Operation succeeded'
  },
  // Person master data (SYS-MD-001)
  person: {
    title: {
      add: 'Add person',
      edit: 'Edit person'
    },
    column: {
      personCode: 'Person code',
      name: 'Name',
      gender: 'Gender',
      phone: 'Phone',
      post: 'Post',
      status: 'Status',
      hireDate: 'Hire date',
      createTime: 'Created at'
    },
    field: {
      name: 'Name',
      gender: 'Gender',
      phone: 'Phone',
      idCard: 'ID card',
      post: 'Post',
      hireDate: 'Hire date',
      status: 'Status',
      remark: 'Remark'
    },
    placeholder: {
      name: 'Enter name',
      gender: 'Select gender',
      phone: 'Enter phone',
      idCard: 'Enter 15 / 18-digit ID card',
      post: 'Select post',
      hireDate: 'Select hire date'
    },
    rule: {
      name: { required: 'Name is required' },
      phone: { pattern: 'Please enter a valid phone' },
      idCard: { pattern: 'Please enter a valid ID card' }
    },
    confirm: {
      del: 'Delete the selected {count} person record(s)?'
    }
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
      statusStartedAt: 'Status since',
      endReason: 'End reason',
      remark: 'Remark'
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
      tab: {
        overview: 'Overview',
        history: 'State history',
        health: 'Health'
      },
      historyEmpty: 'No state changes',
      historyInit: 'Initial',
      duration: '{days} day(s)',
      relatedEvent: 'Related event ID: {id}',
      healthPlaceholder: 'Health log will be wired in BRD-MED-003',
      relatedNotFound: 'No pig found with ear no. {earNo}'
    },
    exportTodo: 'Export will be wired in BRD-LIST-001'
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
    title: { add: 'New usage / return / loss' },
    type: { use: 'Use', return: 'Return', loss: 'Loss' },
    column: {
      medicineId: 'Medicine ID',
      batchId: 'Batch ID',
      usageType: 'Type',
      usageQty: 'Qty',
      useDate: 'Date',
      pigId: 'Pig',
      relatedPenId: 'Pen',
      remark: 'Remark',
      createBy: 'Operator',
      createTime: 'Created'
    },
    field: {
      medicineId: 'Medicine ID',
      batchId: 'Batch',
      usageType: 'Type',
      usageQty: 'Quantity',
      useDate: 'Business date',
      useDateFrom: 'Date ≥',
      useDateTo: 'Date ≤',
      pigId: 'Pig',
      relatedPenId: 'Pen',
      remark: 'Remark'
    },
    placeholder: {
      batchId: 'Search batch by batch no.',
      useDate: 'Pick date'
    },
    rule: {
      batchId: { required: 'Batch is required' },
      usageType: { required: 'Type is required' },
      usageQty: { required: 'Qty must be > 0' },
      useDate: { required: 'Date is required' }
    },
    confirm: {
      del: 'Delete {count} usage record(s)? Stock changes will NOT be reverted.'
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
    }
  }
};
