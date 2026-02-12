import React from 'react'
import Hero from '../components/Hero'
import Rooms from '../components/rooms'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'
import NewsLetter from '../components/NewsLetter'
import Footer from '../components/Footer'
const Home = () => {

  return (
    <div>
      <Hero/>
      <Rooms/>
      <FeaturedDestination/>
      <ExclusiveOffers/>
      <Testimonial/>
      <NewsLetter/>
    </div>
  )
}

export default Home
