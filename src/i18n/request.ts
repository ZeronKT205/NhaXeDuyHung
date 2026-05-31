import { getRequestConfig } from 'next-intl/server';

export const locales = ['vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

export default getRequestConfig(async () => {
  return {
    locale: defaultLocale,
    messages: (await import(`../../messages/vi.json`)).default,
  };
});
