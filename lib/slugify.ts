import slugifyLib from 'slugify';
import { prisma } from '@/lib/db';

export function generateSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function generateUniqueSlug(
  text: string,
  model: 'story' | 'category' | 'tag' | 'author',
  excludeId?: string
): Promise<string> {
  const base = generateSlug(text);
  let slug = base;
  let counter = 2;

  while (true) {
    let existing: { id: string } | null = null;

    if (model === 'story') {
      existing = await prisma.story.findUnique({ where: { slug }, select: { id: true } });
    } else if (model === 'category') {
      existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    } else if (model === 'tag') {
      existing = await prisma.tag.findUnique({ where: { slug }, select: { id: true } });
    } else if (model === 'author') {
      existing = await prisma.author.findUnique({ where: { slug }, select: { id: true } });
    }

    if (!existing || existing.id === excludeId) {
      break;
    }

    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}
