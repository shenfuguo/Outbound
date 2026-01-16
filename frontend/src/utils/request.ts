// utils/request.ts

// 简单的HTTP请求封装
export const request = {
  // 文件上传（带进度）
  async uploadFile(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 监听上传进度
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // 尝试解析JSON响应
            const responseText = xhr.responseText;
            const data = responseText ? JSON.parse(responseText) : {};
            resolve(data);
          } catch (error) {
            // 如果解析失败，返回原始文本
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("网络错误，请检查连接"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("请求超时"));
      });

      // 设置超时时间（30秒）
      xhr.timeout = 30000;

      xhr.open("POST", url);

      // 不需要设置Content-Type，FormData会自动设置
      xhr.send(formData);
    });
  },
};
