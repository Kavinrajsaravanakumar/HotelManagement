import React, { useEffect, useState } from "react";
import { roomsDummyData } from "../assets/assets";
import { useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { assets } from "../assets/assets";
import { facilityIcons } from "../assets/assets";

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const room = roomsDummyData.find((room) => room._id === id);
    room && setRoom(room);
    room && setMainImage(room.images[0]);
  }, []);
  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Room Details */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-playfair">
              {room.hotel.name}
              <span className="font-inter text-sm">({room.roomType})</span>
            </h1>

            <p className="text-xs py-1.5 px-3 bg-orange-500 text-white rounded-full">
              20% OFF
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <StarRating />
            <p>200+ reviews</p>
          </div>

          <div className="flex items-center gap-2 text-gray-500 mt-2">
            <img src={assets.locationIcon} alt="" />
            <span>{room.hotel.address}</span>
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col lg:flex-row mt-8 gap-6">
          <div className="lg:w-1/2 w-full">
            <img
              src={mainImage}
              className="w-full rounded-xl object-cover shadow-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room.images.map((image, index) => (
              <img
                key={index}
                src={image}
                onClick={() => setMainImage(image)}
                className={`w-full rounded-xl cursor-pointer ${
                  mainImage === image ? "outline-4 outline-orange-500" : ""
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row mt-8 gap-6 justify-between items-start">
          <div className="flex flex-col md:flex-row md:justify-between mt-10">
            <div className="flex flex-col">
              <h1 className="text-3x1 md:text-4x1 font-playfair">
                Experience Luxury Like Never Before
              </h1>
              <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                {room.amenities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
                  >
                    <img
                      src={facilityIcons[item]}
                      alt={item}
                      className="w-5 h-5"
                    />
                    <p className="text-xs">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-2xl mt-10 font-medium text-center">
            ${room.pricePerNight}/night
          </p>
        </div>
        <form
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px 0px 20px_rgba(0,0,0,0.15)] p-6 rounded-xl
mx-auto mt-16 max-w-6x1"
        >
          <div
            className="flex flex-col flex-wrap md: flex-row items-start
md:items-center gap-4 md: gap-10 text-gray-500"
          >
            
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dull active: scale-95 transition-all text-white rounded-md max-md: w-full max-md:mt-6 md: px-25 py-3 md: py-4 text-base cursor-pointer"
          >
            Book Now I
          </button>
        </form>
      </div>
    )
  );
};

export default RoomDetails;
