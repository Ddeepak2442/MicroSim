import Head from "next/head";
import { useState, useCallback, useEffect } from "react";
import TextInput from "./components/TextInput";
import Editor from "./components/Editor";
import RunContainer from "./components/RunContainer";
import Header from "./components/header";
import ImageInput from "./components/ImageInput";
import egArray from "./components/egArray";
import ImageUploader from "./components/ImageUploader";

export default function Home() {
  const [result, setResult] = useState("// type a text prompt above and click 'Generate p5.js code'");
  const [textInput, setTextInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [logMsg, setlogMsg] = useState("");
  const [selVal, setSelVal] = useState("");

  const [file, setFile] = useState(null); // Holds the selected image file
  const [preview, setPreview] = useState(''); // URL for the image preview
  const [analysisresult, setanalysisResult] = useState(''); // Stores the analysis result
  const [statusMessage, setStatusMessage] = useState(''); // Displays status messages to the user
  const [uploadProgress, setUploadProgress] = useState(0); // Manages the upload progress
  const [dragOver, setDragOver] = useState(false); // UI state for drag-and-drop
  const [usertextInput, setUserTextInput] = useState(''); // Custom text input by the user
  const [selectedOption, setSelectedOption] = useState('off'); // Option for detail level of analysis
  const [maxTokens, setMaxTokens] = useState(50); // Max tokens for analysis
  const [base64Image, setBase64Image] = useState('');
  const [analysisResult, setAnalysisResult] = useState(""); // State to hold the analysis result

  const updateAnalysisResult = (result) => {
    setAnalysisResult(result);
  };

  const handleFileChange = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setStatusMessage('Image selected. Click "Analyze Image" to proceed.');
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result.toString());
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setStatusMessage('No file selected!');
      return;
    }
  
    setStatusMessage('Sending request...');
    setUploadProgress(40);
  
    const response = await fetch('/api/upload_gpt4v/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Image,
        prompt: usertextInput,
        detail: selectedOption !== 'off' ? selectedOption : undefined,
        max_tokens: maxTokens
      }),
    });
  
    setUploadProgress(60);
  
    // Check if the response status is in the range of 200 to 299
    if (response.ok) {
      try {
        const apiResponse = await response.json();
        setUploadProgress(80);
  
        if (apiResponse.success) {
          setanalysisResult(apiResponse.analysis);
          setStatusMessage('Analysis complete.');
          setUploadProgress(100);
        } else {
          setStatusMessage(apiResponse.message);
        }
      } catch (error) {
        console.error(error);
        setStatusMessage('Error parsing response.');
      }
    } else {
      // Handle the case where the response status is not in the OK range
      setStatusMessage(`HTTP error! status: ${response.status}`);
    }
  };
  
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files.length) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange]);

  useEffect(() => {
    let ranOnce = false;

    const handler = event => {
      const data = JSON.parse(event.data);
      if (!ranOnce) {
        setlogMsg(data.logMsg);
        ranOnce = true;
      } else {
        setlogMsg(msg => msg + '\n' + data.logMsg);
      }
    };

    window.addEventListener("message", handler);

    return () => window.removeEventListener("message", handler);
  }, [result, sandboxRunning]);

  function textInputChange(event) {
    event.preventDefault();
    setTextInput(event.target.value);
  }

  async function textInputSubmit(event) {
    event.preventDefault();
    setlogMsg("");
    setWaiting(true);
    setResult("// Please be patient, this may take a while...");
    setSelVal("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_REMOTE_API_URL || ''}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: textInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        setWaiting(false);
        throw new Error(`Request failed with status ${response.status}`);
      }
      setResult(data.code);
      setSandboxRunning(true);
      setWaiting(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
      setWaiting(false);
    }
  }

  const editorChange = useCallback((value) => {
    setResult(value);
  }, []);

  function runClickPlay(event) {
    event.preventDefault();
    setSandboxRunning(true);
  }

  function runClickStop(event) {
    event.preventDefault();
    setSandboxRunning(false);
    setlogMsg("");
  }

  function textSelectChange(event) {
    setSelVal(event.target.value);
    event.preventDefault();
    const search = event.target.value;
    const selectedEg = egArray.find((obj) => obj.value === search);
    if (selectedEg) {
      setlogMsg('');
      setTextInput(selectedEg.prompt);
      setResult(selectedEg.code);
      setSandboxRunning(true);
    } else {
      setlogMsg('');
      setTextInput('');
      setResult('');
      setSandboxRunning(false);
    }
  }

  return (
    <>
      <Head>
        <title>MicroSim</title>
        <meta name="description" content="Turn text into p5.js code using GPT and display it" />
      </Head>
      <div className="w-full p-5 flex flex-col gap-5 max-w-2xl min-w-[320px] relative 2xl:max-w-7xl">
        <Header />
        <div className="flex flex-col gap-4 2xl:flex-row w-full">
          <div className="flex flex-col gap-4 2xl:w-1/2">
            <TextInput key="textinput-01" textInput={textInput} onChange={textInputChange} onSubmit={textInputSubmit} waiting={waiting} selectVal={selVal} selectChange={textSelectChange} egArray={egArray} />
        <ImageUploader
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleFileChange={handleFileChange}
          preview={preview}
          uploadProgress={uploadProgress}
          handleSubmit={handleSubmit}
          statusMessage={statusMessage}
          analysisresult={analysisresult}
          setAnalysisResult={updateAnalysisResult}
          dragOver={dragOver}
        />
            <ImageInput key="textinput-01" textInput={textInput} onChange={textInputChange} onSubmit={textInputSubmit} waiting={waiting} selectVal={selVal} selectChange={textSelectChange} analysisresult={analysisResult}/>
            <Editor key="editor-01" result={result} onChange={editorChange} waiting={waiting} />
          </div>
          <div className="flex flex-col gap-4 2xl:w-1/2">
            <RunContainer key="runcont-01" sandboxRunning={sandboxRunning} clickPlay={runClickPlay} clickStop={runClickStop} result={result} logMsg={logMsg} waiting={waiting} />
          </div>
        </div>
      </div>

   </>
  );
}