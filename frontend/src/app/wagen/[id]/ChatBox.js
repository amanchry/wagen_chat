"use client";
import { useState, useRef, useEffect } from "react";
import { Box, Button, Flex, TextField } from "@radix-ui/themes";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useSelectedFeatureContext } from "@/provider/SelectedFeatureContext";
import { useGlobal } from "@/hooks/useGlobal";
import { useToast } from "@/provider/ToastContext";
import axios from "axios";
import { useSession } from "next-auth/react";



// Define the conversation flow
const steps = [
  {
    id: "welcome",
    question:
      "Hi! 👋 Welcome to WAGen – the Water Accounting Generator. I can help you create satellite-based water accounting reports, explore datasets, and analyze water balance for your selected area. What would you like to do today?",
    suggestions: ["Generate Water Accounting Report"],
  },
  {
    id: "area",
    question:
      "Please select an area from your added areas or upload/add new area on the map.",
    suggestions: null,
  },
  {
    id: "precip",
    question: "Select a precipitation dataset:",
    suggestions: [
      { label: "CHIRPS", value: "chirps" },
      { label: "GPM", value: "gpm" },
      { label: "GsMAP", value: "gsmap" },
      { label: "ERA5", value: "era5" },
      { label: "Ensemble", value: "ensemble" },
    ],
  },
  {
    id: "et",
    question: "Select an evapotranspiration dataset:",
    suggestions: [
      { label: "SSebop", value: "ssebop" },
      { label: "WaPOR2", value: "wapor2" },
      { label: "WaPOR3", value: "wapor3" },
      { label: "Ensemble Africa", value: "enset" },
      { label: "Ensemble Global", value: "ensetglobal" },
    ],
  },
  {
    id: "start",
    question: "Enter start year:",
    suggestions: [
      { label: "2018", value: "2018" },
      { label: "2019", value: "2019" },
      { label: "2020", value: "2020" },
      { label: "2021", value: "2021" },
      { label: "2022", value: "2022" },
      { label: "2023", value: "2023" },
    ],
  },
  {
    id: "end",
    question: "Enter end year:",
    suggestions: [
      { label: "2018", value: "2018" },
      { label: "2019", value: "2019" },
      { label: "2020", value: "2020" },
      { label: "2021", value: "2021" },
      { label: "2022", value: "2022" },
      { label: "2023", value: "2023" },
    ],
  },
  {
    id: "done",
    question: "Please wait! I’ll generate your Water Accounting Report now.",
  },
];

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "system",
      text: steps[0].question,
      suggestions: steps[0].suggestions,
    },
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState({});
  const messagesEndRef = useRef(null);
  const [progress, setProgress] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [taskId, setTaskId] = useState(null);
  const { selectedArea } = useGlobal();
  const { showToast } = useToast();
  const { data: session, status } = useSession()
  const token = session?.user?.token;
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnswer = async (answer) => {
    const currentStep = steps[stepIndex];

    // Prepare updated answers immediately
    const updatedAnswers = { ...answers, [currentStep.id]: answer };
    setAnswers(updatedAnswers);

    // Show user message
    setMessages((prev) => [...prev, { sender: "user", text: answer }]);

    // Go next
    const nextStepIndex = stepIndex + 1;
    setStepIndex(nextStepIndex);

    if (steps[nextStepIndex]) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: steps[nextStepIndex].question,
          suggestions: steps[nextStepIndex].suggestions,
        },
      ]);

      // ✅ Use the *local* updatedAnswers instead of stale state
      if (steps[nextStepIndex]?.id === "done") {
        console.log("✅ final answers", updatedAnswers);
        setIsGenerating(true);
        setProgress(0);


        try {
          const formData = new FormData();
          formData.append("areaid", selectedArea.value);
          formData.append("start", updatedAnswers.start);
          formData.append("end", updatedAnswers.end);
          formData.append("precip", updatedAnswers.precip);
          formData.append("et", updatedAnswers.et);
          formData.append("wri_data", false);

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/getreport`,
            formData,
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );


setTaskId(res.data.task_id);
          setMessages((prev) => [
            ...prev,
            { sender: "system", text: "Report generation started! You’ll be notified when it’s ready..." },
            { sender: "system", text: "Progress: 0%", type: "progress" },
          ]);

        } catch (err) {
          console.error("Report error:", err);
          etIsGenerating(false);
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: "⚠️ Failed to start report." },
        ]);
          // showToast("Error generating report.");
        }
      }
    }
  };

useEffect(() => {
  if (!taskId || !isGenerating) return;

  const checkStatus = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/get-task-status/${taskId}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      const data = await res.json();
      console.log("data",data)

      if (data.state === "PROGRESS") {
        setProgress(data.progress || 0);
      } else if (data.state === "SUCCESS") {
        setProgress(100);
        setIsGenerating(false);
        showToast("✅ Report completed successfully!");
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: "✅ Report completed successfully!" },
        ]);
      } else if (data.state === "FAILURE") {
        setProgress(0);
        setIsGenerating(false);
        showToast("⚠️ Report failed");
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: "⚠️ Report failed. Please retry." },
        ]);
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  checkStatus(); // immediate first call
  const interval = setInterval(checkStatus, 10000); // every 10 s
  return () => clearInterval(interval);
}, [taskId, isGenerating]);






  const handleSend = () => {
    if (!input.trim()) return;
    handleAnswer(input);
    setInput("");
  };

  return (
    <Flex direction="column" className="w-full h-full rounded-lg p-4 ">
      {/* Chat messages */}
      <Box className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map((msg, idx) => (
  <Flex key={idx} justify={msg.sender === "user" ? "end" : "start"}>
    <Box
      className={`px-3 py-2 rounded-2xl max-w-[70%] ${
        msg.sender === "user"
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-black border border-gray-200"
      }`}
    >
      {/* ✅ Progress bar message */}
      {msg.type === "progress" ? (
        <div className="flex flex-col items-start">
          <p className="text-xs text-gray-500 mb-1">Generating report...</p>

          <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-700 ease-in-out ${
                progress < 100 ? "bg-blue-600" : "bg-green-600"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}%</p>
        </div>
      ) : (
        // ✅ Normal text message
        <span>{msg.text}</span>
      )}
    </Box>
  </Flex>
))}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestion buttons */}
      {steps[stepIndex]?.id === "area" ? (
        <Flex gap="2" wrap="wrap" className="mb-3">
          {selectedArea ? (
            <Button
              size="2"
              variant="soft"
              onClick={() => handleAnswer(selectedArea.label)}
            >
              {selectedArea.label}
            </Button>
          ) : (
            <Box className="text-sm text-red-500 font-medium">
              ⚠️ Please select or upload an area before proceeding.
            </Box>
          )}
        </Flex>
      ) : steps[stepIndex]?.suggestions ? (
        <Flex gap="2" wrap="wrap" className="mb-3">
          {steps[stepIndex].suggestions.map((s, i) => (
            <Button
              key={i}
              size="2"
              variant="soft"
              onClick={() => handleAnswer(typeof s === "object" ? s.value : s)}
            >
              {typeof s === "object" ? s.label : s}
            </Button>
          ))}
        </Flex>
      ) : null}

      {/* Free text input */}
      <Flex gap="2">
        <TextField.Root
          placeholder="Type your answer..."
          value={input}
          disabled={!steps[stepIndex]?.input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} disabled={!input.trim()}>
          <PaperPlaneIcon />
        </Button>
      </Flex>
    </Flex>
  );
}

export default ChatBox;
