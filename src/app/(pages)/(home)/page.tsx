import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Star,
  ArrowRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  FilePen,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BookDemo from "@/components/book-demo";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { SlEnvolopeLetter } from "react-icons/sl";
import { PiFileArrowUpDuotone } from "react-icons/pi";
import { MdOutlineAnalytics, MdOutlineVideoCameraFront } from "react-icons/md";
import HirelyVideo from "@/components/global-cmp/hirely-video";
import { AIChatbot } from "@/components/chat/ai-chatbot";

const BRAND = "Fluxhire";

const steps = [
  {
    step: 1,
    title: "Create Job Posting",
    description: "Create a job posting with all the details",
    icon: <PiFileArrowUpDuotone />,
  },
  {
    step: 2,
    title: "Smart Application Process",
    description: "Smart application process with invitation and matching",
    icon: <SlEnvolopeLetter />,
  },
  {
    step: 3,
    title: "AI Interview Session",
    description: "AI Interview Session with video and audio",
    icon: <MdOutlineVideoCameraFront />,
  },
  {
    step: 4,
    title: "Analytics & Results",
    description: "Get detailed analytics and results",
    icon: <MdOutlineAnalytics />,
  },
];

export default async function FluxhireLanding() {
  const session = await auth();
  if (session?.user?.role === "none") {
    redirect(`/role`);
  }

  // Determine primary CTA path
  const ctaPath = session?.user?.role
    ? `/${session.user.role}/dashboard`
    : "/register";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Decorative aurora orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute -top-16 left-1/2 -translate-x-1/2 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-30 bg-[radial-gradient(ellipse_at_center,theme(colors.primary)_0%,transparent_60%)]"></span>
        <span className="absolute top-1/3 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25 bg-[radial-gradient(ellipse_at_center,theme(colors.accent)_0%,transparent_60%)]"></span>
        <span className="absolute bottom-0 -right-24 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-25 bg-[radial-gradient(ellipse_at_center,theme(colors.secondary)_0%,transparent_60%)]"></span>
      </div>

      {/* AI Chatbot (floating) */}
      <AIChatbot />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl px-6 py-3 flex justify-between items-center border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]">
            <div className="flex items-center space-x-3">
              <Logo />
              <span className="text-2xl font-secondary font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                {BRAND}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {["features", "how-it-works"].map((sec) => (
                <a
                  key={sec}
                  href={`#${sec}`}
                  className="relative group font-medium text-foreground/90 hover:text-primary transition"
                >
                  {sec.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              <Link
                href="/blog"
                className="relative group font-medium text-foreground/90 hover:text-primary transition"
              >
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <BookDemo />
              {session ? (
                <Link href={ctaPath}>
                  <Button variant="outline" className="rounded-xl !text-foreground hover:bg-primary/10 hover:border-primary/40">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="rounded-xl !text-foreground hover:bg-primary/10 hover:border-primary/40">
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative heroGrad min-h-screen flex items-center justify-center overflow-hidden">
        {/* subtle grid overlay */}
        <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:36px_36px]"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
          <Badge className="inline-flex items-center backdrop-blur-lg px-4 py-2 rounded-full bg-white/15 border border-white/40 text-white mb-6">
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            <span>Over 100+ interviews carried out</span>
          </Badge>

          <h1 className="font-secondary font-bold text-balance text-5xl lg:text-7xl leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Uniting Talent & Opportunity
            <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">with AI</span>
          </h1>

          <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            {BRAND} is a smart recruiting platform that finds top talent and helps candidates shine through conversational AI interviews, seamless resume processing, and powerful analytics.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={ctaPath}>
              <Button
                size="lg"
                className="group px-8 py-3 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 inline-block transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <HirelyVideo />
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <a
              href="#features"
              className="w-12 h-12 rounded-full flex items-center justify-center border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition"
            >
              <ChevronDown className="w-6 h-6 text-white animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats + Visual Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 items-center">
            {/* Left visual */}
            <div className="relative">
              <Card className="rounded-3xl overflow-hidden shadow-2xl border border-primary/20 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
                <CardContent className="p-0">
                  <div
                    className="aspect-video bg-center bg-cover"
                    style={{ backgroundImage: "url('/videocalling.png')" }}
                  />
                </CardContent>
              </Card>

              <div className="absolute -right-8 -bottom-8">
                <Card className="bgGrad text-primary-foreground rounded-3xl border-0 shadow-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-white/80">Interview Quality</div>
                    <div className="text-3xl font-secondary font-bold">98%</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right stats */}
            <div className="space-y-8">
              <Badge className="inline-flex items-center px-4 py-2 rounded-full bg-primary/15 text-primary border border-primary/40 mb-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Growing Community</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-secondary font-bold text-foreground mb-4">
                Active interviews and assessments
              </h2>
              <div className="relative text-7xl lg:text-8xl font-secondary font-bold text-primary mb-6">
                100+
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur opacity-60"></div>
              </div>
              <p className="text-lg text-muted-foreground">
                The number of AI‑powered interviews conducted monthly continues to grow, making {BRAND} a top choice for intelligent hiring.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Card className="p-6 rounded-2xl border border-primary/20 text-center bg-white/60 dark:bg-white/5 backdrop-blur-lg hover:scale-[1.02] transition">
                  <div className="text-3xl font-secondary font-bold text-primary mb-1">75%</div>
                  <div className="text-sm text-muted-foreground">Time Saved</div>
                </Card>
                <Card className="p-6 rounded-2xl border border-secondary/20 text-center bg-white/60 dark:bg-white/5 backdrop-blur-lg hover:scale-[1.02] transition">
                  <div className="text-3xl font-secondary font-bold text-secondary mb-1">60%</div>
                  <div className="text-sm text-muted-foreground">Cost Reduction</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <Badge className="inline-flex items-center backdrop-blur-lg px-6 py-3 rounded-full bg-white/15 border border-white/40 text-white">
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              <span>Powerful Features</span>
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-secondary font-bold text-foreground">
              Everything you need for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                smart hiring
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI meets intuitive design for an exceptional interview experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Conversations",
                description: "Natural, adaptive interviews that feel human while maintaining consistency.",
                colorClass: "text-primary border-primary/30 bg-primary/10",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep insights and evaluation metrics on candidate performance.",
                colorClass: "text-secondary border-secondary/30 bg-secondary/10",
              },
              {
                icon: Users,
                title: "Smart Matching",
                description: "Intelligent matching based on skills, experience & cultural fit.",
                colorClass: "text-accent border-accent/30 bg-accent/10",
              },
              {
                icon: FilePen,
                title: "Smart Resume Processing",
                description: "AI extracts and organizes resume data instantly.",
                colorClass: "text-primary border-primary/30 bg-primary/10",
              },
              {
                icon: Shield,
                title: "Bias-Free Evaluation",
                description: "Fair, consistent assessment standards minimizing unconscious bias.",
                colorClass: "text-destructive border-destructive/30 bg-destructive/10",
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                description: "Real-time insights & recommendations as interviews progress.",
                colorClass: "text-secondary border-secondary/30 bg-secondary/10",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className={`relative rounded-3xl border ${feature.colorClass} shadow-lg overflow-hidden group bg-white/60 dark:bg-white/5 backdrop-blur-lg`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/0 via-white/5 to-white/10" />
                <CardContent className="p-8 space-y-4 relative z-10">
                  <div className={`w-16 h-16 border-2 rounded-full p-3 flex items-center justify-center ${feature.colorClass} group-hover:scale-110 transition`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground font-secondary">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-secondary font-bold text-foreground">
              How it <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A streamlined process from profile to hire in just a few steps.
            </p>
          </div>

          <Stepper defaultValue={1}>
            {steps.map(({ step, title, description, icon }) => (
              <StepperItem key={step} step={step}>
                <StepperTrigger className="flex-col gap-2">
                  <StepperIndicator asChild>
                    <span className="p-[2px] rounded-full bg-gradient-to-b from-primary/40 to-accent/40">
                      <span className="w-14 h-14 rounded-full p-3 flex items-center justify-center text-primary bg-white dark:bg-background border border-primary/30">
                        {icon}
                      </span>
                    </span>
                  </StepperIndicator>
                  <div className="space-y-1 text-center">
                    <StepperTitle className="text-lg font-semibold text-foreground font-secondary">
                      {title}
                    </StepperTitle>
                    <StepperDescription className="text-sm text-muted-foreground hidden sm:block">
                      {description}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                {step < steps.length && <StepperSeparator />}
              </StepperItem>
            ))}
          </Stepper>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-secondary font-bold text-foreground">
              Loved by <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">thousands</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from people who use {BRAND} daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "HR Director at TechFlow",
                content: "Fluxhire transformed our hiring process completely. We've reduced time‑to‑hire by 70% while improving candidate quality.",
                avatar: "SC",
                rating: 5,
              },
              {
                name: "Mike Rodriguez",
                role: "Startup Founder",
                content: "As a growing startup, Fluxhire gave us enterprise‑level hiring capabilities without the enterprise budget.",
                avatar: "MR",
                rating: 5,
              },
              {
                name: "Jennifer Park",
                role: "Software Engineer",
                content: "The interview experience was unlike anything I’ve encountered. It felt conversational yet professional.",
                avatar: "JP",
                rating: 5,
              },
            ].map((t, i) => (
              <Card
                key={i}
                className="bg-white/10 border border-primary/20 shadow-lg rounded-3xl hover:-translate-y-1 hover:shadow-xl transition will-change-transform"
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/95 italic">“{t.content}”</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-primary-foreground font-semibold">
                        {t.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Closing */}
      <section className="py-20 bg-gradient-to-b from-primary via-accent to-secondary text-center text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_10%,white_0,transparent_40%),radial-gradient(circle_at_80%_90%,white_0,transparent_40%)]" />
        <div className="relative max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-4xl lg:text-5xl font-secondary font-bold">Ready to revolutionize your hiring?</h2>
          <p className="text-lg text-white/90">
            Join thousands of forward-thinking companies and professionals experiencing the future of recruitment.
          </p>
          <Link href={ctaPath}>
            <Button size="lg" className="px-8 py-3 bg-white text-black hover:shadow-lg transition rounded-xl">
              Get Started
            </Button>
          </Link>
          <p className="text-sm text-white/80">No credit card required • Setup in 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bgGrad text-white text-center">
        <Logo className="w-16 mx-auto mb-4" />
        <div className="max-w-2xl mx-auto px-6">
          <p>© 2025 {BRAND}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}