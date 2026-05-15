import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pin, Users, Copy, AlertTriangle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";
import { ViewCurrencySymbol } from "../ViewCurrencySymbol";
import StatusPill from "./StatusPill";
import SampleIcon from "./SampleIcon";
import ApprovalPill from "./ApprovalPill";
import POCell from "./POCell";
import BillingCell from "./BillingCell";
import LogisticsPill from "./LogisticsPill";
import errorImage from "/public/product-placeholder-wp.jpg";

interface ProcurementRowProps {
  item: any;
  items: any; // The group/room
  isChecked: boolean;
  onToggle: (item: any, checked: boolean) => void;
  openProduct: (product: any) => void;
  handleCommentOpen: (item: any) => void;
  handleChangeSample: (item: any, status: string | null, roomId: string) => void;
  handleQtyChange: (item: any, value: any, roomId: string) => void;
  handleChangeUnitType: (item: any, status: string, roomId: string) => void;
  project: any;
  handleChangeLogisticsStatus: (item: any, status: string, roomId: string) => void;
  handleChangeStatus: (item: any, status: string, roomId: string) => void;
  handleClickPO: (itemId: string, roomId: string) => void;
  loadingProductId: string | null;
  loadingProductIdForInv: string | null;
  handleClickInvoice: (po: string, roomId: string) => void;
  handleChangeLogistics: (data: any, id: string, cb?: any) => void;
  handleLeadTimeChange: (item: any, leadTime: string) => void;
  handleTrackingNumberChange: (item: any, trackingNumber: string) => void;
  setDeleteTarget: (target: any) => void;
  setIsDeleteOpen: (isOpen: boolean) => void;
  onShareToContractor: (item: any) => void;
  gridTemplate?: string;
  style?: React.CSSProperties;
}

const ProcurementRow = React.memo<ProcurementRowProps>(({
  item,
  items,
  isChecked,
  onToggle,
  openProduct,
  handleCommentOpen,
  handleChangeSample,
  handleQtyChange,
  handleChangeUnitType,
  project,
  handleChangeLogisticsStatus,
  handleChangeStatus,
  handleClickPO,
  loadingProductId,
  loadingProductIdForInv,
  handleClickInvoice,
  handleChangeLogistics,
  handleLeadTimeChange,
  handleTrackingNumberChange,
  setDeleteTarget,
  setIsDeleteOpen,
  onShareToContractor,
  gridTemplate,
  procurementPermission,
  style
}) => {
  const [qtyConfirmOpen, setQtyConfirmOpen] = useState(false);
  const pendingQtyRef = useRef<string | null>(null);
  const qtyInputRef = useRef<HTMLInputElement | null>(null);
  const originalQty = String(item.quantity ?? 1);

  const handleQtyBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === originalQty) return;
    if (item?.client_approval === 'APR') {
      pendingQtyRef.current = newValue;
      setQtyConfirmOpen(true);
    } else {
      handleQtyChange(item, newValue, items?.id);
    }
  };

  const handleQtyConfirm = () => {
    setQtyConfirmOpen(false);
    if (pendingQtyRef.current !== null) {
      handleQtyChange(item, pendingQtyRef.current, items?.id);
      pendingQtyRef.current = null;
    }
  };

  const handleQtyCancel = () => {
    setQtyConfirmOpen(false);
    if (qtyInputRef.current) {
      qtyInputRef.current.value = originalQty;
    }
    pendingQtyRef.current = null;
  };

   return (
    <>
    <tr
      className={cn(
        "hover:bg-stone-50 transition-colors group even:bg-stone-50/30 border-b border-greige-500/15 last:border-0",
        isChecked && "bg-primary/5 hover:bg-primary/10"
      )}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: gridTemplate,
      }}
    >
      {/* Checkbox */}
      <td className="sticky left-0 z-10 bg-white group-hover:bg-stone-50 px-3 flex items-center justify-center h-full">
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => onToggle(item, checked as boolean)}
        />
      </td>

      {/* Product */}
      <td className="sticky left-10 z-10 bg-white group-hover:bg-stone-50 px-4 flex items-center h-full overflow-hidden">
        <div className="flex items-center gap-3 w-full">
          <button type="button" onClick={() => openProduct(item)} className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg bg-white transition-transform hover:scale-105">
            <ProductImage
              className="w-11 h-11 rounded-lg shadow-sm object-cover border border-greige-500/30 bg-white"
              alt={item?.product?.name || "Product image"}
              src={item?.product?.images?.find((i: any) => i.is_primary)?.image || item?.product?.images?.[0]?.image || errorImage.src}
            />
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={() => openProduct(item)} className="font-semibold text-sm text-neutral-900 hover:text-primary block truncate w-full text-left" title={item?.product?.name}>
              {item?.product?.name}
            </button>
            <div className="text-xs text-neutral-600 truncate">{item?.product?.dimension}</div>
          </div>
        </div>
      </td>

      {/* Pin */}
      <td className="px-1 flex items-center justify-center h-full">
        {item?.status === "IR" && (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[8px] hover:bg-stone-100" onClick={() => handleCommentOpen(item)}>
            <Pin className="w-3.5 h-3.5 text-neutral-400" />
          </Button>
        )}
      </td>

      {/* Supplier + Sample */}
      <td className="px-4 flex flex-col justify-center gap-1 h-full">
        <span className="text-sm text-neutral-700 font-medium truncate">{item?.supplier?.company_name}</span>
        <SampleIcon status={item?.sample} onChange={(s) => handleChangeSample(item, s, items?.id)} />
      </td>

      {/* Qty / Unit */}
      <td className="px-4 flex items-center gap-1.5 h-full">
        <Input
        disabled={!procurementPermission}
          ref={qtyInputRef}
          onBlur={handleQtyBlur}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          type="number"
          defaultValue={item.quantity || 1}
          className="h-8 w-12 disabled:opacity-100 disabled:cursor-not-allowed text-sm px-2 tabular-nums border-greige-500/30 focus-visible:ring-primary"
        />
        <Select  defaultValue={item.unit_type || "EA"} onValueChange={(s) => handleChangeUnitType(item, s, items?.id)}>
          <SelectTrigger disabled={!procurementPermission} className="h-8 w-14 text-sm px-2 border-greige-500/30 focus:ring-primary disabled:opacity-100 disabled:cursor-not-allowed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EA">ea</SelectItem>
            <SelectItem value="M">m</SelectItem>
            <SelectItem value="M^^2">m²</SelectItem>
            <SelectItem value="ST">set</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Item Price */}
      <td className="px-4 flex items-center justify-end text-sm text-neutral-700 h-full tabular-nums">
        <ViewCurrencySymbol code={project?.currency || item?.product?.currency} />
        {(() => {
          const unitPrice = item?.unit_price ? parseFloat(String(item.unit_price).replace(/[^\d.]/g, '')) : 0;
          const price = unitPrice > 0 ? unitPrice : parseFloat(String(item?.product?.tader_price || item?.product?.regular_price || '0').replace(/[^\d.]/g, ''));
          return price.toLocaleString('en-GB', { minimumFractionDigits: 2 });
        })()}
      </td>

      {/* Total Price */}
      <td className="px-4 flex items-center justify-end text-sm font-semibold text-neutral-900 h-full tabular-nums">
        <ViewCurrencySymbol code={project?.currency || item?.product?.currency} />
        {(() => {
          const unitPrice = item?.unit_price ? parseFloat(String(item.unit_price).replace(/[^\d.]/g, '')) : 0;
          const price = unitPrice > 0 ? unitPrice : parseFloat(String(item?.product?.tader_price || item?.product?.regular_price || '0').replace(/[^\d.]/g, ''));
          return (price * (item?.quantity || 1)).toLocaleString('en-GB', { minimumFractionDigits: 2 });
        })()}
      </td>

      {/* Status */}
      <td className="px-4 flex items-center h-full">
        <StatusPill
          value={item?.status}
          onChange={(v) => handleChangeLogisticsStatus(item, v, items?.id)}
          approvedBy={item?.internally_approved_by?.name}
          approvedByImage={item?.internally_approved_by?.profile_picture}
          procurementPermission={procurementPermission}
        />
      </td>

      {/* Approval */}
      <td className="px-4 flex items-center h-full">
        <ApprovalPill procurementPermission={procurementPermission} status={item?.client_approval} onChange={(s) => handleChangeStatus(item, s, items?.id)} />
      </td>

      {/* PO */}
      <td className="px-4 flex items-center h-full">
        <POCell procurementPermission={procurementPermission} item={item} handleClickPO={() => handleClickPO(item?.id, items?.id)} loadingProductId={loadingProductId} />
      </td>

      {/* Billing */}
      <td className="px-4 flex items-center h-full">
        <BillingCell procurementPermission={procurementPermission} clickHandleInvoice={() => handleClickInvoice(item?.po, items?.id)} loadingProductIdForInv={loadingProductIdForInv} item={item} />
      </td>

      {/* Logistics */}
      <td className="px-4 flex items-center h-full">
        <LogisticsPill procurementPermission={procurementPermission} item={item} room={items} handleChangeLogistics={handleChangeLogistics} project={project} />
      </td>

      {/* Lead Time */}
      <td className="px-4 flex items-center h-full">
        <Input
        disabled={!procurementPermission}
          onBlur={(e) => handleLeadTimeChange(item, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          defaultValue={item.lead_time || ""}
          placeholder="e.g. 2-3 weeks"
          className="h-7 disabled:cursor-not-allowed disabled:opacity-100 w-full placeholder:opacity-70 rounded-[12px] text-xs px-2 border-greige-500/30 focus-visible:ring-primary bg-stone-50/50"
        />
      </td>
      
            {/* Tracking */}
      <td className="px-4 flex justify-center items-center h-full">
        {item?.status == 'ORD' ? (
          <div className="flex items-center gap-1 w-full">
            <Input
            disabled={!procurementPermission}
              onBlur={(e) => handleTrackingNumberChange(item, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              defaultValue={item.tracking_number || ""}
              placeholder="e.g. 1Z999AA10123456784"
              className="h-7 disabled:cursor-not-allowed disabled:opacity-100 flex-1 placeholder:opacity-70 rounded-[12px] text-xs px-2 border-greige-500/30 focus-visible:ring-primary bg-stone-50/50"
            />
            {item.tracking_number && (
              <Button
                variant="ghost"
                size='sm'
                className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(item.tracking_number);
                  toast.success("Tracking number copied");
                }}
                title="Copy tracking number"
              >
                <Copy className="w-2 h-2" />
              </Button>
            )}
          </div>
        ) : '-'}
      </td>
      
         <td className="px-4 flex justify-center items-center h-full">
          {item?.contractor_access ? 
          <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#8fa989' }}><Check className="w-2 h-2 text-white" /></span> : '-' }
         </td>

      {/* Actions */}
      <td className="px-2 flex items-center justify-center h-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openProduct(item)}>View details</DropdownMenuItem>
            {/* <DropdownMenuItem>Download PO</DropdownMenuItem> */}
            {/* <DropdownMenuItem>Contact supplier</DropdownMenuItem> */}
           {procurementPermission && <DropdownMenuItem onClick={() => onShareToContractor(item)}>
              <Users className="w-4 h-4 mr-2" />
              Share to Contractor
            </DropdownMenuItem>}
           {procurementPermission &&  <DropdownMenuSeparator />}
            {procurementPermission && <DropdownMenuItem onClick={() => { setDeleteTarget({ id: item.id, roomId: items.id, name: item?.product?.name }); setIsDeleteOpen(true); }} className="text-red-600">Remove</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>

    <Dialog open={qtyConfirmOpen} onOpenChange={setQtyConfirmOpen}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f3e5d0] shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#a2702f]" />
            </div>
            <DialogTitle className="text-base font-semibold text-neutral-900">
              Client-Approved Item
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-neutral-600 leading-relaxed pl-[52px]">
            This item has been approved by the client. Modifying the quantity may affect the agreed scope of work. The client will be notified of this change via an email.
            <br /><br />
            Please ensure any updates have been communicated and agreed upon before proceeding.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleQtyCancel}>Cancel</Button>
          <Button onClick={handleQtyConfirm} className="bg-[#cfb189] hover:bg-[#c5a57a] text-[#fff]">Proceed Anyway</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
});

ProcurementRow.displayName = 'ProcurementRow';
export default ProcurementRow;