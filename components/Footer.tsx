/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Phone,
  EnvelopeSimple,
  MapPin,
  LinkedinLogo,
  TwitterLogo,
  FacebookLogo,
  InstagramLogo,
} from "@phosphor-icons/react";

const Footer = ({ pricingPage = false }) => {
  return (
    <footer
      className={`text-white ${
        pricingPage
          ? "bg-gradient-to-r from-[#051A33]  to-[#041323]"
          : "bg-gradient-to-b from-[#1A2332]  to-[#041322]"
      }`}>
      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <img
                src='/logoFikrTech.png'
                alt='FikrTech Logo'
                width={60}
                height={60}
              />
              <h3 className='text-xl font-bold'>FikrTech</h3>
            </div>
            <p className='text-gray-300 text-sm leading-relaxed'>
              Empowering students with personalized tutoring, comprehensive
              courses, and expert coaching to achieve academic excellence.
            </p>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200'>
                <FacebookLogo size={20} />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200'>
                <TwitterLogo size={20} />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200'>
                <LinkedinLogo size={20} />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200'>
                <InstagramLogo size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-white'>Quick Links</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  Our Tutors
                </a>
              </li>

              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-white'>Our Services</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  University Tutoring
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  Assignment Help
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  Online Courses
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-300 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                  Career Coaching
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-white'>Contact Us</h4>
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <MapPin
                  size={18}
                  className='text-[#97beda] mt-0.5 flex-shrink-0'
                />
                <p className='text-gray-300 text-sm'>
                  Sahat Al-Assi St.
                  <br />
                  Hama City, Syria
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <Phone size={18} className='text-[#97beda] flex-shrink-0' />
                <p className='text-gray-300 text-sm'>+963 930294306</p>
              </div>
              <div className='flex items-center space-x-3'>
                <EnvelopeSimple
                  size={18}
                  className='text-[#97beda] flex-shrink-0'
                />
                <p className='text-gray-300 text-sm'>info@fikrtech.com</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className='pt-2'>
              <button className='bg-[#97beda]/20 backdrop-blur-sm border border-[#97beda]/30 px-4 py-2 text-white rounded-lg hover:bg-[#97beda]/30 transition-all duration-300 font-medium shadow-lg text-sm'>
                <Phone size={16} className='inline mr-2' />
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className='border-t border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0'>
            <div className='text-center md:text-left'>
              <h5 className='text-lg font-semibold text-white mb-1'>
                Stay Updated
              </h5>
              <p className='text-gray-300 text-sm'>
                Get the latest educational tips and course updates
              </p>
            </div>
            <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto'>
              <input
                type='email'
                placeholder='Enter your email'
                className='px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#97beda] transition-colors duration-200 flex-1 sm:w-64'
              />
              <button className='bg-gradient-to-r from-[#1d9af8] to-[#1279F0]  text-[#FCFEFC] hover:bg-gradient-to-r hover:from-[#1279F0] hover:to-[#1d9af8] px-6 py-2 rounded-lg font-medium  transition-all duration-500'>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-gray-700 bg-slate-900/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0'>
            <p className='text-gray-400 text-sm'>
              © 2025 FikrTech. All rights reserved.
            </p>
            <div className='flex space-x-6'>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                Privacy Policy
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                Terms of Service
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#97beda] transition-colors duration-200 text-sm'>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
