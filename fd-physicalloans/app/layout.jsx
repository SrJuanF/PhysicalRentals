import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Physical Artifact Rentals",
  description: "Rent physical tools and artifacts securely on the blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/*<head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>*/}
      <body className="antialiased font-inter">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
