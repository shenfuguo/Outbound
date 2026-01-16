// src/utils/api.ts
/**
 * 通用 API 通信工具
 * 封装 GET、POST、PUT、DELETE、PATCH 等 HTTP 方法
 */

// 请求配置接口
interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  responseType?: "json" | "text" | "blob" | "arraybuffer";
}

// API 错误类
export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// API 响应接口
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

// 基础 API 类
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // 获取基础URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // 设置基础 URL
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // 构建完整 URL
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseURL}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      url += `?${queryParams.toString()}`;
    }

    return url;
  }

  // 核心请求方法
  private async request<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = 10000,
      responseType = "json",
      ...otherConfig
    } = config;

    // 构建完整 URL
    const url = this.buildUrl(endpoint, params);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...otherConfig,
      });

      clearTimeout(timeoutId);

      // 解析响应数据
      let data: any;
      if (responseType === "blob") {
        data = await response.blob();
      } else if (responseType === "text") {
        data = await response.text();
      } else if (responseType === "arraybuffer") {
        data = await response.arrayBuffer();
      } else {
        // 默认或json
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      }

      if (!response.ok) {
        throw new ApiError(
          data?.message || `请求失败: ${response.statusText}`,
          response.status,
          data
        );
      }

      return {
        data: data as T,
        status: response.status,
        ok: response.ok,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new ApiError(`请求超时 (${timeout}ms)`);
      } else if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`请求失败: ${error.message || "未知错误"}`);
      }
    }
  }

  // GET 请求
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, "method" | "params">
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "GET",
      params,
      ...config,
    });
    return response.data;
  }

  // POST 请求
  async post<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "POST",
      body: data,
      ...config,
    });
    return response.data;
  }

  // PUT 请求
  async put<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PUT",
      body: data,
      ...config,
    });
    return response.data;
  }

  // DELETE 请求
  async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, "method" | "params">
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "DELETE",
      params,
      ...config,
    });
    return response.data;
  }

  // PATCH 请求
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PATCH",
      body: data,
      ...config,
    });
    return response.data;
  }
}

// 创建全局 API 实例
// 简单的配置方式
const getApiBaseUrl = () => {
  // 可以根据需要修改这里
  return "http://localhost:5173/api";
};

export const api = new ApiClient(getApiBaseUrl());
