import React, { useEffect, useRef, useState } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, random, delayRender, continueRender } from "remotion";
import { Sentence } from "../lib/text-utils";

export const SentenceRenderer: React.FC<{
  sentence: Sentence & { startTime: number };
  nextSentenceStartTime: number;
  getWordStartTime: (index: number) => number;
  captionColor: string;
  animationStyle?: "pop" | "karaoke" | "typewriter" | "matrix";
}> = ({
  sentence,
  nextSentenceStartTime,
  getWordStartTime,
  captionColor,
  animationStyle = "pop",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [wordCenters, setWordCenters] = useState<number[]>([]);
  const [handle] = useState(() => delayRender());
  const handleCalled = useRef(false);
  const [measurementsDone, setMeasurementsDone] = useState(false);

  const isVisible = frame >= sentence.startTime && frame < nextSentenceStartTime;

  useEffect(() => {
    if (animationStyle !== 'karaoke') {
        if (!handleCalled.current) {
            continueRender(handle);
            handleCalled.current = true;
        }
        return;
    }

    if (!isVisible) {
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

        const centers = sentence.words.map((_, i) => {
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
  }, [animationStyle, handle, sentence.words, isVisible]);

  // Show sentence until next one starts
  if (!isVisible) {
    return null;
  }

  // Fade out in the last 10 frames before the next sentence
  const opacity = interpolate(
    frame,
    [nextSentenceStartTime - 10, nextSentenceStartTime],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Ball logic
  let ballElement = null;
  if (animationStyle === 'karaoke' && measurementsDone && wordCenters.length === sentence.words.length) {
      let ballX = 0;
      let ballY = -30;
      let showBall = false;
      const jumpDuration = 5;

      for (let i = 0; i < sentence.words.length; i++) {
        const globalIndex = sentence.wordIndices[i];
        const start = getWordStartTime(globalIndex);

        let nextStart;
        if (i < sentence.words.length - 1) {
           nextStart = getWordStartTime(sentence.wordIndices[i+1]);
        } else {
           nextStart = nextSentenceStartTime;
        }

        if (frame >= start && frame < nextStart) {
           showBall = true;
           const currentCenter = wordCenters[i];

           // Check if we are in the jump phase to the next word
           if (i < sentence.words.length - 1 && frame >= nextStart - jumpDuration) {
              const nextCenter = wordCenters[i+1];
              const progress = (frame - (nextStart - jumpDuration)) / jumpDuration;

              ballX = interpolate(progress, [0, 1], [currentCenter, nextCenter]);

              // Parabolic arc
              const jumpHeight = 20;
              const yOffset = Math.sin(progress * Math.PI) * jumpHeight;
              ballY = -30 - yOffset;
           } else {
              // Staying on current word
              ballX = currentCenter;

              // Landing bounce effect (first 5 frames of the word)
              const timeSinceLand = frame - start;
              if (timeSinceLand < 5) {
                  ballY = interpolate(timeSinceLand, [0, 5], [-50, -30], {extrapolateRight: 'clamp'});
              } else {
                  ballY = -30;
              }
           }
           break;
        }
      }

      if (showBall) {
          ballElement = (
            <span
                style={{
                    position: "absolute",
                    left: ballX,
                    top: ballY,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    backgroundColor: captionColor,
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                    zIndex: 10,
                }}
            />
          );
      }
  }

  return (
    <p
      ref={containerRef}
      style={{
        fontFamily: "SF Pro Text, Helvetica, Arial",
        fontWeight: "bold",
        fontSize: 60,
        textAlign: "center",
        position: "absolute",
        bottom: 100,
        width: "100%",
        paddingLeft: 50,
        paddingRight: 50,
        margin: 0,
        opacity,
      }}
    >
      {sentence.words.map((t, i) => {
        const globalIndex = sentence.wordIndices[i];
        const startFrame = getWordStartTime(globalIndex);
        const timeSinceStart = frame - startFrame;

        // Determine word end frame
        let wordEndFrame;
        if (i < sentence.words.length - 1) {
          const nextGlobalIndex = sentence.wordIndices[i + 1];
          wordEndFrame = getWordStartTime(nextGlobalIndex);
        } else {
          wordEndFrame = nextSentenceStartTime;
        }

        // Determine if this is the current word being typed or waiting
        const isCurrentWord = frame >= startFrame && frame < wordEndFrame;

        const style: React.CSSProperties = {
          color: captionColor,
          marginLeft: 8,
          marginRight: 8,
          display: "inline-block",
        };

        let content: React.ReactNode = t;

        if (animationStyle === "pop") {
          content = t.split("").map((char, charIndex) => {
            const delay = charIndex * 1.5; // Slight delay per character
            const charTime = timeSinceStart - delay;

            const scale = spring({
              fps,
              frame: charTime,
              config: {
                damping: 10,
                stiffness: 200,
                mass: 0.5,
              },
            });

            const opacity = interpolate(charTime, [0, 2], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <span
                key={charIndex}
                style={{
                  display: "inline-block",
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                {char}
              </span>
            );
          });
        } else if (animationStyle === "karaoke") {
          style.position = "relative";

          // Classic Karaoke: Unread text is grey, read text is colored
          const isFuture = frame < startFrame;

          if (isFuture) {
            style.color = "#cccccc"; // Grey for unread
          } else {
            style.color = captionColor; // Active/Read color
          }
        } else if (animationStyle === "typewriter") {
          style.fontFamily = "Courier New, monospace";
          style.position = "relative";

          const splitT = t.split("");
          const chars = splitT.map((char, charIndex) => {
            const charVisible = timeSinceStart >= charIndex * 2;
            return (
              <span key={charIndex} style={{ opacity: charVisible ? 1 : 0 }}>
                {char}
              </span>
            );
          });

          if (isCurrentWord) {
            const cursorVisible = Math.floor(frame / 10) % 2 === 0;
            const visibleCharsCount = splitT.filter((_, i) => timeSinceStart >= i * 2).length;

            chars.push(
              <span
                key="cursor"
                style={{
                  opacity: cursorVisible ? 1 : 0,
                  position: "absolute",
                  left: `${visibleCharsCount}ch`,
                  top: 0,
                }}
              >
                |
              </span>,
            );
          }
          content = chars;
        } else if (animationStyle === "matrix") {
          style.color = "#292c3d";
          style.fontFamily = "monospace";
          style.textShadow = "0 0 5px #00FF00";

          // Fade in
          style.opacity = interpolate(timeSinceStart, [0, 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*";

          content = t.split("").map((char, charIndex) => {
            // Resolve characters from left to right
            const resolveThreshold = charIndex * 3 + 5;

            if (timeSinceStart > resolveThreshold) {
              return <span key={charIndex}>{char}</span>;
            }

            // Random character flickering
            const seed = frame + charIndex * 100 + globalIndex * 1000;
            const randIndex = Math.floor(random(seed) * matrixChars.length);

            return (
              <span key={charIndex} style={{ opacity: 0.8 }}>
                {matrixChars[randIndex]}
              </span>
            );
          });
        }

        return (
          <span
            key={`${globalIndex}-${t}`}
            ref={(el) => {
              wordRefs.current[i] = el;
            }}
            style={style}
          >
            {content}
          </span>
        );
      })}
      {ballElement}
    </p>
  );
};

