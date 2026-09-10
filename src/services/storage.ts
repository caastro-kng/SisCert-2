import { Certificate, AuditLog, InstitutionConfig } from '../types';

export const DEFAULT_INSTITUTION_CONFIG: InstitutionConfig = {
  institutionName: 'Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias',
  subordinateUnit: 'Instituição de Ensino de Trânsito – Forte Caxias',
  legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
  contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
  cnpj: '21.744.847/0001-50',
  directorName: 'Carlos Henrique Ferreira De Mello',
  directorRole: 'Diretor Geral',
  directorCpf: '981.050.007-68',
  cityState: 'Brasília-DF',
  operatorName: 'Operador Admin',
  operatorRank: 'Militar',
};

export const CVTE_COURSE = 'Curso Especializado para Condutores de Veículos de Transporte de Emergência';
export const CVTE_DEFAULT_WORKLOAD = 50;
export const INITIAL_CERTIFICATES: Certificate[] = [];
export const INITIAL_LOGS: AuditLog[] = [];

const STORAGE_KEYS = {
  CERTIFICATES: 'sis_certificados_data_clean_v2',
  LOGS: 'sis_certificados_logs_clean_v2',
  CONFIG: 'sis_certificados_config_clean_v2',
};

export function getStoredCertificates(): Certificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_CERTIFICATES;

    const cleaned = parsed
      .filter((c: Certificate) => !['cert-001', 'cert-002', 'cert-003', 'cert-004', 'cert-005'].includes(c.id))
      .map((c: any) => {
        const { validationCode, templateId, ...certificate } = c;
        return {
          ...certificate,
          course: CVTE_COURSE,
        } as Certificate;
      });

    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(cleaned));
    return cleaned;
  } catch (err) {
    console.error('Error loading certificates from storage', err);
    return INITIAL_CERTIFICATES;
  }
}

export function saveCertificates(certificates: Certificate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  } catch (err) {
    console.error('Error saving certificates', err);
  }
}

export function getStoredLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_LOGS;
    const cleaned = parsed.filter((log: any) => log.action !== 'Validação consultada');
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return INITIAL_LOGS;
  }
}

export function addAuditLog(action: AuditLog['action'], certificateNumber: string, details: string, user = 'Operador da Base Adm'): void {
  try {
    const logs = getStoredLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      user,
      timestamp: new Date().toISOString(),
      certificateNumber,
      details,
    };
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([newLog, ...logs]));
  } catch (err) {
    console.error('Error adding history entry', err);
  }
}

export function getStoredConfig(): InstitutionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_INSTITUTION_CONFIG));
      return DEFAULT_INSTITUTION_CONFIG;
    }

    const stored = JSON.parse(raw) as Partial<InstitutionConfig>;
    const merged: InstitutionConfig = { ...DEFAULT_INSTITUTION_CONFIG, ...stored };

    if (stored.cnpj === '00.394.452/0001-03' || stored.directorCpf === '412.879.321-04') {
      Object.assign(merged, {
        institutionName: DEFAULT_INSTITUTION_CONFIG.institutionName,
        subordinateUnit: DEFAULT_INSTITUTION_CONFIG.subordinateUnit,
        legalInstruction: DEFAULT_INSTITUTION_CONFIG.legalInstruction,
        contranResolution: DEFAULT_INSTITUTION_CONFIG.contranResolution,
        cnpj: DEFAULT_INSTITUTION_CONFIG.cnpj,
        directorName: DEFAULT_INSTITUTION_CONFIG.directorName,
        directorRole: DEFAULT_INSTITUTION_CONFIG.directorRole,
        directorCpf: DEFAULT_INSTITUTION_CONFIG.directorCpf,
        cityState: DEFAULT_INSTITUTION_CONFIG.cityState,
      });
    }

    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
    return merged;
  } catch {
    return DEFAULT_INSTITUTION_CONFIG;
  }
}

export function saveStoredConfig(config: InstitutionConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving config', err);
  }
}
