import React, { useEffect, useState } from "react";
import { roomsDummyData } from "../assets/assets";
import { useParams } from "react-router-dom";

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
      <div className="py-28 md:py-35 px-4 md: px-16 1g:px-24 xl:px-32">
        {/* {Room Deatails} */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-3x1 md:text-4x1 font-playfair">
            {room.hotel.name}
            <span className="font-inter text-sm">({room.roomType})</span>
          </h1>
          <p
            className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500
rounded-full"
          >
            20% OFF
          </p>
          
        </div>
      </div>
    )
  );
};

export default RoomDetails;
