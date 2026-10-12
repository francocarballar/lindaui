"use client";

import { useDebounce as useValueDebounce } from "./use-debounce";

/** Migration API retains the optional 300ms default without changing the flat hook. */
export function useDebounce<T>(value: T, delay = 300): T { return useValueDebounce(value, delay); }
