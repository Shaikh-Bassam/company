import { Button } from "@/components/ui/Button";
import { FitText } from "@/components/ui/FitText";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col justify-center px-5 pt-20 md:px-7">
      <FitText as="h1" lines={["Not found"]} max={420} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
        <p className="max-w-md text-lg text-muted">That page doesn&apos;t exist. Let&apos;s get you back to the work.</p>
        <Button href="/">Back home</Button>
      </div>
    </section>
  );
}
