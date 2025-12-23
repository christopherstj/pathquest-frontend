"use client";

import { useRef, useEffect, MutableRefObject } from "react";

/**
 * Hook to maintain a stable ref that always contains the latest value.
 * Useful for avoiding stale closures in callbacks while keeping
 * stable function identity.
 * 
 * Common use case: keeping router.push() available in callbacks without
 * triggering effect re-runs.
 * 
 * @example
 * const routerRef = useStableRef(router);
 * // In a callback:
 * routerRef.current.push('/some-path');
 */
export function useStableRef<T>(value: T): MutableRefObject<T> {
    const ref = useRef(value);
    
    useEffect(() => {
        ref.current = value;
    }, [value]);
    
    return ref;
}

/**
 * Hook specifically for the Next.js router pattern.
 * Returns a ref that always contains the current router instance.
 * 
 * @example
 * import { useRouter } from "next/navigation";
 * 
 * const Component = () => {
 *     const router = useRouter();
 *     const routerRef = useRouterRef(router);
 *     
 *     const handleClick = useCallback(() => {
 *         routerRef.current.push('/new-path');
 *     }, []); // No need to include router in deps
 * };
 */
export function useRouterRef<T extends { push: (path: string) => void }>(router: T): MutableRefObject<T> {
    return useStableRef(router);
}

