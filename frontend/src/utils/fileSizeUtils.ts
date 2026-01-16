// src/utils/fileUtils.ts
/**
 * 格式化文件大小
 * @param sizeInBytes 文件大小（字节）
 * @returns 格式化后的字符串，如 "1.5 MB"、"250 KB"、"2.3 GB" 等
 */
export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // 根据大小决定保留的小数位数
  let decimals = 2;
  if (size < 1) decimals = 3; // 小于1显示3位小数
  else if (size < 10) decimals = 2; // 小于10显示2位小数
  else if (size < 100) decimals = 1; // 小于100显示1位小数
  else decimals = 0; // 大于等于100显示整数

  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}

/**
 * 智能格式化文件大小，可处理多种输入格式
 * @param sizeInput 文件大小（可以是数字、字符串等）
 * @returns 格式化后的字符串
 */
export function formatFileSizeSmart(sizeInput: number | string): string {
  if (!sizeInput && sizeInput !== 0) return "0 B";

  // 如果是数字，直接格式化
  if (typeof sizeInput === "number") {
    return formatFileSize(sizeInput);
  }

  // 如果是字符串
  const str = String(sizeInput).trim();
  if (!str) return "0 B";

  // 检查是否已经是 "数字 单位" 格式
  const formattedMatch = str.match(/^(\d+(\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
  if (formattedMatch) {
    // 已经是格式化好的，直接返回
    return str;
  }

  // 尝试解析为数字
  const num = parseFloat(str);
  if (!isNaN(num)) {
    return formatFileSize(num);
  }

  // 无法解析，返回原值
  return str;
}
