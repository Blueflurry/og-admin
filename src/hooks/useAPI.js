import { useState, useRef, useCallback } from "react";
import { API } from "../api";

export function useAPI() {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiRef = useRef(null);

    // Initialize API instance if it doesn't exist yet
    if (!apiRef.current) {
        apiRef.current = new API(setLoading, setError);
    }

    // Reset error helper function
    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return {
        api: apiRef.current,
        isLoading,
        error,
        resetError,
    };
}
