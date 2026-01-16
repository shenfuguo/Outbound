// components/SearchableSelect.tsx
import React, { useState, useEffect, useRef } from "react";

export interface Option {
  value: string;
  label: string;
  type?: "合同" | "图纸" | "both"; // 可选，用于过滤
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allowClear?: boolean;
  filterByType?: "合同" | "图纸" | "all";
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "请选择或搜索...",
  disabled = false,
  className = "",
  searchPlaceholder = "输入关键词搜索...",
  emptyMessage = "没有找到匹配的选项",
  allowClear = true,
  filterByType = "all",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 根据类型过滤选项
  const filteredOptions = options.filter((option) => {
    if (filterByType === "all") return true;
    if (option.type === "both") return true;
    return option.type === filterByType;
  });

  // 根据搜索词过滤选项
  const searchResults = filteredOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 更新选中的选项
  useEffect(() => {
    const option = options.find((opt) => opt.value === value) || null;
    setSelectedOption(option);
  }, [value, options]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 处理选择选项
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm("");
    setIsOpen(false);
  };

  // 清空选择
  const handleClear = () => {
    onChange("");
    setSearchTerm("");
  };

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  // 处理输入框点击
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 显示框 */}
      <div
        className={`
          w-full px-4 py-3 border rounded-lg 
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
          flex items-center justify-between cursor-pointer
          ${
            disabled
              ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
              : "bg-white border-gray-300 hover:border-gray-400"
          }
        `}
        onClick={handleInputClick}
      >
        {selectedOption ? (
          <span className="text-gray-900">{selectedOption.label}</span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <div className="flex items-center space-x-2">
          {allowClear && value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200"
              title="清空"
            >
              ×
            </button>
          )}
          <span
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* 下拉面板 */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* 搜索框 */}
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* 选项列表 */}
          <div className="max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((option) => (
                  <li
                    key={option.value}
                    className={`
                      px-4 py-3 cursor-pointer hover:bg-gray-100
                      ${
                        value === option.value
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                    {option.type && option.type !== "both" && (
                      <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">
                        {option.type}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
