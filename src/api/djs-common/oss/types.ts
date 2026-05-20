/**
 * OSS STS 上传凭证（SYS-INFRA-002）。
 *
 * 后端：org.dromara.djs.common.controller.OssStsController#credential
 *
 * V1 模式：PRESIGNED_PUT（默认）—— 前端拿 uploadUrl 直接 fetch PUT，无需手算签名
 * V2 模式：ALIYUN_STS（预留）—— 用 accessKeyId/Secret/Token 走阿里云 STS 客户端 SDK
 */
export interface OssStsCredentialVO {
  /** 对象键（djs/<bizType>/<yyyy>/<MM>/<dd>/<uuid>） */
  ossKey: string;
  /** 桶名 */
  bucket: string;
  /** OSS endpoint（不含协议头） */
  endpoint: string;
  /** 区域 */
  region: string;
  /** 凭证过期时间（ISO 字符串） */
  expiration: string;
  /** 有效期（秒） */
  sessionDurationSec: number;
  /** 业务类型 */
  bizType: string;
  /** 模式：PRESIGNED_PUT / ALIYUN_STS */
  mode: 'PRESIGNED_PUT' | 'ALIYUN_STS';

  // ---- PRESIGNED_PUT 模式字段 ----
  /** 预签名 PUT URL（V1 直接 fetch PUT 上传 body） */
  uploadUrl?: string;

  // ---- ALIYUN_STS 模式字段（V2 预留） ----
  accessKeyId?: string;
  accessKeySecret?: string;
  sessionToken?: string;
  /** 上传目录前缀 */
  dir?: string;
}

/**
 * 上传成功回写 BO。
 */
export interface OssNotifyBO {
  ossKey: string;
  originalName: string;
  size: number;
  mime: string;
  bizType: string;
}

/**
 * OssUpload 组件 emit('uploaded') 的 payload。
 */
export interface OssUploadResult {
  ossId: number;
  url: string;
  ossKey: string;
  originalName: string;
  size: number;
  mime: string;
}
