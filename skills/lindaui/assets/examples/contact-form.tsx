"use client";
import { useState, useId } from "react";
import { Input } from "@lindaui/ui/input";
import { Textarea } from "@lindaui/ui/textarea";
import { Button } from "@lindaui/ui/button";

export interface ContactFormProps { onSubmit: (values: { name: string; email: string; message: string }) => void | Promise<void>; }
export function ContactForm({ onSubmit }: ContactFormProps) {
  const id = useId();
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors = { name: values.name.trim() ? "" : "Name is required", email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Enter a valid email", message: values.message.trim() ? "" : "Message is required" };
  return (
    <form aria-label="Contact form" noValidate style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: "36rem" }} onSubmit={async event => {
      event.preventDefault(); setSubmitted(true);
      if (pending || Object.values(errors).some(Boolean)) return;
      setPending(true); setError(null);
      try { await onSubmit(values); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not send the message"); } finally { setPending(false); }
    }}>
      <Input label="Name" name="name" value={values.name} onChange={name => setValues(v => ({ ...v, name }))} isRequired isInvalid={submitted && Boolean(errors.name)} errorMessage={errors.name} />
      <Input label="Email" name="email" type="email" value={values.email} onChange={email => setValues(v => ({ ...v, email }))} isRequired isInvalid={submitted && Boolean(errors.email)} errorMessage={errors.email} />
      <Textarea label="Message" name="message" value={values.message} onChange={message => setValues(v => ({ ...v, message }))} isRequired isInvalid={submitted && Boolean(errors.message)} aria-describedby={submitted && errors.message ? id + "-message-error" : undefined} />
      {submitted && errors.message && <p id={id + "-message-error"} role="alert">{errors.message}</p>}
      {error && <p role="alert">{error}</p>}
      <Button type="submit" isDisabled={pending}>{pending ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
