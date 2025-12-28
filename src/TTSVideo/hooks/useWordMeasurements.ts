import { useEffect, useRef, useState } from "react";
import { delayRender, continueRender } from "remotion";

export const useWordMeasurements = (
  shouldMeasure: boolean,
  wordCount: number
) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [wordCenters, setWordCenters] = useState<number[]>([]);
  const [handle] = useState(() => delayRender());
  const handleCalled = useRef(false);
  const [measurementsDone, setMeasurementsDone] = useState(false);

  useEffect(() => {
    if (!shouldMeasure) {
      if (!handleCalled.current) {
        continueRender(handle);
        handleCalled.current = true;
      }
      return;
    }

    if (!containerRef.current) return;

    const measure = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate scale factor to handle Remotion player scaling
      const scale = containerRect.width / container.offsetWidth;

      const centers = Array.from({ length: wordCount }).map((_, i) => {
        const span = wordRefs.current[i];
        if (!span) return 0;
        const rect = span.getBoundingClientRect();

        const relativeLeft = rect.left - containerRect.left;
        const center = relativeLeft + rect.width / 2;

        return center / scale;
      });
      setWordCenters(centers);
      setMeasurementsDone(true);
      if (!handleCalled.current) {
        continueRender(handle);
        handleCalled.current = true;
      }
    };

    measure();
  }, [shouldMeasure, handle, wordCount]);

  return {
    containerRef,
    wordRefs,
    wordCenters,
    measurementsDone,
  };
};

