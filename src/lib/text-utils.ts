export interface Sentence {
  words: string[];
  wordIndices: number[];
}

export const splitIntoSentences = (text: string): Sentence[] => {
  const words = text.trim().split(/\s+/);
  const sentences: Sentence[] = [];
  let currentSentenceWords: string[] = [];
  let currentSentenceIndices: number[] = [];

  words.forEach((word, index) => {
    currentSentenceWords.push(word);
    currentSentenceIndices.push(index);
    if (/[.!?]$/.test(word)) {
      sentences.push({
        words: currentSentenceWords,
        wordIndices: currentSentenceIndices,
      });
      currentSentenceWords = [];
      currentSentenceIndices = [];
    }
  });
  if (currentSentenceWords.length > 0) {
    sentences.push({
      words: currentSentenceWords,
      wordIndices: currentSentenceIndices,
    });
  }
  return sentences;
};

