export interface R2HttpMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

export interface R2ObjectLike {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
  range?: R2Range;
  writeHttpMetadata(headers: Headers): void;
}

export interface R2ObjectBodyLike extends R2ObjectLike {
  body: ReadableStream<Uint8Array>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface R2PutOptions {
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2ListResult {
  objects: R2ObjectLike[];
  truncated: boolean;
  cursor?: string;
}

export interface R2BucketLike {
  get(key: string, options?: { range?: R2Range | Headers }): Promise<R2ObjectBodyLike | null>;
  head(key: string): Promise<R2ObjectLike | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string | Blob,
    options?: R2PutOptions
  ): Promise<R2ObjectLike | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2ListResult>;
}

export interface KVNamespaceLike {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface AssetsFetcherLike {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

export interface CloudflareEnv {
  ASSETS?: AssetsFetcherLike;
  MEDIA_BUCKET?: R2BucketLike;
  CMS_KV?: KVNamespaceLike;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  AUTH_SECRET?: string;
  R2_PUBLIC_URL?: string;
  ALLOW_CF_ACCESS?: string;
  GEMINI_API_KEY?: string;
}
