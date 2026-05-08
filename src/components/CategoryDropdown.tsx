"use client";

import { useState } from "react";

type CategoryOption = {
  value: string;
  label: string;
};

type CategoryDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: CategoryOption[];
  placeholder?: string;
  showAddCustom?: boolean;
  onAddCustom?: () => void;
  className?: string;
};

export default function CategoryDropdown({
  value,
  onChange,
  options,
  placeholder = "Select category",
  showAddCustom = false,
  onAddCustom,
  className = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
}: CategoryDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "__add_new__" && onAddCustom) {
      onAddCustom();
      return;
    }
    onChange(selectedValue);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={className}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {showAddCustom && (
        <option value="__add_new__">+ Add Custom Category</option>
      )}
    </select>
  );
}