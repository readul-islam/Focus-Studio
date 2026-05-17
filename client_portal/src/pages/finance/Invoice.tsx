import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader, X, ArrowLeft, FileText } from 'lucide-react';
import logo from '/public/images/studio.jpeg';
import placeHolder from '/public/images/product-placeholder-wp.jpg';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/getCurrencySymbol';

// Inline StatusBadge component
const StatusBadge = ({ status, label, className }: { status: string; label: string; className?: string }) => {
  return (
    <Badge variant="outline" className={`font-medium border ${className}`}>
      {label}
    </Badge>
  );
};

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'DFT' },
  { label: 'Sent', value: 'SNT' },
  { label: 'Approved', value: 'APR' },
  { label: 'Paid', value: 'PD' },
  { label: 'Overdue', value: 'OVD' },
];

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading: invoiceLoading } = useFetch(`client_portal/invoices/${id}/`);
  const { currency: currencyDetails } = useCurrency(invoiceData?.currency);

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PD': // Paid
        return 'bg-[#A8E2EC] text-[#2C96A8] border-[#7FCEDC]';

      case 'DFT': // Draft
      case 'NE': // New
        return 'bg-orange-100 text-orange-900 border-orange-300';

      case 'SNT': // Sent
        return 'bg-[#DAEAFD] text-[#3556BB] border-[#B5D4F9]';

      case 'APR': // Approved
      case 'RCV': // Received
        return 'bg-[#C5E7D9] text-green-900 border-[#98D2BD]';

      case 'OVD': // Overdue
        return 'bg-red-100 text-red-900 border-red-300';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (invoiceLoading || !invoiceData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2">Loading invoice...</span>
      </div>
    );
  }

  const currencySymbol = currencyDetails?.symbol || invoiceData?.currency || '£';
  const totalAmount = parseFloat(invoiceData?.total_amount || '0');

  // Calculate subtotal from line items if available, otherwise use total
  const subTotalNum = invoiceData?.line_items?.reduce((total: number, item: any) => {
    const amount = parseFloat(String(item?.unit_price || 0));
    return total + amount * (item.quantity || 1);
  }, 0) || totalAmount;

  const deliveryCharge = parseFloat(invoiceData?.delivery_charge || '0');

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl p-4 md:p-6 rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
          {/* Back/Close Button */}
          <div className="flex justify-start -mt-2 -ml-2 mb-2">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="p-2 md:py-2 md:px-4 h-auto hover:bg-gray-100 text-gray-600 rounded-full transition-colors cursor-pointer"
            >
              <div className="hidden md:flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Back</span>
              </div>
              <div className="md:hidden">
                <X className="w-6 h-6" />
              </div>
            </Button>
          </div>
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-gray-900 font-semibold mb-1 text-xl">Invoice Details</h1>
              <h2 className="text-base font-semibold text-gray-900">#{invoiceData?.invoice_number}</h2>
              <div className="my-4 md:my-8 text-xs md:text-sm leading-[180%] text-gray-600">
                Issue Date : {invoiceData?.date ? new Date(invoiceData.date).toLocaleDateString('en-GB') : '-'}<br />
                Due Date : {invoiceData?.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-GB') : '-'}<br />
                {/* Only show Client/Project if available */}
                {invoiceData?.client && (
                  <>Client : {invoiceData?.client?.company_name || `${invoiceData?.client?.name} ${invoiceData?.client?.surname}` || '-'}<br /></>
                )}
                {invoiceData?.project && (
                  <>Project : {invoiceData?.project?.project_name || '-'}</>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <img alt="Studio Logo" src={logo} className="w-16 h-16 md:w-[90px] md:h-[90px] mb-4 object-contain" />
              <p className="text-gray-600 font-medium text-xs md:text-sm leading-[150%] text-left md:text-right">
                Manifest Designs Ltd t/a Souq.Studio <br /> Sandstones <br /> Langton Rd <br /> Tunbridge Wells <br /> TN3 0JU <br />
                VAT NO: GB423127335 <br />
                hello@souqdesign.co.uk
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-2">
              <Label className="text-gray-500">Issue Date</Label>
              <div className="font-medium text-gray-900">
                {invoiceData?.date ? new Date(invoiceData.date).toLocaleDateString('en-GB') : '-'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500">Due Date</Label>
              <div className="font-medium text-gray-900">
                {invoiceData?.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-GB') : '-'}
              </div>
            </div>
          </div>

          <Separator />

          {invoiceData?.project && (
            <div className="space-y-2">
              <Label className="text-gray-500">Project</Label>
              <div className="font-medium text-gray-900">
                {invoiceData?.project?.project_name || '-'}
              </div>
            </div>
          )}

          {invoiceData?.client && (
            <div className="space-y-2">
              <Label className="text-gray-500">Client</Label>
              <div className="font-medium text-gray-900">
                {invoiceData?.client?.company_name || `${invoiceData?.client?.name} ${invoiceData?.client?.surname}` || '-'}
              </div>
            </div>
          )}

          {(invoiceData?.project || invoiceData?.client) && <Separator />}

          {/* Line Items - Desktop Table View */}
          {invoiceData?.line_items && invoiceData.line_items.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl overflow-hidden border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-500">Image</th>
                      <th className="p-3 text-left font-medium text-gray-500">Description</th>
                      <th className="p-3 text-center font-medium text-gray-500">Qty</th>
                      <th className="p-3 text-right font-medium text-gray-500">Unit Price</th>
                      <th className="p-3 text-right font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoiceData.line_items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="p-3 w-[80px]">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                            {item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image ? (
                              <img className="w-full h-full object-cover" src={item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image} alt="Product" />
                            ) : (
                              <img className="w-full h-full object-cover" src={placeHolder} alt="Placeholder" />
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{item.description}</p>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {currencySymbol}
                          {parseFloat(item.unit_price || '0').toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {currencySymbol}
                          {((parseFloat(item.unit_price || '0') * (item.quantity || 1))).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}

                    {/* FFNE Row if exists */}
                    {(invoiceData?.ffne && Number(invoiceData.ffne) > 0) && (
                      <tr>
                        <td className="p-3"></td>
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{invoiceData?.ffne_desc || 'FFNE'}</p>
                        </td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right">
                          {currencySymbol}
                          {Number(invoiceData.ffne).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {currencySymbol}
                          {Number(invoiceData.ffne).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {invoiceData.line_items.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image ? (
                          <img className="w-full h-full object-cover" src={item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image} alt="Product" />
                        ) : (
                          <img className="w-full h-full object-cover" src={placeHolder} alt="Placeholder" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm mb-2">{item.description}</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Qty:</span>
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unit Price:</span>
                            <span className="font-medium">
                              {currencySymbol}
                              {parseFloat(item.unit_price || '0').toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200">
                            <span>Amount:</span>
                            <span className="font-semibold text-gray-900">
                              {currencySymbol}
                              {((parseFloat(item.unit_price || '0') * (item.quantity || 1))).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* FFNE Card if exists */}
                {(invoiceData?.ffne && Number(invoiceData.ffne) > 0) && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <p className="font-medium text-gray-900 text-sm mb-2">{invoiceData?.ffne_desc || 'FFNE'}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Qty:</span>
                        <span className="font-medium">1</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span>Amount:</span>
                        <span className="font-semibold text-gray-900">
                          {currencySymbol}
                          {Number(invoiceData.ffne).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Status Section */}
          <div className="pt-4 md:pt-6 mt-6 md:mt-8">
            <div className="grid grid-cols-1 gap-4">
              <div className='flex items-center gap-4 md:gap-10'>
                <Label className="font-normal block text-gray-900 text-sm md:text-sm">
                  Status :
                </Label>
                <div className="flex items-center">
                  <StatusBadge
                    status={invoiceData?.status}
                    label={STATUS_OPTIONS.find(o => o.value === invoiceData?.status)?.label || invoiceData?.status}
                    className={getStatusStyle(invoiceData?.status)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span>{currencySymbol}{subTotalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charge:</span>
                  <span>{currencySymbol}{deliveryCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total:</span>
                <span>{currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Trade Invoices */}
          {invoiceData?.trade_invoices && invoiceData.trade_invoices.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Trade Invoices :</h3>
              <div className="space-y-2">
                {invoiceData.trade_invoices.map((ti: any, index: number) => (
                  <a
                    key={index}
                    href={ti.trade_invoice}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm  hover:underline"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{ti.trade_invoice.split('/').pop()}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 md:pt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t mt-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase mb-3 md:mb-5">Payment Advance</h2>
              <p className="text-gray-600 font-medium text-xs md:text-sm">
                Manifest Designs Ltd t/a Souq.Studio <br /> Sandstones <br /> Langton Rd <br /> Tunbridge Wells <br /> TN3 0JU <br />
                VAT NO: GB423127335 <br />
                hello@souqdesign.co.uk
              </p>
            </div>
            <div className="w-full md:min-w-[220px] space-y-3 md:space-y-[14px] text-gray-900 text-sm md:text-sm font-medium">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-500">Document Number</p>
                <p className="text-right">{invoiceData?.invoice_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-500">Amount Due</p>
                <p className="text-right">{currencySymbol}0.00</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-500">Due Date</p>
                <p className="text-right">
                  {invoiceData?.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-GB') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
