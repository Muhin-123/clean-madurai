import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Leaf } from 'lucide-react';
import CleanMaduraiLogo from '../logo/CleanMaduraiLogo';

export default function LandingFooter() {
    return (
        <footer className="bg-white border-t-2 border-[#E8F5E9]">
            <div className="container mx-auto px-6 max-w-6xl py-16">
                <div className="grid lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-5 lg:col-span-2">
                        <CleanMaduraiLogo size={44} />
                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                            A citizen-first platform for smart bio-waste exchange and civic management.
                            Together, we make Madurai cleaner, greener, and smarter.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#2E7D32]">
                            <Leaf className="w-4 h-4" />
                            <span>Serving the Citizens of Madurai</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { label: 'About Us', href: '#' },
                                { label: 'How It Works', href: '#' },
                                { label: 'Contact', href: '#' },
                                { label: 'Privacy Policy', href: '#' },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        className="text-gray-500 hover:text-[#2E7D32] transition-colors duration-200 font-medium"
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                                <span>Madurai Smart City Office,<br />Tamukkam, Madurai – 625002</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
                                <span>+91 452 123 4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[#2E7D32] shrink-0" />
                                <span>support@cleanmadurai.gov.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-[#E8F5E9] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400 font-medium">
                        © 2026 Clean Madurai. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-[#2E7D32] transition-colors">About</a>
                        <a href="#" className="hover:text-[#2E7D32] transition-colors">Contact</a>
                        <a href="#" className="hover:text-[#2E7D32] transition-colors">Privacy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
