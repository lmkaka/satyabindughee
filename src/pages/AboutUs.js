import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, MapPin, Calendar, Shield, Heart } from 'lucide-react';

const AboutUs = () => {
  const stats = [
    { number: '10+', label: 'Years Experience', icon: Calendar },
    { number: '2K+', label: 'Happy Customers', icon: Users },
    { number: '100%', label: 'Pure & Natural', icon: Shield },
    { number: '24/7', label: 'Customer Support', icon: Heart }
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We never compromise on quality. Every batch is carefully tested to ensure the highest standards.',
      icon: Award
    },
    {
      title: 'Traditional Methods',
      description: 'Our ghee is made using time-honored traditional methods passed down through generations.',
      icon: Heart
    },
    {
      title: 'Customer Satisfaction',
      description: 'Your satisfaction is our priority. We strive to exceed expectations in every interaction.',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-playfair font-bold text-gray-900 mb-6">
              About SBGhee Company
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to bringing you the finest quality ghee, made using traditional methods 
              passed down through generations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 mb-6">
               We strongly believe in the quality and tradition of the pure and natural ghee available on our website.

Our Promise: We have been consistently bringing you the finest and most nutritious ghee since 2011, maintaining the highest quality standards. We are committed to providing the best products to our customers.

Please Note:

Product Information: All information provided on our website, such as ingredients, nutritional value, and health benefits, is for general information purposes only.

Not Medical Advice: This information is in no way a substitute for medical advice or treatment provided by a doctor. If you have any health problems or allergies, please consult a healthcare professional or physician before consuming the product.

Use and Storage: For optimal taste and freshness, please store the ghee in a cool, dry, and dark place and follow the instructions for use.

Color and Texture: Because our ghee is made through a natural process, its color and texture may vary slightly depending on temperature and weather, which is a testament to its purity.

Thank you for your continued support!
              </p>
              <p className="text-gray-600 mb-6">
                Today, we are proud to serve thousands of families across India with our premium quality ghee. 
                Each jar represents our commitment to purity, tradition, and the rich heritage of Indian cuisine.
              </p>
              <div className="flex items-center gap-4">
                <MapPin className="text-primary-500" size={24} />
                <span className="text-gray-700 font-semibold">Ranchi, India</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://radarofc.onrender.com/sb1.jpg"
                alt="Traditional Ghee Making"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary-500 text-white p-6 rounded-xl">
                <div className="text-2xl font-bold">2011</div>
                <div className="text-sm">Established</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-8 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-xl mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-playfair font-bold text-gray-900 mb-8">
              Certifications & Quality
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {['FSSAI Certified', 'ISO 22000', 'Organic Certified'].map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <Award className="text-primary-500 mx-auto mb-2" size={32} />
                  <div className="font-semibold">{cert}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
