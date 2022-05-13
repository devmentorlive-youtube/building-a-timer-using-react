import { format } from "date-fns";
import { useEffect, useState, useRef } from "react";
import { StopIcon, PlayIcon } from "@heroicons/react/solid";

export default function Homepage() {
  const [timestamps, setTimestamps] = useState([]);
  return (
    <div className="mt-16 container mx-auto">
      <div className="w-1/3 mx-auto flex flex-col justify-center gap-2">
        <Timer
          timestamps={timestamps}
          onStart={(ts) => setTimestamps(ts)}
          onEnd={(ts) => setTimestamps(ts)}
        />
        <Log timestamps={timestamps} />
        <Total timestamps={timestamps} />
      </div>
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

function Timer({ timestamps, onStart = () => {}, onEnd = () => {} }) {
  const [label, setLabel] = useState("");
  const [tick, setTick] = useState(0);
  const [focused, setFocused] = useState(true);
  const ref = useRef();

  useInterval(() => setTick((prev) => prev + 1), started() ? 1000 : undefined);

  function started() {
    return timestamps.length > 0 && Boolean(!timestamps[0].endedAt);
  }

  function start() {
    setFocused(true);
    onStart((prev) => [{ startedAt: new Date() }, ...prev]);
  }

  function stop() {
    setFocused(true);
    onEnd((prev) =>
      prev.map((ts, i) =>
        i === 0 ? { ...ts, endedAt: new Date(), label } : ts
      )
    );
    setLabel("");
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-grow">
        <TextField
          {...{
            focused,
            value: label,
            onChange: (label) => setLabel(label),
            onEnter: () => ref.current.click(),
          }}
        />
      </div>
      <div className="cursor-pointer h-8">
        {started() ? (
          <button ref={ref} onClick={stop}>
            <StopIcon className="w-8 h-8" />
          </button>
        ) : (
          <button ref={ref} onClick={start}>
            <PlayIcon className="w-8 h-8" />
          </button>
        )}
      </div>
      <div className="text-2xl font-thin w-[110px]">
        {!timestamps[0]?.endedAt
          ? elapsed(new Date().getTime() - timestamps[0]?.startedAt.getTime())
          : "00:00:00"}
      </div>
    </div>
  );
}

function TextField({
  value,
  focused = false,
  onChange = () => {},
  onEnter = () => {},
}) {
  const ref = useRef();

  useEffect(() => {
    if (focused) ref.current.focus();
  }, [focused]);

  useEffect(() => {
    const handler = ({ key }) => {
      if (key !== "Enter") return;
      onEnter();
    };

    addEventListener("keydown", handler);

    return () => removeEventListener("keydown", handler);
  }, []);

  return (
    <input
      placeholder="Task label, eg. Meeting with Sally"
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type="text"
      className="bg-gray-700 text-white p-2 focus:outline-none w-full"
    />
  );
}

function elapsed(seconds) {
  if (!(seconds > 0)) return "00:00:00";

  const pad = function (num, size) {
    return ("000" + num).slice(size * -1);
  };
  const time = parseFloat(seconds / 1000).toFixed(3);

  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor(time / 60) % 60;
  const _seconds = Math.floor(time - minutes * 60);

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(_seconds, 2)}`;
}

function Log({ timestamps }) {
  const timestamp = "hh:mm:ss aaa";
  return (
    <ul className="flex flex-col gap-2">
      {timestamps
        .filter((ts) => Boolean(ts.endedAt))
        .map((ts) => (
          <li className="border inline-block p-2 border-gray-600 rounded">
            <div className="flex items-center gap-2">
              <div className="flex-grow">{ts.label}</div>
              <div className="font-thin">{format(ts.startedAt, timestamp)}</div>
              <div className="font-thin">
                {ts.endedAt && format(ts.endedAt, timestamp)}
              </div>
            </div>
          </li>
        ))}
    </ul>
  );
}

function Total({ timestamps }) {
  return (
    <div className="text-right font-bold text-lg">
      Total:{" "}
      {elapsed(
        timestamps
          .filter((ts) => Boolean(ts.endedAt))
          .reduce(
            (acc, ts) => acc + ts.endedAt.getTime() - ts.startedAt.getTime(),
            0
          )
      )}
    </div>
  );
}
