import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-primary",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nhà Xe Duy Hùng — Dịch vụ xe ghép liên tỉnh",
  description:
    "Nhà Xe Duy Hùng — Dịch vụ xe ghép liên tỉnh uy tín, an toàn, tiện lợi. Đặt vé trực tuyến, bảng giá minh bạch.",
  keywords: "xe ghép, liên tỉnh, đặt vé, Huế, Đà Nẵng, Hội An, nhà xe",
  openGraph: {
    title: "Nhà Xe Duy Hùng — Xe ghép liên tỉnh",
    description: "Dịch vụ xe ghép liên tỉnh uy tín, an toàn, tiện lợi",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={beVietnamPro.variable} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
