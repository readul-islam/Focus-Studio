// Contractor Portal - Mock Data for Development

import {
  ContractorProject,
  ContractorProcurementItem,
  ContractorDrawing,
  ContractorActivity,
  ContractorPortalData,
  TradeType,
  TradeScheduleItem,
  BuilderCoordinationData,
  ProjectContractor,
  ContractorShare,
  ContractorMessage,
} from './types';

export const mockProject: ContractorProject = {
  id: 'proj-001',
  name: 'The Belgravia Residence',
  client_name: 'The Belgravia Residence',
  address: 'Belgravia, London SW1X',
  status: 'active',
  logo_url: '/images/logo.svg',
  created_at: '2024-09-15T10:00:00Z',
};

// All procurement items with proper trade tags
export const mockProcurementItems: ContractorProcurementItem[] = [
  // PLUMBING ITEMS
  {
    id: 'proc-001',
    product_name: 'Italian Marble Tiles - Carrara White',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Master Bathroom',
    status: 'in_transit',
    eta: '2025-02-15',
    quantity: 45,
    notes: 'Handle with care - fragile material. Store in dry area.',
    trade: 'Plumbing',
    updated_at: '2025-01-20T14:30:00Z',
  },
  {
    id: 'proc-005',
    product_name: 'Underfloor Heating System',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Master Bathroom',
    status: 'delivered',
    delivery_date: '2025-01-12',
    quantity: 1,
    notes: 'Delivered to site. Installation scheduled for next week.',
    trade: 'Plumbing',
    updated_at: '2025-01-12T13:00:00Z',
  },
  {
    id: 'proc-007',
    product_name: 'Hansgrohe Shower Valve - Chrome',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Master Bathroom',
    status: 'ordered',
    eta: '2025-02-20',
    quantity: 1,
    notes: 'Thermostatic mixer with diverter. Confirm rough-in dimensions.',
    trade: 'Plumbing',
    updated_at: '2025-01-19T11:00:00Z',
  },
  {
    id: 'proc-008',
    product_name: 'Duravit Wall-Hung Basin',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Guest Bathroom',
    status: 'on_site',
    delivery_date: '2025-01-18',
    quantity: 1,
    notes: 'Ready for installation. Check bracket positions.',
    trade: 'Plumbing',
    updated_at: '2025-01-18T15:00:00Z',
  },
  {
    id: 'proc-009',
    product_name: 'Kitchen Sink - Belfast Style',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Kitchen',
    status: 'ordered',
    eta: '2025-02-25',
    quantity: 1,
    notes: 'Fireclay. Requires strong base support.',
    trade: 'Plumbing',
    updated_at: '2025-01-20T09:00:00Z',
  },

  // ELECTRICAL ITEMS
  {
    id: 'proc-003',
    product_name: 'Designer Pendant Lights - Set of 3',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Living Room',
    status: 'on_site',
    delivery_date: '2025-01-10',
    quantity: 3,
    notes: 'Stored in site container. Ready for install after ceiling finished.',
    trade: 'Electrical',
    updated_at: '2025-01-10T16:45:00Z',
  },
  {
    id: 'proc-010',
    product_name: 'Recessed Downlights - Warm White',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Kitchen',
    status: 'delivered',
    delivery_date: '2025-01-15',
    quantity: 12,
    notes: 'IP65 rated for above sink area.',
    trade: 'Electrical',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'proc-011',
    product_name: 'Smart Dimmer Switches - Brushed Brass',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Living Room',
    status: 'in_transit',
    eta: '2025-02-01',
    quantity: 8,
    notes: 'Lutron Caseta. Requires hub installation.',
    trade: 'Electrical',
    updated_at: '2025-01-22T14:00:00Z',
  },
  {
    id: 'proc-012',
    product_name: 'Wall Sconces - Bedroom',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Bedroom',
    status: 'ordered',
    eta: '2025-02-18',
    quantity: 4,
    notes: 'Bedside reading lights. Adjustable arms.',
    trade: 'Electrical',
    updated_at: '2025-01-19T16:00:00Z',
  },
  {
    id: 'proc-013',
    product_name: 'Under-Cabinet LED Strips',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Kitchen',
    status: 'on_site',
    delivery_date: '2025-01-08',
    quantity: 6,
    notes: '3000K colour temp. Install after cabinets.',
    trade: 'Electrical',
    updated_at: '2025-01-08T12:00:00Z',
  },

  // JOINERY ITEMS
  {
    id: 'proc-002',
    product_name: 'Custom Kitchen Cabinets - Oak',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Kitchen',
    status: 'ordered',
    eta: '2025-02-28',
    quantity: 12,
    notes: 'Lead time 6 weeks. Manufacturing in progress.',
    trade: 'Joinery',
    updated_at: '2025-01-18T09:15:00Z',
  },
  {
    id: 'proc-006',
    product_name: 'Bespoke Vanity Unit',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Guest Bathroom',
    status: 'ordered',
    eta: '2025-03-01',
    quantity: 1,
    notes: 'Custom size. Confirm final measurements before delivery.',
    trade: 'Joinery',
    updated_at: '2025-01-19T10:30:00Z',
  },
  {
    id: 'proc-014',
    product_name: 'Internal Doors - Shaker Style',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Hallway',
    status: 'in_transit',
    eta: '2025-02-05',
    quantity: 8,
    notes: 'Pre-primed. Ready for on-site painting.',
    trade: 'Joinery',
    updated_at: '2025-01-21T11:00:00Z',
  },
  {
    id: 'proc-015',
    product_name: 'Quartz Worktop - Calacatta',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Kitchen',
    status: 'ordered',
    eta: '2025-03-10',
    quantity: 1,
    notes: 'Template after cabinets installed. 10-day lead.',
    trade: 'Joinery',
    updated_at: '2025-01-20T14:00:00Z',
  },
  {
    id: 'proc-016',
    product_name: 'Wardrobe Doors - Mirrored',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Bedroom',
    status: 'delivered',
    delivery_date: '2025-01-17',
    quantity: 4,
    notes: 'Handle with extreme care. Store upright.',
    trade: 'Joinery',
    updated_at: '2025-01-17T09:00:00Z',
  },

  // GENERAL/BUILDER ITEMS
  {
    id: 'proc-004',
    product_name: 'Hardwood Flooring - Havwoods Oak',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Bedroom',
    status: 'installed',
    delivery_date: '2025-01-05',
    quantity: 85,
    notes: 'Installation complete. Awaiting final inspection.',
    trade: 'General',
    updated_at: '2025-01-08T11:20:00Z',
  },
  {
    id: 'proc-017',
    product_name: 'Porcelain Floor Tiles - 600x600',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Kitchen',
    status: 'delivered',
    delivery_date: '2025-01-14',
    quantity: 50,
    notes: 'Rectified edges. Use 2mm spacers.',
    trade: 'General',
    updated_at: '2025-01-14T10:00:00Z',
  },
  {
    id: 'proc-018',
    product_name: 'Paint - Farrow & Ball Skimming Stone',
    product_image: '/product-placeholder-wp.jpg',
    room: 'Living Room',
    status: 'on_site',
    delivery_date: '2025-01-12',
    quantity: 20,
    notes: 'Estate Emulsion. 2 coats required.',
    trade: 'General',
    updated_at: '2025-01-12T11:00:00Z',
  },
];

// All drawings with proper trade tags
export const mockDrawings: ContractorDrawing[] = [
  // PLUMBING DRAWINGS
  {
    id: 'draw-001',
    name: 'Master Bathroom - Plumbing Layout',
    file_url: '/drawings/master-bath-plumbing.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev C',
    uploaded_at: '2025-01-15T09:00:00Z',
    revised_at: '2025-01-20T14:00:00Z',
    file_type: 'pdf',
    file_size: 2450000,
    room: 'Master Bathroom',
    trade: 'Plumbing',
    surveyed: false,
  },
  {
    id: 'draw-004',
    name: 'Guest Bathroom - Plumbing Schematic',
    file_url: '/drawings/guest-bath-plumbing.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev A',
    uploaded_at: '2025-01-18T10:00:00Z',
    file_type: 'pdf',
    file_size: 1500000,
    room: 'Guest Bathroom',
    trade: 'Plumbing',
    surveyed: false,
  },
  {
    id: 'draw-007',
    name: 'Kitchen - Water Supply & Waste',
    file_url: '/drawings/kitchen-plumbing.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev B',
    uploaded_at: '2025-01-12T09:00:00Z',
    file_type: 'pdf',
    file_size: 1800000,
    room: 'Kitchen',
    trade: 'Plumbing',
    surveyed: true,
    surveyed_at: '2025-01-14T10:00:00Z',
    surveyed_by: 'Steve Plumber',
  },

  // ELECTRICAL DRAWINGS
  {
    id: 'draw-002',
    name: 'Kitchen - Electrical Layout',
    file_url: '/drawings/kitchen-electrical.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev B',
    uploaded_at: '2025-01-10T11:30:00Z',
    file_type: 'pdf',
    file_size: 1800000,
    room: 'Kitchen',
    trade: 'Electrical',
    surveyed: true,
    surveyed_at: '2025-01-12T10:00:00Z',
    surveyed_by: 'John Smith',
  },
  {
    id: 'draw-008',
    name: 'Living Room - Lighting Plan',
    file_url: '/drawings/living-lighting.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev A',
    uploaded_at: '2025-01-08T14:00:00Z',
    file_type: 'pdf',
    file_size: 2100000,
    room: 'Living Room',
    trade: 'Electrical',
    surveyed: false,
  },
  {
    id: 'draw-009',
    name: 'Bedroom - Socket & Switch Positions',
    file_url: '/drawings/bedroom-electrical.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev A',
    uploaded_at: '2025-01-09T11:00:00Z',
    file_type: 'pdf',
    file_size: 1600000,
    room: 'Bedroom',
    trade: 'Electrical',
    surveyed: true,
    surveyed_at: '2025-01-11T09:00:00Z',
    surveyed_by: 'John Smith',
    survey_notes: 'All positions confirmed. Double sockets at bed heads.',
  },

  // JOINERY DRAWINGS
  {
    id: 'draw-003',
    name: 'Kitchen - Cabinet Elevations',
    file_url: '/drawings/kitchen-cabinets.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev A',
    uploaded_at: '2025-01-08T15:00:00Z',
    file_type: 'pdf',
    file_size: 3200000,
    room: 'Kitchen',
    trade: 'Joinery',
    surveyed: true,
    surveyed_at: '2025-01-09T09:30:00Z',
    surveyed_by: 'Mike Johnson',
    survey_notes: 'All dimensions confirmed. Ready to proceed.',
  },
  {
    id: 'draw-010',
    name: 'Bedroom - Wardrobe Details',
    file_url: '/drawings/bedroom-wardrobes.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev B',
    uploaded_at: '2025-01-14T10:00:00Z',
    file_type: 'pdf',
    file_size: 2800000,
    room: 'Bedroom',
    trade: 'Joinery',
    surveyed: false,
  },
  {
    id: 'draw-011',
    name: 'Guest Bathroom - Vanity Detail',
    file_url: '/drawings/guest-vanity.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev A',
    uploaded_at: '2025-01-16T09:00:00Z',
    file_type: 'pdf',
    file_size: 1400000,
    room: 'Guest Bathroom',
    trade: 'Joinery',
    surveyed: false,
  },

  // GENERAL/BUILDER DRAWINGS
  {
    id: 'draw-005',
    name: 'Bedroom - Floor Finish Layout',
    file_url: '/drawings/bedroom-flooring.dwg',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev B',
    uploaded_at: '2025-01-05T08:00:00Z',
    revised_at: '2025-01-14T16:30:00Z',
    file_type: 'dwg',
    file_size: 4500000,
    room: 'Bedroom',
    trade: 'General',
    surveyed: true,
    surveyed_at: '2025-01-06T11:00:00Z',
    surveyed_by: 'Tom Williams',
  },
  {
    id: 'draw-012',
    name: 'Kitchen - Floor Tile Layout',
    file_url: '/drawings/kitchen-tiles.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev A',
    uploaded_at: '2025-01-10T14:00:00Z',
    file_type: 'pdf',
    file_size: 1900000,
    room: 'Kitchen',
    trade: 'General',
    surveyed: true,
    surveyed_at: '2025-01-12T15:00:00Z',
    surveyed_by: 'Tom Williams',
    survey_notes: 'Tile layout approved. Starting from centre.',
  },
  {
    id: 'draw-013',
    name: 'Paint Schedule - All Rooms',
    file_url: '/drawings/paint-schedule.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev C',
    uploaded_at: '2025-01-18T11:00:00Z',
    file_type: 'pdf',
    file_size: 800000,
    room: 'All',
    trade: 'General',
    surveyed: false,
  },
  // Demo documents for contractor portal
  {
    id: 'draw-doc-001',
    name: 'Project Specification Document.pdf',
    file_url: '/documents/project-spec.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'v1.0',
    uploaded_at: '2025-01-20T14:00:00Z',
    file_type: 'pdf',
    file_size: 2800000,
    room: 'Documentation',
    trade: 'General',
    surveyed: false,
  },
  {
    id: 'draw-doc-002',
    name: 'Site Photographs - January 2025.zip',
    file_url: '/documents/site-photos-jan-2025.zip',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'v1.0',
    uploaded_at: '2025-01-22T09:30:00Z',
    file_type: 'other',
    file_size: 45000000,
    room: 'Site Documentation',
    trade: 'General',
    surveyed: false,
  },
  {
    id: 'draw-doc-003',
    name: 'Health & Safety Plan.pdf',
    file_url: '/documents/health-safety-plan.pdf',
    thumbnail_url: '/product-placeholder-wp.jpg',
    version: 'Rev B',
    uploaded_at: '2025-01-15T10:15:00Z',
    file_type: 'pdf',
    file_size: 1200000,
    room: 'Safety',
    trade: 'General',
    surveyed: false,
  },
];

export const mockActivities: ContractorActivity[] = [
  {
    id: 'act-001',
    type: 'drawing_revision',
    title: 'Drawing Updated',
    description: 'Master Bathroom - Plumbing Layout updated to Rev C',
    timestamp: '2025-01-20T14:00:00Z',
    read: false,
    related_id: 'draw-001',
  },
  {
    id: 'act-002',
    type: 'procurement_update',
    title: 'Item Status Changed',
    description: 'Italian Marble Tiles now In Transit - ETA 15 Feb',
    timestamp: '2025-01-20T14:30:00Z',
    read: false,
    related_id: 'proc-001',
  },
  {
    id: 'act-003',
    type: 'drawing_added',
    title: 'New Drawing Added',
    description: 'Guest Bathroom - Plumbing Schematic shared with you',
    timestamp: '2025-01-18T10:00:00Z',
    read: true,
    related_id: 'draw-004',
  },
  {
    id: 'act-004',
    type: 'procurement_update',
    title: 'Item Delivered',
    description: 'Underfloor Heating System delivered to site',
    timestamp: '2025-01-12T13:00:00Z',
    read: true,
    related_id: 'proc-005',
  },
  {
    id: 'act-005',
    type: 'status_change',
    title: 'Installation Complete',
    description: 'Hardwood Flooring marked as Installed',
    timestamp: '2025-01-08T11:20:00Z',
    read: true,
    related_id: 'proc-004',
  },
  {
    id: 'act-006',
    type: 'drawing_revision',
    title: 'Drawing Updated',
    description: 'Bedroom - Floor Finish Layout updated to Rev B',
    timestamp: '2025-01-14T16:30:00Z',
    read: true,
    related_id: 'draw-005',
  },
];

// Trade schedule for builder coordination view
export const mockTradeSchedule: TradeScheduleItem[] = [
  {
    trade: 'General',
    contractor_name: 'BuildRight Construction',
    phase: 'rough_in',
    start_date: '2025-01-06',
    end_date: '2025-01-20',
    status: 'complete',
  },
  {
    trade: 'Plumbing',
    contractor_name: 'Premier Plumbing & Heating',
    phase: 'rough_in',
    start_date: '2025-01-15',
    end_date: '2025-01-25',
    status: 'in_progress',
  },
  {
    trade: 'Electrical',
    contractor_name: 'Spark Electrical Services',
    phase: 'rough_in',
    start_date: '2025-01-20',
    end_date: '2025-01-30',
    status: 'pending',
  },
  {
    trade: 'General',
    contractor_name: 'BuildRight Construction',
    phase: 'installation',
    start_date: '2025-02-01',
    end_date: '2025-02-15',
    status: 'pending',
  },
  {
    trade: 'Joinery',
    contractor_name: 'Craftwood Joinery',
    phase: 'installation',
    start_date: '2025-02-15',
    end_date: '2025-03-01',
    status: 'pending',
  },
  {
    trade: 'Plumbing',
    contractor_name: 'Premier Plumbing & Heating',
    phase: 'first_fix',
    start_date: '2025-03-05',
    end_date: '2025-03-12',
    status: 'pending',
  },
  {
    trade: 'Electrical',
    contractor_name: 'Spark Electrical Services',
    phase: 'first_fix',
    start_date: '2025-03-10',
    end_date: '2025-03-18',
    status: 'pending',
  },
  {
    trade: 'General',
    contractor_name: 'BuildRight Construction',
    phase: 'finishing',
    start_date: '2025-03-18',
    end_date: '2025-03-30',
    status: 'pending',
  },
];

// Contractor names by trade
const CONTRACTOR_NAMES: Record<TradeType, string> = {
  Plumbing: 'Premier Plumbing & Heating Ltd',
  Electrical: 'Spark Electrical Services',
  Joinery: 'Craftwood Joinery',
  General: 'BuildRight Construction',
};

// Helper function to get trade-filtered data
export async function getContractorPortalData(
  projectId: string,
  token: string,
  trade?: TradeType
): Promise<ContractorPortalData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // If no trade specified, return ALL items (for builder/GC view)
  const filteredProcurement = trade
    ? mockProcurementItems.filter(item => item.trade === trade)
    : mockProcurementItems;

  const filteredDrawings = trade
    ? mockDrawings.filter(drawing => drawing.trade === trade)
    : mockDrawings;

  const selectedTrade = trade || 'General';

  return {
    project: mockProject,
    procurement_items: filteredProcurement,
    drawings: filteredDrawings,
    activities: mockActivities,
    contractor_name: CONTRACTOR_NAMES[selectedTrade],
    trade: selectedTrade,
    messages: [],
  };
}

// Helper function to get builder coordination data
export async function getBuilderCoordinationData(
  projectId: string,
  token: string
): Promise<BuilderCoordinationData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Get upcoming deliveries (next 2 weeks)
  const upcomingDeliveries = mockProcurementItems.filter(
    item => item.status === 'ordered' || item.status === 'in_transit'
  );

  // Calculate summary per trade
  const tradeSummary = (['Plumbing', 'Electrical', 'Joinery', 'General'] as TradeType[]).map(trade => {
    const tradeItems = mockProcurementItems.filter(item => item.trade === trade);
    return {
      trade,
      total_items: tradeItems.length,
      delivered: tradeItems.filter(i => i.status === 'delivered' || i.status === 'on_site' || i.status === 'installed').length,
      pending: tradeItems.filter(i => i.status === 'ordered' || i.status === 'in_transit').length,
    };
  });

  return {
    project: mockProject,
    trade_schedule: mockTradeSchedule,
    upcoming_deliveries: upcomingDeliveries,
    all_trades_summary: tradeSummary,
  };
}

// Helper function to confirm drawing survey
export async function confirmDrawingSurvey(
  drawingId: string,
  notes?: string
): Promise<{ success: boolean }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // In production, this would POST to the backend
  return { success: true };
}

// ============================================
// PROJECT CONTRACTOR MANAGEMENT (Studio Side)
// ============================================

// Mock project contractors with sharing data
export const mockProjectContractors: ProjectContractor[] = [
  {
    id: 'c1',
    name: "Premier Plumbing & Heating",
    trade: 'Plumbing',
    token: 'plumb-token-123',
    status: 'active',
    created_at: '2025-01-10T09:00:00Z',
    last_accessed: '2025-01-22T14:30:00Z',
    shared_items: [
      {
        id: 'share-001',
        contractor_id: 'c1',
        item_type: 'procurement',
        item_id: 'proc-001',
        item_name: 'Italian Marble Tiles - Carrara White',
        shared_at: '2025-01-15T10:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-15T14:00:00Z',
        view_count: 3,
      },
      {
        id: 'share-002',
        contractor_id: 'c1',
        item_type: 'procurement',
        item_id: 'proc-005',
        item_name: 'Underfloor Heating System',
        shared_at: '2025-01-12T09:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-12T11:00:00Z',
        view_count: 5,
      },
      {
        id: 'share-003',
        contractor_id: 'c1',
        item_type: 'procurement',
        item_id: 'proc-007',
        item_name: 'Hansgrohe Shower Valve - Chrome',
        shared_at: '2025-01-19T11:00:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
      {
        id: 'share-004',
        contractor_id: 'c1',
        item_type: 'procurement',
        item_id: 'proc-008',
        item_name: 'Duravit Wall-Hung Basin',
        shared_at: '2025-01-18T15:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-20T09:00:00Z',
        view_count: 2,
      },
    ],
    shared_drawings: [
      {
        id: 'share-d001',
        contractor_id: 'c1',
        item_type: 'drawing',
        item_id: 'draw-001',
        item_name: 'Master Bathroom - Plumbing Layout',
        shared_at: '2025-01-15T10:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-16T09:00:00Z',
        view_count: 4,
      },
      {
        id: 'share-d002',
        contractor_id: 'c1',
        item_type: 'drawing',
        item_id: 'draw-007',
        item_name: 'Kitchen - Water Supply & Waste',
        shared_at: '2025-01-12T09:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-14T10:00:00Z',
        view_count: 2,
      },
      {
        id: 'share-d011',
        contractor_id: 'c1',
        item_type: 'drawing',
        item_id: 'draw-doc-001',
        item_name: 'Project Specification Document.pdf',
        shared_at: '2025-01-20T14:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-20T16:00:00Z',
        view_count: 1,
      },
      {
        id: 'share-d012',
        contractor_id: 'c1',
        item_type: 'drawing',
        item_id: 'draw-doc-002',
        item_name: 'Site Photographs - January 2025.zip',
        shared_at: '2025-01-22T09:30:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
      {
        id: 'share-d013',
        contractor_id: 'c1',
        item_type: 'drawing',
        item_id: 'draw-doc-003',
        item_name: 'Health & Safety Plan.pdf',
        shared_at: '2025-01-15T10:15:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
    ],
    activities: [
      {
        id: 'act-c1-001',
        type: 'drawing_confirmed',
        title: 'Drawing Confirmed',
        description: 'Confirmed Kitchen - Water Supply & Waste',
        timestamp: '2025-01-14T10:00:00Z',
        read: true,
        related_id: 'draw-007',
      },
      {
        id: 'act-c1-002',
        type: 'portal_accessed',
        title: 'Portal Accessed',
        description: 'Accessed contractor portal',
        timestamp: '2025-01-22T14:30:00Z',
        read: true,
      },
      {
        id: 'act-c1-003',
        type: 'item_viewed',
        title: 'Items Viewed',
        description: 'Viewed 3 procurement items',
        timestamp: '2025-01-20T09:00:00Z',
        read: true,
      },
    ],
    messages: [
      {
        id: 'msg-c1-001',
        contractor_id: 'c1',
        sender: 'studio',
        sender_name: 'Sarah Designer',
        content: 'Hi! Just wanted to confirm the underfloor heating install is scheduled for next Tuesday. Can you confirm you have received all the materials?',
        timestamp: '2025-01-20T10:00:00Z',
        read: true,
      },
      {
        id: 'msg-c1-002',
        contractor_id: 'c1',
        sender: 'contractor',
        sender_name: 'Mike from Premier Plumbing',
        content: 'Yes, all materials received and stored on site. We\'ll be there Tuesday 8am. One question - is the screed dry enough?',
        timestamp: '2025-01-20T14:30:00Z',
        read: true,
      },
      {
        id: 'msg-c1-003',
        contractor_id: 'c1',
        sender: 'studio',
        sender_name: 'Sarah Designer',
        content: 'Great question! Builder confirmed screed has been curing for 3 weeks now, should be good to go. See you Tuesday!',
        timestamp: '2025-01-20T15:00:00Z',
        read: true,
      },
    ],
  },
  {
    id: 'c2',
    name: 'Spark Electrical Services',
    trade: 'Electrical',
    token: 'elec-token-456',
    status: 'active',
    created_at: '2025-01-10T10:00:00Z',
    last_accessed: '2025-01-21T11:00:00Z',
    shared_items: [
      {
        id: 'share-005',
        contractor_id: 'c2',
        item_type: 'procurement',
        item_id: 'proc-003',
        item_name: 'Designer Pendant Lights - Set of 3',
        shared_at: '2025-01-10T16:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-11T09:00:00Z',
        view_count: 2,
      },
      {
        id: 'share-006',
        contractor_id: 'c2',
        item_type: 'procurement',
        item_id: 'proc-010',
        item_name: 'Recessed Downlights - Warm White',
        shared_at: '2025-01-15T10:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-16T14:00:00Z',
        view_count: 1,
      },
      {
        id: 'share-007',
        contractor_id: 'c2',
        item_type: 'procurement',
        item_id: 'proc-011',
        item_name: 'Smart Dimmer Switches - Brushed Brass',
        shared_at: '2025-01-22T14:00:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
    ],
    shared_drawings: [
      {
        id: 'share-d003',
        contractor_id: 'c2',
        item_type: 'drawing',
        item_id: 'draw-002',
        item_name: 'Kitchen - Electrical Layout',
        shared_at: '2025-01-10T11:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-12T10:00:00Z',
        view_count: 3,
      },
      {
        id: 'share-d004',
        contractor_id: 'c2',
        item_type: 'drawing',
        item_id: 'draw-008',
        item_name: 'Living Room - Lighting Plan',
        shared_at: '2025-01-08T14:00:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
      {
        id: 'share-d005',
        contractor_id: 'c2',
        item_type: 'drawing',
        item_id: 'draw-009',
        item_name: 'Bedroom - Socket & Switch Positions',
        shared_at: '2025-01-09T11:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-11T09:00:00Z',
        view_count: 2,
      },
    ],
    activities: [
      {
        id: 'act-c2-001',
        type: 'drawing_confirmed',
        title: 'Drawing Confirmed',
        description: 'Confirmed Kitchen - Electrical Layout',
        timestamp: '2025-01-12T10:00:00Z',
        read: true,
        related_id: 'draw-002',
      },
      {
        id: 'act-c2-002',
        type: 'drawing_confirmed',
        title: 'Drawing Confirmed',
        description: 'Confirmed Bedroom - Socket & Switch Positions',
        timestamp: '2025-01-11T09:00:00Z',
        read: true,
        related_id: 'draw-009',
      },
      {
        id: 'act-c2-003',
        type: 'portal_accessed',
        title: 'Portal Accessed',
        description: 'Accessed contractor portal',
        timestamp: '2025-01-21T11:00:00Z',
        read: true,
      },
    ],
    messages: [
      {
        id: 'msg-c2-001',
        contractor_id: 'c2',
        sender: 'studio',
        sender_name: 'Sarah Designer',
        content: 'Quick heads up - the pendant lights have arrived on site. Please coordinate with builder on ceiling installation timing.',
        timestamp: '2025-01-18T09:00:00Z',
        read: true,
      },
    ],
  },
  {
    id: 'c3',
    name: 'Craftwood Joinery',
    trade: 'Joinery',
    token: 'join-token-789',
    status: 'active',
    created_at: '2025-01-11T09:00:00Z',
    last_accessed: '2025-01-20T16:00:00Z',
    shared_items: [
      {
        id: 'share-008',
        contractor_id: 'c3',
        item_type: 'procurement',
        item_id: 'proc-002',
        item_name: 'Custom Kitchen Cabinets - Oak',
        shared_at: '2025-01-18T09:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-18T14:00:00Z',
        view_count: 4,
      },
      {
        id: 'share-009',
        contractor_id: 'c3',
        item_type: 'procurement',
        item_id: 'proc-006',
        item_name: 'Bespoke Vanity Unit',
        shared_at: '2025-01-19T10:00:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
    ],
    shared_drawings: [
      {
        id: 'share-d006',
        contractor_id: 'c3',
        item_type: 'drawing',
        item_id: 'draw-003',
        item_name: 'Kitchen - Cabinet Elevations',
        shared_at: '2025-01-08T15:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-09T09:30:00Z',
        view_count: 5,
      },
      {
        id: 'share-d007',
        contractor_id: 'c3',
        item_type: 'drawing',
        item_id: 'draw-010',
        item_name: 'Bedroom - Wardrobe Details',
        shared_at: '2025-01-14T10:00:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
    ],
    activities: [
      {
        id: 'act-c3-001',
        type: 'drawing_confirmed',
        title: 'Drawing Confirmed',
        description: 'Confirmed Kitchen - Cabinet Elevations',
        timestamp: '2025-01-09T09:30:00Z',
        read: true,
        related_id: 'draw-003',
      },
      {
        id: 'act-c3-002',
        type: 'item_viewed',
        title: 'Item Viewed',
        description: 'Viewed Custom Kitchen Cabinets - Oak',
        timestamp: '2025-01-18T14:00:00Z',
        read: true,
        related_id: 'proc-002',
      },
    ],
    messages: [
      {
        id: 'msg-c3-001',
        contractor_id: 'c3',
        sender: 'studio',
        sender_name: 'Sarah Designer',
        content: 'Hi! The oak cabinet specs have been finalised. Please review the attached drawings when you get a chance.',
        timestamp: '2025-01-19T11:00:00Z',
        read: true,
      },
      {
        id: 'msg-c3-002',
        contractor_id: 'c3',
        sender: 'contractor',
        sender_name: 'Tom from Craftwood',
        content: 'Thanks Sarah! I\'ve reviewed the kitchen drawings. One question - what finish are we going for on the island unit? Matt or satin?',
        timestamp: '2025-01-19T14:30:00Z',
        read: false,
      },
    ],
  },
  {
    id: 'c4',
    name: 'BuildRight Construction',
    trade: 'General',
    token: 'build-token-000',
    status: 'active',
    created_at: '2025-01-05T09:00:00Z',
    last_accessed: '2025-01-23T09:00:00Z',
    shared_items: [
      {
        id: 'share-010',
        contractor_id: 'c4',
        item_type: 'procurement',
        item_id: 'proc-004',
        item_name: 'Hardwood Flooring - Havwoods Oak',
        shared_at: '2025-01-05T10:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-05T14:00:00Z',
        view_count: 8,
      },
      {
        id: 'share-011',
        contractor_id: 'c4',
        item_type: 'procurement',
        item_id: 'proc-017',
        item_name: 'Porcelain Floor Tiles - 600x600',
        shared_at: '2025-01-14T10:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-14T16:00:00Z',
        view_count: 3,
      },
      {
        id: 'share-012',
        contractor_id: 'c4',
        item_type: 'procurement',
        item_id: 'proc-018',
        item_name: 'Paint - Farrow & Ball Skimming Stone',
        shared_at: '2025-01-12T11:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-12T15:00:00Z',
        view_count: 2,
      },
    ],
    shared_drawings: [
      {
        id: 'share-d008',
        contractor_id: 'c4',
        item_type: 'drawing',
        item_id: 'draw-005',
        item_name: 'Bedroom - Floor Finish Layout',
        shared_at: '2025-01-05T08:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-06T11:00:00Z',
        view_count: 4,
      },
      {
        id: 'share-d009',
        contractor_id: 'c4',
        item_type: 'drawing',
        item_id: 'draw-012',
        item_name: 'Kitchen - Floor Tile Layout',
        shared_at: '2025-01-10T14:00:00Z',
        shared_by: 'Sarah Designer',
        viewed_at: '2025-01-12T15:00:00Z',
        view_count: 3,
      },
      {
        id: 'share-d010',
        contractor_id: 'c4',
        item_type: 'drawing',
        item_id: 'draw-013',
        item_name: 'Paint Schedule - All Rooms',
        shared_at: '2025-01-18T11:00:00Z',
        shared_by: 'Sarah Designer',
        view_count: 0,
      },
    ],
    activities: [
      {
        id: 'act-c4-001',
        type: 'drawing_confirmed',
        title: 'Drawing Confirmed',
        description: 'Confirmed Bedroom - Floor Finish Layout',
        timestamp: '2025-01-06T11:00:00Z',
        read: true,
        related_id: 'draw-005',
      },
      {
        id: 'act-c4-002',
        type: 'drawing_confirmed',
        title: 'Drawing Confirmed',
        description: 'Confirmed Kitchen - Floor Tile Layout',
        timestamp: '2025-01-12T15:00:00Z',
        read: true,
        related_id: 'draw-012',
      },
      {
        id: 'act-c4-003',
        type: 'portal_accessed',
        title: 'Portal Accessed',
        description: 'Accessed contractor portal',
        timestamp: '2025-01-23T09:00:00Z',
        read: true,
      },
    ],
    messages: [
      {
        id: 'msg-c4-001',
        contractor_id: 'c4',
        sender: 'studio',
        sender_name: 'Sarah Designer',
        content: 'Hi BuildRight team! Quick update on the schedule - flooring delivery is confirmed for Monday. Can you ensure the areas are prepped and ready?',
        timestamp: '2025-01-21T09:00:00Z',
        read: true,
      },
      {
        id: 'msg-c4-002',
        contractor_id: 'c4',
        sender: 'contractor',
        sender_name: 'Dave from BuildRight',
        content: 'Thanks for the heads up! We\'ll have all dust and debris cleared by Friday EOD. The screed is cured and ready.',
        timestamp: '2025-01-21T11:30:00Z',
        read: true,
      },
      {
        id: 'msg-c4-003',
        contractor_id: 'c4',
        sender: 'studio',
        sender_name: 'Sarah Designer',
        content: 'Perfect! Also, the paint schedule is now uploaded - please review and let me know if you have any questions about prep or timing.',
        timestamp: '2025-01-22T10:00:00Z',
        read: true,
      },
    ],
  },
];

// Get all contractors for a project (Studio side)
export async function getProjectContractors(
  projectId: string
): Promise<ProjectContractor[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockProjectContractors;
}

// Get a single contractor by ID
export async function getContractorById(
  contractorId: string
): Promise<ProjectContractor | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProjectContractors.find(c => c.id === contractorId) || null;
}

// Share items with a contractor
export async function shareItemsWithContractor(
  contractorId: string,
  itemIds: string[]
): Promise<ContractorShare[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) throw new Error('Contractor not found');

  const newShares: ContractorShare[] = itemIds.map(itemId => {
    const item = mockProcurementItems.find(i => i.id === itemId);
    return {
      id: `share-${Date.now()}-${itemId}`,
      contractor_id: contractorId,
      item_type: 'procurement',
      item_id: itemId,
      item_name: item?.product_name || 'Unknown Item',
      shared_at: new Date().toISOString(),
      shared_by: 'Current User',
      view_count: 0,
    };
  });

  // In production, this would update the backend
  contractor.shared_items.push(...newShares);
  return newShares;
}

// Share drawings with a contractor
export async function shareDrawingsWithContractor(
  contractorId: string,
  drawingIds: string[]
): Promise<ContractorShare[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) throw new Error('Contractor not found');

  const newShares: ContractorShare[] = drawingIds.map(drawingId => {
    const drawing = mockDrawings.find(d => d.id === drawingId);
    return {
      id: `share-d-${Date.now()}-${drawingId}`,
      contractor_id: contractorId,
      item_type: 'drawing',
      item_id: drawingId,
      item_name: drawing?.name || 'Unknown Drawing',
      shared_at: new Date().toISOString(),
      shared_by: 'Current User',
      view_count: 0,
    };
  });

  // In production, this would update the backend
  contractor.shared_drawings.push(...newShares);
  return newShares;
}

// Share files (documents) with a contractor
export async function shareFilesWithContractor(
  contractorId: string,
  files: Array<{ id: string | number; name: string; type: string }>
): Promise<ContractorShare[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) throw new Error('Contractor not found');

  const newShares: ContractorShare[] = files.map(file => ({
    id: `share-file-${Date.now()}-${file.id}`,
    contractor_id: contractorId,
    item_type: 'drawing', // Files are treated as drawings for sharing purposes
    item_id: String(file.id),
    item_name: file.name,
    shared_at: new Date().toISOString(),
    shared_by: 'Current User',
    view_count: 0,
  }));

  // In production, this would update the backend
  contractor.shared_drawings.push(...newShares);
  return newShares;
}

// Remove a share
export async function removeShare(
  contractorId: string,
  shareId: string
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) throw new Error('Contractor not found');

  contractor.shared_items = contractor.shared_items.filter(s => s.id !== shareId);
  contractor.shared_drawings = contractor.shared_drawings.filter(s => s.id !== shareId);

  return { success: true };
}

// Add a new contractor to project
export async function addContractorToProject(
  projectId: string,
  name: string,
  trade: TradeType
): Promise<ProjectContractor> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const newContractor: ProjectContractor = {
    id: `c-${Date.now()}`,
    name,
    trade,
    token: `${trade.toLowerCase()}-token-${Date.now()}`,
    status: 'invited',
    created_at: new Date().toISOString(),
    shared_items: [],
    shared_drawings: [],
    activities: [],
    messages: [],
  };

  mockProjectContractors.push(newContractor);
  return newContractor;
}

// Get contractor portal data (for contractor view) - now filters by shared items
export async function getContractorPortalDataByToken(
  projectId: string,
  token: string
): Promise<ContractorPortalData | null> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const contractor = mockProjectContractors.find(c => c.token === token);
  if (!contractor) return null;

  // Get only shared items
  const sharedItemIds = contractor.shared_items.map(s => s.item_id);
  const sharedDrawingIds = contractor.shared_drawings.map(s => s.item_id);

  const procurement_items = mockProcurementItems.filter(item =>
    sharedItemIds.includes(item.id)
  );

  const drawings = mockDrawings.filter(drawing =>
    sharedDrawingIds.includes(drawing.id)
  );

  return {
    project: mockProject,
    procurement_items,
    drawings,
    activities: contractor.activities,
    contractor_name: contractor.name,
    trade: contractor.trade,
    messages: contractor.messages,
  };
}

// Send a message to a contractor (from studio)
export async function sendMessageToContractor(
  contractorId: string,
  content: string,
  senderName: string = 'Studio'
): Promise<ContractorMessage> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) throw new Error('Contractor not found');

  const newMessage: ContractorMessage = {
    id: `msg-${Date.now()}`,
    contractor_id: contractorId,
    sender: 'studio',
    sender_name: senderName,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  contractor.messages.push(newMessage);
  return newMessage;
}

// Send a message from contractor (for contractor portal)
export async function sendMessageFromContractor(
  token: string,
  content: string
): Promise<ContractorMessage> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const contractor = mockProjectContractors.find(c => c.token === token);
  if (!contractor) throw new Error('Contractor not found');

  const newMessage: ContractorMessage = {
    id: `msg-${Date.now()}`,
    contractor_id: contractor.id,
    sender: 'contractor',
    sender_name: contractor.name,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  contractor.messages.push(newMessage);
  return newMessage;
}

// Get messages for a contractor
export async function getContractorMessages(
  contractorId: string
): Promise<ContractorMessage[]> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) return [];

  return contractor.messages;
}

// Mark messages as read
export async function markMessagesAsRead(
  contractorId: string,
  messageIds: string[]
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const contractor = mockProjectContractors.find(c => c.id === contractorId);
  if (!contractor) throw new Error('Contractor not found');

  contractor.messages.forEach(msg => {
    if (messageIds.includes(msg.id)) {
      msg.read = true;
    }
  });

  return { success: true };
}