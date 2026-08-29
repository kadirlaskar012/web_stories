import { Story, StoryPage, StoryElement } from '@prisma/client';

export type ValidationError = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

type StoryWithPages = Story & {
  pages: (StoryPage & { elements: StoryElement[] })[];
  author: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
};

export function validateStoryForPublishing(story: StoryWithPages): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!story.title?.trim()) {
    errors.push({ field: 'title', message: 'Story title is required', severity: 'error' });
  }
  if (!story.description?.trim()) {
    errors.push({ field: 'description', message: 'Story description is required', severity: 'error' });
  }
  if (!story.coverImage) {
    errors.push({ field: 'coverImage', message: 'Cover image is required', severity: 'error' });
  }
  if (!story.authorId) {
    errors.push({ field: 'author', message: 'Author is required', severity: 'error' });
  }
  if (!story.categoryId) {
    errors.push({ field: 'category', message: 'Category is required', severity: 'error' });
  }

  // Pages validation
  if (!story.pages || story.pages.length === 0) {
    errors.push({ field: 'pages', message: 'Story must have at least one page', severity: 'error' });
  } else {
    story.pages.forEach((page, index) => {
      if (!page.elements || page.elements.length === 0) {
        errors.push({
          field: `pages[${index}]`,
          message: `Page ${index + 1} has no elements`,
          severity: 'warning',
        });
      }

      page.elements.forEach((el) => {
        if (el.type === 'IMAGE' && !el.altText) {
          errors.push({
            field: `pages[${index}].elements`,
            message: `Page ${index + 1} has an image without alt text`,
            severity: 'warning',
          });
        }
      });
    });
  }

  // SEO warnings
  if (!story.seoTitle) {
    errors.push({ field: 'seoTitle', message: 'SEO title is not set — will use story title', severity: 'warning' });
  } else if (story.seoTitle.length > 60) {
    errors.push({ field: 'seoTitle', message: 'SEO title exceeds 60 characters', severity: 'warning' });
  }
  if (!story.seoDescription) {
    errors.push({ field: 'seoDescription', message: 'SEO description is not set', severity: 'warning' });
  } else if (story.seoDescription.length > 160) {
    errors.push({ field: 'seoDescription', message: 'SEO description exceeds 160 characters', severity: 'warning' });
  }

  return errors;
}

export function hasBlockingErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === 'error');
}
