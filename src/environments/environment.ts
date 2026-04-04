// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // 本地开发默认仍然从打包到 assets 里的 JSON 读取
  // 如需改为从服务器拉取完整诗词库，请在 environment.prod.ts 中覆盖 dbBaseUrl
  dbBaseUrl: 'assets',
  // 使用分片压缩包方式：后端提供 db0.zip ~ db5.zip，
  // 这里给出一个“基准”地址，以 db.zip 结尾，代码里会自动映射为 db0.zip...db5.zip
  fullDbZipUrl: 'https://reddah.blob.core.windows.net/msjjimg/db.zip'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
