import "./globals.css";

export const metadata = {
  title: "AI Agent Administracji Publicznej",
  description: "Responsywna strona z chatbotem AI, FAQ i formularzem kontaktowym.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}