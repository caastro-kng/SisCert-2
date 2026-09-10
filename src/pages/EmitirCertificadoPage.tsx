import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Certificate, CourseCode, InstitutionConfig, SubjectDetail } from '../types';
import { CertificateDocument } from '../components/certificate/CertificateDocument';
import { CertificatePreviewModal } from '../components/certificate/CertificatePreviewModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/layout/PageHeader';
import { formatCPF, validateCPF } from '../utils/cpf';
import { formatDateBR, formatPeriodBR, getTodayISO } from '../utils/date';
import { generateNextCertificateNumber } from '../utils/numbering';
import { downloadCertificatePDF, triggerPrintCertificate } from '../utils/pdf';
import { COURSE_OPTIONS, CVTE_COURSE, CVTE_DEFAULT_WORKLOAD } from '../services/storage';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  Eye,
  FilePlus2,
  Info,
  Lock,
  Maximize2,
  Printer,
  RefreshCw,
  ShieldCheck,
  UserRound,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface EmitirCertificadoPageProps {
  existingCertificates: Certificate[];
  config: InstitutionConfig;
  editingCertificate?: Certificate | null;
  reissuingFrom?: Certificate | null;
  onCertificateIssued: (newCert: Certificate) => void;
  onCertificatesIssued?: (newCertificates: Certificate[]) => void;
  onCertificateUpdated?: (updatedCert: Certificate) => void;
  onCancelEmission: () => void;
}

type FormErrors = Record<string, string>;
type ParticipantInput = Pick<Certificate, 'name' | 'cpf' | 'registrationNumber' | 'category'>;

const normalizeName = (value: string) => value.replace(/\s+/g, ' ').trim().toUpperCase();
const onlyDigits = (value: string) => value.replace(/\D/g, '');
const normalizeRenach = (value: string) => value.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
const isValidRenach = (value: string) => /^(?:[A-Z]{2}\s?)?\d{7,11}$/.test(normalizeRenach(value));
const normalizeCategory = (value: string) => value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
const normalizeCertificateNumber = (value: string) => value.toUpperCase().replace(/\s/g, '');
const DEFAULT_SUBJECT_DETAILS: SubjectDetail[] = [
  'LEGISLAÇÃO DE TRÂNSITO', 'DIREÇÃO DEFENSIVA', 'PRIMEIROS SOCORROS E ATENDIMENTO INICIAL', 'COMPORTAMENTO E CONVÍVIO SOCIAL',
].map((name) => ({ name, workload: '', evaluation: '', instructorName: '' }));

export const EmitirCertificadoPage: React.FC<EmitirCertificadoPageProps> = ({
  existingCertificates,
  config,
  editingCertificate,
  reissuingFrom,
  onCertificateIssued,
  onCertificatesIssued,
  onCertificateUpdated,
  onCancelEmission,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [emissionMode, setEmissionMode] = useState<'single' | 'batch'>('single');
  const [addedParticipants, setAddedParticipants] = useState<ParticipantInput[]>([]);
  const [importSummary, setImportSummary] = useState('');
  const [batchPreview, setBatchPreview] = useState<Certificate[]>([]);
  const [batchPreviewIndex, setBatchPreviewIndex] = useState(0);
  const [cpf, setCpf] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [category, setCategory] = useState('AD');
  const [courseCode, setCourseCode] = useState<CourseCode>('CVTE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workload, setWorkload] = useState(CVTE_DEFAULT_WORKLOAD);
  const [subjectName, setSubjectName] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [grade, setGrade] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [subjectDetails, setSubjectDetails] = useState<SubjectDetail[]>(DEFAULT_SUBJECT_DETAILS);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate, setIssueDate] = useState(getTodayISO());
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessingEmission, setIsProcessingEmission] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState<Certificate | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const suggestedCertificateNumber = useMemo(
    () => generateNextCertificateNumber(existingCertificates, new Date().getFullYear(), courseCode),
    [courseCode, existingCertificates]
  );

  useEffect(() => {
    setCurrentStep(1);
    setIssuedCertificate(null);
    setErrors({});

    if (editingCertificate) {
      setCourseCode(editingCertificate.courseCode || (editingCertificate.certificateNumber.split('/')[1] as CourseCode) || 'CVTE');
      setName(editingCertificate.name);
      setCpf(editingCertificate.cpf);
      setRegistrationNumber(editingCertificate.registrationNumber);
      setCategory(editingCertificate.category);
      setStartDate(editingCertificate.startDate);
      setEndDate(editingCertificate.endDate);
      setWorkload(editingCertificate.workload);
      setSubjectName(editingCertificate.subjectName || '');
      setEvaluation(editingCertificate.evaluation || '');
      setGrade(editingCertificate.grade || '');
      setInstructorName(editingCertificate.instructorName || '');
      setSubjectDetails(editingCertificate.subjectDetails || DEFAULT_SUBJECT_DETAILS);
      setCertificateNumber(editingCertificate.certificateNumber);
      setIssueDate(editingCertificate.issueDate);
      return;
    }

    if (reissuingFrom) {
      setCourseCode(reissuingFrom.courseCode || (reissuingFrom.certificateNumber.split('/')[1] as CourseCode) || 'CVTE');
      setName(reissuingFrom.name);
      setCpf(reissuingFrom.cpf);
      setRegistrationNumber(reissuingFrom.registrationNumber);
      setCategory(reissuingFrom.category);
      setStartDate(reissuingFrom.startDate);
      setEndDate(reissuingFrom.endDate);
      setWorkload(reissuingFrom.workload);
      setSubjectName(reissuingFrom.subjectName || '');
      setEvaluation(reissuingFrom.evaluation || '');
      setGrade(reissuingFrom.grade || '');
      setInstructorName(reissuingFrom.instructorName || '');
      setCertificateNumber(suggestedCertificateNumber);
      setIssueDate(getTodayISO());
      return;
    }

    setName('');
    setCpf('');
    setRegistrationNumber('');
    setCategory('AD');
    setCourseCode('CVTE');
    setStartDate('');
    setEndDate('');
    setWorkload(CVTE_DEFAULT_WORKLOAD);
    setSubjectName('');
    setEvaluation('');
    setGrade('');
    setInstructorName('');
    setSubjectDetails(DEFAULT_SUBJECT_DETAILS);
    setCertificateNumber(suggestedCertificateNumber);
    setIssueDate(getTodayISO());
  }, [editingCertificate, reissuingFrom, suggestedCertificateNumber]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    if (formatted.length === 14 && !validateCPF(formatted)) {
      setErrors((prev) => ({ ...prev, cpf: 'CPF inválido. Verifique os dígitos informados.' }));
    } else {
      clearError('cpf');
    }
  };

  const validateStep1 = (): boolean => {
    const next: FormErrors = {};
    const cleanName = normalizeName(name);
    const cleanRegistration = normalizeRenach(registrationNumber);
    const cleanCategory = normalizeCategory(category);
    const cleanNumber = normalizeCertificateNumber(certificateNumber);

    if (cleanName.length < 5 || cleanName.split(' ').length < 2) next.name = 'Informe o nome completo do participante.';
    if (!cpf.trim()) next.cpf = 'O CPF é obrigatório.';
    else if (!validateCPF(cpf)) next.cpf = 'CPF inválido. Verifique os dígitos informados.';
    if (!cleanRegistration) next.registrationNumber = 'Informe o número de registro do condutor.';
    else if (!isValidRenach(cleanRegistration)) next.registrationNumber = 'Use um número de registro válido, como DF 786665602.';
    if (!cleanCategory) next.category = 'Informe a categoria da CNH.';
    else if (!/^[A-E]{1,2}$/.test(cleanCategory)) next.category = 'Use uma categoria válida, como B, D, E, AB ou AD.';
    if (!startDate) next.startDate = 'Selecione a data inicial do curso.';
    if (!endDate) next.endDate = 'Selecione a data final do curso.';
    if (startDate && endDate && startDate > endDate) next.endDate = 'A data final não pode ser anterior à data inicial.';
    if (!Number.isFinite(workload) || workload < 1 || workload > 300) next.workload = 'Informe uma carga horária entre 1 e 300 horas/aula.';

    const certMatch = cleanNumber.match(/^(\d{3})\/(CVTE|MOPP|CTCP|CVTCI)\/(\d{4})$/);
    if (!cleanNumber) next.certificateNumber = 'Informe o número do certificado.';
    else if (!certMatch || Number(certMatch[1]) === 0 || certMatch[2] !== courseCode) next.certificateNumber = `Use o padrão 001/${courseCode}/2026, com sequência maior que zero.`;

    const duplicate = existingCertificates.some(
      (cert) => cert.id !== editingCertificate?.id && normalizeCertificateNumber(cert.certificateNumber) === cleanNumber
    );
    if (duplicate) next.certificateNumber = 'Este número de certificado já está cadastrado.';

    if (!issueDate) next.issueDate = 'Selecione a data de emissão.';
    else {
      if (endDate && issueDate < endDate) next.issueDate = 'A emissão não pode ser anterior ao término do curso.';
      if (certMatch && certMatch[3] !== issueDate.slice(0, 4)) next.certificateNumber = `O ano do número deve ser ${issueDate.slice(0, 4)}, igual ao ano da emissão.`;
    }

    setName(cleanName);
    setRegistrationNumber(cleanRegistration);
    setCategory(cleanCategory);
    setCertificateNumber(cleanNumber);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const addCurrentParticipant = (): boolean => {
    const participant: ParticipantInput = { name: normalizeName(name), cpf: cpf.trim(), registrationNumber: normalizeRenach(registrationNumber), category: normalizeCategory(category) };
    const next: FormErrors = {};
    if (participant.name.length < 5 || participant.name.split(' ').length < 2) next.name = 'Informe o nome completo do participante.';
    if (!validateCPF(participant.cpf)) next.cpf = 'CPF inválido. Verifique os dígitos informados.';
    if (!isValidRenach(participant.registrationNumber)) next.registrationNumber = 'Use um número de registro válido, como DF 786665602.';
    if (!/^[A-E]{1,2}$/.test(participant.category)) next.category = 'Use uma categoria válida, como B, D, E, AB ou AD.';
    if (addedParticipants.some((item) => item.cpf === participant.cpf)) next.participant = 'Este CPF já foi adicionado.';
    setErrors(next);
    if (Object.keys(next).length) return false;
    setAddedParticipants((current) => [...current, participant]);
    setImportSummary('');
    setName(''); setCpf(''); setRegistrationNumber(''); setCategory('AD');
    return true;
  };

  const handleSpreadsheetImport = async (file?: File) => {
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const seenCpfs = new Set<string>();
      const candidates = rows.map((row) => {
        const values = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim().toUpperCase(), value]));
        return {
          name: normalizeName(String(values.NOME || '')),
          cpf: formatCPF(String(values.CPF || '')),
          registrationNumber: normalizeRenach(String(values.RENACH || '')),
          category: normalizeCategory(String(values.CAT || values.CATEGORIA || '')),
        };
      }).filter((participant) => participant.name || participant.cpf || participant.registrationNumber || participant.category);
      const imported = candidates.filter((participant) => {
        const valid = participant.name.split(' ').length >= 2
          && validateCPF(participant.cpf)
          && isValidRenach(participant.registrationNumber)
          && /^[A-E]{1,2}$/.test(participant.category);
        if (!valid || seenCpfs.has(participant.cpf)) return false;
        seenCpfs.add(participant.cpf);
        return true;
      });
      if (!imported.length) throw new Error('Nenhum participante válido foi encontrado nas colunas Nome, CPF, RENACH e CAT.');
      setAddedParticipants(imported);
      setEmissionMode('batch');
      setErrors({});
      const skipped = candidates.length - imported.length;
      setImportSummary(`${imported.length} participante${imported.length === 1 ? '' : 's'} carregado${imported.length === 1 ? '' : 's'} para revisão.${skipped ? ` ${skipped} linha${skipped === 1 ? '' : 's'} com dados incompletos, inválidos ou duplicados foi ignorada.` : ''}`);
    } catch (error) {
      setErrors((current) => ({ ...current, spreadsheet: error instanceof Error ? error.message : 'Não foi possível ler a planilha.' }));
    }
  };

  const buildBatchCertificates = (): Certificate[] | null => {
    const next: FormErrors = {};
    if (!startDate) next.startDate = 'Selecione a data inicial do curso.';
    if (!endDate) next.endDate = 'Selecione a data final do curso.';
    if (startDate && endDate && startDate > endDate) next.endDate = 'A data final não pode ser anterior à data inicial.';
    if (!Number.isFinite(workload) || workload < 1 || workload > 300) next.workload = 'Informe uma carga horária entre 1 e 300 horas/aula.';
    if (!issueDate) next.issueDate = 'Selecione a data de emissão.';
    else if (endDate && issueDate < endDate) next.issueDate = 'A emissão não pode ser anterior ao término do curso.';
    if (!addedParticipants.length) next.participant = 'Adicione ao menos um participante antes de continuar.';
    setErrors(next);
    if (Object.keys(next).length) return null;
    const year = issueDate.slice(0, 4);
    const maxSequence = existingCertificates.reduce((max, cert) => {
      const match = cert.certificateNumber.match(new RegExp(`^(\\d+)/${courseCode}/${year}$`, 'i'));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    const nowISO = new Date().toISOString();
    return addedParticipants.map((participant, index) => ({
      id: `cert-${Date.now()}-${index}`,
      certificateNumber: `${String(maxSequence + index + 1).padStart(3, '0')}/${courseCode}/${year}`,
      ...participant,
      courseCode,
      course: COURSE_OPTIONS[courseCode],
      startDate,
      endDate,
      workload: Number(workload),
      subjectName: normalizeName(subjectName),
      evaluation: evaluation.trim().toUpperCase(),
      grade: grade.trim(),
      instructorName: normalizeName(instructorName),
      subjectDetails,
      issueDate,
      status: 'Emitido' as const,
      createdAt: nowISO,
      updatedAt: nowISO,
    }));
  };

  const previewParticipant = emissionMode === 'batch' ? batchPreview[batchPreviewIndex] || addedParticipants[batchPreviewIndex] : undefined;
  const liveCertificateDraft: Partial<Certificate> = {
    id: editingCertificate?.id || 'live-draft',
    certificateNumber: batchPreview[batchPreviewIndex]?.certificateNumber || certificateNumber,
    name: previewParticipant?.name || normalizeName(name) || 'NOME DO PARTICIPANTE',
    cpf: previewParticipant?.cpf || cpf || '000.000.000-00',
    registrationNumber: previewParticipant?.registrationNumber || registrationNumber || 'DF 000000000',
    category: previewParticipant?.category || category || 'AD',
    courseCode,
    course: COURSE_OPTIONS[courseCode],
    startDate,
    endDate,
    workload: Number(workload) || CVTE_DEFAULT_WORKLOAD,
    subjectName: normalizeName(subjectName),
    evaluation: evaluation.trim().toUpperCase(),
    grade: grade.trim(),
    instructorName: normalizeName(instructorName),
    subjectDetails,
    issueDate,
    status: editingCertificate?.status || 'Emitido',
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (emissionMode === 'batch') {
      const certificates = buildBatchCertificates();
      if (!certificates) return;
      setBatchPreview(certificates);
      setBatchPreviewIndex(0);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!validateStep1()) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmEmission = async () => {
    if (emissionMode === 'batch') {
      const certificates = buildBatchCertificates();
      if (!certificates) { setIsConfirmModalOpen(false); setCurrentStep(1); return; }
      setIsProcessingEmission(true);
      try {
        if (onCertificatesIssued) onCertificatesIssued(certificates);
        else certificates.forEach(onCertificateIssued);
        setBatchPreview(certificates);
        setBatchPreviewIndex(0);
        setIssuedCertificate(certificates[0]);
        setIsConfirmModalOpen(false);
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally { setIsProcessingEmission(false); }
      return;
    }
    if (!validateStep1()) {
      setIsConfirmModalOpen(false);
      setCurrentStep(1);
      return;
    }

    setIsProcessingEmission(true);
    try {
      const nowISO = new Date().toISOString();
      const commonData = {
        certificateNumber: normalizeCertificateNumber(certificateNumber),
        name: normalizeName(name),
        cpf: cpf.trim(),
        registrationNumber: normalizeRenach(registrationNumber),
        category: normalizeCategory(category),
        courseCode,
        course: COURSE_OPTIONS[courseCode],
        startDate,
        endDate,
        workload: Number(workload),
        subjectName: normalizeName(subjectName),
        evaluation: evaluation.trim().toUpperCase(),
        grade: grade.trim(),
        instructorName: normalizeName(instructorName),
        subjectDetails,
        issueDate,
        updatedAt: nowISO,
      };

      if (editingCertificate && onCertificateUpdated) {
        const updated: Certificate = { ...editingCertificate, ...commonData };
        onCertificateUpdated(updated);
        setIssuedCertificate(updated);
      } else {
        const created: Certificate = {
          id: `cert-${Date.now()}`,
          ...commonData,
          status: 'Emitido',
          reissuedFromId: reissuingFrom?.id,
          createdAt: nowISO,
        };
        onCertificateIssued(created);
        setIssuedCertificate(created);
      }

      setIsConfirmModalOpen(false);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erro na emissão:', err);
      alert('Não foi possível concluir a emissão. Tente novamente.');
    } finally {
      setIsProcessingEmission(false);
    }
  };

  const handleResetForAnother = () => {
    setName('');
    setAddedParticipants([]);
    setBatchPreview([]);
    setBatchPreviewIndex(0);
    setCpf('');
    setRegistrationNumber('');
    setCategory('AD');
    setStartDate('');
    setEndDate('');
    setWorkload(CVTE_DEFAULT_WORKLOAD);
    setSubjectName('');
    setEvaluation('');
    setGrade('');
    setInstructorName('');
    setSubjectDetails(DEFAULT_SUBJECT_DETAILS);
    setCertificateNumber(generateNextCertificateNumber(existingCertificates));
    setIssueDate(getTodayISO());
    setIssuedCertificate(null);
    setErrors({});
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadIssuedPDF = async () => {
    if (!issuedCertificate) return;
    setIsDownloadingPdf(true);
    try {
      await downloadCertificatePDF(`certificate-a4-document-${issuedCertificate.id}`, issuedCertificate);
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintIssued = async () => {
    if (!issuedCertificate) return;
    try {
      await triggerPrintCertificate(`certificate-a4-document-${issuedCertificate.id}`);
    } catch (err) {
      console.error(err);
      alert('Não foi possível abrir a impressão do certificado.');
    }
  };

  const inputClass = (field: string, extra = '') => `w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900 transition focus:bg-white focus:outline-none focus:ring-2 ${errors[field] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#1B4332] focus:ring-[#1B4332]/20'} ${extra}`;
  const FieldError = ({ message }: { message?: string }) => message ? <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600" role="alert"><AlertCircle className="h-3 w-3 shrink-0" />{message}</p> : null;
  const isManualNumber = !editingCertificate && certificateNumber && normalizeCertificateNumber(certificateNumber) !== suggestedCertificateNumber;

  return (
    <div id="emitir-certificado-page" className="space-y-8">
      {currentStep === 2 && emissionMode === 'batch' && <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-[#1B4332]">Resumo da emissão</h2><p className="mt-1 text-sm text-emerald-900"><strong>{batchPreview.length} certificado{batchPreview.length === 1 ? '' : 's'}</strong> para <strong>{batchPreview.length} participante{batchPreview.length === 1 ? '' : 's'}</strong>.</p></div><div className="flex items-center gap-2"><button type="button" aria-label="Ver participante anterior" disabled={batchPreviewIndex === 0} onClick={() => setBatchPreviewIndex((index) => Math.max(0, index - 1))} className="rounded-full border border-emerald-200 bg-white p-2 text-[#1B4332] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-12 text-center text-xs font-bold text-[#1B4332]">{batchPreviewIndex + 1} de {batchPreview.length}</span><button type="button" aria-label="Ver próximo participante" disabled={batchPreviewIndex === batchPreview.length - 1} onClick={() => setBatchPreviewIndex((index) => Math.min(batchPreview.length - 1, index + 1))} className="rounded-full border border-emerald-200 bg-white p-2 text-[#1B4332] disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div><div className="mt-3 rounded-md border border-emerald-100 bg-white px-3 py-2 text-xs"><strong>{batchPreview[batchPreviewIndex]?.name}</strong><span className="mt-1 block font-mono text-gray-500">{batchPreview[batchPreviewIndex]?.cpf} · {batchPreview[batchPreviewIndex]?.certificateNumber}</span></div></section>}
      <PageHeader id="emitir-header" title={editingCertificate ? 'Editar Certificado CVTE' : reissuingFrom ? 'Reemitir Certificado CVTE' : 'Emitir Certificado CVTE'} subtitle={currentStep === 1 ? 'Preencha os dados com atenção. O SisCert valida as informações antes da emissão.' : currentStep === 2 ? 'Revise o documento e confirme os dados antes de registrar a emissão.' : 'Certificado registrado com sucesso no SisCert.'} />
      {currentStep === 1 && !editingCertificate && !reissuingFrom && <section className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm"><h3 className="text-sm font-bold text-[#1B4332]">Importar participantes da planilha</h3><p className="mt-1 text-xs text-gray-600">Use o arquivo Excel com as colunas Nome, CPF, RENACH e CAT. Os participantes serão carregados para revisão antes da emissão.</p><label className="mt-3 inline-flex cursor-pointer items-center rounded-md bg-[#1B4332] px-3 py-2 text-xs font-semibold text-white hover:bg-[#143326]">Selecionar planilha<input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => handleSpreadsheetImport(event.target.files?.[0])} /></label>{importSummary && <p className="mt-2 text-xs font-semibold text-emerald-800">{importSummary}</p>}<FieldError message={errors.spreadsheet} /></section>}
      {currentStep === 1 && <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div><h3 className="text-sm font-bold text-gray-900">Selecione o curso</h3><p className="text-[11px] text-gray-500">Escolha uma das quatro modalidades antes de preencher os dados da emissão.</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Curso">{(Object.entries(COURSE_OPTIONS) as [CourseCode, string][]).map(([code, course]) => <button key={code} type="button" role="radio" aria-checked={courseCode === code} onClick={() => { setCourseCode(code); setCertificateNumber(generateNextCertificateNumber(existingCertificates, new Date().getFullYear(), code)); clearError('certificateNumber'); }} className={`rounded-md border p-3 text-left transition-colors ${courseCode === code ? 'border-[#1B4332] bg-emerald-50 ring-1 ring-[#1B4332]' : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'}`}><span className="block text-xs font-bold text-[#1B4332]">{code}</span><span className="mt-1 block text-[11px] leading-relaxed text-gray-700">{course}</span></button>)}</div></section>}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="mx-auto flex max-w-xl items-center justify-between text-xs font-semibold">{['Dados', 'Revisão', 'Emissão'].map((label, index) => { const step = (index + 1) as 1 | 2 | 3; const completed = currentStep > step || currentStep === 3 && step === 3; return <React.Fragment key={label}><div className={`flex items-center gap-2 ${currentStep === step ? 'text-[#1B4332]' : 'text-gray-500'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${currentStep >= step ? 'bg-[#1B4332] text-white' : 'bg-gray-100 text-gray-400'}`}>{completed ? <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" /> : step}</span><span className="hidden sm:inline">{step} {label}</span></div>{step < 3 && <div className={`mx-3 h-[2px] flex-1 ${currentStep > step ? 'bg-[#1B4332]' : 'bg-gray-200'}`} />}</React.Fragment>; })}</div></div>

      {currentStep === 1 && <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"><form onSubmit={handleProceedToReview} className="space-y-6 lg:col-span-6" noValidate>
        {reissuingFrom && <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900"><RefreshCw className="mt-0.5 h-4 w-4 shrink-0" /><div><strong>Reemissão em andamento.</strong><p className="mt-0.5 text-blue-800">Os dados foram carregados do certificado {reissuingFrom.certificateNumber}. Um novo número será utilizado.</p></div></div>}
        {!editingCertificate && !reissuingFrom && <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><div><h3 className="text-sm font-bold text-gray-900">Participantes</h3><p className="mt-1 text-[11px] text-gray-500">Adicione uma pessoa de cada vez; cada certificado recebe numeração sequencial.</p></div><div className="flex gap-2"><button type="button" onClick={() => setEmissionMode('single')} className={`rounded-md px-3 py-2 text-xs font-semibold ${emissionMode === 'single' ? 'bg-[#1B4332] text-white' : 'border border-gray-300 text-gray-700'}`}>Individual</button><button type="button" onClick={() => setEmissionMode('batch')} className={`rounded-md px-3 py-2 text-xs font-semibold ${emissionMode === 'batch' ? 'bg-[#1B4332] text-white' : 'border border-gray-300 text-gray-700'}`}>Adicionar mais</button></div>{emissionMode === 'batch' && <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3"><p className="text-xs font-semibold text-[#1B4332]">{addedParticipants.length} participante{addedParticipants.length === 1 ? '' : 's'} adicionado{addedParticipants.length === 1 ? '' : 's'}</p>{addedParticipants.length > 0 && <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-gray-700">{addedParticipants.map((participant, index) => <li key={participant.cpf} className="flex justify-between rounded bg-white px-2 py-1"><span>{participant.name}</span><span className="font-mono text-gray-500">{index + 1}</span></li>)}</ul>}<FieldError message={errors.participant} /></div>}</section>}
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 border-b border-gray-100 pb-3"><UserRound className="h-4 w-4 text-[#1B4332]" /><h3 className="text-sm font-bold text-gray-900">Dados do Participante</h3></div><div><label htmlFor="input-name" className="mb-1 block text-xs font-semibold text-gray-700">Nome completo *</label><input id="input-name" value={name} aria-invalid={!!errors.name} onChange={(e) => { setName(e.target.value); clearError('name'); }} onBlur={() => setName(normalizeName(name))} className={inputClass('name', 'uppercase')} placeholder="NOME COMPLETO" autoComplete="off" /><FieldError message={errors.name} /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-12"><div className="sm:col-span-5"><label htmlFor="input-cpf" className="mb-1 block text-xs font-semibold text-gray-700">CPF *</label><input id="input-cpf" inputMode="numeric" value={cpf} maxLength={14} aria-invalid={!!errors.cpf} onChange={handleCpfChange} className={inputClass('cpf', 'font-mono')} placeholder="000.000.000-00" autoComplete="off" /><FieldError message={errors.cpf} /></div><div className="sm:col-span-4"><label htmlFor="input-registration" className="mb-1 block text-xs font-semibold text-gray-700">Nº do Registro *</label><input id="input-registration" value={registrationNumber} maxLength={14} aria-invalid={!!errors.registrationNumber} onChange={(e) => { setRegistrationNumber(normalizeRenach(e.target.value)); clearError('registrationNumber'); }} className={inputClass('registrationNumber', 'font-mono uppercase')} placeholder="DF 786665602" autoComplete="off" /><FieldError message={errors.registrationNumber} /></div><div className="sm:col-span-3"><label htmlFor="input-category" className="mb-1 block text-xs font-semibold text-gray-700">Categoria *</label><input id="input-category" value={category} maxLength={2} aria-invalid={!!errors.category} onChange={(e) => { setCategory(normalizeCategory(e.target.value)); clearError('category'); }} className={inputClass('category', 'font-bold uppercase')} placeholder="AD" autoComplete="off" /><FieldError message={errors.category} /></div></div></section>
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 border-b border-gray-100 pb-3"><CalendarDays className="h-4 w-4 text-[#D4AF37]" /><div><h3 className="text-sm font-bold text-gray-900">Dados do Curso</h3><p className="mt-0.5 text-[11px] text-gray-500">Escolha uma das quatro modalidades disponíveis.</p></div></div><div><p className="mb-2 text-xs font-semibold text-gray-700">Curso *</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Curso">{(Object.entries(COURSE_OPTIONS) as [CourseCode, string][]).map(([code, course]) => <button key={code} type="button" role="radio" aria-checked={courseCode === code} onClick={() => { setCourseCode(code); setCertificateNumber(generateNextCertificateNumber(existingCertificates, new Date().getFullYear(), code)); clearError('certificateNumber'); }} className={`rounded-lg border p-3 text-left transition-colors ${courseCode === code ? 'border-[#1B4332] bg-emerald-50 ring-1 ring-[#1B4332]' : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'}`}><span className="block text-xs font-bold text-[#1B4332]">{code}</span><span className="mt-1 block text-[11px] leading-relaxed text-gray-700">{course}</span></button>)}</div></div><div className="rounded-md border border-emerald-100 bg-emerald-50/60 p-3 text-xs font-semibold leading-relaxed text-[#1B4332]">Curso selecionado: {COURSE_OPTIONS[courseCode]}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div><label htmlFor="input-start-date" className="mb-1 block text-xs font-semibold text-gray-700">Data inicial *</label><input id="input-start-date" type="date" value={startDate} aria-invalid={!!errors.startDate} onChange={(e) => { setStartDate(e.target.value); clearError('startDate'); clearError('endDate'); clearError('issueDate'); }} className={inputClass('startDate')} /><FieldError message={errors.startDate} /></div><div><label htmlFor="input-end-date" className="mb-1 block text-xs font-semibold text-gray-700">Data final *</label><input id="input-end-date" type="date" value={endDate} min={startDate || undefined} aria-invalid={!!errors.endDate} onChange={(e) => { setEndDate(e.target.value); clearError('endDate'); clearError('issueDate'); }} className={inputClass('endDate')} /><FieldError message={errors.endDate} /></div><div><label htmlFor="input-workload" className="mb-1 block text-xs font-semibold text-gray-700">Carga horária *</label><div className="relative"><input id="input-workload" type="number" min={1} max={300} value={workload} aria-invalid={!!errors.workload} onChange={(e) => { setWorkload(Number(e.target.value)); clearError('workload'); }} className={inputClass('workload', 'pr-16 font-semibold')} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">h/aula</span></div><FieldError message={errors.workload} /></div></div></section>
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 border-b border-gray-100 pb-3"><ShieldCheck className="h-4 w-4 text-[#1B4332]" /><h3 className="text-sm font-bold text-gray-900">Dados do Certificado</h3></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><div className="mb-1 flex items-center justify-between gap-2"><label htmlFor="input-cert-number" className="text-xs font-semibold text-gray-700">Número *</label><button type="button" onClick={() => { setCertificateNumber(suggestedCertificateNumber); clearError('certificateNumber'); }} className="text-[10px] font-semibold text-[#1B4332] hover:underline">Usar próximo: {suggestedCertificateNumber}</button></div><input id="input-cert-number" value={certificateNumber} aria-invalid={!!errors.certificateNumber} onChange={(e) => { setCertificateNumber(normalizeCertificateNumber(e.target.value)); clearError('certificateNumber'); }} className={inputClass('certificateNumber', 'font-mono font-bold uppercase')} placeholder={suggestedCertificateNumber} autoComplete="off" /><FieldError message={errors.certificateNumber} />{isManualNumber && !errors.certificateNumber && <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-700"><Info className="h-3 w-3" />Número alterado manualmente. Confirme antes da emissão.</p>}</div><div><label htmlFor="input-issue-date" className="mb-1 block text-xs font-semibold text-gray-700">Data de emissão *</label><input id="input-issue-date" type="date" value={issueDate} min={endDate || undefined} aria-invalid={!!errors.issueDate} onChange={(e) => { setIssueDate(e.target.value); clearError('issueDate'); clearError('certificateNumber'); }} className={inputClass('issueDate')} /><FieldError message={errors.issueDate} /></div></div><div className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" /><span>Textos institucionais, símbolos, CNPJ e dados do diretor são fixos no certificado oficial e não podem ser alterados durante a emissão.</span></div></section>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><ActionButton label="Cancelar" variant="secondary" size="md" onClick={onCancelEmission} /><div className="flex flex-col gap-2 sm:flex-row">{emissionMode === 'batch' && <ActionButton label="Adicionar participante" icon={UserRound} variant="secondary" size="md" type="button" onClick={addCurrentParticipant} />}<ActionButton label={emissionMode === 'batch' ? 'Pronto' : 'Avançar para revisão'} icon={ArrowRight} variant="primary" size="md" type="submit" /></div></div>
      </form><div className="space-y-3 lg:sticky lg:top-20 lg:col-span-6"><div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3"><div><h3 className="flex items-center gap-2 text-sm font-bold"><Eye className="h-4 w-4 text-[#1B4332]" />Pré-visualização</h3><p className="text-[11px] text-gray-500">O documento atualiza em tempo real.</p></div><div className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 p-1"><button type="button" onClick={() => setPreviewZoom((p) => Math.max(70, p - 10))} className="rounded p-1 text-gray-500 hover:bg-white"><ZoomOut className="h-4 w-4" /></button><span className="min-w-9 text-center text-[10px] font-mono">{previewZoom}%</span><button type="button" onClick={() => setPreviewZoom((p) => Math.min(130, p + 10))} className="rounded p-1 text-gray-500 hover:bg-white"><ZoomIn className="h-4 w-4" /></button><button type="button" onClick={() => setIsPreviewModalOpen(true)} className="rounded p-1 text-[#1B4332] hover:bg-white"><Maximize2 className="h-4 w-4" /></button></div></div><div className="overflow-hidden rounded border border-gray-200 bg-gray-100 p-2"><div style={{ transform: `scale(${previewZoom / 100})` }} className="origin-top transition-transform"><CertificateDocument certificate={liveCertificateDraft} config={config} /></div></div></div></div></div>}

      {currentStep === 2 && <div className="space-y-5"><div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><strong>Última conferência antes da emissão.</strong><p className="mt-0.5 text-amber-800">Verifique principalmente nome, CPF, número do registro, período, número e data de emissão. Depois de confirmar, o registro entrará no Histórico.</p></div></div><div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"><div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-8"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Documento pronto para emissão</h3><ActionButton label="Visualizar" icon={Eye} variant="ghost" onClick={() => setIsPreviewModalOpen(true)} /></div><CertificateDocument certificate={liveCertificateDraft} config={config} /></div><div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-4"><h3 className="border-b border-gray-100 pb-3 text-sm font-bold">Resumo para conferência</h3><dl className="space-y-3 text-xs"><div><dt className="text-gray-500">Participante</dt><dd className="font-bold text-gray-900">{liveCertificateDraft.name}</dd></div>{emissionMode === 'batch' && <div><dt className="text-gray-500">Certificados para emissão</dt><dd className="font-bold text-[#1B4332]">{batchPreview.length} participante{batchPreview.length === 1 ? '' : 's'}</dd></div>}<div className="grid grid-cols-2 gap-2"><div><dt className="text-gray-500">CPF</dt><dd className="font-mono font-semibold">{liveCertificateDraft.cpf}</dd></div><div><dt className="text-gray-500">Categoria</dt><dd className="font-bold">{liveCertificateDraft.category}</dd></div></div><div><dt className="text-gray-500">Nº do Registro</dt><dd className="font-mono font-semibold">{liveCertificateDraft.registrationNumber}</dd></div><div><dt className="text-gray-500">Curso</dt><dd className="font-semibold leading-relaxed">{CVTE_COURSE}</dd></div><div className="grid grid-cols-2 gap-2"><div><dt className="text-gray-500">Período</dt><dd className="font-semibold">{formatPeriodBR(startDate, endDate)}</dd></div><div><dt className="text-gray-500">Carga horária</dt><dd className="font-semibold">{workload} h/aula</dd></div></div><div className="border-t border-gray-100 pt-3"><dt className="text-gray-500">Nº do Certificado</dt><dd className="font-mono text-sm font-bold text-[#1B4332]">{liveCertificateDraft.certificateNumber}</dd></div><div><dt className="text-gray-500">Data de emissão</dt><dd className="font-semibold">{formatDateBR(issueDate)}</dd></div></dl><div className="space-y-2 border-t border-gray-100 pt-4"><ActionButton label={editingCertificate ? 'Salvar alterações' : reissuingFrom ? 'Confirmar reemissão' : 'Confirmar emissão'} icon={CheckCircle2} variant="primary" size="md" fullWidth onClick={() => setIsConfirmModalOpen(true)} /><ActionButton label="Voltar e editar" icon={ArrowLeft} variant="secondary" fullWidth onClick={() => { setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></div></div></div></div>}

      {currentStep === 3 && issuedCertificate && <div className="space-y-6"><div className="mx-auto max-w-2xl space-y-5 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[#1B4332]"><CheckCircle2 className="h-7 w-7" /></div><div><h2 className="text-xl font-bold">Certificado emitido com sucesso</h2><p className="mt-1 text-sm text-gray-500">O documento foi registrado no Histórico do SisCert.</p></div><div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-xs"><p className="flex justify-between gap-4 border-b border-gray-200 py-2"><span className="text-gray-500">Participante</span><strong className="text-right">{issuedCertificate.name}</strong></p><p className="flex justify-between gap-4 border-b border-gray-200 py-2"><span className="text-gray-500">Nº certificado</span><strong className="font-mono text-[#1B4332]">{issuedCertificate.certificateNumber}</strong></p><p className="flex justify-between gap-4 py-2"><span className="text-gray-500">Data de emissão</span><strong>{formatDateBR(issuedCertificate.issueDate)}</strong></p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><ActionButton label="Visualizar" icon={Eye} variant="secondary" size="md" fullWidth onClick={() => setIsPreviewModalOpen(true)} /><ActionButton label="Baixar PDF" icon={Download} variant="primary" size="md" fullWidth loading={isDownloadingPdf} loadingLabel="Gerando PDF..." onClick={handleDownloadIssuedPDF} /><ActionButton label="Imprimir" icon={Printer} variant="secondary" size="md" fullWidth onClick={handlePrintIssued} /><ActionButton label="Emitir outro certificado" icon={FilePlus2} variant="secondary" size="md" fullWidth onClick={handleResetForAnother} /></div></div><div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><CertificateDocument certificate={issuedCertificate} config={config} /></div></div>}

      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmEmission} title={editingCertificate ? 'Confirmar alteração?' : reissuingFrom ? 'Confirmar reemissão?' : 'Confirmar emissão?'} description="Confira os dados abaixo. A ação será registrada no Histórico do SisCert." confirmText={editingCertificate ? 'Salvar alterações' : reissuingFrom ? 'Confirmar reemissão' : 'Confirmar emissão'} cancelText="Voltar" variant="primary" isLoading={isProcessingEmission}><div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs"><p className="flex justify-between gap-4"><span className="text-gray-500">Participante</span><strong className="text-right">{normalizeName(name)}</strong></p><p className="flex justify-between gap-4"><span className="text-gray-500">CPF</span><strong className="font-mono">{cpf}</strong></p><p className="flex justify-between gap-4"><span className="text-gray-500">Certificado</span><strong className="font-mono text-[#1B4332]">{certificateNumber}</strong></p><p className="flex justify-between gap-4"><span className="text-gray-500">Período</span><strong>{formatPeriodBR(startDate, endDate)}</strong></p></div></ConfirmModal>

      <CertificatePreviewModal certificate={issuedCertificate || liveCertificateDraft} config={config} isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} onEmitClick={() => { setIsPreviewModalOpen(false); if (currentStep === 1) { if (emissionMode === 'batch') { const certificates = buildBatchCertificates(); if (certificates) { setBatchPreview(certificates); setBatchPreviewIndex(0); setCurrentStep(2); } } else if (validateStep1()) setCurrentStep(2); } else if (currentStep === 2) setIsConfirmModalOpen(true); }} isEmitStep={currentStep !== 3} />
    </div>
  );
};
