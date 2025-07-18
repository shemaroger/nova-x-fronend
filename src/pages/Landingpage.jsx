import React from 'react';
import { Users, Building2, ShieldCheck, Handshake, CreditCard, Facebook, Instagram, Send, Twitter, Youtube } from 'lucide-react';

// Topbar Component
const Topbar = () => {
    return (
        <nav className="bg-[#F5F7FA] py-4 px-8 flex justify-between rounded-2xl items-center shadow-sm container mx-auto">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
                <img src="/images/nova-logo.png" alt="Nova X Logo" className="h-20 w-auto" />
            </div>

            {/* Navigation links */}
            <ul className="flex space-x-10 text-base font-semibold text-gray-800">
                <li className="font-semibold">Home</li>
                <li className="hover:text-blue-600 cursor-pointer">Service</li>
                <li className="hover:text-blue-600 cursor-pointer">Feature</li>
                <li className="hover:text-blue-600 cursor-pointer">Product</li>
                <li className="hover:text-blue-600 cursor-pointer">Testimonial</li>
                <li className="hover:text-blue-600 cursor-pointer">FAQ</li>
            </ul>
            {/* Auth buttons */}
            <div className="flex items-center space-x-6">
                <a href="/login" className="text-blue-700 font-medium hover:underline">
                    Login
                </a>
                <a
                    href="/signup"
                    className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition"
                >
                    Sign up
                </a>
            </div>
        </nav>
    );
};

// Footer Component
const Footer = () => {
    return (
        <footer className="bg-[#263238] text-gray-300 py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden ">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Copyright section */}
                    <div className="space-y-2 max-w-[280px]">
                        <img src="/landing/nova-white.svg" alt="Nova X Logo" className="h-20 w-auto" />
                        <p className="text-sm">Copyright © 2024 NOVA X ltd.</p>
                        <p className="text-sm">All rights reserved</p>
                    </div>

                    {/* Company links */}
                    <div className="max-w-[200px]">
                        <h2 className="text-lg font-semibold text-white mb-4">Company</h2>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition-colors text-sm">About us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Contact us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Testimonials</a></li>
                        </ul>
                    </div>

                    {/* Support links */}
                    <div className="max-w-[200px]">
                        <h2 className="text-lg font-semibold text-white mb-4">Support</h2>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Help center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Terms of service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Legal</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Privacy policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors text-sm">Status</a></li>
                        </ul>
                    </div>

                    {/* Stay up to date section with send icon */}
                    <div className="lg:col-span-1 md:col-span-2 w-full max-w-[320px]">
                        <h2 className="text-lg font-semibold text-white mb-4">Stay up to date</h2>
                        <div className="relative w-full">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full px-4 py-2 pr-10 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                                aria-label="Subscribe"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Social media links */}
                <div className="mt-8 flex space-x-4">
                    <a href="https://instagram.com">
                        <Instagram className="hover:text-white transition-colors" />
                    </a>
                    <a href="https://facebook.com">
                        <Facebook className="hover:text-white transition-colors" />
                    </a>
                    <a href="https://twitter.com">
                        <Twitter className="hover:text-white transition-colors" />
                    </a>
                    <a href="https://youtube.com">
                        <Youtube className="hover:text-white transition-colors" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

// Main Landing Page Component
const LandingPage = () => {
    return (
        <>
            <Topbar />
            <main className="font-sans container  mx-auto">
                {/* Hero Section */}
                <section className="py-10 px-8 flex flex-col-reverse lg:flex-row items-center justify-between">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-4">
                            Empowering Your Business, <br />
                            <span className="text-blue-700">Elevating Your Potential</span>
                        </h1>
                        <p className="text-gray-600 text-base mb-6">
                            Unlock growth opportunities with NOVA X through innovative, non-collateral-based financing
                            solutions that expand your capital and connect you with forward-thinking investors to turn
                            your business vision into reality.
                        </p>
                        <a href="/signup" className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition">
                            Register
                        </a>
                    </div>
                    <div>
                        <img
                            src="/landing/landing1.svg"
                            alt="Landing"
                            width={500}
                            height={300}
                            className="w-full max-w-[500px] h-auto"
                        />
                    </div>
                </section>

                {/* Client Logos Section */}
                <section className="bg-white py-10 text-center">
                    <h2 className="text-2xl font-semibold mb-2">Our Clients</h2>
                    <p className="text-gray-500 mb-8">We have been working with more than 1000 clients</p>
                    <div className="flex justify-center flex-wrap gap-10 px-4">
                        {['nova-logo', 'nova-logo', 'nova-logo'].map((logo, idx) => (
                            <div key={idx} className="w-20 h-15 flex items-center justify-center rounded">
                                <img src={`/images/${logo}.png`} alt={`Logo ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Who Is It For Section */}
                <section className="py-10 px-8 text-center bg-white">
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                        Manage your capital in a single system
                    </h2>
                    <p className="text-gray-600 mb-12">Who is Nova X suitable for?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                title: 'Investors',
                                desc: 'Investors leverage Nova X to access diverse, high-potential SMEs for impactful growth.',
                                icon: <Users className="text-blue-600 w-8 h-8" />,
                            },
                            {
                                title: 'Businesses',
                                desc: 'Businesses secure capital through Nova Xs accessible, innovative, non- collateral financing platform.',
                                icon: <Building2 className="text-blue-600 w-8 h-8" />,
                            },
                            {
                                title: 'CMA',
                                desc: 'CMA supports Nova Xs mission, fostering a secure and inclusive financial ecosystem.',
                                icon: <ShieldCheck className="text-blue-600 w-8 h-8" />,
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                                <div className="text-3xl mb-4 flex justify-center">{item.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Discover Section */}
                <section className="bg-white py-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6">
                        {/* Left Side Illustration */}
                        <div className="flex-shrink-0 w-full md:w-1/2">
                            <img
                                src="/landing/discover.svg"
                                alt="Transform your business"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                                Discover How NOVA X Can Transform Your Business
                            </h1>
                            <p className="text-gray-600 text-base mb-8">
                                At NOVA X, we're revolutionizing the way small and medium-sized enterprises (SMEs) in Rwanda
                                access capital and grow. Our platform offers a seamless, secure, and innovative financing
                                experience that breaks down traditional barriers, enabling you to reach your full potential.
                            </p>
                            <a
                                href="#learn-more"
                                className="inline-block bg-blue-700 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-800 transition-colors duration-300"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </section>

                {/* Impact Metrics Section */}
                <section className="bg-[#F5F7FA] py-10 w-max-6xl mx-auto px-6">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Textual Part */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
                                Helping a local <span className="text-[#00008B]">business reinvent itself</span>
                            </h2>
                            <p className="text-gray-600 text-lg">
                                We reached here with our hard work and dedication
                            </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-6 text-gray-800">
                            {/* Investors */}
                            <div className="flex items-center gap-3">
                                <Users className='text-[#00008B]' />
                                <div>
                                    <p className="text-xl font-semibold">100,000</p>
                                    <p className="text-sm text-gray-500">Investors</p>
                                </div>
                            </div>

                            {/* Public Institutions */}
                            <div className="flex items-center gap-3">
                                <Handshake className='text-[#00008B]' />
                                <div>
                                    <p className="text-xl font-semibold">5</p>
                                    <p className="text-sm text-gray-500">Public Institutions</p>
                                </div>
                            </div>

                            {/* Businesses */}
                            <div className="flex items-center gap-3">
                                <Building2 className='text-[#00008B]' />
                                <div>
                                    <p className="text-xl font-semibold">828,867</p>
                                    <p className="text-sm text-gray-500">Businesses</p>
                                </div>
                            </div>

                            {/* Loans and Equity Sales */}
                            <div className="flex items-center gap-3">
                                <CreditCard className='text-[#00008B]' />
                                <div>
                                    <p className="text-xl font-semibold">1,926,436</p>
                                    <p className="text-sm text-gray-500">Loans and Equity sales</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Unleash your potential Section */}
                <section className="bg-white py-10 px-4 md:px-16 flex flex-col lg:flex-row items-center justify-center gap-12">
                    {/* Left side: Illustration */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <img
                            src="/landing/signup-illustration.svg"
                            alt="Sign Up Illustration"
                            className="max-w-full h-auto"
                        />
                    </div>

                    {/* Right side: Text */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Unleash Your Business's Full Potential with <span className="text-[#1E1EFA]">NOVA X</span>
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Welcome to NOVA X—your gateway to simplified, innovative financing designed specifically for Rwandan SMEs.
                            We are here to help you access the capital you need to scale and succeed.
                        </p>
                        <a
                            href="#"
                            className="inline-block bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-lg transition"
                        >
                            Learn More
                        </a>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="bg-[#F5F7FA] py-10">
                    <div className="max-w-5xl mx-auto grid grid-cols-2 gap-2 items-center">
                        {/* Image */}
                        <img
                            src="/landing/guy.jpg"
                            alt="Testimonial"
                            className="rounded-lg shadow-md"
                            width={300}
                            height={260}
                        />

                        {/* Testimonial Content */}
                        <div>
                            <p className="text-lg text-gray-700 mb-6">
                                Partnering with NOVA X has been a game-changer for my business. The process was straightforward,and I
                                received the funding I needed without the burden of collateral. Now, I'm able to expand my operations and
                                reach new markets. NOVA X truly understands the challenges faced by SMEs and provides the support we
                                need to grow.
                            </p>
                            <p className="font-semibold text-gray-900">Tim Smith</p>
                            <p className="text-sm text-gray-500 mb-4">Owner of Kigali Crafts</p>

                            {/* Logos */}
                            <div className="flex flex-wrap items-center gap-4 my-4">
                                {['nova-logo.png', 'nova-logo.png', 'nova-logo.png'].map((logo, idx) => (
                                    <img key={idx} src={`/images/${logo}`} alt={`Logo ${idx + 1}`} className="w-8 h-8" />
                                ))}
                                <a href="#" className="text-blue-700 text-sm font-medium hover:underline">
                                    Meet all customers →
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Cards Section */}
                <section className="bg-white py-10 text-center">
                    <h2 className="text-3xl font-bold mb-4">Caring is the new marketing</h2>
                    <p className="max-w-2xl mx-auto text-gray-600 mb-12">
                        The NovaX blog is the best place to read about the latest membership insights,
                        trends and more. See who's joining the community, read about how our community
                        are increasing their membership income and lots more.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 max-w-6xl mx-auto">
                        {[
                            {
                                title: 'Creating Streamlined Safeguarding Processes with OneRen',
                                image: '/landing/blog.jpg',
                            },
                            {
                                title: 'What are your safeguarding responsibilities and how can you manage them?',
                                image: '/landing/blog.jpg',
                            },
                            {
                                title: 'Revamping the Membership Model with Triathlon Australia',
                                image: '/landing/blog.jpg',
                            },
                        ].map((blog, idx) => (
                            <div
                                key={idx}
                                className="bg-white text-black rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300"
                            >
                                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="text-base text-gray-600 mb-2">{blog.title}</h3>
                                    <a href="#" className="text-blue-700 text-sm font-medium hover:underline">
                                        Readmore →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="bg-[#F5F7FA] py-10 text-center">
                    <h2 className="text-4xl font-bold mb-5">Begin Your Journey</h2>
                    <a
                        href="/signup"
                        className="inline-block bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-lg transition"
                    >
                        Register →
                    </a>
                </div>
            </main>

            {/* Footer Section */}
            <Footer />
        </>
    );
};

export default LandingPage;