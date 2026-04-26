import { Box, MapPin, Users, Clock } from "lucide-react";

export function StatsSection() {
  const stats = [
    { icon: Box, value: "2M+", label: "Shipments Delivered" },
    { icon: MapPin, value: "27,000+", label: "Pin Codes Covered" },
    { icon: Users, value: "25,000+", label: "Happy Customers" },
    { icon: Clock, value: "99.5%", label: "On-Time Delivery" },
  ];

  return (
    <section className="bg-brand-navy py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center justify-center text-center px-4">
                <Icon className="w-8 h-8 text-brand-orange mb-4" strokeWidth={2} />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-brand-light/80 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
