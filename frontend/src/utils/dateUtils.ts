// src/utils/dateUtils.ts
/**
 * 格式化日期时间
 * @param dateInput 日期字符串、Date对象或时间戳
 * @param format 格式，默认 'yyyy-MM-dd HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  dateInput: string | Date | number,
  format: string = "yyyy-MM-dd HH:mm:ss"
): string {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const replacements: Record<string, () => string> = {
    yyyy: () => date.getFullYear().toString(),
    yy: () => date.getFullYear().toString().slice(-2),
    MM: () => pad(date.getMonth() + 1),
    dd: () => pad(date.getDate()),
    HH: () => pad(date.getHours()),
    hh: () => pad(date.getHours() % 12 || 12),
    mm: () => pad(date.getMinutes()),
    ss: () => pad(date.getSeconds()),
  };

  return format.replace(/yyyy|yy|MM|dd|HH|hh|mm|ss/g, (match) =>
    replacements[match] ? replacements[match]() : match
  );
}

/**
 * 智能格式化日期
 * @param dateInput 日期输入
 * @returns 格式为 'yy-MM-dd HH:mm:ss' 的字符串
 */
export function formatDateSmart(dateInput: string | Date | number): string {
  return formatDateTime(dateInput, "yy-MM-dd HH:mm:ss");
}
