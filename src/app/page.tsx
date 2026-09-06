import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Offers } from "@/components/sections/Offers";
import { Statement } from "@/components/sections/Statement";
import { Work } from "@/components/sections/Work";
import { getFeaturedProjects, getProjects } from "@/lib/projects";

export default async function HomePage() {
  const [projects, featured] = await Promise.all([getProjects(), getFeaturedProjects()]);
  return (
    <>
      <Hero showcase={featured[0] ?? projects[0] ?? null} />
      <Statement />
      <Work projects={projects} />
      <Offers />
      <Contact />
    </>
  );
}
