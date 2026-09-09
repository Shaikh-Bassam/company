import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.email("Please enter a valid email"),
  subject: z.string().trim().min(2, "Tell us what this is about").max(120, "Subject is too long"),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000, "Message is too long"),
  source: z.enum(["project", "service", "general"]).catch("general"),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryField = keyof Inquiry;

export type InquiryState = {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<InquiryField | "form", string>>;
  values?: Partial<Record<InquiryField, string>>;
};

export const initialInquiryState: InquiryState = { status: "idle" };
