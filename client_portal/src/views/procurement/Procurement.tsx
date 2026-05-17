import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChevronDown, ChevronRight, Filter, MoveLeftIcon, Search, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { usePatch } from '@/hooks/usePatch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProcurementOverview from './ProcurementOverview.tsx';
import { AnimatePresence, motion } from "framer-motion";
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { Link } from '@/lib/navigation';
import { statusColors } from '@/lib/status-colors';
// Unit type mapping
const unitTypeMapping: Record<string, string> = {
  'EA': 'EA',
  'M': 'M',
  'M^^2': 'M²',
  'ST': 'ST'
};

const Procurement = () => {
  const { project: projectData } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set());

  const { data: procurements, isLoading: procurementsLoading, refetch } = useFetch(
    `client_portal/procurements/?project_id=${projectData?.project_id}` ,{
      enabled: !!projectData?.project_id
    }
  );
  
  
  const { data: roomTotal, isLoading: roomTotalLoading } = useFetch(
    `client_portal/room-totals/?project_id=${projectData?.project_id}`,{
      enabled: !!projectData?.project_id
    }
  );


  const { mutate: updateProcurement } = usePatch({
    onSuccess: () => {
      toast.success('Procurement updated successfully');
      refetch();
    }
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateProcurement({
      url: `/client_portal/procurements/${id}/`,
      data: { client_approval: status }
    });
  };

  // Toggle room expansion
  const toggleRoom = (roomName: string) => {
    setCollapsedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomName)) {
        newSet.delete(roomName);
      } else {
        newSet.add(roomName);
      }
      return newSet;
    });
  };

  // Filter and search logic
  const filteredProcurements = useMemo(() => {
    if (!procurements) return [];

    let filtered = [...procurements];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(query) ||
          item.dimension?.toLowerCase().includes(query) ||
          item.room?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter((item) => !item.client_approval);
      } else if (statusFilter === 'ordered') {
        filtered = filtered.filter((item) => item.is_ordered);
      } else if (statusFilter === 'not_ordered') {
        filtered = filtered.filter((item) => !item.is_ordered);
      } else {
        filtered = filtered.filter((item) => item.client_approval === statusFilter);
      }
    } else {
      // By default, hide rejected items unless explicitly filtered for
      filtered = filtered.filter((item) => item.client_approval !== 'REJ');
    }

    // Delivery date filter
    if (deliveryFilter !== 'all') {
      if (deliveryFilter === 'scheduled') {
        filtered = filtered.filter((item) => item.delivery_date);
      } else if (deliveryFilter === 'unscheduled') {
        filtered = filtered.filter((item) => !item.delivery_date);
      }
    }

    return filtered;
  }, [procurements, searchQuery, statusFilter, deliveryFilter]);

  // Compute overview data from filtered procurements when a filter is active
  const isFiltered = searchQuery.trim() || statusFilter !== 'all' || deliveryFilter !== 'all';

  const filteredRoomInfo = useMemo(() => {
    if (!isFiltered) return roomTotal;

    const roomMap: Record<string, { room_name: string; room_id: string; total: number; item_count: number }> = {};

    filteredProcurements.forEach((item) => {
      const key = item.room || 'Uncategorized';
      if (!roomMap[key]) {
        roomMap[key] = { room_name: key, room_id: key, total: 0, item_count: 0 };
      }
      roomMap[key].total += item.total_price || 0;
      roomMap[key].item_count += 1;
    });

    const rooms = Object.values(roomMap);
    const grand_total = rooms.reduce((sum, r) => sum + r.total, 0);

    return { rooms, grand_total };
  }, [isFiltered, filteredProcurements, roomTotal]);

  // Group by room
  const groupedByRoom = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    filteredProcurements.forEach(item => {
      const roomName = item.room || 'Uncategorized';
      if (!groups[roomName]) {
        groups[roomName] = [];
      }
      groups[roomName].push(item);
    });

    return groups;
  }, [filteredProcurements]);

  // Calculate subtotal for a room
  const calculateRoomSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };


  return (
    <DashboardLayout>
      <Helmet title="Procurement | TechStyle" />
      <div className="space-y-6">
        <ProcurementOverview roomInfo={filteredRoomInfo} isLoading={roomTotalLoading} />
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Product Proposals</h1>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-none border-none">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row item-center gap-3">
              <div
                className='flex flex-col md:flex-row gap-2 md:gap-4 flex-1'
              >
                                
                                 <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="APR">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="REJ">Rejected</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="not_ordered">Not Ordered</SelectItem>
                </SelectContent>
              </Select>

              {/* Delivery Date Filter */}
              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger className="w-full bg-white md:w-[180px]">
                  <SelectValue placeholder="Delivery status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="unscheduled">Unscheduled</SelectItem>
                </SelectContent>
              </Select>
           </div>
  
             

              {/* Clear Filters */}
             <div>
              {(searchQuery || statusFilter !== 'all' || deliveryFilter !== 'all') && (
                <Button
                 className='bg-red-600 w-full md:w-auto text-white hover:bg-red-800'
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDeliveryFilter('all');
                  }}
                >
                  Clear
                </Button>
              )}
             </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="hidden md:block border border-greige-500/30 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-greige-500/30">
                  <tr>
                    {/* <th className="px-4 py-3 w-10"></th> */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">
                      Dimension
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">
                      Delivery
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700">
                      Qty / Unit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700">
                     Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {procurementsLoading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div>
                              <Skeleton className="w-32 h-4 mb-1" />
                              <Skeleton className="w-24 h-3" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="w-24 h-4" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="w-20 h-6" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="w-16 h-8 mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="w-20 h-4 ml-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="w-24 h-4 ml-auto" />
                        </td>
                         <td className="px-4 py-4">
                          <Skeleton className="w-24 h-4 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : Object.keys(groupedByRoom).length === 0 ? (
                    // Empty state
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag className="h-12 w-12 text-neutral-300" />
                          <p className="text-neutral-500 font-medium">No procurement items found</p>
                          {(searchQuery || statusFilter !== 'all' || deliveryFilter !== 'all') && (
                            <p className="text-sm text-neutral-400">
                              Try adjusting your filters or search query
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Grouped data rows
                    Object.entries(groupedByRoom).map(([roomName, items]) => {
                      const isExpanded = !collapsedRooms.has(roomName);
                      const subtotal = calculateRoomSubtotal(items);
                      
                      return (
                        <>
                          {/* Room Header */}
                          <tr key={`header-${roomName}`} className="bg-white border-t border-greige-500/30">
                            <td colSpan={7} className="px-4 py-3">
                              <button
                                onClick={() => toggleRoom(roomName)}
                                className="flex items-center gap-2 text-left w-full hover:text-neutral-700 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-neutral-600 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                                )}
                                <span className="font-semibold text-neutral-900">
                                  {roomName} — {items.length} {items.length === 1 ? 'Item' : 'Items'} • Subtotal {' '}
                                  <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                                  {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              </button>
                            </td>
                          </tr>

                          {/* Room Items */}
                          {isExpanded && items.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-50 transition-colors border-t border-greige-500/10">
                              {/* <td className="px-4 py-3">
                                <Checkbox />
                              </td> */}
                              <td className="px-4 py-3">
                                <Link title='Visit Product' target="_blank" rel="noopener noreferrer" to={item?.product_url || '#'} className="flex items-center gap-3">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.product_name}
                                      className="w-12 h-12 flex-shrink-0 rounded-lg object-cover border border-greige-500/30"
                                      onError={(e) => {
                                        e.currentTarget.src = '/public/product-placeholder-wp.jpg';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-neutral-100 border border-greige-500/30 flex items-center justify-center">
                                      <ShoppingBag className="h-5 w-5 text-neutral-400" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-sm text-neutral-900">
                                      {item.product_name}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                      {item.supplier || '—'}
                                    </div>
                                  </div>
                                </Link>
                              </td>
                              <td className="px-4 py-3 text-sm text-neutral-600">
                                {item.dimension || '—'}
                              </td>
                                  <td className="px-4 py-3 text-center text-sm text-neutral-600">
                                    {item?.is_ordered && <span className='text-xs border border-[#8fa989] block bg-[#dbe2db]  text-[#646f52] px-2 py-0.5 rounded-full'>Ordered</span> }
                                {item.delivery_date && <span className='block mt-2'>{item?.delivery_date}</span> }
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-sm font-medium text-neutral-900">{item.qty}</span>
                                  <span className="text-xs text-neutral-700">{unitTypeMapping[item.unit] || item.unit}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-neutral-900 tabular-nums">
                                <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                                {item?.unit_price ? item?.unit_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 0}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900 tabular-nums">
                                <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                                {item?.total_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-2">
                                  {/* <StatusBadge status={item.client_approval} /> */}
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      className={`px-4 text-xs ${item.client_approval == 'APR' ? `${statusColors.approved.bg} ${statusColors.approved.text}` : `bg-transparent border ${statusColors.approved.border} text-black hover:${statusColors.approved.bg} hover:${statusColors.approved.text}`}`}
                                      onClick={() => handleStatusUpdate(item.id, 'APR')}
                                    >
                                      Approved
                                    </Button>

                                    <Button
                                      className={`px-4   text-xs ${item.client_approval == 'RVW' ? `${statusColors.review.bg} ${statusColors.review.text}` : `bg-transparent border ${statusColors.review.border} text-black hover:${statusColors.review.bg} hover:${statusColors.review.text}`}`}
                                      onClick={() => handleStatusUpdate(item.id, 'RVW')}
                                    >
                                      Review
                                    </Button>
                                           <Button
                                      className={`px-4   text-xs ${item.client_approval == 'REJ' ? `${statusColors.rejected.bg} ${statusColors.rejected.text}` : `bg-transparent border ${statusColors.rejected.border} text-black hover:${statusColors.rejected.bg} hover:${statusColors.rejected.text}`}`}
                                      onClick={() => handleStatusUpdate(item.id, 'REJ')}
                                    >
                                      Rejected
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile List View */}
        <div className="md:hidden space-y-4">
          {procurementsLoading ? (
             [...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 border border-greige-500/30">
                <div className="flex gap-3 mb-4">
                   <Skeleton className="w-16 h-16 rounded-lg" />
                   <div className="flex-1">
                     <Skeleton className="w-3/4 h-4 mb-2" />
                     <Skeleton className="w-1/2 h-3" />
                   </div>
                </div>
                <Skeleton className="w-full h-8" />
              </Card>
            ))
          ) : Object.keys(groupedByRoom).length === 0 ? (
             <div className="flex flex-col items-center gap-2 py-12 text-center bg-white rounded-xl border border-greige-500/30">
                <ShoppingBag className="h-12 w-12 text-neutral-300" />
                <p className="text-neutral-500 font-medium">No procurement items found</p>
                {(searchQuery || statusFilter !== 'all' || deliveryFilter !== 'all') && (
                  <p className="text-sm text-neutral-400">
                    Try adjusting your filters or search query
                  </p>
                )}
             </div>
          ) : (
            Object.entries(groupedByRoom).map(([roomName, items]) => {
               const isExpanded = !collapsedRooms.has(roomName);
               const subtotal = calculateRoomSubtotal(items);
               
               return (
                 <div key={roomName} className="space-y-2">
                    {/* Mobile Room Header */}
                    <div 
                      onClick={() => toggleRoom(roomName)}
                      className={`bg-white p-3 rounded-xl border border-greige-500/30 flex items-center justify-between shadow-sm cursor-pointer ${isExpanded ? 'sticky top-2 shadow-lg z-10' : ''}`}
                    >
                       <div className="flex flex-col">
                         <span className="font-semibold text-neutral-900 text-sm">{roomName}</span>
                         <span className="text-xs text-neutral-500">
                           {items.length} {items.length === 1 ? 'Item' : 'Items'} • <ViewCurrencySymbol code={projectData?.currency || 'USD'} />{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </span>
                       </div>
                       {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-600" /> : <ChevronRight className="w-4 h-4 text-neutral-600" />}
                    </div>

                    {/* Mobile Items */}
                    {/* Mobile Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 pt-2">
                            {items.map((item) => (
                              <Card key={item.id} className="border border-greige-500/30 shadow-sm rounded-xl overflow-hidden bg-white">
                                
                                <CardContent className="p-4 space-y-4">
                                  {/* Header Row: Image & Title */}
                                  <Link target="_blank" rel="noopener noreferrer" to={item?.product_url || '#'} className="flex gap-3">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.product_name}
                                        className="w-16 h-16 rounded-lg object-cover border border-greige-500/30"
                                        onError={(e) => { e.currentTarget.src = '/public/product-placeholder-wp.jpg'; }}
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-lg bg-neutral-100 border border-greige-500/30 flex items-center justify-center">
                                        <ShoppingBag className="h-6 w-6 text-neutral-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-neutral-900 text-sm truncate">{item.product_name}</div>
                                      <div className="text-xs text-neutral-500 truncate">{item.supplier || 'No Supplier'}</div>
                                    </div>
                                  </Link>

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-2 gap-y-3 text-sm border-t border-greige-500/10 pt-3">
                                    <div>
                                      <span className="block text-xs uppercase tracking-wider text-neutral-500">Dimension</span>
                                      <span className="text-neutral-700">{item.dimension || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="block text-xs uppercase tracking-wider text-neutral-500">Delivery</span>
                                          {item?.is_ordered ? <span className='text-xs border border-[#8fa989] mt-1 inline-block bg-[#dbe2db]  text-[#646f52] px-2 py-0.5 rounded-full'>Ordered</span> : <span className='text-xs border border-[#fecfcf] mt-1 inline-block bg-[#fee2e2]  text-[#bc2626] px-2 py-0.5 rounded-full'>Not Ordered</span> }
                                {item.delivery_date && <span className='block mt-2'>{item?.delivery_date}</span> }
                                    </div>
                                    <div>
                                      <span className="block text-xs uppercase tracking-wider text-neutral-500">Qty / Unit</span>
                                      <span className="text-neutral-700">{item.qty} {unitTypeMapping[item.unit] || item.unit}</span>
                                    </div>
                                    <div>
                                      <span className="block text-xs uppercase tracking-wider text-neutral-500">Unit Price</span>
                                      <span className="text-neutral-700">
                                        <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                                        {item?.unit_price ? item?.unit_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 0}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Total Price */}
                                  <div className="flex justify-between items-center py-2 border-t border-b border-greige-500/10">
                                    <span className="font-medium text-sm text-neutral-900">Total</span>
                                    <span className="font-semibold text-neutral-900">
                                      <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                                      {item?.total_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-3 gap-2">
                                    <Button
                                      className={`h-8 text-xs ${item.client_approval == 'APR' ? `${statusColors.approved.bg} ${statusColors.approved.text}` : `bg-transparent border ${statusColors.approved.border} text-black hover:${statusColors.approved.bg} hover:${statusColors.approved.text}`}`}
                                      onClick={() => handleStatusUpdate(item.id, 'APR')}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      className={`h-8 text-xs ${item.client_approval == 'RVW' ? `${statusColors.review.bg} ${statusColors.review.text}` : `bg-transparent border ${statusColors.review.border} text-black hover:${statusColors.review.bg} hover:${statusColors.review.text}`}`}
                                      onClick={() => handleStatusUpdate(item.id, 'RVW')}
                                    >
                                      Review
                                    </Button>
                                    <Button
                                      className={`h-8 text-xs ${item.client_approval == 'REJ' ? `${statusColors.rejected.bg} ${statusColors.rejected.text}` : `bg-transparent border ${statusColors.rejected.border} text-black hover:${statusColors.rejected.bg} hover:${statusColors.rejected.text}`}`}
                                      onClick={() => handleStatusUpdate(item.id, 'REJ')}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </CardContent>
                                
                              </Card>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               );
            })
          )}
        </div>

        {/* Summary */}
        {!procurementsLoading && filteredProcurements.length > 0 && (
          <div className="flex justify-between items-center text-sm text-neutral-600">
            <p>
              Showing {filteredProcurements.length} of {procurements?.length || 0} items
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Procurement;
