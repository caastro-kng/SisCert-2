export interface SubjectDetail {
  name: string;
  workload: string;
  evaluation: string;
  instructorName: string;
}

export type CourseCode = 'CVTE' | 'MOPP' | 'CTCP' | 'CVTCI';

export interface Certificate {
  id: string;
  certificateNumber: string;
  name: string;
  cpf: string;
  registrationNumber: string;
  category: string;
  courseCode?: CourseCode;
  course: string;
  startDate: string;
  endDate: string;
  workload: number;
  subjectName?: string;
  evaluation?: string;
  grade?: string;
  instructorName?: string;
  subjectDetails?: SubjectDetail[];
  issueDate: string;
  status: 'Emitido' | 'Cancelado';
  cancellationReason?: string;
  cancelledAt?: string;
  reissuedFromId?: string;
  reissuedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: 'Certificado criado' | 'Certificado editado' | 'PDF gerado' | 'Certificado reemitido' | 'Certificado cancelado';
  user: string;
  timestamp: string;
  certificateNumber: string;
  details: string;
}

export interface InstitutionConfig {
  institutionName: string;
  subordinateUnit: string;
  legalInstruction: string;
  contranResolution: string;
  cnpj: string;
  directorName: string;
  directorRole: string;
  directorCpf: string;
  cityState: string;
  operatorName: string;
  operatorRank: string;
}

export type NavigationPage =
  | 'dashboard'
  | 'emitir'
  | 'certificados'
  | 'detalhes'
  | 'auditoria'
  | 'configuracoes';
