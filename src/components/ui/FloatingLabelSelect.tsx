"use client";
import React, { SelectHTMLAttributes } from "react";

interface FloatingLabelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}

export const FloatingLabelSelect = React.forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(
    ({ label, children, className = "", value, ...props }, ref) => {
        // Determine if label should float (has value)
        const hasValue = value !== "" && value !== undefined && value !== null;

        return (
            <div className="relative">
                <select
                    {...props}
                    ref={ref}
                    value={value}
                    className={`peer block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-green-600 focus:outline-none focus:ring-1 focus:ring-brand-green-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
                >
                    {children}
                </select>
                <label
                    className={`pointer-events-none absolute left-2 z-10 origin-[0] transform bg-white px-2 text-sm text-gray-500 duration-300 dark:bg-gray-800 dark:text-gray-400 ${hasValue
                        ? "top-0 -translate-y-1/2 scale-75 text-brand-green-600 dark:text-brand-green-500"
                        : "top-1/2 -translate-y-1/2 scale-100 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-brand-green-600 dark:peer-focus:text-brand-green-500"
                        }`}
                >
                    {label}
                </label>
            </div>
        );
    }
);
FloatingLabelSelect.displayName = "FloatingLabelSelect";
