/**
 * 人员主数据类型定义（SYS-MD-001）。
 */

/** 后端 PersonVo 出参 */
export interface PersonVO extends BaseEntity {
  id: number | string;
  personCode: string;
  name: string;
  gender?: string;
  phone?: string;
  idCard?: string;
  postId?: number | string;
  postName?: string;
  hireDate?: string;
  status: string;
  avatarUrl?: string;
  remark?: string;
}

/** 新增 / 编辑表单（personCode 由后端生成，前端不传；postName 由后端 enrich，前端不传） */
export interface PersonForm {
  id?: number | string;
  name: string;
  gender?: string;
  phone?: string;
  idCard?: string;
  postId?: number | string;
  hireDate?: string;
  status?: string;
  avatarUrl?: string;
  remark?: string;
}

/** 列表查询入参（继承 PageQuery 拿 pageNum/pageSize） */
export interface PersonQuery extends PageQuery {
  name?: string;
  personCode?: string;
  phone?: string;
  status?: string;
  postId?: number | string;
}
