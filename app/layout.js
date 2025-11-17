import './globals.css';
import SessionProviderWrapper from './SessionProviderWrapper'; // 1. Import the wrapper

export const metadata = {
  title: "Urban Veins",
  description: "A clothing store for the modern urbanite.",
  icons: {
    icon: "/favicon.png",
  }
};

export default function RootLayout({ children }) {
  return (
  
    <html lang="en">
      <body>
        {/* 2. Wrap your entire application with the provider */}
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}