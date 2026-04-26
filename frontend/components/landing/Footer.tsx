import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition mb-6">
              <Package className="h-8 w-8 text-brand-orange" />
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none italic">PAARO LOGISTICS</span>
                <span className="text-[10px] font-medium tracking-widest text-slate-300 italic">DELIVERING EXCELLENCE</span>
              </div>
            </Link>
            <p className="text-sm text-brand-light/70 leading-relaxed mb-6 max-w-xs">
              Paaro Logistics is one of India&apos;s leading logistics solution providers, offering express delivery services across the nation.
            </p>
            <div className="flex items-center gap-4 text-brand-light/70">
              <Link href="#" className="hover:text-white transition font-semibold text-sm">FB</Link>
              <Link href="#" className="hover:text-white transition font-semibold text-sm">TW</Link>
              <Link href="#" className="hover:text-white transition font-semibold text-sm">IN</Link>
              <Link href="#" className="hover:text-white transition font-semibold text-sm">IG</Link>
            </div>
          </div>

          {/* Services Col */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Services</h4>
            <ul className="space-y-3 text-sm text-brand-light/70">
              <li><Link href="#" className="hover:text-brand-orange transition">Domestic Delivery</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">Express Services</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">Warehousing</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">E-Commerce Logistics</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">Reverse Logistics</Link></li>
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-brand-light/70">
              <li><Link href="#" className="hover:text-brand-orange transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">News & Media</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-brand-orange transition">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Newsletter</h4>
            <p className="text-sm text-brand-light/70 mb-4">
              Subscribe to get updates and offers.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-[#1a4f76] text-white px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-brand-orange placeholder:text-brand-light/50 text-sm border border-white/10"
              />
              <button className="w-full bg-brand-orange hover:bg-[#e66000] text-white px-4 py-3 rounded-md font-semibold text-sm transition-colors">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-brand-light/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2024 Paaro Logistics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
