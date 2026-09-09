"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { InquirySource } from "@/lib/types";
import { scrollToId } from "@/lib/scroll";

export type ContactPrefill = { subject: string; source: InquirySource };

type ContactContextValue = {
  prefill: ContactPrefill | null;
  openContact: (prefill: ContactPrefill) => void;
};

const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [prefill, setPrefill] = useState<ContactPrefill | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const openContact = useCallback(
    (next: ContactPrefill) => {
      setPrefill(next);
      if (pathname === "/") {
        scrollToId("contact");
        return;
      }
      const query = new URLSearchParams({ subject: next.subject, source: next.source });
      router.push(`/?${query.toString()}#contact`);
    },
    [pathname, router],
  );

  const value = useMemo(() => ({ prefill, openContact }), [prefill, openContact]);
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactContextValue {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used inside <ContactProvider>");
  return ctx;
}
