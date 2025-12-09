/**
 * Module-level state for controlling peaks search behavior.
 * This allows non-React code (like getNewData) to check if peaks search should be disabled
 * without relying on React's render cycle timing.
 */

let peaksSearchDisabled = false;

export const setPeaksSearchDisabled = (disabled: boolean) => {
    peaksSearchDisabled = disabled;
};

export const isPeaksSearchDisabled = () => peaksSearchDisabled;

