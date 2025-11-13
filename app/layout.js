import "./globals.css";

export const metadata = {
  title: "Urban Veins",
  description: "A clothing store for the modern urbanite.",
  icons: {
    icon: "/favicon.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="smooth-scroll">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
