import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patchData } from "@/lib/Api";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";
import { ProductDetailSheet } from "../product-detail-sheet";
import { DeleteDialog } from "../DeleteDialog";
import { usePost } from "@/hooks/usePost";
import useDeleteData from "@/hooks/useDelete";
import { ViewCurrencySymbol } from "../ViewCurrencySymbol";
import { ProcurementComment } from "./ProcuremntComment";
import ProcurementRow from "./ProcurementRow";
import { SelectContractorDialog } from '@/components/contractor';
import { useEditGuard } from '@/hooks/useEditGuard';
import { useTranslations } from 'next-intl';

interface ProcurementTableProps {
  setCheckedItems: React.Dispatch<React.SetStateAction<any[]>>;
  checkedItems: any[];
  groupedItems: any;
  project: any;
  loading: boolean;
}

const ProcurementTable = React.memo<ProcurementTableProps>(({
  setCheckedItems,
  checkedItems,
  groupedItems,
  project,
  loading,
  procurementPermission
}: any) => {
  const t = useTranslations('projectProcurementTable');
  const queryClient = useQueryClient();
  const { guard } = useEditGuard('procurement.edit');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | {
    id: string;
    roomId: string;
    name: string;
  }>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [loadingProductIdForInv, setLoadingProductIdForInv] = useState<string | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentItem, setCommentItem] = useState(undefined);
  const [shareToContractorItem, setShareToContractorItem] = useState<any>(null);
  const [contractorPickerOpen, setContractorPickerOpen] = useState(false);

  const handleShareToContractor = useCallback((item: any) => {
    setShareToContractorItem(item);
    setContractorPickerOpen(true);
  }, []);

  const handleContractorSelected = async (contractor: any) => {
    if (!shareToContractorItem) return;
    // The API call is now handled inside SelectContractorDialog
    // Just close the dialog and reset state
    setContractorPickerOpen(false);
    setShareToContractorItem(null);
  };

  const mutation = useMutation({
    mutationFn: patchData,
    onSuccess: () => {
      toast.success(t('statusUpdated'));
      queryClient.refetchQueries({
        queryKey: [`projects/project-procurements/?project_id=${project?.id}`],
      });
    },
    onError: () => {
      toast.error(t('errorTryAgain'));
    },
  });

  const { mutate: deleteMutation } = useDeleteData({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`projects/project-procurements/?project_id=${project?.id}`],
      });
      toast(t('productRemoved'));
    },
    onError: () => {
      toast(t('errorTryAgain'));
    },
  });

  const { mutate: postMutate } = usePost();
  const parentRef = useRef<HTMLDivElement>(null);

  // Initialize expandedRooms only once
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (groupedItems?.type?.length && !hasInitialized.current) {
      const rooms = groupedItems.type.map((item: any) => item.text);
      setExpandedRooms(new Set(rooms));
      hasInitialized.current = true;
    }
  }, [groupedItems]);

  const openProduct = useCallback((item: any) => {
    const displayProduct = item.product || item.catalog_product;
    const updatedItem = {
      ...(displayProduct || item),
      supplier: item.supplier || item.product?.supplier,
      is_from_catalog: Boolean(item.catalog_product || item.is_from_catalog),
    };
    setSelected(updatedItem);
    setOpen(true);
  }, []);

  const handleCheckAll = useCallback((e: any) => {
    const allProducts: any[] = [];
    if (groupedItems?.type && Array.isArray(groupedItems.type)) {
      groupedItems.type.forEach((typeObj: any) => {
        if (typeObj && Array.isArray(typeObj.product)) {
          const productsWithRoomID = typeObj.product.map((product: any) => ({
            ...product,
            roomID: typeObj.id,
          }));
          allProducts.push(...productsWithRoomID);
        }
      });
    }
    setCheckedItems(e.target.checked ? allProducts : []);
  }, [groupedItems, setCheckedItems]);

  const handleChangeStatus = useCallback(guard((item: any, status: string) => {
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { client_approval: status } });
  }), [guard, mutation]);

  const handleChangeLogisticsStatus = useCallback(guard((item: any, status: string) => {
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { status: status } });
  }), [guard, mutation]);

  const handleChangeUnitType = useCallback(guard((item: any, status: string) => {
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { unit_type: status } });
  }), [guard, mutation]);

  const handleChangeSample = useCallback(guard((item: any, status: string | null, roomid: string) => {
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { sample: status } });
  }), [guard, mutation]);

  const handleQtyChange = useCallback(guard((item: any, qty: any) => {
    if (qty < 1 || Number.isNaN(Number(qty))) {
      toast(t('enterValidQty'));
      return;
    }
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { quantity: qty } });
  }), [guard, mutation]);

  const handleLeadTimeChange = useCallback(guard((item: any, leadTime: string) => {
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { lead_time: leadTime } });
  }), [guard, mutation]);

  const handleTrackingNumberChange = useCallback(guard((item: any, trackingNumber: string) => {
    if (trackingNumber.length > 40) {
      toast(t('trackingMaxLength'));
      return;
    }
    mutation.mutate({ url: `projects/procurements/${item.id}/`, data: { tracking_number: trackingNumber } });
  }), [guard, mutation]);

  const toggleRoom = useCallback((room: string) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  }, []);

  const handleChangeLogistics = useCallback(guard((updatedData: any, procurementId: string, done?: any) => {
    mutation.mutate({ url: `projects/procurements/${procurementId}/`, data: updatedData }, { onSettled: () => { if (done) done(); } });
  }), [guard, mutation]);

  const handleClickPO = useCallback(guard((itemId: string) => {
    setLoadingProductId(itemId);
    postMutate(
      { url: `finance/create-po-from-procurement/create_po/`, data: { procurement_ids: [itemId] } },
      {
        onSuccess: () => {
          queryClient.refetchQueries({ queryKey: [`projects/project-procurements/?project_id=${project?.id}`] });
          queryClient.refetchQueries({ queryKey: [`finance/studio-finance/`] });
          setLoadingProductId(null);
          toast.success(t('poCreated'));
        },
        onError: () => setLoadingProductId(null),
      }
    );
  }), [guard, postMutate, queryClient, project?.id]);

  const handleClickInvoice = useCallback(guard((po: string) => {
    setLoadingProductIdForInv(po);
    postMutate(
      { url: `finance/create-invoice/create_invoice/`, data: { po_ids: [po] } },
      {
        onSuccess: () => {
          queryClient.refetchQueries({ queryKey: [`projects/project-procurements/?project_id=${project?.id}`] });
          queryClient.refetchQueries({ queryKey: [`finance/studio-finance/`] });
          setLoadingProductIdForInv(null);
          toast.success(t('invoiceCreated'));
        },
        onError: () => setLoadingProductIdForInv(null),
      }
    );
  }), [guard, postMutate, queryClient, project?.id]);

  const handleDelete = useCallback(guard((itemID: string) => {
    deleteMutation({ url: `/projects/procurements/${itemID}/`, data: undefined });
  }), [guard, deleteMutation]);

  const handleChange = useCallback((item: any, checked: boolean) => {
    setCheckedItems((prev) => checked ? [...prev, item] : prev.filter((i) => i.id !== item.id));
  }, [setCheckedItems]);

  const handleCommentOpen = useCallback((item: any) => {
    setCommentItem(item);
    setCommentOpen(true);
  }, []);

  const flatRows = useMemo(() => {
    if (!groupedItems?.type) return [];
    const rows: any[] = [];
    groupedItems.type.forEach((room: any) => {
      rows.push({ type: 'header', data: room });
      if (expandedRooms.has(room.text)) {
        room.product?.forEach((product: any) => {
          rows.push({ type: 'row', data: product, room: room });
        });
      }
    });
    return rows;
  }, [groupedItems, expandedRooms]);

  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => flatRows[index].type === 'header' ? 48 : 64,
    overscan: 10,
    getItemKey: useCallback((index: number) => {
      const row = flatRows[index];
      if (!row) return index;
      return row.type === 'header' ? `header-${row.data.text}` : `row-${row.data.id}`;
    }, [flatRows]),
  });

  const totalProduct = useMemo(() => {
    return groupedItems?.type?.reduce((sum: number, item: any) => sum + (item.product?.length || 0), 0) || 0;
  }, [groupedItems]);

  const gridTemplate = "40px minmax(200px, 1fr) 60px 170px 120px 110px 100px 190px 120px 180px 180px 190px 100px 160px 160px 80px";

  return (
    <Card className="border border-greige-500/30 shadow-sm overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <div ref={parentRef} className="overflow-auto scrollbar scrollbar-thin max-h-[75vh]">
          <table className="w-full border-separate border-spacing-0" style={{ minWidth: '1200px' }}>
            <thead className="sticky top-0 z-30 bg-stone-50">
              <tr style={{ display: 'grid', gridTemplateColumns: gridTemplate }} className="text-xs font-medium border-b border-greige-500/30">
                <th className="sticky left-0 z-40 bg-stone-50 px-3 py-4 flex items-center justify-center font-normal">
                  <Checkbox
                    checked={checkedItems?.length === totalProduct && totalProduct > 0}
                    onCheckedChange={(checked) => handleCheckAll({ target: { checked } })}
                  />
                </th>
                <th className="sticky left-10 z-40 bg-stone-50 px-4 py-3 flex items-center font-normal text-left">{t('colProduct')}</th>
                <th className="px-1 py-3 flex items-center justify-center font-normal"></th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colSupplier')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colQtyUnit')}</th>
                <th className="px-4 py-3 flex items-center gap-1 justify-end font-normal">{t('colUnit')} <ViewCurrencySymbol code={project?.currency} /></th>
                <th className="px-4 py-3 flex items-center gap-1 justify-end font-normal">{t('colTotal')} <ViewCurrencySymbol code={project?.currency} /></th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colStatus')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colApproval')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colPo')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colBilling')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colLogistics')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colLeadTime')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colTracking')}</th>
                <th className="px-4 py-3 flex items-center font-normal text-left">{t('colContractorAccess')}</th>
                <th className="px-4 py-3 flex items-center justify-center font-normal"></th>
              </tr>
            </thead>
            <tbody 
              style={{
                height: loading ? 'auto' : `${virtualizer.getTotalSize()}px`,
                position: loading ? 'static' : 'relative',
                display: 'block'
              }}
            >
              {loading ? (
                [1, 2, 3, 4, 5, 6, 7].map((item) => (
                  <tr key={item} style={{ display: 'grid', gridTemplateColumns: gridTemplate }} className="border-b border-greige-500/30">
                    <td className="px-3 py-3 flex items-center justify-center">
                      <Skeleton className="w-5 h-5 bg-stone-100 rounded " />
                    </td>
                    <td className="px-4 py-3 flex items-center ">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 bg-stone-100 h-12 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="w-28 bg-stone-100 h-4" />
                          <Skeleton className="w-20 bg-stone-100 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-1 py-1"></td>
                    <td className="px-4 py-3  "><Skeleton className="w-28 bg-stone-100 h-4" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-20 bg-stone-100 h-4" /></td>
                    <td className="px-4 py-3   text-right"><Skeleton className="w-12 bg-stone-100 h-4 ml-auto" /></td>
                    <td className="px-4 py-3   text-right"><Skeleton className="w-16 bg-stone-100 h-4 ml-auto" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-24 bg-stone-100 h-8 rounded-full" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-24 bg-stone-100 h-8 rounded-full" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-12 bg-stone-100 h-4" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-12 bg-stone-100 h-4" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-24 bg-stone-100 h-8 rounded-full" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-24 bg-stone-100 h-8 rounded-full" /></td>
                    <td className="px-4 py-3  "><Skeleton className="w-24 bg-stone-100 h-8 rounded-full" /></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                ))
              ) : (
                virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = flatRows[virtualRow.index];
                  const isHeader = row.type === 'header';

                  if (isHeader) {
                    return (
                      <tr
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="border-b border-greige-500/30 font-medium capitalize z-10 text-[16px]"
                      >
                        <td colSpan={13} className="py-[5px] h-full sticky left-0 bg-white z-20">
                          <div className="bg-neutral-30 w-full h-full border-greige-500/30">
                            <button
                              onClick={() => toggleRoom(row.data.text)}
                              className="w-full h-full flex items-center gap-3 px-6 py-1.5 text-left transition-colors"
                            >
                              {expandedRooms.has(row.data.text) ? (
                                <ChevronDown className="w-4 h-4 text-neutral-600 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                              )}
                              <span className="font-semibold text-neutral-900">
                                 {row.data.text} — {row.data.itemCount} items • Subtotal <ViewCurrencySymbol code={project?.currency} />{row.data.totalPriceFormatted}
                               </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <ProcurementRow
                      key={virtualRow.key}
                      item={row.data}
                      items={row.room}
                      isChecked={!!checkedItems?.find(check => check.id === row.data.id)}
                      onToggle={handleChange}
                      openProduct={openProduct}
                      handleCommentOpen={handleCommentOpen}
                      handleChangeSample={handleChangeSample}
                      handleQtyChange={handleQtyChange}
                      handleChangeUnitType={handleChangeUnitType}
                      project={project}
                      handleChangeLogisticsStatus={handleChangeLogisticsStatus}
                      handleChangeStatus={handleChangeStatus}
                      handleClickPO={handleClickPO}
                      loadingProductId={loadingProductId}
                      loadingProductIdForInv={loadingProductIdForInv}
                      handleClickInvoice={handleClickInvoice}
                      handleChangeLogistics={handleChangeLogistics}
                      handleLeadTimeChange={handleLeadTimeChange}
                      setDeleteTarget={setDeleteTarget}
                      setIsDeleteOpen={setIsDeleteOpen}
                      onShareToContractor={handleShareToContractor}
                      handleTrackingNumberChange={handleTrackingNumberChange}
                      gridTemplate={gridTemplate}
                      procurementPermission={procurementPermission}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    />
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </CardContent>

      <ProductDetailSheet
        open={open}
        onOpenChange={setOpen}
        product={selected}
      />
      
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
          setDeleteTarget(null);
          setIsDeleteOpen(false);
        }}
        title="Remove Product"
        description="Are you sure you want to remove this product? This action cannot be undone."
        itemName={deleteTarget?.name}
        requireConfirmation={false}
        confirmText="Remove"
      />

      <ProcurementComment
        item={commentItem}
        open={commentOpen}
        onOpenChange={setCommentOpen}
      />
      <SelectContractorDialog
        projectId={project?.id}
        isOpen={contractorPickerOpen}
        onClose={() => {
          setContractorPickerOpen(false);
          setShareToContractorItem(null);
        }}
        onSelect={handleContractorSelected}
        procurementId={shareToContractorItem?.id}
        title={shareToContractorItem ? `Share "${shareToContractorItem?.product?.name}" with...` : 'Select Contractor'}
      />
    </Card>
  );
});

ProcurementTable.displayName = 'ProcurementTable';
export default ProcurementTable;