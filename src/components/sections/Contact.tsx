"use client";

import { useActionState, useEffect, useId } from "react";
import { submitInquiry } from "@/actions/inquiry";
import { Button } from "@/components/ui/Button";
import { FitText } from "@/components/ui/FitText";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { initialInquiryState } from "@/lib/inquiry-schema";
import { useContact } from "@/store/contact";

export function Contact() {
  const { prefill, openContact } = useContact();
  const [state, formAction, pending] = useActionState(submitInquiry, initialInquiryState);

  // Hand-off from other pages: /?subject=…&source=…#contact
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");
    if (!subject) return;
    const source = params.get("source");
    openContact({ subject, source: source === "project" || source === "service" ? source : "general" });
    window.history.replaceState(null, "", "/#contact");
  }, [openContact]);

  const subjectDefault = state.values?.subject ?? prefill?.subject ?? "";

  return (
    <section id="contact" className="px-5 py-24 md:px-7 md:py-32">
      <FitText lines={["Let's talk"]} max={300} />

      <div className="mt-6 grid gap-12 border-t border-line pt-8 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <div className="space-y-8">
          <p className="eyebrow text-muted">New build, redesign or a ready-made project</p>
          <p className="max-w-md text-lg leading-relaxed">
            Tell us which project you want or what you need built. We reply within 24 hours with a price and a timeline.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="display inline-block text-[clamp(1.75rem,3.5vw,3rem)] underline-offset-[10px] transition-colors hover:text-muted hover:underline"
          >
            {site.email}
          </a>
        </div>

        {state.status === "success" ? (
          <div role="status" className="flex flex-col justify-center">
            <p className="display text-[clamp(2.5rem,6vw,6rem)]">Thanks.</p>
            <p className="mt-4 max-w-md text-lg text-muted">We got your message and will reply within 24 hours.</p>
          </div>
        ) : (
          <form action={formAction} noValidate className="relative space-y-8">
            <input type="hidden" name="source" value={prefill?.source ?? "general"} />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <div className="grid gap-8 sm:grid-cols-2">
              <Field label="Name" name="name" autoComplete="name" defaultValue={state.values?.name} error={state.errors?.name} />
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.values?.email}
                error={state.errors?.email}
              />
            </div>
            <Field key={subjectDefault} label="Subject" name="subject" defaultValue={subjectDefault} error={state.errors?.subject} />
            <Field label="Message" name="message" textarea defaultValue={state.values?.message} error={state.errors?.message} />
            {state.errors?.form && (
              <p role="alert" className="text-sm text-accent">
                {state.errors.form}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  textarea?: boolean;
};

function Field({ label, name, type = "text", autoComplete, defaultValue, error, textarea }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const cls = cn(
    "w-full border-b bg-transparent py-3 text-base text-fg outline-none transition-colors placeholder:text-muted focus:border-fg",
    error ? "border-accent" : "border-line",
  );
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-muted">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={4}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(cls, "resize-none")}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cls}
        />
      )}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
