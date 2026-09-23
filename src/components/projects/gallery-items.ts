import type { Project } from '@/content'

export interface GalleryItem {
  /** Real image path, when the project ships one. Absent for the generated fallback. */
  src?: string
  alt: string
  /** Stable seed for the fallback gradient — also doubles as the React key. */
  seed: string
}

const FALLBACK_COUNT = 3

/**
 * `Project.gallery` is optional and no current project supplies one (`src/content/projects.ts`
 * — real screenshots aren't in yet). Rather than rendering an empty section, fall back to
 * generated gradient placeholders (same algorithm as the cover SVGs), each clearly marked
 * TODO(agustin) in its alt text so it reads as a placeholder, not a broken image.
 */
export function getProjectGalleryItems(project: Project): GalleryItem[] {
  if (project.gallery && project.gallery.length > 0) {
    return project.gallery.map((image, index) => ({
      src: image.src,
      alt: image.alt,
      seed: `${project.slug}-gallery-${index}`,
    }))
  }

  return Array.from({ length: FALLBACK_COUNT }, (_, index) => ({
    alt: `TODO(agustin): add a real gallery image (${index + 1} of ${FALLBACK_COUNT}) for ${project.title}.`,
    seed: `${project.slug}-gallery-${index}`,
  }))
}
