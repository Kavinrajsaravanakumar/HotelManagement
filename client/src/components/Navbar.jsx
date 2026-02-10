import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";


const BookIcon = () => (
  <svg
    className="w-4 h-4 text-black-700"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState({
    roomType: "",
    numberOfRooms: "0",
    adults: "0",
    children: "0",
    checkIn: "",
    checkOut: "",
    location: "",
  });

  // Speech recognition ref
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isListeningRef = useRef(false);
  const previousTranscriptRef = useRef("");
  const tempTranscriptRef = useRef("");

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    } else {
      setIsScrolled(false);
    }
    setIsScrolled((prev) => (location.pathname !== "/" ? true : prev));
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Extract booking details from speech
  const extractDetailsFromSpeech = (text) => {
    const lowerText = text.toLowerCase();
    const newInfo = {};

    const wordToNumber = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };

    const parseNumber = (match) => {
      if (!match) return null;
      const val = match[1];
      if (!isNaN(val)) return val;
      return wordToNumber[val] || null;
    };

    // Extract room type
    const roomTypes = [
      "single",
      "double",
      "suite",
      "deluxe",
      "standard",
      "premium",
      "family",
      "twin",
      "king",
      "queen",
    ];
    for (const room of roomTypes) {
      if (lowerText.includes(room)) {
        newInfo.roomType = room.charAt(0).toUpperCase() + room.slice(1);
        break;
      }
    }

    // Extract number of rooms
    const roomsMatch = lowerText.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*room/);
    const roomsVal = parseNumber(roomsMatch);
    if (roomsVal) {
      newInfo.numberOfRooms = roomsVal.toString();
    } else {
      // Default if not mentioned
      newInfo.numberOfRooms = "1";
    }

    // Extract number of adults
    const adultsMatch = lowerText.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*adult/);
    const adultsVal = parseNumber(adultsMatch);
    if (adultsVal) {
      newInfo.adults = adultsVal.toString();
    } else {
      // Default if not mentioned
      newInfo.adults = "1";
    }

    // Extract number of children
    const childrenMatch = lowerText.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(child|kid)/);
    const childrenVal = parseNumber(childrenMatch);
    if (childrenVal) {
      newInfo.children = childrenVal.toString();
    } else {
      // Default if not mentioned
      newInfo.children = "0";
    }

    // Extract location/city
    const cities = [
      "mumbai",
      "delhi",
      "bangalore",
      "chennai",
      "kolkata",
      "hyderabad",
      "pune",
      "goa",
      "jaipur",
      "new york",
      "london",
      "paris",
      "dubai",
    ];
    for (const city of cities) {
      if (lowerText.includes(city)) {
        newInfo.location = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Extract dates
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/gi,
      /(\d{1,2})(?:st|nd|rd|th)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)/gi,
      /(tomorrow|today|next week|next month)/gi,
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        if (!newInfo.checkIn) {
          newInfo.checkIn = matches[0];
        } else if (!newInfo.checkOut && matches.length > 1) {
          newInfo.checkOut = matches[1];
        }
      }
    }

    setExtractedInfo((prev) => ({ ...prev, ...newInfo }));
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Search. Please use Chrome or Edge.");
      return;
    }

    try {
      // Prepare for new session
      previousTranscriptRef.current = transcript;
      finalTranscriptRef.current = "";
      tempTranscriptRef.current = "";
      setShowVoiceModal(true);
      setIsListening(true);
      isListeningRef.current = true;
      setIsProcessing(false);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("Voice recognition started");
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptChunk += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscriptChunk) {
          finalTranscriptRef.current += finalTranscriptChunk + " ";
          tempTranscriptRef.current = "";
        }
        if (interimTranscript) {
          tempTranscriptRef.current = interimTranscript;
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert("Please allow microphone access to use voice search.");
          stopListening();
        }
      };

      recognition.onend = () => {
        // Optional: handle auto-stop
      };

      recognition.start();

    } catch (error) {
      console.error("Failed to start recording:", error);
      setTranscript("Failed to access microphone. Please allow permissions.");
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    setIsListening(false);
    isListeningRef.current = false;
    setIsProcessing(true);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Finalize Transcript and Update UI
    setTimeout(() => {
      const currentSessionText = (finalTranscriptRef.current + " " + tempTranscriptRef.current).trim();
      const fullText = (previousTranscriptRef.current + " " + currentSessionText).trim();

      setTranscript(fullText);

      if (currentSessionText) {
        extractDetailsFromSpeech(currentSessionText);
      }

      setIsProcessing(false);
    }, 500);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const closeVoiceModal = () => {
    stopListening();
    setShowVoiceModal(false);
    setIsProcessing(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0  w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled
        ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
        : "py-4 md:py-6"
        }`}
    >
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className={`h-9 ${isScrolled && "invert opacity-80"}`}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <a
            key={i}
            href={link.path}
            className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"
              }`}
          >
            {link.name}
            <div
              className={`${isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </a>
        ))}
        <button
          className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? "text-black" : "text-white"
            } transition-all`}
          onClick={() => navigate("/owner")}
        >
          Dashboard
        </button>
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        <img
          src={assets.searchIcon}
          alt="search"
          className={`h-7 transition-all duration-500 ${isScrolled ? "hover:bg-gray-200" : "hover:bg-white/20"
            }`}
        />

        {/* Mic Button */}
        <button
          onClick={startListening}
          className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${isScrolled ? "hover:bg-gray-200" : "hover:bg-white/20"
            }`}
          title="Voice Search"
        >
          <svg
            className={`w-6 h-6 transition-all duration-500 ${isScrolled ? "text-gray-700" : "text-white"
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${isScrolled ? "text-white bg-black" : "bg-white text-black"
              }`}
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}

      <div className="flex items-center gap-3 md:hidden">
        {user && (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={assets.menuIcon}
          alt=""
          className={'${isScrolled && "invert"}h-7 transition-all duration-500'}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={assets.closeIcon} alt="close-menu" className="h-6.5" />
        </button>

        {navLinks.map((link, i) => (
          <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
            {link.name}
          </a>
        ))}
        {user && (
          <button
            className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
            onClick={() => navigate("/owner")}
          >
            Dashboard
          </button>
        )}

        {!user && (
          <button
            onClick={openSignIn}
            className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500"
          >
            Login
          </button>
        )}
      </div>

      {/* Voice Recognition Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full mx-4 relative">
            {/* Close Button */}
            <button
              onClick={closeVoiceModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Voice Search
              </h3>
              <p className="text-gray-500 text-sm">
                Tell us what you're looking for
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Mic & Transcript */}
              <div className="flex-1 flex flex-col">
                {/* Mic Animation */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`p-6 rounded-full transition-all duration-300 ${isProcessing
                      ? "bg-yellow-500 cursor-wait"
                      : isListening
                        ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105"
                      }`}
                  >
                    {isProcessing ? (
                      <svg
                        className="w-10 h-10 text-white animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Status */}
                <div className="text-center mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isProcessing
                      ? "bg-yellow-100 text-yellow-700"
                      : isListening
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${isProcessing
                        ? "bg-yellow-500 animate-pulse"
                        : isListening
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-400"
                        }`}
                    ></span>
                    {isProcessing
                      ? "Processing..."
                      : isListening
                        ? "Recording... Click to stop"
                        : "Click mic to start"}
                  </span>
                </div>

                {/* Transcript Display */}
                <div className="mt-4 flex-grow">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                    Your Speech:
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 h-full min-h-[150px]">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder={
                        isListening
                          ? "Listening... speak now"
                          : "Click the mic button and start speaking"
                      }
                      className="w-full h-full bg-transparent resize-none outline-none text-gray-700 p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Extracted Details Inputs */}
              <div className="flex-1 border-l pl-8 border-gray-100">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-6 block">
                  Details (Edit if needed):
                </label>
                <div className="grid grid-cols-1 gap-5">
                  {/* Room Type */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Room Type</label>
                    <input
                      type="text"
                      value={extractedInfo.roomType}
                      onChange={(e) => setExtractedInfo({ ...extractedInfo, roomType: e.target.value })}
                      placeholder="e.g. Deluxe"
                      className="w-full bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-700 font-medium transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Number of Rooms */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">No. of Rooms</label>
                      <input
                        type="number"
                        min="1"
                        value={extractedInfo.numberOfRooms}
                        onChange={(e) => setExtractedInfo({ ...extractedInfo, numberOfRooms: e.target.value })}
                        className="w-full bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-700 font-medium transition-colors"
                      />
                    </div>

                    {/* Adults */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">No. of Adults</label>
                      <input
                        type="number"
                        min="1"
                        value={extractedInfo.adults}
                        onChange={(e) => setExtractedInfo({ ...extractedInfo, adults: e.target.value })}
                        className="w-full bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-700 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Children */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">No. of Children</label>
                      <input
                        type="number"
                        min="0"
                        value={extractedInfo.children}
                        onChange={(e) => setExtractedInfo({ ...extractedInfo, children: e.target.value })}
                        className="w-full bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-700 font-medium transition-colors"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Location</label>
                      <input
                        type="text"
                        value={extractedInfo.location}
                        onChange={(e) => setExtractedInfo({ ...extractedInfo, location: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-700 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  {/* Date (Check-in) */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Date</label>
                    <input
                      type="text"
                      value={extractedInfo.checkIn}
                      onChange={(e) => setExtractedInfo({ ...extractedInfo, checkIn: e.target.value })}
                      placeholder="e.g. Tomorrow"
                      className="w-full bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-700 font-medium transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs">
                Try saying: "I need a deluxe room for 2 adults and 1 child in
                Mumbai"
              </p>
            </div>

            {/* Send Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  if (transcript) {
                    // You can handle the send action here
                    console.log("Sending message:", transcript);
                    console.log("Extracted info:", extractedInfo);
                    // Navigate to rooms or handle search
                    navigate("/", {
                      state: {
                        searchQuery: transcript,
                        ...extractedInfo,
                      },
                    });

                    // Clear state and close
                    setTranscript("");
                    finalTranscriptRef.current = "";
                    previousTranscriptRef.current = "";
                    tempTranscriptRef.current = "";

                    setExtractedInfo({
                      roomType: "",
                      numberOfRooms: "0",
                      adults: "0",
                      children: "0",
                      checkIn: "",
                      checkOut: "",
                      location: "",
                    });
                    closeVoiceModal();
                  }
                }}
                disabled={!transcript}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${transcript
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
