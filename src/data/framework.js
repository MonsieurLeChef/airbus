/**
 * Edit this file to customize steps, copy, and layout positions.
 * Grid uses 4 columns and 4 rows by default (see Flowchart.css).
 * Position nodes with 1-based indices: { col: 1..4, row: 1..4 }
 */
export const framework = {
  nodes: [
    {
      id: "discover",
      title: "Discover",
      subtitle: "1. Understand",
      description: "Gather context, signals, and constraints to surface promising opportunities.",
      prompts: [
        "What problem or opportunity space are we exploring?",
        "What data, trends, or user insights matter here?",
        "What constraints (time, risk, compliance) shape our options?"
      ],
      outputs: ["Opportunity landscape", "Key stakeholders", "Initial hypotheses"],
      col: 1, row: 1
    },
    {
      id: "define",
      title: "Define",
      subtitle: "2. Focus",
      description: "Prioritize and frame the most compelling opportunities with crisp criteria.",
      prompts: [
        "Which outcomes are we optimizing for?",
        "How will we measure impact?",
        "What does success look like in 90 days?"
      ],
      outputs: ["Prioritized opportunity statements", "Success metrics", "Assumptions list"],
      col: 2, row: 2
    },
    {
      id: "design",
      title: "Design",
      subtitle: "3. Shape",
      description: "Generate solution concepts and stress-test them with users and experts.",
      prompts: [
        "What are 2-3 distinct solution patterns?",
        "What is the smallest testable slice?",
        "What risks can we retire early?"
      ],
      outputs: ["Concept sketches", "Test plan", "Risk backlog"],
      col: 3, row: 2
    },
    {
      id: "deliver",
      title: "Deliver",
      subtitle: "4. Execute",
      description: "Build the minimum lovable implementation and iterate based on signals.",
      prompts: [
        "What is the first increment we can ship?",
        "How do we monitor success and learn quickly?",
        "What must be true for scale?"
      ],
      outputs: ["Milestoned plan", "Live metrics", "Release notes"],
      col: 4, row: 3
    },
    {
      id: "reflect",
      title: "Reflect",
      subtitle: "5. Learn",
      description: "Close the loop: capture learnings, update the knowledge base, and celebrate wins.",
      prompts: [
        "What did we learn vs. our assumptions?",
        "What should we do next?",
        "What will we stop doing?"
      ],
      outputs: ["Retrospective", "Updated playbooks", "Next bets"],
      col: 3, row: 4
    }
  ],
  links: [
    { from: "discover", to: "define" },
    { from: "define", to: "design" },
    { from: "design", to: "deliver" },
    { from: "deliver", to: "reflect" },
    // feedback loops
    { from: "reflect", to: "discover" }
  ]
};
