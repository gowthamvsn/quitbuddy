// src/brain/rag.ts
const corpus = [
  { id: 1, text: "Cravings last 3–5 minutes. Ride the wave." },
  { id: 2, text: "Deep breathing: 4-7-8 method — inhale 4, hold 7, exhale 8." },
  { id: 3, text: "Nicotine leaves your body in 72 hours. Day 3 is peak withdrawal." },
  { id: 4, text: "Exercise boosts dopamine — walk, jump, dance." },
  { id: 5, text: "Tell a friend: 'I'm quitting today.' Accountability works." },
  { id: 6, text: "Replace the habit: water, gum, or a 60-second distraction." }
];

export const retrieve = (query: string, topK = 2): string[] => {
  const q = query.toLowerCase();
  return corpus
    .filter(c => 
      q.includes('craving') && c.id <= 3 ||
      q.includes('stress') && c.id === 2 ||
      q.includes('exercise') && c.id === 4
    )
    .slice(0, topK)
    .map(c => c.text);
};