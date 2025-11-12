import "./globals.css";

export const metadata = {
  title: "Urban Veins",
  description: "A clothing store for the modern urbanite.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
