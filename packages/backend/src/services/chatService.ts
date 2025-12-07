import OpenAI from 'openai';
import { prisma } from '@repo/database';
import type { PhaseType, IdeaArea, IdeaStatus } from '@repo/database';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// ==========================================
// TOOL DEFINITIONS
// ==========================================

const tools: ChatCompletionTool[] = [
  // === USTAWY (Laws) ===
  {
    type: 'function',
    function: {
      name: 'searchLaws',
      description: 'Wyszukaj ustawy po nazwie, autorze lub opisie. Użyj gdy użytkownik pyta o konkretne ustawy lub chce zobaczyć listę ustaw.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Tekst do wyszukania w nazwie, autorze lub opisie ustawy',
          },
          phaseType: {
            type: 'string',
            enum: ['PRECONSULTATION', 'RCL', 'SEJM', 'SENAT', 'PRESIDENT', 'JOURNAL'],
            description: 'Filtruj po aktualnej fazie procesu legislacyjnego',
          },
          limit: {
            type: 'number',
            description: 'Maksymalna liczba wyników (domyślnie 10)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLawById',
      description: 'Pobierz szczegóły konkretnej ustawy wraz z jej fazami. Użyj gdy znasz ID ustawy.',
      parameters: {
        type: 'object',
        properties: {
          lawId: {
            type: 'string',
            description: 'ID ustawy',
          },
        },
        required: ['lawId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLawStages',
      description: 'Pobierz wszystkie etapy ustawy w kolejności chronologicznej. Użyj gdy użytkownik pyta o przebieg procesu legislacyjnego konkretnej ustawy.',
      parameters: {
        type: 'object',
        properties: {
          lawId: {
            type: 'string',
            description: 'ID ustawy',
          },
        },
        required: ['lawId'],
      },
    },
  },

  // === FAZY (Phases) ===
  {
    type: 'function',
    function: {
      name: 'getPhaseDetails',
      description: 'Pobierz szczegóły fazy wraz z jej etapami. Użyj gdy użytkownik pyta o konkretną fazę procesu.',
      parameters: {
        type: 'object',
        properties: {
          phaseId: {
            type: 'string',
            description: 'ID fazy',
          },
        },
        required: ['phaseId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'explainPhase',
      description: 'Wyjaśnij co dzieje się w danej fazie procesu legislacyjnego. Użyj gdy użytkownik pyta o znaczenie fazy (np. "co to jest RCL?", "co robi Senat?").',
      parameters: {
        type: 'object',
        properties: {
          phaseType: {
            type: 'string',
            enum: ['PRECONSULTATION', 'RCL', 'SEJM', 'SENAT', 'PRESIDENT', 'JOURNAL'],
            description: 'Typ fazy do wyjaśnienia',
          },
        },
        required: ['phaseType'],
      },
    },
  },

  // === ETAPY (Stages) ===
  {
    type: 'function',
    function: {
      name: 'getStageDetails',
      description: 'Pobierz szczegóły etapu wraz z plikami i dyskusjami. Użyj gdy użytkownik pyta o konkretny etap procesu.',
      parameters: {
        type: 'object',
        properties: {
          stageId: {
            type: 'string',
            description: 'ID etapu',
          },
        },
        required: ['stageId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getStageText',
      description: 'Pobierz tekst ustawy z danego etapu. Użyj gdy użytkownik chce zobaczyć treść ustawy.',
      parameters: {
        type: 'object',
        properties: {
          stageId: {
            type: 'string',
            description: 'ID etapu',
          },
        },
        required: ['stageId'],
      },
    },
  },

  // === POMYSŁY (Ideas) - Etap 0 ===
  {
    type: 'function',
    function: {
      name: 'searchIdeas',
      description: 'Wyszukaj pomysły na ustawy (prekonsultacje). Użyj gdy użytkownik pyta o pomysły, prekonsultacje lub wczesne etapy tworzenia prawa.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Tekst do wyszukania',
          },
          area: {
            type: 'string',
            enum: ['DIGITALIZATION', 'HEALTH', 'EDUCATION', 'TRANSPORT', 'ENVIRONMENT', 'TAXES', 'SECURITY', 'SOCIAL', 'ECONOMY', 'OTHER'],
            description: 'Obszar tematyczny',
          },
          status: {
            type: 'string',
            enum: ['NEW', 'COLLECTING', 'SUMMARIZING', 'CLOSED', 'ARCHIVED', 'CONVERTED'],
            description: 'Status pomysłu',
          },
          limit: {
            type: 'number',
            description: 'Maksymalna liczba wyników',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIdeaDetails',
      description: 'Pobierz szczegóły pomysłu wraz z pytaniami i statystykami. Użyj gdy użytkownik pyta o konkretny pomysł.',
      parameters: {
        type: 'object',
        properties: {
          ideaId: {
            type: 'string',
            description: 'ID pomysłu',
          },
        },
        required: ['ideaId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIdeaStats',
      description: 'Pobierz statystyki poparcia i opinii dla pomysłu. Użyj gdy użytkownik pyta o poparcie lub opinie.',
      parameters: {
        type: 'object',
        properties: {
          ideaId: {
            type: 'string',
            description: 'ID pomysłu',
          },
        },
        required: ['ideaId'],
      },
    },
  },

  // === STATYSTYKI ===
  {
    type: 'function',
    function: {
      name: 'getStats',
      description: 'Pobierz ogólne statystyki systemu (ile ustaw, faz, etapów). Użyj gdy użytkownik pyta o statystyki lub ogólny przegląd.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLawsByPhase',
      description: 'Pobierz podział ustaw według faz. Użyj gdy użytkownik pyta ile ustaw jest w jakiej fazie.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },

  // === EDUKACJA ===
  {
    type: 'function',
    function: {
      name: 'explainProcess',
      description: 'Wyjaśnij proces legislacyjny w Polsce. Użyj gdy użytkownik pyta o to jak działa tworzenie prawa, co to jest proces legislacyjny, lub jak ustawy przechodzą przez system.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Konkretny temat do wyjaśnienia (opcjonalnie)',
          },
        },
      },
    },
  },

  // === NAWIGACJA ===
  {
    type: 'function',
    function: {
      name: 'navigateTo',
      description: 'Zaproponuj użytkownikowi przejście do konkretnej strony w aplikacji. Użyj gdy użytkownik pyta o plik ustawy, chce zobaczyć szczegóły etapu, ustawy, pomysłu lub fazy. ZAWSZE używaj tego narzędzia zamiast pokazywać tekst pliku - zaproponuj przejście na stronę gdzie użytkownik zobaczy pełne informacje. Wywołanie tego narzędzia wyświetli użytkownikowi przycisk do potwierdzenia nawigacji.',
      parameters: {
        type: 'object',
        properties: {
          targetType: {
            type: 'string',
            enum: ['law', 'phase', 'stage', 'idea'],
            description: 'Typ strony docelowej',
          },
          targetId: {
            type: 'string',
            description: 'ID zasobu (lawId, phaseId, stageId lub ideaId)',
          },
          lawId: {
            type: 'string',
            description: 'ID ustawy (wymagane dla phase i stage)',
          },
          phaseId: {
            type: 'string',
            description: 'ID fazy (wymagane dla stage)',
          },
          title: {
            type: 'string',
            description: 'Nazwa/tytuł strony do wyświetlenia użytkownikowi',
          },
          description: {
            type: 'string',
            description: 'Krótki opis co użytkownik tam znajdzie',
          },
        },
        required: ['targetType', 'targetId', 'title'],
      },
    },
  },
];

// ==========================================
// TOOL IMPLEMENTATIONS
// ==========================================

async function executeToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'searchLaws': {
        const { query, phaseType, limit = 10 } = args as { query?: string; phaseType?: PhaseType; limit?: number };
        const where: Record<string, unknown> = {};

        if (query) {
          where.OR = [
            { name: { contains: query } },
            { author: { contains: query } },
            { description: { contains: query } },
          ];
        }

        if (phaseType) {
          where.phases = { some: { type: phaseType } };
        }

        const laws = await prisma.law.findMany({
          where,
          take: Math.min(limit, 20),
          orderBy: { startDate: 'desc' },
          include: {
            phases: {
              orderBy: { order: 'desc' },
              take: 1,
            },
          },
        });

        const result = laws.map(law => ({
          id: law.id,
          name: law.name,
          author: law.author,
          description: law.description.substring(0, 200),
          startDate: law.startDate,
          currentPhase: law.phases[0]?.type || null,
        }));

        return JSON.stringify({ laws: result, count: result.length });
      }

      case 'getLawById': {
        const { lawId } = args as { lawId: string };
        const law = await prisma.law.findUnique({
          where: { id: lawId },
          include: {
            phases: {
              orderBy: { order: 'asc' },
              include: {
                _count: { select: { stages: true } },
              },
            },
          },
        });

        if (!law) return JSON.stringify({ error: 'Ustawa nie znaleziona' });

        return JSON.stringify({
          id: law.id,
          name: law.name,
          author: law.author,
          description: law.description,
          startDate: law.startDate,
          publishDate: law.publishDate,
          phases: law.phases.map(p => ({
            id: p.id,
            type: p.type,
            startDate: p.startDate,
            endDate: p.endDate,
            stagesCount: p._count.stages,
          })),
        });
      }

      case 'getLawStages': {
        const { lawId } = args as { lawId: string };
        const law = await prisma.law.findUnique({
          where: { id: lawId },
          include: {
            phases: {
              orderBy: { order: 'asc' },
              include: {
                stages: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        });

        if (!law) return JSON.stringify({ error: 'Ustawa nie znaleziona' });

        const stages = law.phases.flatMap(phase =>
          phase.stages.map(stage => ({
            id: stage.id,
            name: stage.name,
            date: stage.date,
            phaseType: phase.type,
            phaseId: phase.id,
            phaseOrder: phase.order,
            stageOrder: stage.order,
            hasText: !!stage.lawTextContent,
          }))
        );

        // Sort by phase order first, then by stage order within phase (same as controller)
        stages.sort((a, b) => {
          if (a.phaseOrder !== b.phaseOrder) {
            return a.phaseOrder - b.phaseOrder;
          }
          return (a.stageOrder || 0) - (b.stageOrder || 0);
        });

        console.log('getLawStages result:', stages);

        return JSON.stringify({ lawName: law.name, stages });
      }

      case 'getPhaseDetails': {
        const { phaseId } = args as { phaseId: string };
        const phase = await prisma.phase.findUnique({
          where: { id: phaseId },
          include: {
            law: { select: { id: true, name: true } },
            stages: {
              orderBy: { order: 'asc' },
              select: { id: true, name: true, date: true, author: true },
            },
          },
        });

        if (!phase) return JSON.stringify({ error: 'Faza nie znaleziona' });

        return JSON.stringify({
          id: phase.id,
          type: phase.type,
          startDate: phase.startDate,
          endDate: phase.endDate,
          law: phase.law,
          stages: phase.stages,
        });
      }

      case 'explainPhase': {
        const { phaseType } = args as { phaseType: PhaseType };
        const explanations: Record<PhaseType, string> = {
          PRECONSULTATION: 'Prekonsultacje to wczesny etap, gdzie ministerstwa zbierają opinie obywateli na temat pomysłów na nowe przepisy. Każdy może wyrazić swoją opinię zanim powstanie oficjalny projekt ustawy.',
          RCL: 'RCL (Rządowe Centrum Legislacji) to etap, gdzie projekt ustawy jest oficjalnie opracowywany. Tutaj prawnicy rządowi sprawdzają czy projekt jest zgodny z innymi przepisami i Konstytucją.',
          SEJM: 'W Sejmie posłowie debatują nad projektem ustawy. Odbywa się kilka czytań, prace w komisjach i głosowania. Sejm może wprowadzać poprawki do projektu.',
          SENAT: 'Senat to druga izba parlamentu. Senatorowie mogą zaproponować poprawki do ustawy przyjętej przez Sejm lub ją odrzucić. Mają na to 30 dni.',
          PRESIDENT: 'Prezydent może podpisać ustawę (wtedy wchodzi w życie), zawetować ją (wtedy wraca do Sejmu) lub skierować do Trybunału Konstytucyjnego.',
          JOURNAL: 'Dziennik Ustaw to oficjalna publikacja, gdzie ogłaszane są wszystkie przyjęte ustawy. Po publikacji ustawa wchodzi w życie.',
        };

        return JSON.stringify({
          phaseType,
          explanation: explanations[phaseType] || 'Nieznany typ fazy',
        });
      }

      case 'getStageDetails': {
        const { stageId } = args as { stageId: string };
        const stage = await prisma.stage.findUnique({
          where: { id: stageId },
          include: {
            phase: {
              include: { law: { select: { id: true, name: true } } },
            },
            files: { select: { id: true, fileName: true, fileType: true } },
            discussions: { select: { id: true, nickname: true, content: true, createdAt: true } },
          },
        });

        if (!stage) return JSON.stringify({ error: 'Etap nie znaleziony' });

        return JSON.stringify({
          id: stage.id,
          name: stage.name,
          date: stage.date,
          author: stage.author,
          description: stage.description,
          phaseType: stage.phase.type,
          law: stage.phase.law,
          hasText: !!stage.lawTextContent,
          files: stage.files,
          discussionsCount: stage.discussions.length,
          recentDiscussions: stage.discussions.slice(0, 5),
        });
      }

      case 'getStageText': {
        const { stageId } = args as { stageId: string };
        const stage = await prisma.stage.findUnique({
          where: { id: stageId },
          select: { id: true, name: true, lawTextContent: true },
        });

        if (!stage) return JSON.stringify({ error: 'Etap nie znaleziony' });
        if (!stage.lawTextContent) return JSON.stringify({ error: 'Ten etap nie ma tekstu ustawy' });

        // Limit text length for context
        const text = stage.lawTextContent.substring(0, 8000);
        return JSON.stringify({
          stageName: stage.name,
          textPreview: text,
          isTruncated: stage.lawTextContent.length > 8000,
        });
      }

      case 'searchIdeas': {
        const { query, area, status, limit = 10 } = args as {
          query?: string;
          area?: IdeaArea;
          status?: IdeaStatus;
          limit?: number
        };
        const where: Record<string, unknown> = {};

        if (query) {
          where.OR = [
            { title: { contains: query } },
            { shortDescription: { contains: query } },
          ];
        }
        if (area) where.area = area;
        if (status) where.status = status;

        const ideas = await prisma.idea.findMany({
          where,
          take: Math.min(limit, 20),
          orderBy: { publishDate: 'desc' },
          include: {
            _count: { select: { opinions: true, surveyResponses: true } },
          },
        });

        return JSON.stringify({
          ideas: ideas.map(idea => ({
            id: idea.id,
            title: idea.title,
            shortDescription: idea.shortDescription,
            area: idea.area,
            status: idea.status,
            ministry: idea.ministry,
            opinionsCount: idea._count.opinions,
            surveysCount: idea._count.surveyResponses,
          })),
          count: ideas.length,
        });
      }

      case 'getIdeaDetails': {
        const { ideaId } = args as { ideaId: string };
        const idea = await prisma.idea.findUnique({
          where: { id: ideaId },
          include: {
            questions: { orderBy: { order: 'asc' } },
            timeline: { orderBy: { order: 'asc' } },
            _count: { select: { opinions: true, surveyResponses: true } },
          },
        });

        if (!idea) return JSON.stringify({ error: 'Pomysł nie znaleziony' });

        return JSON.stringify({
          id: idea.id,
          title: idea.title,
          shortDescription: idea.shortDescription,
          problemDescription: idea.problemDescription,
          proposedSolutions: idea.proposedSolutions,
          area: idea.area,
          status: idea.status,
          ministry: idea.ministry,
          opinionDeadline: idea.opinionDeadline,
          questions: idea.questions.map(q => q.question),
          timeline: idea.timeline.map(t => ({ title: t.title, date: t.date })),
          opinionsCount: idea._count.opinions,
          surveysCount: idea._count.surveyResponses,
          aiSummary: idea.aiSummaryPublic ? idea.aiSummary : null,
        });
      }

      case 'getIdeaStats': {
        const { ideaId } = args as { ideaId: string };
        const [surveys, opinions] = await Promise.all([
          prisma.ideaSurveyResponse.findMany({
            where: { ideaId },
            select: { support: true, importance: true },
          }),
          prisma.ideaOpinion.groupBy({
            by: ['respondentType'],
            where: { ideaId },
            _count: true,
          }),
        ]);

        if (surveys.length === 0) {
          return JSON.stringify({ message: 'Brak danych z ankiet' });
        }

        const supportCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        let totalImportance = 0;

        surveys.forEach(s => {
          supportCounts[s.support as keyof typeof supportCounts]++;
          totalImportance += s.importance;
        });

        const total = surveys.length;

        return JSON.stringify({
          totalResponses: total,
          support: {
            przeciw: Math.round((supportCounts[1] / total) * 100),
            raczejPrzeciw: Math.round((supportCounts[2] / total) * 100),
            raczejZa: Math.round((supportCounts[3] / total) * 100),
            za: Math.round((supportCounts[4] / total) * 100),
          },
          avgImportance: (totalImportance / total).toFixed(1),
          opinionsByType: opinions.map(o => ({
            type: o.respondentType,
            count: o._count,
          })),
        });
      }

      case 'getStats': {
        const [lawsCount, phasesCount, stagesCount, ideasCount, discussionsCount] = await Promise.all([
          prisma.law.count(),
          prisma.phase.count(),
          prisma.stage.count(),
          prisma.idea.count(),
          prisma.discussion.count(),
        ]);

        return JSON.stringify({
          totalLaws: lawsCount,
          totalPhases: phasesCount,
          totalStages: stagesCount,
          totalIdeas: ideasCount,
          totalDiscussions: discussionsCount,
        });
      }

      case 'getLawsByPhase': {
        const phases = await prisma.phase.groupBy({
          by: ['type'],
          _count: true,
        });

        const phaseNames: Record<PhaseType, string> = {
          PRECONSULTATION: 'Prekonsultacje',
          RCL: 'RCL',
          SEJM: 'Sejm',
          SENAT: 'Senat',
          PRESIDENT: 'Prezydent',
          JOURNAL: 'Dziennik Ustaw',
        };

        return JSON.stringify({
          byPhase: phases.map(p => ({
            phase: phaseNames[p.type],
            count: p._count,
          })),
        });
      }

      case 'explainProcess': {
        const { topic } = args as { topic?: string };

        const generalExplanation = `
Polski proces legislacyjny składa się z kilku etapów:

1. **Prekonsultacje** - Ministerstwo zbiera opinie obywateli na temat pomysłu na nową ustawę
2. **RCL (Rządowe Centrum Legislacji)** - Prawnicy rządowi opracowują oficjalny projekt
3. **Sejm** - Posłowie debatują i głosują nad projektem (3 czytania)
4. **Senat** - Senatorowie mogą zaproponować poprawki (mają 30 dni)
5. **Prezydent** - Może podpisać, zawetować lub skierować do Trybunału
6. **Dziennik Ustaw** - Oficjalna publikacja, po której ustawa wchodzi w życie

Cały proces może trwać od kilku miesięcy do kilku lat, w zależności od złożoności ustawy i kontrowersji wokół niej.
        `;

        return JSON.stringify({
          topic: topic || 'ogólny',
          explanation: generalExplanation,
        });
      }

      case 'navigateTo': {
        const { targetType, targetId, lawId, phaseId, title, description } = args as {
          targetType: 'law' | 'phase' | 'stage' | 'idea';
          targetId: string;
          lawId?: string;
          phaseId?: string;
          title: string;
          description?: string;
        };

        let url = '';
        switch (targetType) {
          case 'law':
            url = `/laws/${targetId}`;
            break;
          case 'phase':
            url = `/laws/${lawId}/phases/${targetId}`;
            break;
          case 'stage':
            url = `/laws/${lawId}/phases/${phaseId}/stages/${targetId}`;
            break;
          case 'idea':
            url = `/ideas/${targetId}`;
            break;
        }

        // Return special format that frontend will parse
        return JSON.stringify({
          __navigation__: true,
          url,
          title,
          description: description || 'Kliknij aby przejść do strony',
          targetType,
        });
      }

      default:
        return JSON.stringify({ error: `Nieznane narzędzie: ${name}` });
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return JSON.stringify({ error: `Błąd podczas wykonywania ${name}` });
  }
}

// ==========================================
// MAIN CHAT FUNCTION
// ==========================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Jesteś pomocnym asystentem systemu śledzenia procesu legislacyjnego w Polsce. Twoim zadaniem jest pomagać obywatelom zrozumieć:

- Jak działa proces tworzenia prawa w Polsce
- Jakie ustawy są obecnie procedowane
- Na jakim etapie są konkretne ustawy
- Co oznaczają poszczególne fazy procesu legislacyjnego
- Jakie pomysły na nowe przepisy są w prekonsultacjach

Masz dostęp do narzędzi, które pozwalają Ci pobierać aktualne dane z systemu. Używaj ich, gdy użytkownik pyta o konkretne ustawy lub statystyki.

ZASADY:
1. Odpowiadaj zawsze po polsku
2. Używaj prostego języka zrozumiałego dla każdego obywatela
3. Gdy podajesz informacje o ustawach, zawsze podawaj ich nazwy i aktualne fazy
4. Bądź pomocny i cierpliwy
5. Jeśli nie znasz odpowiedzi, powiedz o tym szczerze
6. Gdy użytkownik pyta o konkretną ustawę, użyj narzędzi do wyszukania informacji
7. Formatuj odpowiedzi czytelnie, używaj list i pogrubień gdy to pomoże
8. WAŻNE: Gdy użytkownik pyta o plik ustawy, tekst ustawy lub chce zobaczyć szczegóły - ZAWSZE użyj narzędzia navigateTo podając id ustawy zamiast pokazywać tekst. Zaproponuj przejście na odpowiednią stronę gdzie znajdzie pełne informacje.
9. NIE pokazuj długich tekstów ustaw w chacie - zamiast tego użyj narzędzia navigateTo z dobrym Id ustawy jako target id aby zaproponować nawigację do strony etapu
10. Formatuj odpowiedzi w markdown, z tabulacją, punktami dla lepszej czytelności

Pamiętaj: Twoim celem jest edukacja obywateli i zwiększenie transparentności procesu legislacyjnego.`;

export async function processChat(
  messages: ChatMessage[],
  maxIterations: number = 5
): Promise<string> {
  const client = getOpenAIClient();

  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const assistantMessage = response.choices[0]?.message;

    if (!assistantMessage) {
      return 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania.';
    }

    // If no tool calls, return the response
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return assistantMessage.content || 'Przepraszam, nie udało mi się wygenerować odpowiedzi.';
    }

    // Add assistant message with tool calls
    openaiMessages.push(assistantMessage);

    // Execute all tool calls
    for (const toolCall of assistantMessage.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`Executing tool: ${toolCall.function.name}`, args);

      const result = await executeToolCall(toolCall.function.name, args);

      // Special handling for navigateTo - return immediately with navigation data
      if (toolCall.function.name === 'navigateTo') {
        // Include any partial message from assistant + the navigation JSON
        const assistantText = assistantMessage.content || '';
        return assistantText + (assistantText ? '\n\n' : '') + result;
      }

      openaiMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  return 'Przepraszam, przekroczono limit iteracji. Spróbuj zadać prostsze pytanie.';
}
