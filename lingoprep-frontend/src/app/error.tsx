"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorScreen from "@/components/layout/ErrorScreen";

/**
 * Route-level error boundary — renders the design's 500 screen inside the
 * normal chrome, with "Try again" re-running the failed segment.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorScreen kind="500" onRetry={() => unstable_retry()} />;
}
