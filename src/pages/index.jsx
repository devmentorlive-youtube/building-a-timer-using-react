import { useEffect, useState, useRef } from "react";
import { StopIcon, PlayIcon } from "@heroicons/react/solid";

export default function Homepage() {
  return (
    <div className="mt-16 container mx-auto">
      <Timer />
    </div>
  );
}

function useInterval(callback, delay = undefined) {
  const callbackRef = useRef(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (Boolean(!delay)) return;
    const handler = () => callbackRef.current();
    const id = setInterval(handler);

    return () => clearInterval(id);
  }, [delay]);
}

function Timer({}) {
  const [startedAt, setStartedAt] = useState(undefined);
  const [endedAt, setEndedAt] = useState(undefined);
  const [tick, setTick] = useState(0);

  useInterval(() => setTick((prev) => prev + 1), started() ? 1000 : undefined);

  function started() {
    return Boolean(startedAt) && Boolean(!endedAt);
  }

  function elapsed() {
    if (!started()) return "00:00:00";

    const pad = function (num, size) {
      return ("000" + num).slice(size * -1);
    };
    const time = parseFloat(
      (new Date().getTime() - startedAt.getTime()) / 1000
    ).toFixed(3);

    const hours = Math.floor(time / 60 / 60);
    const minutes = Math.floor(time / 60) % 60;
    const seconds = Math.floor(time - minutes * 60);

    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="">
        <input
          type="text"
          className="bg-gray-700 text-white p-2 focus:outline-none"
        />
      </div>
      <div className="">
        {started() ? (
          <StopIcon
            className="w-8 h-8"
            onClick={() => setEndedAt(new Date())}
          />
        ) : (
          <PlayIcon
            className="w-8 h-8"
            onClick={() => setStartedAt(new Date())}
          />
        )}
      </div>
      <div className="text-2xl font-thin">{elapsed()}</div>
    </div>
  );
}
