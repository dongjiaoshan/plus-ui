/**
 * 门店退回管理 admin API（STR-RETURN-001，admin only 无 mp）。
 *
 * 后端：org.dromara.djs.store.returns.controller.StoreReturnController  /djs/store/return
 * 权限串 djs:store:return:{list,query,add,edit,remove,export}。
 * 范围（决策 a）：三方向退回登记 + 会员/追溯码字段，不做库存联动 / 不做状态机。
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  StoreReturnBatchForm,
  StoreReturnConfirmForm,
  StoreReturnForm,
  StoreReturnOpsItemVO,
  StoreReturnOwnerOptionVO,
  StoreReturnPorkCandidateVO,
  StoreReturnUnitCandidateVO,
  StoreReturnUnitForm,
  StoreReturnVegCandidateVO,
  StoreReturnQuery,
  StoreReturnVO
} from './return/types';

/** 列表（分页） */
export const listStoreReturn = (query?: StoreReturnQuery): AxiosPromise<StoreReturnVO[]> => {
  return request({
    url: '/djs/store/return/list',
    method: 'get',
    params: query
  });
};

/** 详情 */
export const getStoreReturn = (id: string) => {
  return request<StoreReturnVO>({
    url: `/djs/store/return/${id}`,
    method: 'get'
  });
};

/** 新增（returnNo 服务端生成） */
export const addStoreReturn = (data: StoreReturnForm) => {
  return request<string>({
    url: '/djs/store/return',
    method: 'post',
    data
  });
};

/** 编辑（不允许改 returnNo） */
export const updateStoreReturn = (data: StoreReturnForm) => {
  return request({
    url: '/djs/store/return',
    method: 'put',
    data
  });
};

/** 退回操作批量录入（原型「退回操作」，建 pending 待仓库确认，不入库） */
export const batchCreateStoreReturn = (data: StoreReturnBatchForm) => {
  return request<number>({
    url: '/djs/store/return/operation/batch',
    method: 'post',
    data
  });
};

/** 退回操作「猪肉产品」tab 候选（row214：取字典「退回产品清单」里 belong_type=pork/white_bar 的产品，与门店当日有无到店无关） */
export const listPorkReturnCandidates = (storeId: string): AxiosPromise<StoreReturnPorkCandidateVO[]> => {
  return request({
    url: '/djs/store/return/operation/pork-candidates',
    method: 'get',
    params: { storeId }
  });
};

/** 退回操作「果蔬产品」tab 候选（row214：取字典「退回产品清单」里 belong_type=vegetable 的产品；材料外售的成品会折叠成其原材料） */
export const listVegReturnCandidates = (storeId: string): AxiosPromise<StoreReturnVegCandidateVO[]> => {
  return request({
    url: '/djs/store/return/operation/veg-candidates',
    method: 'get',
    params: { storeId }
  });
};

/**
 * 退回操作「其他产品」tab 候选（row214）：**非猪肉非果蔬的一律落这里**（甲方原话「其他的类型统一显示在其他产品里」），
 * 含 belong_type 为空的外购产品；礼盒除外（拆不回单一原材料，确认那步必然 400，候选侧就剔掉）。
 * 三个 tab 同源 —— 字典「退回产品清单」`djs_return_product_list`，按产品自身 belong_type 分流。
 * 返回的 arrivedQuantity 恒为 null = **不封顶**（甲方「对于其退回量不做限制」），台账封顶口径已作废。
 */
export const listOtherReturnCandidates = (storeId: string): AxiosPromise<StoreReturnVegCandidateVO[]> => {
  return request({
    url: '/djs/store/return/operation/other-candidates',
    method: 'get',
    params: { storeId }
  });
};

/**
 * 仓库确认实收（原型「退回记录」仓库确认入库，pending→received 联动外购入库）。
 *
 * `receivedQty` / `receivedWeight` 传的都是**原材料量**：admin「门店退回操作」抽屉里界面按
 * **退回单位**录，提交前必须乘 `materialNum` 换算（与 mp `metric.ts#toConfirmWeight` 同一套），
 * 否则同一张单 admin 处理与 mp 处理会写出两个数。
 */
export const confirmStoreReturn = (data: StoreReturnConfirmForm) => {
  return request({
    url: '/djs/store/return/confirm',
    method: 'put',
    data
  });
};

// ---------------------------------------------------------------------------
// STR-RETURN-OPS-001 admin「门店退回操作」
// ---------------------------------------------------------------------------

/**
 * 门店退回操作抽屉明细：一张退回单（退回类型 + 退回日期 + 门店/退回单位）下的逐产品行。
 *
 * 「退回处理」与「查看详情」共用本端点 —— 同一份数据，由前端按 `returnStatus` 决定可编辑性。
 */
export const listReturnOpsItems = (query?: StoreReturnQuery): AxiosPromise<StoreReturnOpsItemVO[]> => {
  return request({
    url: '/djs/store/return/operation/items',
    method: 'get',
    params: query
  });
};

/**
 * 门店退回操作页「退回门店」筛选项：现有退回记录里出现过的门店 / 退回单位，去重（V6 row222）。
 *
 * 不接受筛选参数 —— 选项池必须是全量的，跟着当前搜索条件变会导致筛完只剩自己那一项。
 */
export const listReturnOwnerOptions = (): AxiosPromise<StoreReturnOwnerOptionVO[]> => {
  return request({
    url: '/djs/store/return/operation/owner-options',
    method: 'get'
  });
};

/**
 * 「新增单位退回」弹框候选产品：字典「退回产品清单」按产品编码 resolve 出的产品数据（含入库库位候选）。
 */
export const listReturnUnitCandidates = (): AxiosPromise<StoreReturnUnitCandidateVO[]> => {
  return request({
    url: '/djs/store/return/operation/unit-candidates',
    method: 'get'
  });
};

/**
 * 新增一张「单位退回」单：落 return_type='unit' + return_status='received'，未丢弃行同事务写入库。
 */
export const createUnitReturn = (data: StoreReturnUnitForm) => {
  return request<number>({
    url: '/djs/store/return/unit',
    method: 'post',
    data
  });
};

/** 软删 */
export const delStoreReturn = (ids: string | string[]) => {
  return request({
    url: `/djs/store/return/${Array.isArray(ids) ? ids.join(',') : ids}`,
    method: 'delete'
  });
};

/** 导出 */
export const exportStoreReturn = (query?: StoreReturnQuery) => {
  return request({
    url: '/djs/store/return/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};
