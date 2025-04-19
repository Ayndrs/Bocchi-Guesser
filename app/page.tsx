"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Frame = {
  episode: string;
  frame: string;
  url: string;
};

export default function Home() {
  const [frameData, setFrameData] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState<Frame | null>(null);
  const [score, setScore] = useState(0);
  const [guessResult, setGuessResult] = useState<"" | "correct" | "wrong">("");
  const [cheated, setCheated] = useState(false);

  // 👮 DevTools cheat detection logic
  useEffect(() => {
    const threshold = 160;

    const detectDevTools = () => {
      const before = performance.now();
      debugger; // intentionally triggers slowdown if DevTools open
      const after = performance.now();

      if (after - before > threshold && !cheated) {
        setCheated(true);
        setScore(-999999999);
        alert("STOP CHEATING");
      }
    };

    const interval = setInterval(detectDevTools, 2000);

    return () => clearInterval(interval);
  }, [cheated]);

  // Load random episode on first render
  useEffect(() => {
    loadRandomEpisode();
  }, []);

  const loadRandomEpisode = async () => {
    const epNum = Math.floor(Math.random() * 12) + 1;
    const filename = `/jsons/ep${epNum}.json`;

    try {
      const res = await axios.get<Frame[]>(filename);
      const data = res.data;
      setFrameData(data);

      const random = data[Math.floor(Math.random() * data.length)];
      setCurrentFrame(random);
      setGuessResult("");
    } catch (err) {
      console.error("Error loading JSON:", err);
    }
  };

  const handleGuess = (episodeGuess: string) => {
    if (cheated || !currentFrame) return;

    const isCorrect = episodeGuess === currentFrame.episode;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setGuessResult("correct");
    } else {
      setScore(0);
      setGuessResult("wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 py-8">
      <p className="text-2xl mb-2">Score: {score}</p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-pink-400">
        {cheated ? "Walter is Watching." : "🎸 Bocchi the Rock: Episode Guesser"}
      </h1>

      {(currentFrame || cheated) && (
        <img
          key={cheated ? "shame" : currentFrame?.url}
          src={cheated ? "/DogOfShame.jpg" : currentFrame?.url}
          alt="Anime frame"
          className="rounded-lg h-auto w-full max-w-5xl mb-6 border-2 border-pink-500"
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          style={{ pointerEvents: "none" }}
        />
      )}

      {!cheated && (
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 12 }, (_, index) => (
            <button
              key={index}
              onClick={() => handleGuess(`ep${index + 1}`)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Episode {index + 1}
            </button>
          ))}
        </div>
      )}

      {cheated && (
        <button
          onClick={() => {
            setCheated(false);
            setScore(0);
            loadRandomEpisode();
          }}
          className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-bold"
        >
          Pray to Walter
        </button>
      )}

      {!cheated && guessResult === "correct" && (
        <div className="mt-6 text-green-400 font-semibold text-lg">
          ✅ Correct!
          <button
            onClick={loadRandomEpisode}
            className="ml-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
          >
            Next
          </button>
        </div>
      )}

      {!cheated && guessResult === "wrong" && (
        <div className="mt-6 text-red-400 font-semibold text-lg text-center">
          ❌ Nope! It was episode{" "}
          <span className="underline">{currentFrame?.episode.slice(2)}</span>
          <div>
            <button
              onClick={loadRandomEpisode}
              className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
