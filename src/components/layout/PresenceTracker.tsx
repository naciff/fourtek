"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function PresenceTracker() {
    const supabase = supabaseBrowser();

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updatePresence = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from("users")
                    .update({ last_seen_at: new Date().toISOString() })
                    .eq("user_id", user.id);
            }
        };

        // Update once on mount
        updatePresence();

        // Update every 2 minutes
        interval = setInterval(updatePresence, 120000);

        return () => clearInterval(interval);
    }, [supabase]);

    return null; // This component doesn't render anything
}
