import type { ReactNode } from "react";

export const metadata = {
  title: "Studiqa — Learn visually, retain longer",
  description: "AI-generated mind maps, notes, quizzes, flashcards and coding practice for engineering students.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
