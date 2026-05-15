'use client';

import { useState, useCallback } from 'react';
import { gooeyToast } from 'goey-toast';
import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { fetchData } from '@/lib/Api';
import { getCurrencySymbol } from '@/lib/currencySymbols';

type PdfType = 'po' | 'invoice';

export interface UsePdfDownloadReturn {
  downloadPdf: (id: string | number, type: PdfType) => Promise<void>;
  isGenerating: boolean;
  generatingId: string | number | null;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.5
  },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 56 },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  docTitle: { fontSize: 22, fontFamily: 'Helvetica', marginBottom: 14, color: '#000' },
  docNumber: { fontSize: 18, fontFamily: 'Helvetica', marginBottom: 14, color: '#000' },
  metaText: { fontSize: 9, lineHeight: 1.8, color: '#374151' },
  logo: { width: 52, height: 52, marginBottom: 8, objectFit: 'cover' },
  studioText: { fontSize: 9, lineHeight: 1.8, color: '#374151', textAlign: 'right' },

  // From section
  fromSection: { marginBottom: 24 },
  fromName: { fontSize: 11, color: '#111827', marginBottom: 2 },
  fromAddress: { fontSize: 9, color: '#6b7280', lineHeight: 1.6 },

  // Table header
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 2,
  },
  tableHeaderCell: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Table row
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom:14
  },
  tableCell: { fontSize: 10, color: '#374151' },
  productImg: { width: 32, height: 32, objectFit: 'cover', borderRadius: 3 },

  // Column widths
  colImg: { width: '8%' },
  colDesc: { width: '26%' },
  colDim: { width: '26%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right' },

  // Totals
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, marginBottom: 28 },
  totalsBox: { width: 200 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, fontSize: 10 },
  totalsDivider: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, marginTop: 2 },
  totalsLabel: { color: '#374151' },
  totalsValue: { color: '#374151' },
  totalsBold: { fontFamily: 'Helvetica-Bold', fontSize: 10 },

  // Delivery box
  deliveryBox: {
    backgroundColor: '#f5f5f4',
    padding: 14,
    borderRadius: 6,
    marginBottom: 24,
  },
  deliveryTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 5, color: '#374151' },
  deliveryText: { fontSize: 9, color: '#4b5563', lineHeight: 1.5 },

  // Product detail page
  detailPage: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    color: '#1f2937',
  },
  detailProjectName: { fontSize: 9, color: '#374151', marginBottom: 10 },
  detailProductName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 20 },
  detailGrid: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  detailImage: { width: 220, height: 220, objectFit: 'contain' },
  detailRight: { flex: 1 },
  detailSectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1f2937', marginBottom: 10 },
  detailRow: { marginBottom: 12 },
  detailFieldLabel: { fontSize: 9, color: '#6b7280', marginBottom: 3 },
  detailFieldValue: { fontSize: 10, color: '#111827',lineHeight:1.7 },
  detailColumns: { flexDirection: 'row', gap: 12 },
  detailCol: { width: '50%' },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(d: string | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB');
}

function formatMoney(val: number, sym: string): string {
  return sym + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function safeStr(v: any): string {
  return v ? String(v) : '';
}

async function toDataUrl(src: string): Promise<string> {
  return new Promise(resolve => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve('');
      }
    };
    image.onerror = () => resolve('');
    // Cache-bust to avoid opaque cached responses blocking canvas taint
    image.src = src.startsWith('http') ? `${src}${src.includes('?') ? '&' : '?'}_cb=${Date.now()}` : src;
  });
}

async function collectImageDataUrls(data: any): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const lineItems: any[] = data?.line_items || [];

  const urls = new Set<string>();
  urls.add('/studio.jpeg');
  urls.add('/product-placeholder-wp.jpg');
  lineItems.forEach((item: any) => {
    const img =
      item.product?.images?.find((i: any) => i.is_primary)?.image ||
      item.product?.images?.[0]?.image;
    if (img) urls.add(img);
  });

  await Promise.all(
    Array.from(urls).map(async url => {
      const dataUrl = await toDataUrl(url);
      if (dataUrl) map.set(url, dataUrl);
    })
  );

  return map;
}

// ---------------------------------------------------------------------------
// React PDF Document component
// ---------------------------------------------------------------------------
function PdfDocument({ data, type, currencySymbol, images }: { data: any; type: PdfType; currencySymbol: string; images: Map<string, string> }) {
  const resolveImg = (src: string | undefined | null) => images.get(src ?? '') || images.get('/product-placeholder-wp.jpg') || '/product-placeholder-wp.jpg';
  const logoSrc = images.get('/studio.jpeg') || '/studio.jpeg';
  const isInvoice = type === 'invoice';
  const docTitle = isInvoice ? 'Invoice' : 'Purchase Order';
  const docNumber = isInvoice ? data?.display_invoice : data?.display_po;
  const lineItems: any[] = data?.line_items || [];
  const subtotal = (data?.total_amount || 0) - (data?.delivery_charge || 0);

  return (
    <Document>
      {/* ── Summary page ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.docTitle}>{docTitle}</Text>
            <Text style={s.docNumber}>#{safeStr(docNumber)}</Text>
            <Text style={s.metaText}>Issue Date: {formatDate(data?.date)}</Text>
            <Text style={s.metaText}>Due Date: {formatDate(data?.due_date)}</Text>
            <Text style={s.metaText}>Supplier: {safeStr(data?.supplier?.company_name)}</Text>
            <Text style={s.metaText}>Project: {safeStr(data?.project?.project_name)}</Text>
          </View>
          <View style={s.headerRight}>
            <Image src={logoSrc} style={s.logo} />
            <Text style={s.studioText}>{safeStr(data?.studio?.name)}</Text>
            <Text style={s.studioText}>11 Wilman Rd</Text>
            <Text style={s.studioText}>Tunbridge Wells</Text>
            <Text style={s.studioText}>TN4 9AJ</Text>
            <Text style={s.studioText}>VAT NO: GB423127335</Text>
            <Text style={s.studioText}>{safeStr(data?.studio?.support_email)}</Text>
          </View>
        </View>

        {/* Supplier address */}
        <View style={s.fromSection}>
          <Text style={s.fromName}>{safeStr(data?.supplier?.company_name)}</Text>
          <Text style={s.fromAddress}>{safeStr(data?.supplier?.address)}</Text>
        </View>

        {/* Table header */}
        <View style={s.tableHeaderRow}>
          <View style={s.colImg}><Text style={s.tableHeaderCell}>IMG</Text></View>
          <View style={s.colDesc}><Text style={s.tableHeaderCell}>Description</Text></View>
          <View style={s.colDim}><Text style={s.tableHeaderCell}>Dimensions</Text></View>
          <View style={s.colQty}><Text style={[s.tableHeaderCell, { textAlign: 'center' }]}>QTY</Text></View>
          <View style={s.colPrice}><Text style={[s.tableHeaderCell, { textAlign: 'right' }]}>Price</Text></View>
          <View style={s.colAmount}><Text style={[s.tableHeaderCell, { textAlign: 'right' }]}>Amount</Text></View>
        </View>

        {/* Line items */}
        {lineItems.map((item: any, idx: number) => {
          const itemImg =
            item.product?.images?.find((i: any) => i.is_primary)?.image ||
            item.product?.images?.[0]?.image;
          const unitPrice = parseFloat(item.unit_price || 0);
          const total = parseFloat(item.total || 0);
          const dims = safeStr(data?.product_details_enriched?.[idx]?.product_dimensions) || '-';

          return (
            <View key={item.id ?? idx} style={s.tableRow}>
              <View style={s.colImg}>
                <Image src={resolveImg(itemImg)} style={s.productImg} />
              </View>
              <View style={s.colDesc}>
                <Text style={s.tableCell}>{safeStr(item.description || item.product?.name)}</Text>
              </View>
              <View style={s.colDim}>
                <Text style={s.tableCell}>{dims}</Text>
              </View>
              <View style={s.colQty}>
                <Text style={[s.tableCell, { textAlign: 'center' }]}>{safeStr(item.quantity)}</Text>
              </View>
              <View style={s.colPrice}>
                <Text style={[s.tableCell, { textAlign: 'right' }]}>{formatMoney(unitPrice, currencySymbol)}</Text>
              </View>
              <View style={s.colAmount}>
                <Text style={[s.tableCell, { textAlign: 'right' }]}>{formatMoney(total, currencySymbol)}</Text>
              </View>
            </View>
          );
        })}

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>{formatMoney(subtotal, currencySymbol)}</Text>
            </View>
            {data?.delivery_charge > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Delivery Charge</Text>
                <Text style={s.totalsValue}>{formatMoney(data.delivery_charge, currencySymbol)}</Text>
              </View>
            )}
            <View style={[s.totalsRow, s.totalsDivider]}>
              <Text style={[s.totalsLabel, s.totalsBold]}>TOTAL</Text>
              <Text style={[s.totalsValue, s.totalsBold]}>{formatMoney(data?.total_amount || 0, currencySymbol)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery */}
        <View style={s.deliveryBox}>
          <Text style={s.deliveryTitle}>Delivery Address</Text>
          <Text style={s.deliveryText}>
            {safeStr(data?.project?.delivery_address || data?.project?.location) || '-'}
          </Text>
        </View>
      </Page>

      {/* ── Per-product detail pages ── */}
      {lineItems.map((item: any, idx: number) => {
        const rawImg =
          item.product?.images?.find((i: any) => i.is_primary)?.image ||
          item.product?.images?.[0]?.image;
        const pd = data?.product_details_enriched?.[idx];

        return (
          <Page key={item.id ?? idx} size="A4" style={s.detailPage}>
            <Text style={s.detailProjectName}>{safeStr(data?.project?.project_name)}</Text>
            <Text style={s.detailProductName}>{safeStr(item.product?.name || item.description)}</Text>

            <View style={s.detailGrid}>
              {/* Image */}
              <View>
                <Image src={resolveImg(rawImg)} style={s.detailImage} />
              </View>

              {/* Right column */}
              <View style={s.detailRight}>
                {/* Product Specs */}
                <Text style={s.detailSectionTitle}>Product Specs</Text>
                <View style={s.detailColumns}>
                  <View style={s.detailCol}>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Product Name</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.product_name || item.product?.name)}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Product Dimensions</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.product_dimensions) || '-'}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Quantity</Text>
                      <Text style={s.detailFieldValue}>{safeStr(item.quantity)}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Unit Price</Text>
                      <Text style={s.detailFieldValue}>
                        {formatMoney(parseFloat(item.unit_price || 0), currencySymbol)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contact */}
                <Text style={[s.detailSectionTitle, { marginTop: 12 }]}>Contact Information</Text>
                <View style={s.detailColumns}>
                  <View style={s.detailCol}>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Supplier Name</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.supplier_name || data?.supplier?.company_name)}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Supplier Contact</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.supplier_contact_person || data?.supplier?.name)}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Phone</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.supplier_phone || data?.supplier?.phone) || '-'}</Text>
                    </View>
                  </View>
                  <View style={s.detailCol}>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Email Address</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.supplier_email || data?.supplier?.email) || '-'}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailFieldLabel}>Supplier Address</Text>
                      <Text style={s.detailFieldValue}>{safeStr(pd?.supplier_address || data?.supplier?.address) || '-'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePdfDownload(): UsePdfDownloadReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | number | null>(null);

  const downloadPdf = useCallback(async (id: string | number, type: PdfType) => {
    setIsGenerating(true);
    setGeneratingId(id);

    const generate = async () => {
      const [data] = await Promise.all([
        fetchData(
          type === 'po'
            ? `/finance/purchase-orders/${id}/download/`
            : `finance/invoices/${id}/`
        ),
        new Promise(r => setTimeout(r, 2000)),
      ]);

      const currencySymbol = getCurrencySymbol(data?.currency);
      const images = await collectImageDataUrls(data);

      const doc = <PdfDocument data={data} type={type} currencySymbol={currencySymbol} images={images} />;
      const blob = await pdf(doc).toBlob();

      const isInvoice = type === 'invoice';
      const docNumber = isInvoice ? data?.display_invoice : data?.display_po;
      const projectName = data?.project?.project_name || 'document';
      const filename = `${projectName} - ${docNumber}.pdf`;

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);

      return filename;
    };

    const promise = generate();

    gooeyToast.promise(promise, {
      loading: 'Generating PDF...',
      success: (filename) => `Generated`,
      error: 'Failed to generate PDF',
      description: {
        success: 'Your PDF is ready and downloading.',
        error: 'Please try again.',
      },
    });

    try {
      await promise;
    } catch {
      // error surfaced via gooeyToast.promise
    } finally {
      setIsGenerating(false);
      setGeneratingId(null);
    }
  }, []);

  return { downloadPdf, isGenerating, generatingId };
}
