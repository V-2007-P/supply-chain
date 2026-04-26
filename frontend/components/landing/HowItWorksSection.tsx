import { ClipboardCheck, PackageCheck, Truck, MapPin, PackageOpen } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    { icon: ClipboardCheck, title: "1. Create Shipment", desc: "Enter your pickup and delivery details." },
    { icon: PackageCheck, title: "2. Pickup & Processing", desc: "We pick up your package and process it at hub." },
    { icon: Truck, title: "3. In Transit", desc: "Your shipment is on the way with real-time tracking." },
    { icon: MapPin, title: "4. Out for Delivery", desc: "Nearest delivery partner is on the way." },
    { icon: PackageOpen, title: "5. Delivered", desc: "Your package is delivered safely at your doorstep." },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
        </div>

        <div className="relative">
          {/* Connecting Dotted Line */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-slate-200"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white rounded-full border-2 border-slate-100 shadow-sm flex items-center justify-center mb-6 relative z-10 group-hover:border-brand-orange group-hover:shadow-md transition-all">
                    <Icon className="w-10 h-10 text-brand-navy" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
