/**
 * Project registry. Array order is display order; unpublished projects are filtered out everywhere.
 * To add a project: create a file next to this one exporting a `Project`, then add it below.
 */
import type { Project } from "../types";
import { tracelayer } from "./tracelayer";
import { passable } from "./passable";
import { marketpulse } from "./marketpulse";
import { energy } from "./energy";
import { fitLetter } from "./fit-letter";

const all: Project[] = [tracelayer, passable, marketpulse, energy, fitLetter];

export const projects: Project[] = all.filter((p) => p.published);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
