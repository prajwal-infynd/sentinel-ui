import { motion } from "framer-motion";
import { ArrowRight, Zap, FileText, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const DemoClosing = () => (
  <div className="min-h-screen bg-navy text-navy-foreground flex items-center justify-center p-8">
    <div className="max-w-3xl text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-6">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          From static screening to continuous{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI-driven risk intelligence
          </span>
        </h1>
        <p className="text-lg text-navy-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Deploy sanctions monitoring first. Then expand into PEP, adverse media, reputational risk,
          and full customer-book monitoring — using the same infrastructure.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Button size="lg" className="gap-2"><Rocket className="h-4 w-4" /> Request Pilot</Button>
          <Button size="lg" variant="outline" className="border-white/20 text-navy-foreground hover:bg-white/5 bg-transparent gap-2">
            <Users className="h-4 w-4" /> Speak to Product Team
          </Button>
          <Button size="lg" variant="outline" className="border-white/20 text-navy-foreground hover:bg-white/5 bg-transparent gap-2">
            <FileText className="h-4 w-4" /> Download Architecture
          </Button>
          <Button size="lg" variant="outline" className="border-white/20 text-navy-foreground hover:bg-white/5 bg-transparent gap-2">
            <ArrowRight className="h-4 w-4" /> Start Proof of Concept
          </Button>
        </div>
      </motion.div>
    </div>
  </div>
);

export default DemoClosing;
