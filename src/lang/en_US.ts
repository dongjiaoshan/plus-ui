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
        export: 'Export'
      }
    }
  },
  // Common text
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
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
      position: 'Position',
      status: 'Status',
      hireDate: 'Hire date',
      createTime: 'Created at'
    },
    field: {
      name: 'Name',
      gender: 'Gender',
      phone: 'Phone',
      idCard: 'ID card',
      position: 'Position',
      hireDate: 'Hire date',
      status: 'Status',
      remark: 'Remark'
    },
    placeholder: {
      name: 'Enter name',
      gender: 'Select gender',
      phone: 'Enter phone',
      idCard: 'Enter 15 / 18-digit ID card',
      position: 'Enter position',
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
  // Supplier master data (SYS-MD-003)
  supplier: {
    title: {
      add: 'Add supplier',
      edit: 'Edit supplier'
    },
    column: {
      supplierCode: 'Supplier code',
      supplierName: 'Supplier name',
      supplierType: 'Type',
      contactName: 'Contact',
      contactPhone: 'Phone',
      address: 'Address',
      businessStatus: 'Status',
      createTime: 'Created at'
    },
    field: {
      supplierName: 'Supplier name',
      supplierType: 'Type',
      contactName: 'Contact',
      contactPhone: 'Phone',
      address: 'Address',
      businessStatus: 'Status',
      settleType: 'Settle type',
      bankName: 'Bank name',
      bankAccount: 'Bank account',
      remark: 'Remark'
    },
    placeholder: {
      supplierName: 'Enter supplier name',
      supplierType: 'Select type',
      contactName: 'Enter contact name',
      contactPhone: 'Enter phone',
      address: 'Enter address',
      settleType: 'Enter settle type',
      bankName: 'Enter bank name',
      bankAccount: 'Enter bank account'
    },
    rule: {
      supplierName: { required: 'Supplier name is required' },
      supplierType: { required: 'Please select supplier type' },
      businessStatus: { required: 'Please select business status' },
      contactPhone: { pattern: 'Please enter a valid phone' }
    },
    confirm: {
      del: 'Delete the selected {count} supplier record(s)?'
    }
  },
  // Store master data (SYS-MD-002)
  store: {
    title: {
      add: 'Add store',
      edit: 'Edit store'
    },
    column: {
      storeCode: 'Store code',
      storeName: 'Store name',
      storeType: 'Store type',
      businessStatus: 'Business status',
      address: 'Address',
      contactName: 'Contact',
      contactPhone: 'Phone',
      createTime: 'Created at'
    },
    field: {
      storeCode: 'Store code',
      storeName: 'Store name',
      storeType: 'Store type',
      businessStatus: 'Business status',
      address: 'Address',
      contactName: 'Contact',
      contactPhone: 'Phone',
      remark: 'Remark'
    },
    placeholder: {
      storeName: 'Enter store name',
      storeType: 'Select store type',
      contactName: 'Enter contact name',
      contactPhone: 'Enter phone',
      address: 'Enter address'
    },
    option: {
      direct: 'Direct',
      franchise: 'Franchise',
      cooperating: 'Cooperating',
      terminated: 'Terminated'
    },
    rule: {
      storeName: { required: 'Store name is required' },
      businessStatus: { required: 'Business status is required' },
      contactPhone: { pattern: 'Please enter a valid phone' }
    },
    confirm: {
      del: 'Delete the selected {count} store record(s)?'
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
