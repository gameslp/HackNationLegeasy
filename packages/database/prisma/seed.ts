import { PrismaClient, PhaseType, FileType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Przykładowa ustawa
  const law = await prisma.law.create({
    data: {
      name: 'Ustawa o ochronie danych osobowych obywateli',
      author: 'Rada Ministrów',
      description:
        'Projekt ustawy regulującej zasady przetwarzania i ochrony danych osobowych obywateli RP w systemach informatycznych administracji publicznej.',
      startDate: new Date('2024-01-15'),
      publishDate: null,
    },
  });

  // Faza 1: Prekonsultacje
  const phase1 = await prisma.phase.create({
    data: {
      lawId: law.id,
      type: PhaseType.PRECONSULTATION,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-28'),
      order: 1,
    },
  });

  // Etap 1.1: Wstępny projekt
  const stage1 = await prisma.stage.create({
    data: {
      phaseId: phase1.id,
      name: 'Wstępny projekt ustawy i założeń',
      date: new Date('2024-01-15'),
      author: 'Ministerstwo Cyfryzacji',
      description:
        'Przedstawienie wstępnych założeń projektu ustawy o ochronie danych osobowych.',
      governmentLinks: JSON.stringify([
        'https://www.gov.pl/web/cyfryzacja/projekt-ustawy-dane-osobowe',
      ]),
      lawTextContent: `Art. 1. Ustawa określa zasady przetwarzania danych osobowych obywateli.

Art. 2. Dane osobowe podlegają szczególnej ochronie.

Art. 3. Administrator danych jest zobowiązany do zabezpieczenia danych.`,
      order: 1,
    },
  });

  // Etap 1.2: Konsultacje
  const stage2 = await prisma.stage.create({
    data: {
      phaseId: phase1.id,
      name: 'Konsultacje społeczne',
      date: new Date('2024-02-01'),
      author: 'Ministerstwo Cyfryzacji',
      description: 'Zbieranie opinii i uwag od obywateli oraz organizacji.',
      governmentLinks: JSON.stringify([]),
      lawTextContent: `Art. 1. Ustawa określa zasady przetwarzania danych osobowych obywateli.

Art. 2. Dane osobowe podlegają szczególnej ochronie prawnej.

Art. 3. Administrator danych jest zobowiązany do zabezpieczenia danych przed nieuprawnionym dostępem.

Art. 4. Obywatel ma prawo do wglądu w swoje dane osobowe.`,
      order: 2,
    },
  });

  // Faza 2: RCL
  const phase2 = await prisma.phase.create({
    data: {
      lawId: law.id,
      type: PhaseType.RCL,
      startDate: new Date('2024-03-01'),
      endDate: null,
      order: 2,
    },
  });

  // Etap 2.1: Opinia RCL
  await prisma.stage.create({
    data: {
      phaseId: phase2.id,
      name: 'Opiniowanie przez RCL',
      date: new Date('2024-03-01'),
      author: 'Rządowe Centrum Legislacji',
      description: 'Analiza projektu pod kątem zgodności z systemem prawa.',
      governmentLinks: JSON.stringify([
        'https://legislacja.rcl.gov.pl/projekt/12345',
      ]),
      lawTextContent: `Art. 1. Ustawa określa zasady przetwarzania danych osobowych obywateli Rzeczypospolitej Polskiej.

Art. 2. Dane osobowe podlegają szczególnej ochronie prawnej zgodnie z Konstytucją RP.

Art. 3. Administrator danych jest zobowiązany do:
  1) zabezpieczenia danych przed nieuprawnionym dostępem,
  2) prowadzenia rejestru operacji na danych,
  3) informowania o naruszeniach ochrony danych.

Art. 4. Obywatel ma prawo do:
  1) wglądu w swoje dane osobowe,
  2) żądania sprostowania danych,
  3) żądania usunięcia danych.

Art. 5. Przepisy wchodzą w życie po upływie 6 miesięcy od dnia ogłoszenia.`,
      order: 1,
    },
  });

  // Dyskusja do etapu 1
  await prisma.discussion.createMany({
    data: [
      {
        stageId: stage1.id,
        nickname: 'JanKowalski',
        content:
          'Czy ustawa będzie dotyczyła również danych przetwarzanych przez firmy prywatne?',
      },
      {
        stageId: stage1.id,
        nickname: 'AnnaNowak',
        content:
          'Uważam, że Art. 3 powinien precyzyjniej określać wymagania techniczne zabezpieczeń.',
      },
      {
        stageId: stage2.id,
        nickname: 'PiotrWiśniewski',
        content:
          'Dodanie Art. 4 o prawie wglądu to dobry krok. Czy będzie określony termin na realizację wniosku?',
      },
    ],
  });

  console.log('Seed data created successfully!');
  console.log(`Created law: ${law.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
