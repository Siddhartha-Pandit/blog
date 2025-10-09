import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans px-8 py-16 sm:px-20">
      {/* Hero Section */}
      <header className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold font-[Poppins] mb-4 text-primary">
          Tech Blog Design System
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-7">
          A professional, minimal, and tech-inspired aesthetic. Built with
          Inter, IBM Plex Sans, and JetBrains Mono — inspired by Medium and
          Vercel Blog.
        </p>
      </header>

      {/* Typography Section */}
      <section className="max-w-4xl mx-auto mb-20 space-y-6">
        <h2 className="text-3xl font-semibold text-foreground">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-[Inter]">H1 - Blog Title</h1>
          <h2 className="text-2xl font-semibold font-[Inter]">
            H2 - Section Header
          </h2>
          <h3 className="text-xl font-semibold font-[Inter]">
            H3 - Subheader
          </h3>
          <p className="text-base font-normal leading-7 text-foreground">
            Body text example — clean, readable, and consistent across all
            devices. Perfect for long-form content.
          </p>
          <code className="block bg-muted text-primary px-3 py-2 rounded font-[JetBrains_Mono] text-sm">
            Inline code snippet example
          </code>
          <p className="text-sm text-muted-foreground">
            Caption / Meta — Example text for date, author, and tags.
          </p>
        </div>
      </section>

      {/* Color Palette */}
      <section className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold mb-6 text-foreground">Color System</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { name: "Primary", color: "bg-primary text-primary-foreground" },
            { name: "Accent", color: "bg-accent text-accent-foreground" },
            { name: "Muted", color: "bg-muted text-muted-foreground" },
            { name: "Card", color: "bg-card text-card-foreground" },
          ].map((c) => (
            <div
              key={c.name}
              className={`p-6 rounded-lg border border-border flex flex-col items-center justify-center ${c.color}`}
            >
              <span className="font-medium">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold mb-6 text-foreground">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-[#1F63C9] transition">
            Primary
          </button>
          <button className="border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-accent transition">
            Secondary
          </button>
          <button className="text-foreground bg-transparent hover:bg-muted px-6 py-3 rounded-md font-medium transition">
            Ghost
          </button>
        </div>
      </section>

      {/* Blog Card Example */}
      <section className="max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold mb-6 text-foreground">Blog Card</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <article className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:scale-[1.02] transition-transform">
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              The Future of Web Development
            </h3>
            <p className="text-muted-foreground leading-7 mb-4">
              Exploring new technologies and design principles that define
              modern web experiences.
            </p>
            <a
              href="#"
              className="text-primary font-medium hover:underline hover:underline-offset-4"
            >
              Read more →
            </a>
          </article>

          <article className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:scale-[1.02] transition-transform">
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Understanding Design Systems
            </h3>
            <p className="text-muted-foreground leading-7 mb-4">
              How consistent color, typography, and spacing create brand
              identity and user trust.
            </p>
            <a
              href="#"
              className="text-primary font-medium hover:underline hover:underline-offset-4"
            >
              Read more →
            </a>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-muted-foreground border-t border-border pt-8 mt-20">
        <p className="text-sm">
          © 2025 Tech Blog — Designed with ❤️ using your custom design system.
        </p>
      </footer>
    </div>
  );
}
