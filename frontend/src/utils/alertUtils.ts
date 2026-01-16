// utils/alertUtils.ts

// 弹窗工具函数
export const showAlert = (
  message: string,
  type: "error" | "success" | "warning" = "error"
) => {
  // 移除消息中的表情符号，让弹窗更简洁
  const cleanMessage = message.replace(/[❌✅⚠️]/g, "").trim();

  switch (type) {
    case "error":
      alert(`错误: ${cleanMessage}`);
      break;
    case "success":
      alert(`成功: ${cleanMessage}`);
      break;
    case "warning":
      alert(`警告: ${cleanMessage}`);
      break;
    default:
      alert(cleanMessage);
  }
};

// 或者使用更高级的版本，支持自定义选项
interface AlertOptions {
  type?: "error" | "success" | "warning";
  title?: string;
  duration?: number;
}

export const showAdvancedAlert = (
  message: string,
  options: AlertOptions = {}
) => {
  const { type = "error", title } = options;

  const cleanMessage = message.replace(/[❌✅⚠️]/g, "").trim();
  const alertTitle = title || getDefaultTitle(type);

  alert(`${alertTitle}: ${cleanMessage}`);
};

const getDefaultTitle = (type: string) => {
  switch (type) {
    case "error":
      return "错误";
    case "success":
      return "成功";
    case "warning":
      return "警告";
    default:
      return "提示";
  }
};
