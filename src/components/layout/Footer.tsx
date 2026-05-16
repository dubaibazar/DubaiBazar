import React from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../constants';

import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          {/* Brand */}
          <div className="flex flex-col gap-6 md:max-w-md">
            <Logo size="md" />
            <p className="text-slate-500 text-base leading-relaxed font-medium">
              Curating the most exclusive gadgets, collectibles, and imported tech since 2012. Old dreams, modern gear.
            </p>
            <div className="flex gap-4">
              <a 
                href={BUSINESS_INFO.whatsappGroup}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-green-50 text-green-700 rounded-xl border border-green-100 font-black uppercase tracking-widest text-[9px] hover:bg-green-100 transition-all shadow-sm"
              >
                <MessageCircle size={16} />
                Join Community
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6 md:items-end md:text-right shrink-0">
            <div>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 w-fit rounded-lg md:ml-auto mb-4">Connect</h4>
              <div className="flex flex-col gap-6 text-sm text-slate-600 font-bold">
                <div className="flex items-start gap-4 md:flex-row-reverse">
                  <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                    <MapPin size={22} />
                  </div>
                  <span className="leading-relaxed max-w-[180px]">{BUSINESS_INFO.location}</span>
                </div>
                <div className="flex items-center gap-4 md:flex-row-reverse">
                  <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                    <Phone size={22} />
                  </div>
                  <span className="text-lg font-black tracking-tight">{BUSINESS_INFO.whatsapp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Dubai Bazar Ops. Restricted Domain.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase px-4 py-2 border border-slate-100 rounded-2xl">Verified Official Outlet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
