import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  try {
    const response = await openai.chat.completions.create({
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

  try {
    const response = await openai.chat.completions.create({
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
