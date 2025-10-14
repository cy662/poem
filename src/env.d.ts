/// <reference types="vite/client" />

// 声明 Vite 环境变量的类型
interface ImportMetaEnv {
  readonly MODE: string;    // 环境模式（development/production/test）
  readonly DEV: boolean;    // 是否为开发环境（true/false）
  readonly PROD: boolean;   // 是否为生产环境（true/false）
  // 若后续添加自定义环境变量（如 VITE_API_URL），需在此处补充声明
  // readonly VITE_API_URL: string;
}

// 扩展 ImportMeta 接口，添加 env 属性
interface ImportMeta {
  readonly env: ImportMetaEnv;
}