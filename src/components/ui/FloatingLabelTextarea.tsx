"use client";
import React, { TextareaHTMLAttributes } from "react";

interface FloatingLabelTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export const FloatingLabelTextarea = React.forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
    ({ label, className = "", ...props }, ref) => {
        return (
            <div className="relative">
                <textarea
                    {...props}
                    ref={ref}
                    placeholder=" " // Required for peer-placeholder-shown
                    className={`peer block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-green-600 focus:outline-none focus:ring-1 focus:ring-brand-green-600 placeholder-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[120px] resize-y ${className}`}
                />
                <label
                    className="pointer-events-none absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-brand-green-600 dark:bg-gray-800 dark:text-gray-400 dark:peer-focus:text-brand-green-500"
                >
                    {label}
                </label>
            </div>
        );
    }
);
FloatingLabelTextarea.displayName = "FloatingLabelTextarea";
