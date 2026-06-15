export const SAMPLE_TEXT = `School phone bans are a reckless policy that everyone knows will destroy student independence and lead to disastrous consequences. These draconian measures strip teenagers of their autonomy at a critical developmental stage. Any reasonable person can see that this policy was created by out-of-touch administrators who have completely forgotten what it's like to be young. The research is clear: students need their phones for safety, learning, and communication. Banning phones will inevitably create anxiety, helplessness, and resentment among the student body. This is nothing short of an authoritarian overreach that has no place in a modern educational environment. We cannot allow bureaucrats to dictate the basic rights of our children simply because they fear what they do not understand. Every student deserves the freedom to manage their own tools and time without being treated like a criminal.`;

export const MOCK_REPORT = {
  framingSummary: {
    topic: "School Phone Bans",
    mainArgument:
      "The author argues that phone bans harm student independence, constitute an authoritarian overreach, and were created by administrators out of touch with student needs.",
    likelyStance: "Strongly opposed to phone bans",
    tone: "Critical and emotionally charged",
    framingLens: "Student freedom vs. administrative control",
  },

  biasRiskScores: {
    loadedLanguage: 8,
    evidenceQuality: 3,
    missingCounterarguments: 7,
    emotionalFraming: 9,
    overall: "Medium-High" as const,
  },

  loadedPhrases: [
    {
      phrase: "reckless policy",
      whyItMatters:
        "Implies careless decision-making without providing supporting evidence for that characterization.",
      impact: "High" as const,
    },
    {
      phrase: "everyone knows",
      whyItMatters:
        'Appeals to false consensus. "Everyone" is rarely accurate and discourages critical examination of the claim.',
      impact: "Medium" as const,
    },
    {
      phrase: "disastrous consequences",
      whyItMatters:
        "Catastrophizing language designed to amplify fear and urgency well beyond what any cited evidence supports.",
      impact: "High" as const,
    },
    {
      phrase: "draconian measures",
      whyItMatters:
        "Loaded historical reference evoking extreme repression; applied without evidence that the policy meets that threshold.",
      impact: "High" as const,
    },
    {
      phrase: "out-of-touch administrators",
      whyItMatters:
        "Ad hominem framing that attacks the character and competence of decision-makers rather than engaging with their stated reasoning.",
      impact: "High" as const,
    },
    {
      phrase: "any reasonable person",
      whyItMatters:
        "Implies that disagreement is inherently unreasonable; shuts down legitimate debate before it begins.",
      impact: "Medium" as const,
    },
    {
      phrase: "authoritarian overreach",
      whyItMatters:
        "Extreme political framing applied to a school policy. Draws a misleading comparison to authoritarianism without justification.",
      impact: "High" as const,
    },
  ],

  claims: [
    {
      claim: "This policy will destroy student independence.",
      evidenceProvided: "None",
      risk: "Unsupported" as const,
    },
    {
      claim: "The research is clear: students need their phones.",
      evidenceProvided: "Vague reference — no study, author, or data cited.",
      risk: "Weak" as const,
    },
    {
      claim: "Banning phones will inevitably create anxiety.",
      evidenceProvided: "None — stated as certainty with no causal mechanism shown.",
      risk: "Unsupported" as const,
    },
    {
      claim: "Administrators fear what they do not understand.",
      evidenceProvided: "No evidence — speculative motive attribution.",
      risk: "Fallacy" as const,
    },
  ],

  fallacies: [
    {
      name: "False Dilemma",
      explanation:
        "The text frames the issue as either unrestricted phone access or destroyed student independence, ignoring nuanced middle-ground policies like limited phone zones or supervised use.",
    },
    {
      name: "Appeal to Emotion",
      explanation:
        'Words like "reckless," "disastrous," "draconian," and "authoritarian" are chosen to trigger emotional responses rather than to engage evidence or logic.',
    },
    {
      name: "Hasty Generalization",
      explanation:
        '"Everyone knows" and "any reasonable person" generalize from no stated evidence base, treating one perspective as universal.',
    },
  ],

  missingPerspectives: [
    "The article does not include the perspective of teachers who support phone restrictions to reduce classroom distractions.",
    "No student voices who support the ban or report improved focus are cited.",
    "School administrators' rationale — including academic performance data or mental health research — is not presented.",
    "Parents who favor restrictions for child safety or attention reasons are entirely absent from the analysis.",
  ],

  neutralRewrite: {
    original: "This reckless policy will destroy student independence.",
    neutral:
      "Critics argue that the policy may limit student independence, though proponents contend it could reduce distractions and improve focus.",
  },

  socraticQuestions: [
    "What emotion does the phrase \"reckless policy\" create in you as a reader? Is that emotion supported by evidence in the text?",
    "The author says \"the research is clear\" — what specific research would you need to see to find this claim convincing?",
    "Whose perspective is missing from this argument? How might an administrator or a supportive teacher describe the same situation?",
    "Is \"authoritarian overreach\" an accurate description of a school rule? What assumptions does that comparison require you to accept?",
    "If you rewrote the opening sentence to be completely neutral, which words would you change first, and why?",
  ],
};

export type ImpactLevel = "High" | "Medium";
export type RiskLevel = "Unsupported" | "Weak" | "Fallacy" | "Supported";
export type OverallRisk = "Low" | "Medium" | "Medium-High" | "High";

export interface MockReport {
  framingSummary: {
    topic: string;
    mainArgument: string;
    likelyStance: string;
    tone: string;
    framingLens: string;
  };
  biasRiskScores: {
    loadedLanguage: number;
    evidenceQuality: number;
    missingCounterarguments: number;
    emotionalFraming: number;
    overall: OverallRisk;
  };
  loadedPhrases: Array<{
    phrase: string;
    whyItMatters: string;
    impact: ImpactLevel;
  }>;
  claims: Array<{
    claim: string;
    evidenceProvided: string;
    risk: RiskLevel;
  }>;
  fallacies: Array<{
    name: string;
    explanation: string;
  }>;
  missingPerspectives: string[];
  neutralRewrite: {
    original: string;
    neutral: string;
  };
  socraticQuestions: string[];
}
