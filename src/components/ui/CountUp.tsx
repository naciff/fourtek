"use client";

import { useEffect, useState, useRef } from "react";
import { useLayout } from "../layout/LayoutContext";

interface CountUpProps {
    end: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    style?: string;
    currency?: boolean;
}

export default function CountUp({
    end,
    duration = 2000,
    decimals = 0,
    prefix = "",
    suffix = "",
    style = "",
    currency = false,
}: CountUpProps) {
    const [value, setValue] = useState(0);
    const startTime = useRef<number | null>(null);
    const requestRef = useRef<number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        setHasStarted(true);
        const animate = (time: number) => {
            if (!startTime.current) startTime.current = time;
            const progress = time - startTime.current;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeOutExpo)
            const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

            setValue(end * ease);

            if (percentage < 1) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [end, duration]);

    // Privacy mode
    const { settings } = useLayout();
    const showValues = settings.privacy.showValues;

    const formattedValue = currency
        ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    const display = currency ? formattedValue : `${prefix}${formattedValue}${suffix}`;

    // If privacy is active and this is a currency value (sensitive), hide it
    if (!showValues && currency) {
        return (
            <span className={`${style} filter blur-sm select-none`}>
                R$ •••••
            </span>
        );
    }

    return <span className={style}>{display}</span>;
}
