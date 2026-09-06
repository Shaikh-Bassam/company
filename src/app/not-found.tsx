import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-8 pt-32">
      <DisplayHeading as="h1" size="hero" lines={["404", "Not found"]} />
      <p className="text-lg text-muted">That page doesn&apos;t exist. Let&apos;s get you back to the work.</p>
      <Button href="/">Back home</Button>
    </Container>
  );
}
