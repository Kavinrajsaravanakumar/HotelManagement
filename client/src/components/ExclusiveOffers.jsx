import React from "react";
import Title from "./Title";
import { assets, exclusiveOffers } from "../assets/assets";
const ExclusiveOffers = () => {
  return (
    <div>
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-10">
        <Title
          align="left"
          title="Exclusive Offers"
          subtitle="Take advantages of our limited time offer."
        />
        <button className="flex items-center gap-1 group text-sm font-medium  rounded hover:bg-gray-50 transition-all cursor-pointer px-4 py-2">
          View All Offers
          <img
            src={assets.arrowIcon}
            alt=""
            className="group-hover:translate-x-2 transition-all"
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 px-6 md:px-16 lg:px-24">
        {exclusiveOffers.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col items-start justify-between gap-2 pt-12 md:pt-18 px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center h-80"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <p className="px-3 py-1 absolute top-4 left-4 text-xs bg-white text-gray-800 font-medium rounded-full">
              {item.priceOff}% OFF
            </p>
          <div>
              <p className="text-2xl font-medium font-playfair">{item.title}</p>
              <p>{item.description}</p>
              <p className="text-xs text-white/70 mt-3">Expires {item.expiryDate}</p>
          </div>
          <button className="flex items-center gap-1 mt-auto mb-8 cursor-pointer px-4 py-2  text-white-800">View Offers
            <img
              src={assets.arrowIcon}
            className="invert group-hover:translate-x-2 transition-all"
              alt=""/>
          </button>
       </div>
     ))}
    </div>
    </div>
  );
};

export default ExclusiveOffers;
