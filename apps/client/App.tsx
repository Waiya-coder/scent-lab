import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  climates,
  lifestyles,
  moods,
  personalities,
  type Fragrance,
  type FragranceCatalogResponse,
  type RecommendationResponse,
  type QuizSubmission
} from "@scent-lab/shared";
import { fetchFragrances, fetchRecommendation } from "./src/api";
import { getFragranceImageSource } from "./src/fragranceImages";

type Stage = "question" | "splash" | "details" | "survey" | "results";

type SurveyKey = Exclude<keyof QuizSubmission, "name">;

const surveySteps: Array<{
  key: SurveyKey;
  title: string;
  helper: string;
  options: string[];
  descriptions?: Record<string, string>;
}> = [
  {
    key: "lifestyle",
    title: "How do your days usually feel?",
    helper: "Choose the rhythm that sounds most like you.",
    options: [...lifestyles],
    descriptions: {
      creative: "Expressive, artistic, and inspired by atmosphere",
      outdoorsy: "Fresh air, movement, and grounded routines",
      urban: "Fast pace, dressed up plans, and city energy",
      wellness: "Calm rituals, clean structure, and balance",
      traveler: "Curious, adaptable, and always in motion"
    }
  },
  {
    key: "personality",
    title: "What energy should your scent leave behind?",
    helper: "Think about the impression you want to make.",
    options: [...personalities],
    descriptions: {
      bold: "Magnetic and hard to forget",
      romantic: "Softly expressive and dreamy",
      grounded: "Calm, steady, and quietly confident",
      curious: "Layered, playful, and open",
      luxurious: "Refined, plush, and elevated"
    }
  },
  {
    key: "climate",
    title: "What kind of air do you wear fragrance in most?",
    helper: "Climate changes how a scent opens and lasts.",
    options: [...climates],
    descriptions: {
      hot: "Bright heat and warmer days",
      temperate: "Balanced weather most of the year",
      cold: "Cool air and heavier layers",
      humid: "Moisture-rich conditions",
      dry: "Air that can make fragrance fade faster"
    }
  },
  {
    key: "mood",
    title: "What mood are you shopping for today?",
    helper: "Your mood can shape what feels right on skin.",
    options: [...moods]
  },
  {
    key: "intensity",
    title: "How strong do you want it to wear?",
    helper: "Projection should match the room you want to enter.",
    options: ["soft", "balanced", "statement"]
  },
  {
    key: "refillPreference",
    title: "Do you want us to prioritize refillable bottles?",
    helper: "Useful if you want a more sustainable long-term pick.",
    options: ["refillable", "all options"]
  }
];

const initialQuiz: QuizSubmission = {
  name: "",
  lifestyle: "creative",
  personality: "curious",
  climate: "temperate",
  mood: "playful",
  intensity: "balanced",
  refillPreference: true
};

export default function App() {
  const [stage, setStage] = useState<Stage>("question");
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [quiz, setQuiz] = useState<QuizSubmission>(initialQuiz);
  const [catalog, setCatalog] = useState<Fragrance[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCatalog();
  }, []);

  async function loadCatalog() {
    setLoadingCatalog(true);

    try {
      const response: FragranceCatalogResponse = await fetchFragrances();
      setCatalog(response.items);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to load fragrance catalog.";
      setError(message);
    } finally {
      setLoadingCatalog(false);
    }
  }

  async function handleRecommendation() {
    setLoadingRecommendation(true);
    setError(null);

    try {
      const result = await fetchRecommendation(quiz);
      setRecommendation(result);
      setStage("results");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to generate recommendations.";
      setError(message);
    } finally {
      setLoadingRecommendation(false);
    }
  }

  function updateQuiz<Key extends keyof QuizSubmission>(key: Key, value: QuizSubmission[Key]) {
    setQuiz((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSurveySelection(stepKey: SurveyKey, value: string) {
    if (stepKey === "refillPreference") {
      updateQuiz("refillPreference", value === "refillable");
    } else {
      updateQuiz(stepKey as Exclude<SurveyKey, "refillPreference">, value as never);
    }
  }

  function advanceSurvey() {
    if (surveyIndex === surveySteps.length - 1) {
      void handleRecommendation();
      return;
    }

    setSurveyIndex((current) => current + 1);
  }

  function retreatSurvey() {
    if (surveyIndex === 0) {
      setStage("details");
      return;
    }

    setSurveyIndex((current) => current - 1);
  }

  const currentStep = surveySteps[surveyIndex] ?? surveySteps[0];
  const heroBottle = useMemo(() => catalog[0] ?? null, [catalog]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#050505", "#0f0f0f", "#181411"]} style={styles.background}>
          {stage === "question" ? (
            <View style={styles.screen}>
              <View style={styles.questionContent}>
                <Text style={styles.brandMark}>SCENT LAB</Text>
                <Text style={styles.questionTitle}>What do you want to smell like?</Text>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => setStage("splash")}>
                <Text style={styles.primaryButtonText}>Begin</Text>
              </Pressable>
            </View>
          ) : null}

          {stage === "splash" ? (
            <View style={styles.splashScreen}>
              {heroBottle ? <Image source={getFragranceImageSource(heroBottle.id, heroBottle.imageUrl)} style={styles.splashBottle} resizeMode="contain" /> : null}

              <View style={styles.splashOverlay}>
                <Text style={styles.splashLine}>Well, if you musk?</Text>
                <Pressable style={styles.ghostButton} onPress={() => setStage("details")}>
                  <Text style={styles.ghostButtonText}>Continue</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {stage === "details" ? (
            <View style={styles.screen}>
              <View style={styles.detailsContent}>
                <Text style={styles.sectionKicker}>Tell us about yourself...</Text>
                <Text style={styles.detailsCopy}>
                  We&apos;ll ask a few quick questions, then point you to the bottles worth trying first.
                </Text>

                <View style={styles.nameField}>
                  <Text style={styles.fieldLabel}>Your name</Text>
                  <TextInput
                    value={quiz.name}
                    onChangeText={(value: string) => updateQuiz("name", value)}
                    placeholder="Avery"
                    placeholderTextColor="#9f978f"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.bottomActions}>
                <Pressable style={styles.secondaryButton} onPress={() => setStage("question")}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => {
                    setSurveyIndex(0);
                    setStage("survey");
                  }}
                >
                  <Text style={styles.primaryButtonText}>Start survey</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {stage === "survey" ? (
            <ScrollView contentContainerStyle={styles.surveyScreen} showsVerticalScrollIndicator={false}>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {surveyIndex + 1} / {surveySteps.length}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${((surveyIndex + 1) / surveySteps.length) * 100}%` }]} />
                </View>
              </View>

              <View style={styles.surveyHeader}>
                <Text style={styles.surveyTitle}>{currentStep.title}</Text>
                <Text style={styles.surveyHelper}>{currentStep.helper}</Text>
              </View>

              <View style={styles.optionStack}>
                {currentStep.options.map((option) => {
                  const selectedValue =
                    currentStep.key === "refillPreference"
                      ? quiz.refillPreference
                        ? "refillable"
                        : "all options"
                      : String(quiz[currentStep.key]);
                  const active = selectedValue === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleSurveySelection(currentStep.key, option)}
                      style={[styles.optionCard, active && styles.optionCardActive]}
                    >
                      <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{capitalize(option)}</Text>
                      {currentStep.descriptions?.[option] ? (
                        <Text style={[styles.optionDescription, active && styles.optionDescriptionActive]}>
                          {currentStep.descriptions[option]}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.bottomActions}>
                <Pressable style={styles.secondaryButton} onPress={retreatSurvey}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryButton, loadingRecommendation && surveyIndex === surveySteps.length - 1 && styles.buttonDisabled]}
                  onPress={advanceSurvey}
                  disabled={loadingRecommendation && surveyIndex === surveySteps.length - 1}
                >
                  {loadingRecommendation && surveyIndex === surveySteps.length - 1 ? (
                    <ActivityIndicator color="#050505" />
                  ) : (
                    <Text style={styles.primaryButtonTextDark}>
                      {surveyIndex === surveySteps.length - 1 ? "See matches" : "Next"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          ) : null}

          {stage === "results" ? (
            <ScrollView contentContainerStyle={styles.resultsScreen} showsVerticalScrollIndicator={false}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionKickerLight}>Recommended for you</Text>
                <Text style={styles.resultsTitle}>{recommendation?.profileLabel ?? "Your Matches"}</Text>
                <Text style={styles.resultsSummary}>{recommendation?.summary}</Text>
              </View>

              <View style={styles.resultsStack}>
                {recommendation?.recommendations.map(({ fragrance, whyItFits, score }, index) => (
                  <View key={fragrance.id} style={styles.resultCard}>
                    <Image source={getFragranceImageSource(fragrance.id, fragrance.imageUrl)} style={styles.resultImage} resizeMode="contain" />
                    <View style={styles.resultBody}>
                      <View style={styles.resultTopline}>
                        <Text style={styles.resultRank}>Try {index + 1}</Text>
                        <Text style={styles.resultScore}>{score} pts</Text>
                      </View>
                      <Text style={styles.resultBrand}>{fragrance.brand}</Text>
                      <Text style={styles.resultName}>{fragrance.name}</Text>
                      <Text style={styles.resultTagline}>{fragrance.tagline}</Text>
                      {whyItFits.slice(0, 2).map((reason) => (
                        <Text key={reason} style={styles.reasonText}>
                          • {reason}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.shelfPanel}>
                <Text style={styles.sectionKickerLight}>Available in store</Text>
                <Text style={styles.shelfTitle}>Browse the shelf</Text>
                <View style={styles.shelfGrid}>
                  {catalog.map((fragrance) => (
                    <View key={fragrance.id} style={styles.shelfCard}>
                      <Image source={getFragranceImageSource(fragrance.id, fragrance.imageUrl)} style={styles.shelfImage} resizeMode="contain" />
                      <Text style={styles.shelfBrand}>{fragrance.brand}</Text>
                      <Text style={styles.shelfName}>{fragrance.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.bottomActions}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setSurveyIndex(0);
                    setStage("survey");
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Retake survey</Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : null}

          {loadingCatalog && stage !== "results" && !heroBottle ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#f4ede2" />
            </View>
          ) : null}

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function capitalize(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050505"
  },
  background: {
    flex: 1
  },
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 28
  },
  questionContent: {
    flex: 1,
    justifyContent: "center",
    gap: 22
  },
  brandMark: {
    color: "#f4ede2",
    fontSize: 12,
    letterSpacing: 4,
    textTransform: "uppercase"
  },
  questionTitle: {
    color: "#f8f2e7",
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "300"
  },
  splashScreen: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 24
  },
  splashBottle: {
    width: "100%",
    height: "68%"
  },
  splashOverlay: {
    width: "100%",
    alignItems: "center",
    gap: 18
  },
  splashLine: {
    color: "#f8f2e7",
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "300",
    textAlign: "center"
  },
  detailsContent: {
    flex: 1,
    justifyContent: "center",
    gap: 18
  },
  sectionKicker: {
    color: "#f4ede2",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "300"
  },
  detailsCopy: {
    color: "#cfc4b6",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320
  },
  nameField: {
    gap: 8,
    marginTop: 8
  },
  fieldLabel: {
    color: "#d9d0c6",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  textInput: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(244, 237, 226, 0.22)",
    backgroundColor: "rgba(248, 242, 231, 0.08)",
    color: "#f8f2e7",
    paddingHorizontal: 16,
    fontSize: 17
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    backgroundColor: "#f2eadf"
  },
  primaryButtonText: {
    color: "#050505",
    fontSize: 15,
    fontWeight: "700"
  },
  primaryButtonTextDark: {
    color: "#050505",
    fontSize: 15,
    fontWeight: "700"
  },
  ghostButton: {
    minHeight: 50,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(248, 242, 231, 0.28)"
  },
  ghostButtonText: {
    color: "#f8f2e7",
    fontSize: 15,
    fontWeight: "600"
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(242, 234, 223, 0.28)"
  },
  secondaryButtonText: {
    color: "#f2eadf",
    fontSize: 15,
    fontWeight: "600"
  },
  bottomActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between"
  },
  surveyScreen: {
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 24
  },
  progressRow: {
    gap: 12
  },
  progressText: {
    color: "#b9b1a8",
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  progressTrack: {
    height: 2,
    backgroundColor: "rgba(244, 237, 226, 0.12)"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f2eadf"
  },
  surveyHeader: {
    gap: 10
  },
  surveyTitle: {
    color: "#f8f2e7",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "300"
  },
  surveyHelper: {
    color: "#bfb5a8",
    fontSize: 15,
    lineHeight: 22
  },
  optionStack: {
    gap: 12
  },
  optionCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(244, 237, 226, 0.12)",
    backgroundColor: "rgba(248, 242, 231, 0.03)"
  },
  optionCardActive: {
    backgroundColor: "#f2eadf",
    borderColor: "#f2eadf"
  },
  optionTitle: {
    color: "#f8f2e7",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "500"
  },
  optionTitleActive: {
    color: "#050505"
  },
  optionDescription: {
    color: "#bfb5a8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  optionDescriptionActive: {
    color: "#2c241d"
  },
  buttonDisabled: {
    opacity: 0.65
  },
  resultsScreen: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 30,
    gap: 20
  },
  resultsHeader: {
    gap: 10
  },
  sectionKickerLight: {
    color: "#b9b1a8",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  resultsTitle: {
    color: "#f8f2e7",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "300"
  },
  resultsSummary: {
    color: "#c7bdb0",
    fontSize: 15,
    lineHeight: 22
  },
  resultsStack: {
    gap: 16
  },
  resultCard: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "rgba(242, 234, 223, 0.12)"
  },
  resultImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#0b0b0b"
  },
  resultBody: {
    padding: 18,
    gap: 8
  },
  resultTopline: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  resultRank: {
    color: "#f2eadf",
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  resultScore: {
    color: "#b9b1a8",
    fontSize: 13
  },
  resultBrand: {
    color: "#d7cabc",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  resultName: {
    color: "#f8f2e7",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "400"
  },
  resultTagline: {
    color: "#bfb5a8",
    fontSize: 15,
    lineHeight: 22
  },
  reasonText: {
    color: "#f2eadf",
    fontSize: 14,
    lineHeight: 20
  },
  shelfPanel: {
    gap: 14,
    paddingTop: 6
  },
  shelfTitle: {
    color: "#f8f2e7",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "300"
  },
  shelfGrid: {
    gap: 12
  },
  shelfCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(248, 242, 231, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(242, 234, 223, 0.1)"
  },
  shelfImage: {
    width: 72,
    height: 96
  },
  shelfBrand: {
    color: "#b9b1a8",
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  shelfName: {
    color: "#f8f2e7",
    fontSize: 18,
    lineHeight: 22,
    marginTop: 4
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  errorBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(173, 64, 45, 0.28)",
    color: "#fff2ea"
  }
});
