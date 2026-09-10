import { jsPDF } from 'jspdf';
import { Certificate } from '../types';

const EXPORT_WIDTH = 1123;
const EXPORT_HEIGHT = 794;
const EXPORT_SCALE = 2;

function resolveElementId(target?: string | Partial<Certificate>): string | undefined {
  if (typeof target === 'string') return target;
  if (target?.id) return `certificate-a4-document-${target.id}`;
  return undefined;
}

function findBestCertificateElement(target?: string | Partial<Certificate>): HTMLElement | null {
  const elementId = resolveElementId(target);
  const selector = elementId ? `[id="${elementId}"]` : '.certificate-root-element';
  const matches = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (!matches.length) return null;

  const visible = matches
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 10 && rect.height > 10)
    .sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height);

  return visible[0]?.el || matches[0];
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function createExportSurface(source: HTMLElement): Promise<{ host: HTMLDivElement; element: HTMLElement }> {
  if (document.fonts?.ready) await document.fonts.ready;

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-20000px',
    top: '0',
    width: `${EXPORT_WIDTH}px`,
    height: `${EXPORT_HEIGHT}px`,
    overflow: 'hidden',
    background: '#fbf7ef',
    pointerEvents: 'none',
    zIndex: '-2147483647',
  });

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  Object.assign(clone.style, {
    width: `${EXPORT_WIDTH}px`,
    height: `${EXPORT_HEIGHT}px`,
    minWidth: `${EXPORT_WIDTH}px`,
    minHeight: `${EXPORT_HEIGHT}px`,
    maxWidth: 'none',
    maxHeight: 'none',
    aspectRatio: 'auto',
    transform: 'none',
    margin: '0',
    boxShadow: 'none',
    border: '0',
    containerType: 'inline-size',
  });

  host.appendChild(clone);
  document.body.appendChild(host);
  await waitForLayout();
  return { host, element: clone };
}

function cloneWithResolvedStyles(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const sourceNodes: Element[] = [source, ...Array.from(source.querySelectorAll('*'))];
  const cloneNodes: Element[] = [clone, ...Array.from(clone.querySelectorAll('*'))];

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index] as HTMLElement | undefined;
    if (!cloneNode) return;
    if (sourceNode instanceof HTMLImageElement && cloneNode instanceof HTMLImageElement) {
      cloneNode.src = sourceNode.currentSrc || sourceNode.src;
    }
    const computed = window.getComputedStyle(sourceNode);
    for (let i = 0; i < computed.length; i += 1) {
      const property = computed[i];
      try {
        cloneNode.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
      } catch {
        // Browser-specific properties can be ignored for export.
      }
    }
    cloneNode.removeAttribute('class');
  });

  clone.removeAttribute('id');
  return clone;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível renderizar o certificado.'));
    image.src = url;
  });
}

async function renderCertificateToCanvas(source: HTMLElement): Promise<HTMLCanvasElement> {
  const { host, element } = await createExportSurface(source);
  try {
    const resolvedClone = cloneWithResolvedStyles(element);
    Object.assign(resolvedClone.style, {
      width: `${EXPORT_WIDTH}px`,
      height: `${EXPORT_HEIGHT}px`,
      minWidth: `${EXPORT_WIDTH}px`,
      minHeight: `${EXPORT_HEIGHT}px`,
      margin: '0',
      transform: 'none',
    });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    Object.assign(wrapper.style, {
      width: `${EXPORT_WIDTH}px`,
      height: `${EXPORT_HEIGHT}px`,
      overflow: 'hidden',
      margin: '0',
      padding: '0',
      background: '#fbf7ef',
    });
    wrapper.appendChild(resolvedClone);

    const serialized = new XMLSerializer().serializeToString(wrapper);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}"><foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject></svg>`;
    const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));

    try {
      const image = await loadImage(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = EXPORT_WIDTH * EXPORT_SCALE;
      canvas.height = EXPORT_HEIGHT * EXPORT_SCALE;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D indisponível.');
      ctx.fillStyle = '#fbf7ef';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } finally {
    host.remove();
  }
}

export async function downloadCertificatePDF(
  elementId: string,
  certificate: Partial<Certificate>,
  onProgress?: (status: string) => void
): Promise<boolean> {
  onProgress?.('Preparando documento...');
  const source = findBestCertificateElement(elementId);
  if (!source) throw new Error(`Certificate element "${elementId}" not found.`);

  onProgress?.('Renderizando certificado...');
  const canvas = await renderCertificateToCanvas(source);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
  const back = document.querySelector<HTMLElement>(`#certificate-a4-back-${certificate.id || 'preview'}`);
  if (back) {
    const backCanvas = await renderCertificateToCanvas(back);
    pdf.addPage('a4', 'landscape');
    pdf.addImage(backCanvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
  }

  const safeNumber = (certificate.certificateNumber || '000-CVTE-2026').replace(/[\/\\]/g, '-');
  const safeName = (certificate.name || 'Certificado')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 36);

  pdf.save(`Certificado_${safeNumber}_${safeName || 'Participante'}.pdf`);
  onProgress?.('Download concluído!');
  return true;
}

/**
 * Imprime somente o certificado. O primeiro argumento pode ser o id do elemento
 * ou o próprio certificado; o segundo é aceito por compatibilidade com telas antigas.
 */
export async function triggerPrintCertificate(
  target?: string | Partial<Certificate>,
  _legacyConfig?: unknown
): Promise<void> {
  const source = findBestCertificateElement(target);
  if (!source) throw new Error('Certificado não encontrado para impressão.');

  const { host, element } = await createExportSurface(source);
  try {
    const resolvedClone = cloneWithResolvedStyles(element);
    Object.assign(resolvedClone.style, {
      width: '297mm',
      height: '210mm',
      minWidth: '297mm',
      minHeight: '210mm',
      margin: '0',
      transform: 'none',
      boxShadow: 'none',
      border: '0',
    });

    const iframe = document.createElement('iframe');
    iframe.title = 'Impressão do certificado';
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '1px',
      height: '1px',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
    });
    document.body.appendChild(iframe);

    const printDoc = iframe.contentDocument;
    const printWindow = iframe.contentWindow;
    if (!printDoc || !printWindow) {
      iframe.remove();
      throw new Error('Janela de impressão indisponível.');
    }

    printDoc.open();
    printDoc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Certificado SisCert</title><style>@page{size:A4 landscape;margin:0}html,body{width:297mm;height:210mm;margin:0;padding:0;overflow:hidden;background:#fbf7ef}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${resolvedClone.outerHTML}</body></html>`);
    printDoc.close();

    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    printWindow.focus();
    printWindow.print();
    const cleanup = () => iframe.remove();
    printWindow.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(cleanup, 30000);
  } finally {
    host.remove();
  }
}
