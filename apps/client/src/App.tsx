import { useEffect, useState, type FormEvent } from "react";
import {
  climates,
  lifestyles,
  moods,
  personalities,
  type AccordLevels,
  type Climate,
  type Mood,
  type RecommendationResponse,
  type QuizSubmission
} from "@scent-lab/shared";
import { fetchMixSimulation, fetchRecommendation } from "./api";

const quizSteps = [
  {
    key: "lifestyle",
    label: "Lifestyle",
    helper: "How does your week usually feel?"
  },
  {
    key: "personality",
    label: "Personality",
    helper: "What energy should your scent project?"
  },
  {
    key: "climate",
    label: "Climate",
    helper: "What conditions should the fragrance perform in?"
  }
] as const;

const optionCopy = {
  lifestyle: {
    creative: "Studio days, galleries, expressive routines",
    outdoorsy: "Fresh air, movement, textured landscapes",
    urban: "Fast pace, dinners out, polished essentials",
    wellness: "Calm rituals, clean spaces, soft structure",
    traveler: "Adaptable, curious, always in motion"
  },
  personality: {
    bold: "Magnetic, memorable, confident",
    romantic: "Tender, dreamy, softly expressive",
    grounded: "Calm, composed, quietly strong",
    curious: "Playful, exploratory, layered",
    luxurious: "Refined, plush, statement-making"
  },
  climate: {
    hot: "Heat-heavy days and warm evenings",
    temperate: "Balanced conditions year-round",
    cold: "Cool air and layered wardrobes",
    humid: "Moisture-rich weather that changes projection",
    dry: "Arid air that can flatten a scent"
  }
} as const;

const sustainabilityPillars = [
  "Refillable bottles and travel vials reduce packaging waste.",
  "Mood-based layering encourages fewer, more versatile purchases.",
  "Climate-aware matching lowers failed blind buys."
];

const initialQuiz: QuizSubmission = {
  name: "",
  lifestyle: "creative",
  personality: "curious",
  climate: "temperate",
  mood: "grounded",
  intensity: "balanced",
  refillPreference: true
};

const initialAccords: AccordLevels = {
  citrus: 55,
  floral: 40,
  woods: 50,
  musk: 30,
  spice: 20,
  green: 45
};

export function App() {
  const [quiz, setQuiz] = useState<QuizSubmission>(initialQuiz);
  const [stepIndex, setStepIndex] = useState(0);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [mixAccords, setMixAccords] = useState<AccordLevels>(initialAccords);
  const [mixPreview, setMixPreview] = useState<Awaited<ReturnType<typeof fetchMixSimulation>> | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [loadingMix, setLoadingMix] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void runMixSimulation(quiz.mood, quiz.climate, mixAccords);
  }, []);

  async function runRecommendation(nextQuiz: QuizSubmission) {
    setLoadingRecommendation(true);
    setError(null);

    try {
      const result = await fetchRecommendation(nextQuiz);
      setRecommendation(result);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to generate recommendations.";
      setError(message);
    } finally {
      setLoadingRecommendation(false);
    }
  }

  async function runMixSimulation(nextMood: Mood, nextClimate: Climate, accords: AccordLevels) {
    setLoadingMix(true);

    try {
      const result = await fetchMixSimulation({
        mood: nextMood,
        climate: nextClimate,
        accords
      });
      setMixPreview(result);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to simulate blend.";
      setError(message);
    } finally {
      setLoadingMix(false);
    }
  }

  function updateQuiz<Key extends keyof QuizSubmission>(key: Key, value: QuizSubmission[Key]) {
    const nextQuiz = {
      ...quiz,
      [key]: value
    };
    setQuiz(nextQuiz);

    if (key === "mood" || key === "climate") {
      void runMixSimulation(
        key === "mood" ? (value as Mood) : nextQuiz.mood,
        key === "climate" ? (value as Climate) : nextQuiz.climate,
        mixAccords
      );
    }

    if (recommendation && (key === "mood" || key === "climate" || key === "intensity" || key === "refillPreference")) {
      void runRecommendation(nextQuiz);
    }
  }

  function updateAccord(key: keyof AccordLevels, value: number) {
    const nextAccords = {
      ...mixAccords,
      [key]: value
    };

    setMixAccords(nextAccords);
    void runMixSimulation(quiz.mood, quiz.climate, nextAccords);
  }

  async function handleQuizSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runRecommendation(quiz);
  }

  const currentStep = quizSteps[stepIndex] ?? quizSteps[0];
  const stepKey = currentStep.key;

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Scent Lab</p>
          <h1>Find a fragrance that fits your rhythm, weather, and mood.</h1>
          <p className="hero-text">
            This starter experience profiles each user, recommends refillable scent directions, and lets them
            experiment with a live mixing simulator before they commit.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#quiz">
              Start the scent quiz
            </a>
            <a className="secondary-link" href="#simulator">
              Explore the simulator
            </a>
          </div>
        </div>
        <div className="hero-card">
          <span className="badge">Climate-aware</span>
          <span className="badge">Mood-responsive</span>
          <span className="badge">Refill-first</span>
          <div className="orb-grid">
            <div className="orb orb-citrus" />
            <div className="orb orb-spice" />
            <div className="orb orb-green" />
            <div className="orb orb-floral" />
          </div>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel quiz-panel" id="quiz">
          <div className="section-heading">
            <p className="eyebrow">1. Scent Quiz</p>
            <h2>Profile the user before recommending anything.</h2>
          </div>

          <form onSubmit={handleQuizSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input
                  value={quiz.name}
                  onChange={(event) => updateQuiz("name", event.target.value)}
                  placeholder="Avery"
                />
              </label>

              <label className="field">
                <span>Preferred intensity</span>
                <select
                  value={quiz.intensity}
                  onChange={(event) => updateQuiz("intensity", event.target.value as QuizSubmission["intensity"])}
                >
                  <option value="soft">Soft</option>
                  <option value="balanced">Balanced</option>
                  <option value="statement">Statement</option>
                </select>
              </label>
            </div>

            <div className="stepper">
              {quizSteps.map((step, index) => (
                <button
                  key={step.key}
                  className={index === stepIndex ? "step-chip is-active" : "step-chip"}
                  type="button"
                  onClick={() => setStepIndex(index)}
                >
                  {step.label}
                </button>
              ))}
            </div>

            <div className="step-card">
              <div>
                <p className="eyebrow">{currentStep.label}</p>
                <h3>{currentStep.helper}</h3>
              </div>

              <div className="option-grid">
                {stepKey === "lifestyle" &&
                  lifestyles.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={quiz.lifestyle === option ? "option-card is-selected" : "option-card"}
                      onClick={() => updateQuiz("lifestyle", option)}
                    >
                      <strong>{option}</strong>
                      <span>{optionCopy.lifestyle[option]}</span>
                    </button>
                  ))}

                {stepKey === "personality" &&
                  personalities.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={quiz.personality === option ? "option-card is-selected" : "option-card"}
                      onClick={() => updateQuiz("personality", option)}
                    >
                      <strong>{option}</strong>
                      <span>{optionCopy.personality[option]}</span>
                    </button>
                  ))}

                {stepKey === "climate" &&
                  climates.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={quiz.climate === option ? "option-card is-selected" : "option-card"}
                      onClick={() => updateQuiz("climate", option)}
                    >
                      <strong>{option}</strong>
                      <span>{optionCopy.climate[option]}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="field-grid compact">
              <label className="field">
                <span>Current mood</span>
                <select value={quiz.mood} onChange={(event) => updateQuiz("mood", event.target.value as Mood)}>
                  {moods.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="toggle-field">
                <input
                  checked={quiz.refillPreference}
                  type="checkbox"
                  onChange={(event) => updateQuiz("refillPreference", event.target.checked)}
                />
                <span>Prioritize refillable options</span>
              </label>
            </div>

            <button className="primary-button" type="submit" disabled={loadingRecommendation}>
              {loadingRecommendation ? "Matching scent profile..." : "Generate recommendations"}
            </button>
          </form>

          {error ? <p className="error-banner">{error}</p> : null}
        </section>

        <section className="panel recommendation-panel">
          <div className="section-heading">
            <p className="eyebrow">2. Results</p>
            <h2>Recommendations stay responsive to mood and climate changes.</h2>
          </div>

          {recommendation ? (
            <>
              <div className="profile-summary">
                <p className="eyebrow">{recommendation.profileLabel}</p>
                <p>{recommendation.summary}</p>
              </div>

              <div className="recommendation-list">
                {recommendation.recommendations.map(({ fragrance, whyItFits, score }) => (
                  <article className="recommendation-card" key={fragrance.id}>
                    <div className="card-topline">
                      <span className="family-pill">{fragrance.family}</span>
                      <span className="score-pill">{score} pts</span>
                    </div>
                    <h3>{fragrance.name}</h3>
                    <p>{fragrance.tagline}</p>
                    <p className="notes-line">Notes: {fragrance.notes.join(", ")}</p>
                    <ul className="fit-list">
                      {whyItFits.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                    <div className="meta-row">
                      <span>{fragrance.sillage} projection</span>
                      <span>{fragrance.longevity}h longevity</span>
                      <span>{fragrance.sustainabilityScore}/100 sustainability</span>
                    </div>
                    {fragrance.refillable ? <p className="refill-pill">Refillable format available</p> : null}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>No scent profile yet</h3>
              <p>Complete the quiz to see top fragrance matches and why each one earned its score.</p>
            </div>
          )}
        </section>

        <section className="panel simulator-panel" id="simulator">
          <div className="section-heading">
            <p className="eyebrow">3. Mixing Simulator</p>
            <h2>Let users shape the fragrance direction before they buy.</h2>
          </div>

          <div className="slider-grid">
            {Object.entries(mixAccords).map(([key, value]) => (
              <label className="slider-field" key={key}>
                <span>{key}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(event) => updateAccord(key as keyof AccordLevels, Number(event.target.value))}
                />
                <strong>{value}</strong>
              </label>
            ))}
          </div>

          <div className="mix-output">
            {loadingMix ? (
              <p>Simulating your blend...</p>
            ) : mixPreview ? (
              <>
                <p className="eyebrow">{mixPreview.blendName}</p>
                <h3>{mixPreview.description}</h3>
                <p>Highlighted notes: {mixPreview.highlightedNotes.join(", ")}</p>
                <div className="meta-row">
                  <span>{mixPreview.intensity} intensity</span>
                  <span>{quiz.mood} mood</span>
                  <span>{quiz.climate} climate</span>
                </div>
                <p className="sustainability-note">{mixPreview.sustainabilityHint}</p>
              </>
            ) : (
              <p>Blend guidance will appear here.</p>
            )}
          </div>
        </section>

        <section className="panel sustainability-panel">
          <div className="section-heading">
            <p className="eyebrow">4. Sustainable Model</p>
            <h2>Refills and better matching reduce waste across the whole experience.</h2>
          </div>

          <div className="pillar-grid">
            {sustainabilityPillars.map((item) => (
              <article className="pillar-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
