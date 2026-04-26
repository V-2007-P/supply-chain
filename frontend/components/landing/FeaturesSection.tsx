import { Smartphone, BrainCircuit, MapPin, Bell } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Real-Time Tracking",
      description: "Track your shipments in real-time with live location updates."
    },
    {
      icon: BrainCircuit,
      title: "AI Delay Prediction",
      description: "AI-powered system predicts delays and suggests solutions."
    },
    {
      icon: MapPin,
      title: "Smart Route Optimization",
      description: "Dynamic route optimization for faster and cost-effective delivery."
    },
    {
      icon: Bell,
      title: "Live Alerts & Notifications",
      description: "Instant alerts for delays, weather, traffic & important updates."
    }
  ];

  return (
    <section className="py-24 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why Choose <span className="text-brand-orange">Paaro Logistics</span>?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow text-center group">
                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-10 h-10 text-brand-navy" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
