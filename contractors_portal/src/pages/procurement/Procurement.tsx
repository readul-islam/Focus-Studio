import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CheckCircle2, ChevronDown, ChevronRight, Filter, Search, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { usePatch } from '@/hooks/usePatch';
import { usePost } from '@/hooks/usePost';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProcurementOverview from './ProcurementOverview.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { Link } from 'react-router-dom';
import { statusColors } from '@/lib/status-colors';
// Unit type mapping
const unitTypeMapping: Record<string, string> = {
  EA: 'EA',
  M: 'M',
  'M^^2': 'M²',
  ST: 'ST',
};

// Status badge helper
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ordered':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Ordered</span>;
    case 'delivered':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Delivered</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span>;
    case 'cancelled':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Cancelled</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unknown</span>;
  }
};

const Procurement = () => {
  const { project: projectData , user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set());
  const { mutate: markViewed } = usePost({
    onSuccess: () => {
      refetch();
    },
  });

  const handleMarkAsViewed = (id: number) => {
    markViewed({
      url: `contractor_portal/procurements/${id}/mark_viewed/?contractor_id=${user?.id}`,
      data: {},
    });
  };

  const {
    data: procurements,
    isLoading: procurementsLoading,
    refetch,
  } = useFetch(`contractor_portal/procurements/?project_id=${projectData?.project_id}&contractor_id=${user?.id}`, {
    enabled: !!projectData?.project_id,
  });

  // const { data: roomTotal, isLoading: roomTotalLoading } = useFetch(
  //   `client_portal/room-totals/?project_id=${projectData?.project_id}`,{
  //     enabled: !!projectData?.project_id
  //   }
  // );

  const { mutate: updateProcurement } = usePatch({
    onSuccess: () => {
      toast.success('Procurement updated successfully');
      refetch();
    },
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateProcurement({
      url: `/contractor_portal/procurements/${id}/`,
      data: { client_approval: status },
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
        item =>
          item.product_name?.toLowerCase().includes(query) ||
          item.dimension?.toLowerCase().includes(query) ||
          item.room?.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(item => !item.client_approval);
      } else {
        filtered = filtered.filter(item => item.client_approval === statusFilter);
      }
    }

    // Delivery date filter
    if (deliveryFilter !== 'all') {
      if (deliveryFilter === 'scheduled') {
        filtered = filtered.filter(item => item.delivery_date);
      } else if (deliveryFilter === 'unscheduled') {
        filtered = filtered.filter(item => !item.delivery_date);
      }
    }

    return filtered;
  }, [procurements, searchQuery, statusFilter, deliveryFilter]);

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
        {/* <ProcurementOverview roomInfo={roomTotal} isLoading={roomTotalLoading} /> */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-none border-none">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row item-center gap-3">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="APR">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="REJ">Rejected</SelectItem>
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
                    className="bg-red-600 w-full md:w-auto text-white hover:bg-red-800"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">Dimension</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700">Delivery / ETA</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700">Qty / Unit</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {procurementsLoading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div>
                              <Skeleton className="w-32 h-4 mb-1" />
                              <Skeleton className="w-24 h-3" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-24 h-4" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-20 h-6" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-16 h-8 mx-auto" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-20 h-4 ml-auto" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-24 h-4 ml-auto" />
                        </td>
                        <td className="px-4 py-3">
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
                            <p className="text-sm text-neutral-400">Try adjusting your filters or search query</p>
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
                                  {roomName} — {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                </span>
                              </button>
                            </td>
                          </tr>

                          {/* Room Items */}
                          {isExpanded &&
                            items.map(item => (
                              <tr key={item.id} className="hover:bg-neutral-50 transition-colors border-t border-greige-500/10">
                                <td className="px-4 py-3">
                                  <Link
                                    title="Visit Product"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    to={item?.product_url || '#'}
                                    className="flex items-center gap-3"
                                  >
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.product_name}
                                        className="w-12 h-12 flex-shrink-0 rounded-lg object-cover border border-greige-500/30"
                                        onError={e => {
                                          e.currentTarget.src = '/public/product-placeholder-wp.jpg';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-neutral-100 border border-greige-500/30 flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 text-neutral-400" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-sm text-neutral-900">{item.product_name}</div>
                                      <div className="text-xs text-neutral-500">{item.supplier || '—'}</div>
                                    </div>
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">{item.room || roomName}</td>
                                <td className="px-4 py-3 text-sm text-neutral-600">{item.dimension || '—'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                  {item.delivery_date || item.lead_time || item.eta || '—'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-medium text-neutral-900">{item.qty}</span>
                                    <span className="text-xs text-neutral-700">{unitTypeMapping[item.unit] || item.unit}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getStatusBadge(item.status || 'pending')}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2 justify-end">
                                    {item.is_viewed ? (
                                      <span className="inline-flex flex-col items-end">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                          <CheckCircle2 className="w-3 h-3" /> Viewed
                                        </span>
                                        {item.viewed_at && <span className="text-xs text-gray-400 mt-0.5">{item.viewed_at ? new Date(item.viewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>}
                                      </span>
                                    ) : (
                                      <Button
                                        className="px-4 text-xs bg-transparent border text-black hover:bg-emerald-100 hover:text-emerald-800"
                                        onClick={() => handleMarkAsViewed(item.id)}
                                      >
                                        Mark as viewed
                                      </Button>
                                    )}
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
                <p className="text-sm text-neutral-400">Try adjusting your filters or search query</p>
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
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    )}
                  </div>

                  {/* Mobile Items */}
                  {/* Mobile Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pt-2">
                          {items.map(item => (
                            <Card key={item.id} className="border border-greige-500/30 shadow-sm rounded-xl overflow-hidden bg-white">
                              <CardContent className="p-4 space-y-4">
                                {/* Header Row: Image & Title */}
                                <Link target="_blank" rel="noopener noreferrer" to={item?.product_url || '#'} className="flex gap-3">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.product_name}
                                      className="w-16 h-16 rounded-lg object-cover border border-greige-500/30"
                                      onError={e => {
                                        e.currentTarget.src = '/public/product-placeholder-wp.jpg';
                                      }}
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
                                    <span className="block text-xs uppercase tracking-wider text-neutral-500">Room</span>
                                    <span className="text-neutral-700">{item.room || roomName}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs uppercase tracking-wider text-neutral-500">Status</span>
                                    <span className="text-neutral-700">{getStatusBadge(item.status || 'pending')}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs uppercase tracking-wider text-neutral-500">Dimension</span>
                                    <span className="text-neutral-700">{item.dimension || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs uppercase tracking-wider text-neutral-500">Delivery / ETA</span>
                                    <span className="text-neutral-700">{item.delivery_date || item.lead_time || item.eta || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs uppercase tracking-wider text-neutral-500">Qty / Unit</span>
                                    <span className="text-neutral-700">
                                      {item.qty} {unitTypeMapping[item.unit] || item.unit}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                {/* <div className="grid grid-cols-3 gap-2">
                                  <Button
                                    className={`h-8 text-xs ${item.client_approval == 'APR' ? `${statusColors.approved.bg} ${statusColors.approved.text} hover:bg-emerald-200` : 'bg-transparent border text-black hover:bg-emerald-100 hover:text-emerald-800'}`}
                                    onClick={() => handleStatusUpdate(item.id, 'APR')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    className={`h-8 text-xs ${item.client_approval == 'RVW' ? `${statusColors.review.bg} ${statusColors.review.text} hover:bg-yellow-200` : 'bg-transparent border text-black hover:bg-yellow-100 hover:text-yellow-800'}`}
                                    onClick={() => handleStatusUpdate(item.id, 'RVW')}
                                  >
                                    Review
                                  </Button>
                                  <Button
                                    className={`h-8 text-xs ${item.client_approval == 'REJ' ? `${statusColors.rejected.bg} ${statusColors.rejected.text} hover:bg-red-200` : 'bg-transparent border text-black hover:bg-red-100 hover:text-red-800'}`}
                                    onClick={() => handleStatusUpdate(item.id, 'REJ')}
                                  >
                                    Reject
                                  </Button>
                                </div> */}
                                {item.is_viewed ? (
                                  <span className="inline-flex flex-col items-center w-full">
                                    <span className="inline-flex items-center justify-center gap-1 w-full px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                      <CheckCircle2 className="w-3 h-3" /> Viewed
                                    </span>
                                    {item.viewed_at && <span className="text-xs text-gray-400 mt-0.5">{new Date(item.viewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                  </span>
                                ) : (
                                  <Button
                                    className="px-4 w-full text-xs bg-transparent border text-black hover:bg-emerald-100 hover:text-emerald-800"
                                    onClick={() => handleMarkAsViewed(item.id)}
                                  >
                                    Mark as viewed
                                  </Button>
                                )}
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
