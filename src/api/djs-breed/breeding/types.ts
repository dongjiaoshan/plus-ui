/**
 * 育种配置类型定义（BRD-MD-001 / CR-20260519-06）。
 *
 * 后端：org.dromara.djs.breed.breeding.*
 *  - BreedInfoController   /djs/breed/breeding/info/*     品种 / 品系
 *  - BreedConfigController /djs/breed/breeding/config/*   配种关系（mother/father/cub code 字符串引用 BreedInfo）
 */

/** 类型枚举（与字典 djs_breed_strain_type / DB t_farm_breed_info.breed_strain 严格对齐） */
export const BreedStrain = {
  /** 品种 */
  TYPE: 1,
  /** 品系 */
  STRAIN: 2
} as const;

export type BreedStrainValue = (typeof BreedStrain)[keyof typeof BreedStrain];

// ============= BreedInfo（品种 + 品系） =============

/** 后端 BreedInfoVo 出参 */
export interface BreedInfoVO extends BaseEntity {
  id: number | string;
  /** 1=品种 / 2=品系 */
  breedStrain: number;
  breedStrainCode: string;
  breedStrainName: string;
  parentCode?: string;
  description?: string;
  remark?: string;
  /** 创建人 sys_user.user_id */
  createBy?: number | string;
  /** 创建人姓名（USER_ID_TO_NICKNAME 翻译 sys_user.nick_name 中文名） */
  createByName?: string;
}

/** 新增 / 编辑表单 */
export interface BreedInfoForm {
  id?: number | string;
  breedStrain: number;
  breedStrainCode: string;
  breedStrainName: string;
  parentCode?: string;
  description?: string;
  remark?: string;
}

/** 列表查询入参（继承 PageQuery） */
export interface BreedInfoQuery extends PageQuery {
  breedStrain?: number;
  breedStrainCode?: string;
  breedStrainName?: string;
  parentCode?: string;
  /** 创建时间范围 - 开始（含），ISO yyyy-MM-dd HH:mm:ss */
  createTimeBegin?: string;
  /** 创建时间范围 - 结束（含），ISO yyyy-MM-dd HH:mm:ss */
  createTimeEnd?: string;
}

// ============= BreedConfig（配种关系） =============

/** 后端 BreedConfigVo 出参 */
export interface BreedConfigVO extends BaseEntity {
  id: number | string;
  /** 1=品种配种 / 2=品系配种 */
  breedStrain: number;
  /** 引用 t_farm_breed_info.breed_strain_code */
  motherCode: string;
  fatherCode: string;
  cubCode: string;
  remark?: string;
  /** 创建人 sys_user.user_id */
  createBy?: number | string;
  /** 创建人姓名（USER_ID_TO_NICKNAME 翻译 sys_user.nick_name 中文名） */
  createByName?: string;
}

/** 新增 / 编辑表单 */
export interface BreedConfigForm {
  id?: number | string;
  breedStrain: number;
  motherCode: string;
  fatherCode: string;
  cubCode: string;
  remark?: string;
}

/** 列表查询入参 */
export interface BreedConfigQuery extends PageQuery {
  breedStrain?: number;
  motherCode?: string;
  fatherCode?: string;
  cubCode?: string;
  /** 创建时间范围 - 开始（含），ISO yyyy-MM-dd HH:mm:ss */
  createTimeBegin?: string;
  /** 创建时间范围 - 结束（含），ISO yyyy-MM-dd HH:mm:ss */
  createTimeEnd?: string;
}
