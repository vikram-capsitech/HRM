"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSpeechRecognition } from "@/lib/speech-to-txt";
import { useTextToSpeech } from "@/lib/txt-speech";
import { toast } from "sonner";
import { chatAction } from "@/actions/action";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, VideoOff } from "lucide-react";
import { LuLanguages } from "react-icons/lu";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { MdBusinessCenter, MdMic, MdMicOff } from "react-icons/md";
import { BsBuildingFillCheck } from "react-icons/bs";
import { Card } from "@/components/ui/card";
import { RiVoiceAiFill } from "react-icons/ri";
import { FiLoader, FiPhoneOff } from "react-icons/fi";
import WebcamFrame from "@/components/global-cmp/webcam-frame";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { endConversation, getApplicationDetails } from "@/actions/checkpointer";
import PermissionRequest from "@/components/global-cmp/permission";
import { createNotificationAction } from "@/actions/notification";
import { BiConversation } from "react-icons/bi";
import EmojiBubble from "@/components/global-cmp/emoji-bubble";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const DEFAULT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const AgentModel = () => {
  const params = useParams();
  const router = useRouter();
  const { appid } = params;

  const {
    interimTranscript,
    finalTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isMicOn,
    error: speechError,
  } = useSpeechRecognition();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewState, setInterviewState] = useState<
    "idle" | "requesting" | "countdown" | "starting" | "active" | "ended"
  >("idle");
  const [context, setContext] = useState<Message[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const { speak, stopSpeaking, isSpeaking } = useTextToSpeech();
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [isBrave, setIsBrave] = useState(false);
  const [endRecording, setEndRecording] = useState(false);
  const [isWebCamOn, setIsWebCamOn] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [startTiming, setStartTiming] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(DEFAULT_DURATION);
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    microphone: false,
  });
  const [countdown, setCountdown] = useState(5);
  const toastIdRef = useRef<string | number | null>(null);

  const {
    data: applicationData,
    isLoading: isApplicationLoading,
    error: applicationError,
  } = useQuery({
    queryKey: ["application", appid],
    queryFn: async () => getApplicationDetails(appid as string),
    enabled: !!appid,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Memoized toast function to prevent multiple renders
  const showToast = useCallback(
    (message: string, type: "error" | "info" = "error") => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast[type](message, {
        position: "top-center",
        duration: 5000,
      });
    },
    []
  );

  // Request permissions with error handling
  const requestPermissions = useCallback(async () => {
    setInterviewState("requesting");
    try {
      const [videoStream, audioStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: true }),
        navigator.mediaDevices.getUserMedia({ audio: true }),
      ]);

      setPermissionsGranted({ camera: true, microphone: true });
      videoStream.getTracks().forEach((track) => track.stop());
      audioStream.getTracks().forEach((track) => track.stop());
      setInterviewState("countdown");
    } catch (err) {
      console.error("Permission error:", err);
      showToast("Camera and microphone permissions are required.");
      setInterviewState("idle");
    }
  }, [showToast]);

  // Countdown logic
  useEffect(() => {
    if (interviewState !== "countdown") return;
    if (countdown === 0) {
      setInterviewState("starting");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState, countdown]);

  // Set interview duration and start time
  useEffect(() => {
    if (
      applicationData?.jobId?.interviewSettings?.interviewDuration &&
      interviewState === "starting"
    ) {
      const durationInMs =
        applicationData.jobId.interviewSettings.interviewDuration * 60 * 1000;
      setDuration(durationInMs);
      const startTime = Date.now();
      setStartTiming(startTime);
      setRemainingTime(durationInMs);
    }
  }, [applicationData, interviewState]);

  // Real-time timer for interview duration
  useEffect(() => {
    if (interviewState !== "active" || !startTiming) return;

    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTiming;
      const newRemainingTime = Math.max(0, duration - elapsedTime);
      setRemainingTime(newRemainingTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState, startTiming, duration]);

  // Format time as MM:SS
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollTo({
        top: conversationEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [context]);

  // Handle final transcript
  useEffect(() => {
    if (!finalTranscript.trim() || interviewState !== "active") return;
    handleAIConversation(finalTranscript.trim());
  }, [finalTranscript, interviewState]);

  // AI conversation handler with retry logic
  const handleAIConversation = useCallback(
    async (userText: string, isRetry = false) => {
      if (!userText.trim() || (isLoading && !isRetry)) return;

      if (!isRetry) {
        stopListening();
        stopSpeaking();
        resetTranscript();
        setContext((prev) => [...prev, { role: "user", content: userText }]);
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiContext = context.map((msg) => ({
          role: msg.role,
          content:
            msg.role === "user"
              ? `{"candidateResponse": "${
                  msg.content
                }", "remainingTime": "${formatTime(remainingTime)}"}`
              : msg.content,
        }));

        if (!isRetry) {
          apiContext.push({
            role: "user",
            content: `{"candidateResponse": "${userText}", "remainingTime": "${formatTime(
              remainingTime
            )}"}`,
          });
        }

        const result = await chatAction({
          query: `{"candidateResponse": "${userText}", "remainingTime": "${formatTime(
            remainingTime
          )}"}`,
          context: apiContext,
          appData: applicationData,
        });

        if (!result.data)
          throw new Error(result.error || "Failed to get response");

        const parsedResponse = JSON.parse(result.data);
        setContext((prev) => [
          ...prev,
          { role: "assistant", content: result.data },
        ]);

        if (parsedResponse.isEnded) {
          await handleEndInterview();
        } else {
          await speak(
            parsedResponse.aiResponse,
            { rate: 1.0, pitch: 1.0, volume: 1.0 },
            () => {
              if (interviewState === "active" && !parsedResponse.isEnded) {
                setTimeout(() => startListening(), 500);
              }
            }
          );
        }

        setRetryCount(0);
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * (retryCount + 1))
          );
          return handleAIConversation(userText, true);
        }

        setError(
          error instanceof Error ? error.message : "Failed to get AI response"
        );
        showToast("Failed to get response from AI. Please try again.");
        if (interviewState === "active") {
          setTimeout(() => startListening(), 1000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      context,
      applicationData,
      interviewState,
      retryCount,
      showToast,
      stopListening,
      stopSpeaking,
      resetTranscript,
      speak,
      startListening,
    ]
  );

  // Browser detection
  const detectBrowser = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Edg")) return "Microsoft Edge";
    if (userAgent.includes("Chrome")) {
      if ((navigator as any).brave?.isBrave?.name === "isBrave") return "Brave";
      return "Google Chrome";
    }
    return "Unknown Browser";
  }, []);

  // Check browser compatibility
  useEffect(() => {
    if (detectBrowser() === "Brave") {
      showToast(
        "Brave Browser is not supported. Please use Google Chrome or Microsoft Edge."
      );
      setIsBrave(true);
    }
  }, [showToast, detectBrowser]);

  // Initialize interview
  const initializeInterview = useCallback(async () => {
    if (
      hasInitialized ||
      isBrave ||
      interviewState !== "starting" ||
      !applicationData ||
      isApplicationLoading ||
      applicationData.interviewstatus === "COMPLETED"
    )
      return;

    setHasInitialized(true);
    try {
      const initialQuery = `{"candidateResponse": "Let's begin the interview", "remainingTime": "${formatTime(
        remainingTime
      )}"}`;
      const result = await chatAction({
        query: initialQuery,
        context: [],
        appData: applicationData,
      });

      if (!result.data)
        throw new Error(result.error || "Failed to initialize interview");

      const parsedResponse = JSON.parse(result.data);
      setContext([{ role: "assistant", content: result.data }]);
      setInterviewState("active");
      await speak(
        parsedResponse.aiResponse,
        { rate: 1.0, pitch: 1.0, volume: 1.0 },
        () => {
          setTimeout(() => startListening(), 500);
        }
      );
      setTimeout(() => setIsWebCamOn(true), 2000);
    } catch (error) {
      setError("Failed to start the interview. Please refresh and try again.");
      showToast("Failed to start the interview. Please refresh and try again.");
      setInterviewState("idle");
    }
  }, [
    hasInitialized,
    isBrave,
    interviewState,
    applicationData,
    isApplicationLoading,
    showToast,
    speak,
    startListening,
  ]);

  useEffect(() => {
    initializeInterview();
  }, [initializeInterview]);

  // Handle completed interview status
  useEffect(() => {
    if (applicationData?.interviewstatus === "COMPLETED") {
      setInterviewState("ended");
      setEndRecording(true);
      stopListening();
      stopSpeaking();
    }
  }, [applicationData, appid, stopListening, stopSpeaking]);

  // Prevent page refresh data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      showToast("This may lead to loss of interview data", "info");
      e.returnValue =
        "You will lose all entered data if you refresh or leave this page. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showToast]);

  // End interview handler
  const handleEndInterview = useCallback(async () => {
    setEndRecording(true);
    setInterviewState("ended");
    stopListening();
    stopSpeaking();
    await createNotificationAction({
      title: "Interview Completed",
      email: applicationData?.jobId?.employerId?.email,
      content: `<p>Hi ${applicationData?.jobId?.employerId?.name},</p>
      <p>Interview with <b style="color: blue;">${applicationData?.candidateId?.name}</b> is completed.</p>
      <p style="color: blue; text-decoration: underline;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/interview/${appid}/analytics">View Detailed Report</a></p>`,
      receiver_id: applicationData?.jobId?.employerId?._id,
    });
    await endConversation(appid as string);
    router.push(`/interview/${appid}/analytics`);
  }, [applicationData, appid, router, stopListening, stopSpeaking]);

  // Toggle microphone
  const handleMicToggle = useCallback(() => {
    if (isMicOn) {
      stopListening();
    } else if (interviewState === "active") {
      startListening();
    }
  }, [isMicOn, interviewState, startListening, stopListening]);

  // Repeat last AI response
  const repeatLastResponse = useCallback(() => {
    const lastAIMessage = context.findLast(
      (msg) => msg.role === "assistant"
    )?.content;
    if (lastAIMessage && !isSpeaking) {
      const parsedResponse = JSON.parse(lastAIMessage);
      speak(parsedResponse.aiResponse, { rate: 1.0, pitch: 1.0, volume: 1.0 });
    }
  }, [context, isSpeaking, speak]);

  // Memoized render components
  const renderHeader = useMemo(
    () => (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <Image
            className="rounded-lg object-cover"
            src={
              applicationData?.jobId?.employerId?.companyDetails?.logo ||
              "/logo.png"
            }
            alt="Company Logo"
            width={50}
            height={50}
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <LuLanguages />
              {applicationData?.jobId?.interviewSettings?.language || "English"}
            </span>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <MdBusinessCenter className="w-4 h-4" />
              {applicationData?.jobId?.title || "Position"}
            </span>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
              <BsBuildingFillCheck />
              {applicationData?.jobId?.employerId?.companyDetails?.name ||
                "Company"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">
            Duration: {formatTime(remainingTime)}
          </span>
          {interviewState === "starting" && (
            <div className="flex items-center text-primary space-x-2">
              <FiLoader className="animate-spin w-5 h-5" />
              <span className="text-sm">Starting interview...</span>
            </div>
          )}
        </div>
      </div>
    ),
    [applicationData, interviewState, remainingTime, formatTime]
  );

  const renderError = useMemo(
    () =>
      error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg flex items-center gap-2">
          {error}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            Retry
          </Button>
        </div>
      ),
    [error]
  );

  const renderVideoSection = useMemo(
    () => (
      <Card
        className="flex-1 relative grid place-items-center overflow-hidden rounded-lg h-96 lg:h-auto"
        aria-label="Video Feed"
      >
        <WebcamFrame
          endRecording={endRecording}
          isVideoOn={isWebCamOn}
          setIsVideoOn={setIsWebCamOn}
          width="100%"
          height="400px"
          showControls={true}
        />
        {(finalTranscript || interimTranscript) && (
          <div className="p-2 px-3 bottom-2 absolute bg-black/80 text-white rounded-lg mb-4 max-w-[90%]">
            <span className="font-bold">{finalTranscript}</span>
            <span className="font-normal opacity-70"> {interimTranscript}</span>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-full absolute bottom-2 right-2 bg-white/30 text-white p-1 px-3">
          <button
            onClick={() => setIsWebCamOn(!isWebCamOn)}
            aria-label={isWebCamOn ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isWebCamOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleMicToggle}
            aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {isMicOn ? (
              <IoMdMic className="w-5 h-5" />
            ) : (
              <IoMdMicOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </Card>
    ),
    [
      endRecording,
      isWebCamOn,
      finalTranscript,
      interimTranscript,
      isMicOn,
      handleMicToggle,
    ]
  );

  const renderConversationPanel = useMemo(
    () => (
      <Card className="p-4 gap-2 bg-white rounded-lg shadow">
        <div className="flex border-b justify-between items-center pb-1.5">
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            aria-label="Interview Conversation"
          >
            <BiConversation />
            Interview Conversation
          </h2>
          <button
            className="bg-primary/20 p-1 rounded-full text-primary text-xl hover:bg-primary/30 transition-colors"
            onClick={repeatLastResponse}
            aria-label="Repeat Last Response"
            disabled={interviewState !== "active" || isSpeaking}
          >
            <RiVoiceAiFill className="w-5 h-5" />
          </button>
        </div>
        <div
          ref={conversationEndRef}
          className="overflow-hidden overflow-y-auto space-y-2 max-h-[calc(100vh-400px)]"
        >
          {context.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-md flex gap-2 ${
                msg.role === "assistant"
                  ? "bg-primary/20 text-primary border-l-4 border-primary"
                  : "bg-gray-100 text-gray-700 border-l-4 border-gray-400"
              }`}
            >
              {msg.role === "assistant" ? (
                <div>
                  <h3 className="font-semibold">AI Interviewer</h3>
                  {JSON.parse(msg.content).aiResponse}
                </div>
              ) : (
                <div>
                  {" "}
                  <h3 className="font-semibold">Candidate</h3>
                  {msg.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    ),
    [context, interviewState, isSpeaking, repeatLastResponse]
  );

  const renderAIStatus = useMemo(
    () => (
      <Card className="w-full grid relative place-items-center text-2xl overflow-hidden text-white aiCard bg-primary/20 border-4 border-primary">
        <div className="rounded-full p-2 bg-primary w-[100px] aspect-video absolute blur-3xl right-5 bottom-5"></div>
        <button className="absolute text-primary rounded-full p-1 bg-primary/30 bottom-4 right-4">
          {interviewState === "active" && isSpeaking ? (
            <IoMdMic className="size-6" />
          ) : (
            <IoMdMicOff className="size-6" />
          )}
        </button>
        <div className="text-center ring-5 rounded-full ring-primary/50 relative">
          <div
            className={`absolute bg-primary rounded-full ${
              interviewState === "active" && isSpeaking ? "animate-ping" : ""
            } inset-0 scale-75`}
          ></div>
          <div className="bg-cover relative z-20 animate bg-no-repeat bg-[url('https://img.icons8.com/color/200/administrator-male--v1.png')] aspect-square w-20 rounded-full bg-primary ring ring-primary/50"></div>
        </div>
      </Card>
    ),
    [interviewState, isSpeaking]
  );

  const renderControls = useMemo(
    () => (
      <div className="flex justify-center items-center bg-white shadow rounded-full p-2 w-fit mx-auto gap-3 mt-4">
        <Button
          className="size-12 hover:bg-destructive/30 !text-destructive"
          variant="outline"
          size="icon"
          onClick={handleEndInterview}
          aria-label="End Interview"
          disabled={interviewState === "ended"}
        >
          <FiPhoneOff className="size-5" />
        </Button>
        <Button
          className={
            !isMicOn
              ? "size-12 !bg-destructive !text-white"
              : "size-12 !bg-primary !text-white"
          }
          size="icon"
          onClick={handleMicToggle}
          disabled={interviewState !== "active"}
          aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? (
            <MdMic className="size-6" />
          ) : (
            <MdMicOff className="size-6" />
          )}
        </Button>
        <Button
          className={
            isWebCamOn
              ? "size-12 !bg-primary !text-white"
              : "size-12 !bg-destructive !text-white"
          }
          size="icon"
          onClick={() => setIsWebCamOn(!isWebCamOn)}
          aria-label={isWebCamOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {isWebCamOn ? (
            <Video className="size-6" />
          ) : (
            <VideoOff className="size-6" />
          )}
        </Button>
        <EmojiBubble />
      </div>
    ),
    [isMicOn, isWebCamOn, interviewState, handleMicToggle, handleEndInterview]
  );

  // Render states
  if (isApplicationLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <span className="intvLoader"></span>
        <h2 className="text-2xl">Scheduling interview...</h2>
      </div>
    );
  }

  if (applicationError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">
            Error loading interview details:{" "}
            {(applicationError as Error).message}
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">No interview details available</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (applicationData.interviewstatus === "COMPLETED") {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-3">
        <Image
          src="/interview-completed.png"
          alt="Interview Completed"
          width={300}
          height={300}
        />
        <div className="text-center">
          <h2 className="text-xl">Interview Completed</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isBrave) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-3">
        <Image
          src="/brave-nosupport.png"
          alt="Browser Not Supported"
          width={500}
          height={500}
        />
        <div className="text-center">
          <h2 className="text-xl">
            Brave Browser is not supported. <br /> Please use Google Chrome or
            Microsoft Edge.
          </h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (interviewState === "idle" || interviewState === "requesting") {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <PermissionRequest
          permissions={permissionsGranted}
          permissionError={error || ""}
          onPermissionToggle={requestPermissions}
        />
      </div>
    );
  }

  if (interviewState === "countdown") {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <Image
          src="/intvstart.png"
          alt="Interview Starting"
          width={500}
          height={500}
        />
        <h2 className="text-2xl">Interview Starting in</h2>
        <div className="text-5xl font-bold">{countdown}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden p-4">
      {renderHeader}
      {renderError}
      <div className="flex flex-col flex-1 overflow-hidden lg:flex-row gap-4">
        {renderVideoSection}
        <div className="lg:w-1/3 grid grid-rows-2 gap-4 overflow-hidden">
          {renderConversationPanel}
          {renderAIStatus}
        </div>
      </div>
      {renderControls}
      <br />
      <div className="p-0.5 bgGrad text-center fixed bottom-0 inset-x-0 text-white">
        <span>Powered by Hirely</span>
      </div>
    </div>
  );
};

export default AgentModel;
