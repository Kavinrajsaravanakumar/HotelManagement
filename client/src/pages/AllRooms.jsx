import React from "react";
import Title from "../components/Title";
import { roomsDummyData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import StarRating from "../components/StarRating";

const AllRooms = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col-reverse lg: flex-row items-start justify-between pt-28 md:pt-35 px-4 md: px-16 lg:px-24 x1:px-32">
      <div>
        <Title
          title="Hotel Rooms"
          align="left"
          subtitle="Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories."
        />

        {roomsDummyData.map((room) => (
          <div>
            <img
              src={room.images[0]}
              alt="hotel-img"
              title="View Room Details"
              className="max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
              onClick={() => {
                navigate(`/rooms/${room._id}`);
                scrollTo(0, 0);
              }}
            />
            <div className="md:w-1/2 flex flex-col gap-2">
              <p className="text-gray-500">{room.hotel.city}</p>
              <p
                onClick={() => {
                  navigate(`/rooms/${room._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer text-gray-800 text-3x1 font-playfair"
              >
                {room.hotel.name}
              </p>
              <div className="flex items-center">
                <StarRating />
                <p className="ml-2">200+reviews</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div></div>
    </div>
  );
};

export default AllRooms;
