export const environment = {
  production: true,
  // 线上建议将完整诗词库部署到服务器（例如 CDN），然后把这里改成对应基础 URL，
  // 如 'https://your-domain.com/assets'，这样就不需要把庞大的 /assets/db 打进安装包。
  dbBaseUrl: 'assets',
  // 如果将来你把整个 /assets/db 打成 db.zip 放到服务器，
  // 可以在这里配置完整 zip 下载地址，然后在 DataService 里使用。
  // 现在后端已将大包拆分为 db0.zip ~ db5.zip 存在同一目录下，
  // 这里使用一个以 db.zip 结尾的基准地址，实际下载时会自动映射为多段 db0.zip...db5.zip。
  fullDbZipUrl: 'https://reddah.blob.core.windows.net/msjjdb/db.zip'
};
