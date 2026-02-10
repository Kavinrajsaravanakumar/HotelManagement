import React, { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = "6e6c96b5-1672-4c82-ad5a-8081c815348f";

const Callai = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extractedDetails, setExtractedDetails] = useState({
    roomType: "",
    adults: "",
    children: "",
    checkInDate: "",
    checkOutDate: "",
  });
  const [status, setStatus] = useState("Ready to call");

  const vapiRef = useRef(null);

  useEffect(() => {
    // Initialize VAPI with PUBLIC KEY
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);

    const vapi = vapiRef.current;

    // Event listeners
    vapi.on("call-start", () => {
      setIsCallActive(true);
      setIsLoading(false);
      setStatus("Call started - Speak now...");
    });

    vapi.on("call-end", () => {
      setIsCallActive(false);
      setStatus("Call ended");
    });

    vapi.on("message", (message) => {
      // Handle transcription messages
      if (message.type === "transcript") {
        if (message.transcriptType === "final") {
          setTranscript((prev) => prev + " " + message.transcript);
          // Extract details from the transcript
          extractDetailsFromText(message.transcript);
        }
      }

      // Handle function calls or extracted data
      if (message.type === "function-call" && message.functionCall) {
        const args = message.functionCall.parameters;
        if (args) {
          setExtractedDetails((prev) => ({
            ...prev,
            ...args,
          }));
        }
      }
    });

    vapi.on("speech-start", () => {
      setStatus("AI is speaking...");
    });

    vapi.on("speech-end", () => {
      setStatus("Listening...");
    });

    vapi.on("error", (error) => {
      console.error("VAPI Error:", error);
      setStatus("Error: " + (error.message || "Connection failed"));
      setIsCallActive(false);
      setIsLoading(false);
    });

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  // Extract booking details from text using regex patterns
  const extractDetailsFromText = (text) => {
    const lowerText = text.toLowerCase();

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
    ];
    for (const room of roomTypes) {
      if (lowerText.includes(room)) {
        setExtractedDetails((prev) => ({
          ...prev,
          roomType: room.charAt(0).toUpperCase() + room.slice(1),
        }));
        break;
      }
    }

    // Extract number of adults
    const adultsMatch = lowerText.match(/(\d+)\s*adult/);
    if (adultsMatch) {
      setExtractedDetails((prev) => ({ ...prev, adults: adultsMatch[1] }));
    }

    // Extract number of children
    const childrenMatch = lowerText.match(/(\d+)\s*(child|children|kid|kids)/);
    if (childrenMatch) {
      setExtractedDetails((prev) => ({ ...prev, children: childrenMatch[1] }));
    }

    // Extract dates (various formats)
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/gi,
      /(\d{1,2})(?:st|nd|rd|th)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s*,?\s*(\d{4}))?/gi,
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        if (!extractedDetails.checkInDate) {
          setExtractedDetails((prev) => ({ ...prev, checkInDate: matches[0] }));
        }
        if (matches.length > 1 && !extractedDetails.checkOutDate) {
          setExtractedDetails((prev) => ({
            ...prev,
            checkOutDate: matches[1],
          }));
        }
        break;
      }
    }
  };

  const startCall = async () => {
    if (!vapiRef.current) return;

    setIsLoading(true);
    setStatus("Starting call...");
    setTranscript("");
    setExtractedDetails({
      roomType: "",
      adults: "",
      children: "",
      checkInDate: "",
      checkOutDate: "",
    });

    try {
      await vapiRef.current.start({
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a helpful hotel booking assistant. Your job is to collect booking information from the user in a friendly conversational manner. 
              
              Ask the user for:
              1. Room type (single, double, suite, deluxe, standard, premium, family, twin)
              2. Number of adults
              3. Number of children
              4. Check-in date
              5. Check-out date
              
              Be conversational and confirm each piece of information. At the end, summarize the booking details.`,
            },
          ],
          functions: [
            {
              name: "extractBookingDetails",
              description:
                "Extract and save booking details from the conversation",
              parameters: {
                type: "object",
                properties: {
                  roomType: {
                    type: "string",
                    description:
                      "Type of room (single, double, suite, deluxe, standard, premium, family, twin)",
                  },
                  adults: {
                    type: "string",
                    description: "Number of adults",
                  },
                  children: {
                    type: "string",
                    description: "Number of children",
                  },
                  checkInDate: {
                    type: "string",
                    description: "Check-in date",
                  },
                  checkOutDate: {
                    type: "string",
                    description: "Check-out date",
                  },
                },
              },
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setStatus("Failed to start call: " + error.message);
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setIsCallActive(false);
      setStatus("Call ended");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              AI Voice Booking
            </h2>
            <p className="text-gray-300">
              Speak to our AI assistant to book your room
            </p>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isCallActive
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isCallActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
                }`}
              ></span>
              {status}
            </span>
          </div>

          {/* Call Button */}
          <div className="flex justify-center mb-8">
            {!isCallActive ? (
              <button
                onClick={startCall}
                disabled={isLoading}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Call to AI
                    </>
                  )}
                </span>
              </button>
            ) : (
              <button
                onClick={endCall}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                    />
                  </svg>
                  End Call
                </span>
              </button>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Conversation
              </h3>
              <div className="bg-black/20 rounded-xl p-4 max-h-40 overflow-y-auto">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {transcript}
                </p>
              </div>
            </div>
          )}

          {/* Extracted Details */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Extracted Booking Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Room Type
                </label>
                <div className="bg-black/20 rounded-lg px-4 py-3 text-white">
                  {extractedDetails.roomType || (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Adults
                </label>
                <div className="bg-black/20 rounded-lg px-4 py-3 text-white">
                  {extractedDetails.adults || (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Children
                </label>
                <div className="bg-black/20 rounded-lg px-4 py-3 text-white">
                  {extractedDetails.children || (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Check-in Date
                </label>
                <div className="bg-black/20 rounded-lg px-4 py-3 text-white">
                  {extractedDetails.checkInDate || (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Check-out Date
                </label>
                <div className="bg-black/20 rounded-lg px-4 py-3 text-white">
                  {extractedDetails.checkOutDate || (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Click "Call to AI" and speak naturally. Tell the assistant about
              your booking preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callai;
