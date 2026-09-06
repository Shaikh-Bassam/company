"use client";

import { useActionState, useEffect, useId } from "react";
import { submitInquiry } from "@/actions/inquiry";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
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
    <section id="contact" className="py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <DisplayHeading lines={["Let's build", "something."]} />
          <p className="max-w-md text-lg text-muted">
            Tell us which project you want or what you need built. We reply within 24 hours with a price and timeline.
          </p>
          <a href={`mailto:${site.email}`} className="inline-block text-accent hover:underline">
            {site.email}
          </a>
        </div>

        {state.status === "success" ? (
          <div role="status" className="flex flex-col justify-center rounded-card border border-line bg-surface p-8">
            <p className="display text-3xl text-accent">Thanks!</p>
            <p className="mt-3 text-muted">We got your message and will reply within 24 hours.</p>
          </div>
        ) : (
          <form action={formAction} noValidate className="relative space-y-5 rounded-card border border-line bg-surface p-6 md:p-8">
            <input type="hidden" name="source" value={prefill?.source ?? "general"} />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <Field label="Name" name="name" autoComplete="name" defaultValue={state.values?.name} error={state.errors?.name} />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.values?.email}
              error={state.errors?.email}
            />
            <Field key={subjectDefault} label="Subject" name="subject" defaultValue={subjectDefault} error={state.errors?.subject} />
            <Field label="Message" name="message" textarea defaultValue={state.values?.message} error={state.errors?.message} />
            {state.errors?.form && (
              <p role="alert" className="text-sm text-red-400">
                {state.errors.form}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </Container>
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
    "w-full rounded-xl border bg-bg px-4 py-3 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none",
    error ? "border-red-400" : "border-line",
  );
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cls}
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
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
