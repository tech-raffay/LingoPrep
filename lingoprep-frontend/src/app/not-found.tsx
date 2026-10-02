import type { Metadata } from "next";
import ErrorScreen from "@/components/layout/ErrorScreen";

export const metadata: Metadata = {
  title: "Page not found | LingoPrep",
};

export default function NotFound() {
  return <ErrorScreen kind="404" />;
}
