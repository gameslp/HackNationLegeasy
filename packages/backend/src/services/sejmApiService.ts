import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SejmProcessResponse,
  SejmPrint,
  SejmStage,
  SejmStageChild,
  MappedPhase,
  MappedStage,
  PhaseType,
} from '../types/sejm-api';

const SEJM_API_BASE = 'https://api.sejm.gov.pl/sejm';
const SEJM_PRINTS_BASE = 'https://www.sejm.gov.pl/sejm';

export class SejmApiService {
  /**
   * Pobiera dane procesu legislacyjnego z Sejm API
   */
  async fetchProcess(term: number, processNumber: string): Promise<SejmProcessResponse> {
    const url = `${SEJM_API_BASE}/term${term}/processes/${processNumber}`;

    try {
      const response = await axios.get<SejmProcessResponse>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Process not found: term ${term}, number ${processNumber}`);
      }
      throw new Error(`Failed to fetch Sejm process: ${error}`);
    }
  }

  /**
   * Pobiera informacje o druku
   */
  async fetchPrint(term: number, printNumber: string): Promise<SejmPrint | null> {
    const url = `${SEJM_API_BASE}/term${term}/prints/${printNumber}`;

    try {
      const response = await axios.get<SejmPrint>(url);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch print ${printNumber}:`, error);
      return null;
    }
  }

  /**
   * Pobiera plik PDF druku i zapisuje lokalnie
   */
  async downloadPrintPdf(
    term: number,
    printNumber: string,
    targetDir: string
  ): Promise<{ filePath: string; fileName: string } | null> {
    const pdfUrl = `${SEJM_PRINTS_BASE}${term}/druki/${printNumber}.pdf`;
    const fileName = `sejm_t${term}_druk_${printNumber}.pdf`;
    const filePath = path.join(targetDir, fileName);

    try {
      // Sprawdź czy plik już istnieje
      try {
        await fs.access(filePath);
        console.log(`PDF already exists: ${fileName}`);
        return { filePath, fileName };
      } catch {
        // Plik nie istnieje, pobierz
      }

      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxRedirects: 5,
      });

      // Utwórz folder jeśli nie istnieje
      await fs.mkdir(targetDir, { recursive: true });

      // Zapisz plik
      await fs.writeFile(filePath, response.data);

      console.log(`Downloaded PDF: ${fileName}`);
      return { filePath, fileName };
    } catch (error) {
      console.warn(`Failed to download PDF for print ${printNumber}:`, error);
      return null;
    }
  }

  /**
   * Mapuje typ etapu Sejm na fazę w naszym systemie
   */
  private mapStageTypeToPhase(stageType: string, stageName: string): PhaseType {
    const lowerStageName = stageName.toLowerCase();

    // Senat
    if (stageType === 'SenatReading' || lowerStageName.includes('senat')) {
      return 'SENAT';
    }

    // Prezydent
    if (
      stageType === 'PresidentSigning' ||
      lowerStageName.includes('prezydent') ||
      lowerStageName.includes('podpis')
    ) {
      return 'PRESIDENT';
    }

    // Dziennik Ustaw
    if (
      stageType === 'Publication' ||
      lowerStageName.includes('dziennik ustaw') ||
      lowerStageName.includes('publikacja')
    ) {
      return 'JOURNAL';
    }

    // RCL (Rządowe Centrum Legislacji)
    if (lowerStageName.includes('rcl') || lowerStageName.includes('rządowe centrum')) {
      return 'RCL';
    }

    // Domyślnie: Sejm (większość etapów)
    return 'SEJM';
  }

  /**
   * Mapuje etap i jego children na listę MappedStage
   */
  private mapSejmStageToStages(
    stage: SejmStage,
    phaseType: PhaseType,
    stageOrder: number
  ): MappedStage[] {
    const result: MappedStage[] = [];

    // Główny etap
    const links: string[] = [];

    // Dodaj link do głosowania jeśli istnieje
    if (stage.children) {
      stage.children.forEach((child) => {
        if (child.voting?.links) {
          child.voting.links.forEach((link) => links.push(link.href));
        }
      });
    }

    const mainStage: MappedStage = {
      name: stage.stageName,
      date: stage.date ? new Date(stage.date) : null,
      author: null, // Sejm API nie podaje autora na poziomie etapu
      description: this.buildStageDescription(stage),
      governmentLinks: links,
      printNumber: stage.printNumber || null,
      order: stageOrder,
    };

    result.push(mainStage);

    // Dodaj children jako osobne etapy (flat structure)
    if (stage.children && stage.children.length > 0) {
      stage.children.forEach((child, idx) => {
        const childLinks: string[] = [];
        if (child.voting?.links) {
          child.voting.links.forEach((link) => childLinks.push(link.href));
        }

        const childStage: MappedStage = {
          name: `${stage.stageName} - ${child.stageName}`,
          date: new Date(child.date),
          author: child.committeeCode || null,
          description: this.buildChildDescription(child),
          governmentLinks: childLinks,
          printNumber: null,
          order: stageOrder + idx + 0.1, // Sub-order dla children
        };

        result.push(childStage);
      });
    }

    return result;
  }

  /**
   * Buduje opis głównego etapu
   */
  private buildStageDescription(stage: SejmStage): string | null {
    const parts: string[] = [];

    if (stage.decision) {
      parts.push(`Decyzja: ${stage.decision}`);
    }

    if (stage.sittingNum) {
      parts.push(`Posiedzenie nr ${stage.sittingNum}`);
    }

    if (stage.printNumber) {
      parts.push(`Druk nr ${stage.printNumber}`);
    }

    if (stage.children && stage.children.length > 0) {
      const childrenSummary = stage.children.map((c) => c.stageName).join(', ');
      parts.push(`Zawiera: ${childrenSummary}`);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  /**
   * Buduje opis child stage
   */
  private buildChildDescription(child: SejmStageChild): string | null {
    const parts: string[] = [];

    if (child.committeeCode) {
      parts.push(`Komisja: ${child.committeeCode}`);
    }

    if (child.type) {
      parts.push(`Typ: ${child.type}`);
    }

    if (child.voting) {
      const v = child.voting;
      parts.push(`Głosowanie: TAK=${v.yes}, NIE=${v.no}, WSTRZYMAŁO SIĘ=${v.abstain}`);
      if (v.description) {
        parts.push(`Opis głosowania: ${v.description}`);
      }
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  /**
   * Mapuje wszystkie etapy z Sejm API na fazy i etapy w naszym systemie
   */
  mapProcessToPhases(process: SejmProcessResponse): MappedPhase[] {
    const phasesMap = new Map<PhaseType, MappedPhase>();
    let globalStageOrder = 0;

    process.stages.forEach((stage) => {
      const phaseType = this.mapStageTypeToPhase(stage.stageType, stage.stageName);

      // Pobierz lub utwórz fazę
      let phase = phasesMap.get(phaseType);
      if (!phase) {
        phase = {
          type: phaseType,
          startDate: stage.date ? new Date(stage.date) : new Date(process.processStartDate),
          endDate: null,
          order: phasesMap.size,
          stages: [],
        };
        phasesMap.set(phaseType, phase);
      }

      // Zmapuj etap i jego children
      const mappedStages = this.mapSejmStageToStages(stage, phaseType, globalStageOrder);
      phase.stages.push(...mappedStages);

      // Aktualizuj daty fazy
      if (stage.date) {
        const stageDate = new Date(stage.date);
        if (!phase.startDate || stageDate < phase.startDate) {
          phase.startDate = stageDate;
        }
        if (!phase.endDate || stageDate > phase.endDate) {
          phase.endDate = stageDate;
        }
      }

      globalStageOrder += 10; // Odstęp między głównymi etapami
    });

    // Ustaw endDate dla faz (ostatni stage date w fazie)
    phasesMap.forEach((phase) => {
      if (phase.stages.length > 0) {
        const lastStageDate = phase.stages
          .filter((s) => s.date)
          .map((s) => s.date!)
          .sort((a, b) => b.getTime() - a.getTime())[0];
        if (lastStageDate) {
          phase.endDate = lastStageDate;
        }
      }
    });

    // Konwertuj mapę na tablicę i posortuj według order
    return Array.from(phasesMap.values()).sort((a, b) => a.order - b.order);
  }
}

export const sejmApiService = new SejmApiService();
