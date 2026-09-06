import { Contact } from "@/components/sections/Contact";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Offers } from "@/components/sections/Offers";
import { Process } from "@/components/sections/Process";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { site } from "@/config/site";
import { getFeaturedProjects, getProjects } from "@/lib/projects";

export default async function HomePage() {
  const [projects, featured] = await Promise.all([getProjects(), getFeaturedProjects()]);
  return (
    <>
      <Hero showcase={featured[0] ?? null} />
      <Statement />
      <Marquee items={site.marquee} />
      <Services />
      <Offers />
      <FeaturedWork projects={featured} />
      <ProjectsGrid projects={projects} />
      <Process />
      <Contact />
    </>
  );
}
