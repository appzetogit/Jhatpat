/*
 * Default content for the public website home page. Seeded into
 * taxi_website_pages the first time it is read; after that the admin owns it.
 * Image fields hold a URL (uploaded via admin) or a /site/... path shipped with
 * the frontend, which is what these defaults point at.
 */
export const WEBSITE_DEFAULTS = {
  sections: {
    hero: true,
    trust: true,
    services: true,
    how: true,
    features: true,
    app: true,
    partner: true,
    testimonials: false,
    faq: true,
    contact: true,
  },

  brand: {
    name: 'Jhatpat',
    tagline: 'Ride. Order. Deliver.',
    logo: '/site/logo.png',
  },

  nav: [
    { label: 'Services', href: '#services' },
    { label: 'How it works', href: '#how' },
    { label: 'Partner with us', href: '#partner' },
    { label: 'FAQs', href: '#faq' },
  ],
  navCta: { label: 'Explore services', href: '#services' },

  hero: {
    eyebrow: 'One app for everything you need',
    title: 'Rides, food and parcels —',
    highlight: 'delivered Jhatpat.',
    subtitle:
      'Book a taxi in seconds, order from the restaurants you love, or send a parcel across the city. Verified captains, live tracking and honest prices.',
    primaryCta: { label: 'Explore services', href: '#services' },
    secondaryCta: { label: 'How it works', href: '#how' },
    image: '',
    stats: [
      { value: '3 in 1', label: 'Rides, food and parcels' },
      { value: 'Live', label: 'Tracking on every trip' },
      { value: '24 x 7', label: 'Support and safety' },
    ],
    chips: ['Taxi', 'Food Delivery', 'Parcel & Courier', 'Cargo'],
  },

  trust: {
    title: 'Built for everyday trust',
    items: [
      { icon: 'shield', title: 'Verified captains', text: 'Every captain is background-checked and document-verified.' },
      { icon: 'pin', title: 'Live tracking', text: 'Follow your ride or order on the map, door to door.' },
      { icon: 'wallet', title: 'Transparent pricing', text: 'See the fare before you book. No surprise charges.' },
      { icon: 'headset', title: 'Round-the-clock help', text: 'In-app support and SOS whenever you need it.' },
    ],
  },

  services: {
    eyebrow: 'What we do',
    title: 'Everything your city offers, one tap away',
    subtitle: 'Three services, one account, one wallet.',
    items: [
      {
        icon: 'car',
        title: 'Taxi & Rides',
        text: 'Auto, bike, mini and sedan rides with upfront fares and live tracking from pickup to drop.',
        points: ['Instant captain matching', 'Safe rides with SOS', 'Cash, UPI & wallet'],
        image: '',
        cta: { label: '', href: '' },
        accent: 'yellow',
      },
      {
        icon: 'food',
        title: 'Food Delivery',
        text: 'Hot food from local restaurants, delivered fast by riders who know your neighbourhood.',
        points: ['Hundreds of restaurants', 'Live order tracking', 'Offers & coupons'],
        image: '',
        cta: { label: '', href: '' },
        accent: 'red',
      },
      {
        icon: 'parcel',
        title: 'Parcel & Courier',
        text: 'Send documents and parcels across the city the same day, with proof of delivery.',
        points: ['Same-day delivery', 'Photo proof & OTP', 'Pickup from your door'],
        image: '',
        cta: { label: '', href: '' },
        accent: 'blue',
      },
    ],
  },

  how: {
    eyebrow: 'How it works',
    title: 'From tap to doorstep in three steps',
    steps: [
      { title: 'Choose your service', text: 'Pick a ride, a meal or a parcel from the home screen.' },
      { title: 'Confirm and track', text: 'See your fare, get matched with a captain and follow every move live.' },
      { title: 'Pay and rate', text: 'Pay with cash, UPI or wallet, then rate your experience.' },
    ],
  },

  features: {
    eyebrow: 'Why Jhatpat',
    title: 'Designed to be fast, fair and safe',
    items: [
      { icon: 'bolt', title: 'Lightning-fast matching', text: 'Smart dispatch connects you with the nearest captain in under a minute.' },
      { icon: 'shield', title: 'Safety built in', text: 'SOS, ride sharing and verified captains on every trip.' },
      { icon: 'wallet', title: 'Fair, upfront pricing', text: 'Know the price before you confirm. Low cancellation fees.' },
      { icon: 'pin', title: 'Live everything', text: 'Real-time location for rides, riders and parcels.' },
      { icon: 'gift', title: 'Rewards & offers', text: 'Coupons, referral bonuses and wallet cashback on every order.' },
      { icon: 'headset', title: 'Help that answers', text: 'A real support team, in the app, any time of day.' },
    ],
  },

  app: {
    eyebrow: 'Get the app',
    title: 'Everything in your pocket',
    subtitle: 'Download Jhatpat and get your first ride, meal or delivery in minutes.',
    image: '',
    playStoreUrl: '',
    appStoreUrl: '',
    points: ['Free to download', 'Works on Android and iOS', 'One login for every service'],
  },

  partner: {
    eyebrow: 'Partner with us',
    title: 'Earn on your own schedule',
    subtitle:
      'Drive a taxi, deliver food or run parcels. Keep more of what you earn with simple commissions and weekly payouts.',
    image: '',
    points: ['Low commission, fast payouts', 'Work when you want', 'Free onboarding and support'],
    cta: { label: 'Become a captain', href: '#contact' },
  },

  testimonials: {
    eyebrow: 'Loved by riders and captains',
    title: 'What people say',
    items: [],
  },

  faq: {
    eyebrow: 'FAQs',
    title: 'Questions, answered',
    items: [
      { question: 'What is Jhatpat?', answer: 'Jhatpat is a multi-service app for taxi rides, food delivery and parcel delivery, all in one account.' },
      { question: 'How do I book a ride?', answer: 'Open the app, enter your pickup and drop, choose a vehicle and confirm. A nearby captain is matched right away.' },
      { question: 'Which payment methods are supported?', answer: 'You can pay with cash, UPI, cards or your Jhatpat wallet, depending on the service.' },
      { question: 'Can I cancel a booking?', answer: 'Yes. Cancelling soon after booking is free. A small fee applies once a captain has been on the way for a while.' },
      { question: 'How do I become a captain or delivery partner?', answer: 'Download the app, choose Partner sign-up, upload your documents and our team will verify you quickly.' },
    ],
  },

  contact: {
    eyebrow: 'Contact us',
    title: 'We would love to hear from you',
    subtitle: 'Questions, partnerships or feedback — reach out any time.',
    email: 'jhatpat@gmail.com',
    phone: '+91 97561 03627',
    address: 'Delhi NCR, India',
    hours: 'Open 24 x 7',
  },

  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  },

  footer: {
    about: 'Jhatpat brings rides, food and parcel delivery together in one fast, trusted app.',
    links: [
      { label: 'About us', href: '/taxi/about' },
      { label: 'Careers', href: '/taxi/careers' },
      { label: 'Terms of service', href: '/terms?tab=terms' },
      { label: 'Privacy policy', href: '/terms?tab=privacy' },
      { label: 'Refund policy', href: '/terms?tab=refund' },
      { label: 'Cancellation policy', href: '/terms?tab=cancellation' },
      { label: 'Support', href: '/support' },
    ],
    copyright: 'Jhatpat. All rights reserved.',
  },

  seo: {
    title: 'Jhatpat — Taxi, Food & Parcel Delivery in One App',
    description:
      'Book taxi rides, order food and send parcels with Jhatpat. Verified captains, live tracking and transparent pricing.',
  },
};
