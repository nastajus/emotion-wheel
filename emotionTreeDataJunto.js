// emotionTreeData.js

export const literalEmotionTree = [
  {
    name: "Joy",
    baseHue: 60,
    children: [
      {
        name: "Optimistic",
        children: [{ name: "Inspired" }, { name: "Hopeful" }]
      },
      {
        name: "Trusting",
        children: [{ name: "Supportive" }, { name: "Loving" }]
      },
      {
        name: "Proud",
        children: [{ name: "Triumphant" }, { name: "Confident" }]
      },
      {
        name: "Cheerful",
        children: [{ name: "Happy" }, { name: "Content" }]
      },
      {
        name: "Excited",
        children: [{ name: "Eager" }, { name: "Energetic" }]
      },
      {
        name: "Grateful",
        children: [{ name: "Appreciative" }, { name: "Thankful" }]
      }
    ]
  },
  {
    name: "Trust",
    baseHue: 120,
    children: [
      {
        name: "Affectionate",
        children: [{ name: "Warm" }, { name: "Caring" }]
      },
      {
        name: "Sensitive",
        children: [{ name: "Tender" }, { name: "Loving" }]
      },
      {
        name: "Intimate",
        children: [{ name: "Connected" }, { name: "Compassionate" }]
      },
      {
        name: "Loyal",
        children: [{ name: "Faithful" }, { name: "Reliable" }]
      },
      {
        name: "Approving",
        children: [{ name: "Accepting" }, { name: "Friendly" }]
      }
    ]
  },
  {
    name: "Fear",
    baseHue: 180,
    children: [
      {
        name: "Humiliated",
        children: [{ name: "Disgraced" }, { name: "Shameful" }]
      },
      {
        name: "Rejected",
        children: [{ name: "Excluded" }, { name: "Persecuted" }]
      },
      {
        name: "Insecure",
        children: [{ name: "Inferior" }, { name: "Worthless" }]
      },
      {
        name: "Anxious",
        children: [{ name: "Worried" }, { name: "Overwhelmed" }]
      },
      {
        name: "Scared",
        children: [{ name: "Frightened" }, { name: "Helpless" }]
      }
    ]
  },
  {
    name: "Surprise",
    baseHue: 240,
    children: [
      {
        name: "Startled",
        children: [{ name: "Shocked" }, { name: "Dismayed" }]
      },
      {
        name: "Disillusioned",
        children: [{ name: "Disappointed" }, { name: "Betrayed" }]
      },
      {
        name: "Amazed",
        children: [{ name: "Awe" }, { name: "Wonder" }]
      },
      {
        name: "Confused",
        children: [{ name: "Perplexed" }, { name: "Disoriented" }]
      }
    ]
  },
  {
    name: "Sadness",
    baseHue: 300,
    children: [
      {
        name: "Lonely",
        children: [{ name: "Abandoned" }, { name: "Isolated" }]
      },
      {
        name: "Vulnerable",
        children: [{ name: "Fragile" }, { name: "Victimized" }]
      },
      {
        name: "Despair",
        children: [{ name: "Powerless" }, { name: "Hopeless" }]
      },
      {
        name: "Guilty",
        children: [{ name: "Remorseful" }, { name: "Ashamed" }]
      },
      {
        name: "Depressed",
        children: [{ name: "Empty" }, { name: "Inferior" }]
      }
    ]
  },
  {
    name: "Anger",
    baseHue: 0,
    children: [
      {
        name: "Hurt",
        children: [{ name: "Embarrassed" }, { name: "Devastated" }]
      },
      {
        name: "Hostile",
        children: [{ name: "Jealous" }, { name: "Bitter" }]
      },
      {
        name: "Angry",
        children: [{ name: "Frustrated" }, { name: "Infuriated" }]
      },
      {
        name: "Selfish",
        children: [{ name: "Greedy" }, { name: "Arrogant" }]
      },
      {
        name: "Hateful",
        children: [{ name: "Violent" }, { name: "Spiteful" }]
      }
    ]
  }
];
