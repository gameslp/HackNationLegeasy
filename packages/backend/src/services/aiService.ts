import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface AnalysisResult {
  summary: string;
  changes: string[];
  effects: string[];
  simplifiedExplanation: string;
}

export async function analyzeStage(
  stageName: string,
  stageDescription: string | null,
  lawTextContent: string | null,
  previousLawTextContent: string | null
): Promise<AnalysisResult> {
  const hasChanges = previousLawTextContent && lawTextContent;

  const prompt = `Jesteś ekspertem prawnym analizującym polski proces legislacyjny.

Etap: ${stageName}
${stageDescription ? `Opis: ${stageDescription}` : ''}

${
  lawTextContent
    ? `Aktualna treść ustawy:
${lawTextContent}`
    : 'Brak treści ustawy.'
}

${
  hasChanges
    ? `Poprzednia wersja ustawy:
${previousLawTextContent}`
    : ''
}

Przeanalizuj ten etap procesu legislacyjnego i odpowiedz w formacie JSON:
{
  "summary": "Krótkie podsumowanie tego etapu (2-3 zdania)",
  "changes": ["Lista głównych zmian wprowadzonych w tym etapie"],
  "effects": ["Potencjalne efekty prawne i społeczne tych zmian"],
  "simplifiedExplanation": "Wyjaśnienie prostym językiem dla zwykłego obywatela"
}

Odpowiedz TYLKO w formacie JSON, bez dodatkowego tekstu.`;

console.log("Generated prompt for analyzeStage:", prompt);

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Jesteś polskim ekspertem prawnym. Odpowiadasz zawsze po polsku w formacie JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }

    return {
      summary: 'Nie udało się przeanalizować etapu.',
      changes: [],
      effects: [],
      simplifiedExplanation: 'Brak analizy.',
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      summary: 'Błąd podczas analizy AI.',
      changes: [],
      effects: [],
      simplifiedExplanation: 'Wystąpił błąd podczas generowania analizy.',
    };
  }
}

export interface DiffAnalysisResult {
  explanation: string;
  keyChanges: string[];
  impact: string;
}

export async function analyzeDiff(
  diffContent: string,
  sourceStage: string,
  targetStage: string
): Promise<DiffAnalysisResult> {
  const prompt = `Jesteś ekspertem prawnym analizującym zmiany w polskich ustawach.

Porównuję dwie wersje ustawy:
- Wersja źródłowa: ${sourceStage}
- Wersja docelowa: ${targetStage}

Oto różnice między wersjami (format diff - linie zaczynające się od "+" zostały dodane, linie zaczynające się od "-" zostały usunięte):

${diffContent.substring(0, 15000)}

Wyjaśnij te zmiany PROSTYM JĘZYKIEM, zrozumiałym dla zwykłego obywatela. Odpowiedz w formacie JSON:
{
  "explanation": "Proste wyjaśnienie co się zmieniło i dlaczego to jest ważne (3-5 zdań)",
  "keyChanges": ["Lista najważniejszych zmian w prostym języku"],
  "impact": "Jak te zmiany mogą wpłynąć na obywateli (2-3 zdania)"
}

Odpowiedz TYLKO w formacie JSON, bez dodatkowego tekstu.`;

console.log("Generated prompt for analyzeDiff:", prompt);

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Jesteś polskim ekspertem prawnym. Wyjaśniasz zmiany w ustawach prostym językiem zrozumiałym dla każdego. Odpowiadasz zawsze po polsku w formacie JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as DiffAnalysisResult;
    }

    return {
      explanation: 'Nie udało się przeanalizować zmian.',
      keyChanges: [],
      impact: 'Brak analizy.',
    };
  } catch (error) {
    console.error('AI diff analysis error:', error);
    return {
      explanation: 'Błąd podczas analizy AI.',
      keyChanges: [],
      impact: 'Wystąpił błąd podczas generowania analizy.',
    };
  }
}

export interface IdeaSummaryResult {
  summary: string;
  mainConcerns: string[];
  mainBenefits: string[];
  recommendations: string[];
}

export async function summarizeIdeaOpinions(
  ideaTitle: string,
  ideaDescription: string,
  surveyStats: {
    total: number;
    supportFor: number;
    supportAgainst: number;
    avgImportance: number;
  },
  opinions: Array<{
    respondentType: string;
    answers: Array<{ question: string; answer: string }>;
  }>
): Promise<IdeaSummaryResult> {
  const opinionsText = opinions
    .map((op, i) => {
      const answersText = op.answers
        .map((a) => `  P: ${a.question}\n  O: ${a.answer}`)
        .join('\n');
      return `Opinia ${i + 1} (${op.respondentType}):\n${answersText}`;
    })
    .join('\n\n');

  const prompt = `Jesteś ekspertem analizującym wyniki prekonsultacji społecznych w polskim procesie legislacyjnym.

POMYSŁ: ${ideaTitle}
OPIS: ${ideaDescription}

WYNIKI ANKIETY:
- Łączna liczba głosów: ${surveyStats.total}
- Popiera kierunek zmian: ${surveyStats.supportFor}%
- Ma zastrzeżenia: ${surveyStats.supportAgainst}%
- Średnia ważność tematu: ${surveyStats.avgImportance}/5

ZEBRANE OPINIE (${opinions.length}):
${opinionsText.substring(0, 10000)}

Na podstawie powyższych danych przygotuj podsumowanie dla urzędników. Odpowiedz w formacie JSON:
{
  "summary": "Ogólne podsumowanie wyników prekonsultacji (3-5 zdań)",
  "mainConcerns": ["Lista najczęściej powtarzających się obaw i zastrzeżeń"],
  "mainBenefits": ["Lista najczęściej wskazywanych korzyści"],
  "recommendations": ["Rekomendacje dla dalszych prac legislacyjnych"]
}

Odpowiedz TYLKO w formacie JSON, bez dodatkowego tekstu.`;

  console.log("Generated prompt for summarizeIdeaOpinions:", prompt.substring(0, 500) + "...");

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Jesteś polskim ekspertem od konsultacji społecznych. Podsumowujesz opinie obywateli w sposób rzeczowy i konstruktywny. Odpowiadasz zawsze po polsku w formacie JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as IdeaSummaryResult;
    }

    return {
      summary: 'Nie udało się wygenerować podsumowania.',
      mainConcerns: [],
      mainBenefits: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('AI idea summary error:', error);
    return {
      summary: 'Błąd podczas generowania podsumowania AI.',
      mainConcerns: [],
      mainBenefits: [],
      recommendations: [],
    };
  }
}

// ==========================================
// IMPACT RADAR - Analiza wpływu ustawy
// ==========================================

export interface ImpactCategoryDetails {
  description: string;
  benefits: string[];
  costs: string[];
  affectedGroups: string[];
}

export interface ImpactAnalysisResult {
  // Oceny 1-5
  economicScore: number;
  socialScore: number;
  administrativeScore: number;
  technologicalScore: number;
  environmentalScore: number;
  overallScore: number;

  // Ogólne info
  mainAffectedGroup: string;
  uncertaintyLevel: string; // niska/średnia/wysoka
  simpleSummary: string[];

  // Szczegóły per kategoria
  economicDetails: ImpactCategoryDetails;
  socialDetails: ImpactCategoryDetails;
  administrativeDetails: ImpactCategoryDetails;
  technologicalDetails: ImpactCategoryDetails;
  environmentalDetails: ImpactCategoryDetails;
}

export async function generateImpactAnalysis(
  lawName: string,
  stageName: string,
  lawTextContent: string | null,
  stageDescription: string | null
): Promise<ImpactAnalysisResult> {
  const prompt = `Jesteś ekspertem analizującym wpływ polskich ustaw na społeczeństwo, gospodarkę i administrację.

USTAWA: ${lawName}
ETAP: ${stageName}
${stageDescription ? `OPIS ETAPU: ${stageDescription}` : ''}

TREŚĆ USTAWY:
${lawTextContent ? lawTextContent.substring(0, 12000) : 'Brak treści ustawy.'}

Przygotuj kompleksową analizę wpływu tej ustawy (Impact Radar). Oceń wpływ w skali 1-5 (1=minimalny, 5=bardzo duży) w każdej kategorii.

Odpowiedz w formacie JSON:
{
  "economicScore": <1-5>,
  "socialScore": <1-5>,
  "administrativeScore": <1-5>,
  "technologicalScore": <1-5>,
  "environmentalScore": <1-5>,
  "overallScore": <1-5>,
  "mainAffectedGroup": "Główna grupa dotknięta zmianą np. 'małe i średnie firmy z sektora IT'",
  "uncertaintyLevel": "niska|średnia|wysoka",
  "simpleSummary": [
    "Prosty opis zmiany 1 dla obywatela",
    "Prosty opis zmiany 2 dla obywatela",
    "Prosty opis zmiany 3 dla obywatela"
  ],
  "economicDetails": {
    "description": "Opis wpływu ekonomicznego",
    "benefits": ["Korzyść 1", "Korzyść 2"],
    "costs": ["Koszt/ryzyko 1", "Koszt/ryzyko 2"],
    "affectedGroups": ["Grupa 1", "Grupa 2"]
  },
  "socialDetails": {
    "description": "Opis wpływu społecznego",
    "benefits": [],
    "costs": [],
    "affectedGroups": []
  },
  "administrativeDetails": {
    "description": "Opis wpływu administracyjnego",
    "benefits": [],
    "costs": [],
    "affectedGroups": []
  },
  "technologicalDetails": {
    "description": "Opis wpływu technologicznego/cyfrowego",
    "benefits": [],
    "costs": [],
    "affectedGroups": []
  },
  "environmentalDetails": {
    "description": "Opis wpływu środowiskowego",
    "benefits": [],
    "costs": [],
    "affectedGroups": []
  }
}

WAŻNE:
- Pisz prostym językiem zrozumiałym dla każdego obywatela
- W simpleSummary podaj 3-5 konkretnych zmian z perspektywy obywatela
- Jeśli dana kategoria ma minimalny wpływ (1), opisz to krótko
- Odpowiedz TYLKO w formacie JSON`;

  console.log("Generated prompt for generateImpactAnalysis:", prompt.substring(0, 500) + "...");

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Jesteś polskim ekspertem od analizy skutków regulacji (OSR). Przygotowujesz analizy wpływu ustaw w sposób zrozumiały dla obywateli. Odpowiadasz zawsze po polsku w formacie JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]) as ImpactAnalysisResult;
      // Walidacja i normalizacja wyników
      return {
        economicScore: Math.min(5, Math.max(1, result.economicScore || 1)),
        socialScore: Math.min(5, Math.max(1, result.socialScore || 1)),
        administrativeScore: Math.min(5, Math.max(1, result.administrativeScore || 1)),
        technologicalScore: Math.min(5, Math.max(1, result.technologicalScore || 1)),
        environmentalScore: Math.min(5, Math.max(1, result.environmentalScore || 1)),
        overallScore: Math.min(5, Math.max(1, result.overallScore || 1)),
        mainAffectedGroup: result.mainAffectedGroup || 'Brak danych',
        uncertaintyLevel: result.uncertaintyLevel || 'średnia',
        simpleSummary: result.simpleSummary || [],
        economicDetails: result.economicDetails || { description: '', benefits: [], costs: [], affectedGroups: [] },
        socialDetails: result.socialDetails || { description: '', benefits: [], costs: [], affectedGroups: [] },
        administrativeDetails: result.administrativeDetails || { description: '', benefits: [], costs: [], affectedGroups: [] },
        technologicalDetails: result.technologicalDetails || { description: '', benefits: [], costs: [], affectedGroups: [] },
        environmentalDetails: result.environmentalDetails || { description: '', benefits: [], costs: [], affectedGroups: [] },
      };
    }

    return getDefaultImpactAnalysis();
  } catch (error) {
    console.error('AI impact analysis error:', error);
    return getDefaultImpactAnalysis();
  }
}

function getDefaultImpactAnalysis(): ImpactAnalysisResult {
  const defaultDetails: ImpactCategoryDetails = {
    description: 'Brak analizy.',
    benefits: [],
    costs: [],
    affectedGroups: [],
  };
  return {
    economicScore: 1,
    socialScore: 1,
    administrativeScore: 1,
    technologicalScore: 1,
    environmentalScore: 1,
    overallScore: 1,
    mainAffectedGroup: 'Brak danych',
    uncertaintyLevel: 'wysoka',
    simpleSummary: ['Nie udało się wygenerować analizy wpływu.'],
    economicDetails: defaultDetails,
    socialDetails: defaultDetails,
    administrativeDetails: defaultDetails,
    technologicalDetails: defaultDetails,
    environmentalDetails: defaultDetails,
  };
}

export async function analyzeFile(
  fileName: string,
  fileContent: string
): Promise<AnalysisResult> {
  const prompt = `Jesteś ekspertem prawnym analizującym polski proces legislacyjny.

Plik: ${fileName}

Treść:
${fileContent.substring(0, 10000)}

Przeanalizuj ten dokument i odpowiedz w formacie JSON:
{
  "summary": "Krótkie podsumowanie dokumentu (2-3 zdania)",
  "changes": ["Główne punkty dokumentu"],
  "effects": ["Potencjalne efekty prawne"],
  "simplifiedExplanation": "Wyjaśnienie prostym językiem dla zwykłego obywatela"
}

Odpowiedz TYLKO w formacie JSON, bez dodatkowego tekstu.`;

console.log("Generated prompt for analyzeFile:", prompt);

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Jesteś polskim ekspertem prawnym. Odpowiadasz zawsze po polsku w formacie JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }

    return {
      summary: 'Nie udało się przeanalizować pliku.',
      changes: [],
      effects: [],
      simplifiedExplanation: 'Brak analizy.',
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      summary: 'Błąd podczas analizy AI.',
      changes: [],
      effects: [],
      simplifiedExplanation: 'Wystąpił błąd podczas generowania analizy.',
    };
  }
}
