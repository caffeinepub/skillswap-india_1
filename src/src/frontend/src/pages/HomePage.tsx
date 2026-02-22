import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Users,
  ArrowRight,
  UserPlus,
  Search,
  Repeat2,
  GraduationCap,
  Code,
  Music,
  Palette,
  Camera,
  Languages,
  BookOpen,
  Dumbbell,
} from "lucide-react";
import { useEffect } from "react";

const featuredSkills = [
  { name: "Web Development", icon: Code, color: "text-primary" },
  { name: "Guitar & Music", icon: Music, color: "text-secondary" },
  { name: "Graphic Design", icon: Palette, color: "text-accent" },
  { name: "Photography", icon: Camera, color: "text-chart-4" },
  { name: "Languages", icon: Languages, color: "text-chart-5" },
  { name: "Academic Tutoring", icon: GraduationCap, color: "text-chart-1" },
  { name: "Creative Writing", icon: BookOpen, color: "text-chart-2" },
  { name: "Fitness Training", icon: Dumbbell, color: "text-chart-3" },
];

const howItWorks = [
  {
    step: 1,
    title: "Create Your Profile",
    description:
      "Sign in with Internet Identity and list the skills you offer and the skills you want to learn.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Find Your Match",
    description:
      "Browse skilled learners and teachers. Our platform suggests perfect matches based on your interests.",
    icon: Search,
  },
  {
    step: 3,
    title: "Swap & Learn",
    description:
      "Exchange skills directly—no money required. Schedule sessions, learn together, and grow your network.",
    icon: Repeat2,
  },
];

export default function HomePage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = loginStatus === "success" && identity;
  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with Diagonal Flow */}
      <section className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge
                variant="secondary"
                className="gap-2 px-4 py-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                India's First Skill Exchange Platform
              </Badge>
            </div>

            {/* Hero Heading - Split Typography */}
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Learn Anything.
              </span>
              <span className="block text-foreground mt-2">Teach Anything.</span>
              <span className="block text-foreground/80 text-4xl md:text-5xl mt-4 font-mono">
                Pay with Skills.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Join thousands of students exchanging knowledge without spending a
              rupee. Your skills are your currency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Button
                size="lg"
                className="gap-2 shadow-lifted hover:shadow-lifted-lg transition-all duration-300 group"
                onClick={() => login()}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  "Signing in..."
                ) : (
                  <>
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Users className="w-5 h-5" />
                How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 animate-in fade-in zoom-in-95 duration-700 delay-500">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  500+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary">
                  1,200+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Skills Exchanged
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">
                  100%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How SkillSwap Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start learning and teaching for free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lifted group"
                >
                  <CardContent className="pt-8 pb-6">
                    {/* Step Badge */}
                    <div className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lifted">
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Popular Skills on SkillSwap
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From coding to music, find or teach any skill you can imagine.
            </p>
          </div>

          {/* Diagonal Skill Tags - Signature Detail */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {featuredSkills.map((skill, index) => {
              const Icon = skill.icon;
              const rotation = (index % 3) - 1; // -1, 0, 1
              return (
                <div
                  key={index}
                  className="group cursor-pointer"
                  style={{
                    transform: `rotate(${rotation * 2}deg)`,
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotate(0deg) scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${rotation * 2}deg)`;
                  }}
                >
                  <Card className="border-2 hover:border-primary/50 shadow-md hover:shadow-lifted transition-all">
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <Icon className={`w-8 h-8 ${skill.color}`} />
                      <span className="font-mono text-sm text-center">
                        {skill.name}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => login()}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing in..." : "Start Swapping Skills"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Learn for Free?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join SkillSwap India today and unlock unlimited learning
            opportunities without spending money.
          </p>
          <Button
            size="lg"
            className="gap-2 shadow-lifted hover:shadow-lifted-lg transition-all duration-300"
            onClick={() => login()}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Create Free Account"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
