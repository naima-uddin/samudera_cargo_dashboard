// app/warehouse/page.jsx - সম্পূর্ণ ওয়্যারহাউস ম্যানেজমেন্ট সিস্টেম (ফিক্সড ভার্সন)

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getExpectedShipments, 
  receiveShipment, 
  getWarehouseReceipts,
  inspectShipment,
  getReceiptById,
  generateReceiptPDF, 
  formatLocation,
  getConditionDisplayText,
  getConditionColor ,
  deleteWarehouseReceipt
} from '@/services/warehouse';
import { getConsolidationQueue, createConsolidation, addToQueue } from '@/services/consolidation';
import { formatDate } from '@/services/booking';
import { 
  Loader2, Package, Search, Calendar, MapPin, User, 
  X, CheckCircle, Map, AlertTriangle, Save, Boxes,
  Warehouse, Layers, Tag, Hash, Weight, Ruler, AlertOctagon,
  RefreshCw, Eye, Download, Filter, ArrowLeft, ChevronLeft, ChevronRight,
  ClipboardList, ThumbsUp, ThumbsDown, Camera, FileText, Upload, Trash2,
  Home, Clock, Printer, Box, Truck, DollarSign, Plus, Minus, Edit, ChevronDown,
  Ship
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==================== CONSTANTS ====================

// Package Type wise Storage Zone Mapping
const PACKAGE_STORAGE_MAP = {
  'pallet': { zone: 'P', zoneName: 'Pallet Zone', default: 'P-1-1-1', description: 'Heavy duty pallet racking' },
  'crate': { zone: 'C', zoneName: 'Crate Zone', default: 'C-1-1-1', description: 'Wooden crate storage' },
  'wooden_box': { zone: 'W', zoneName: 'Wooden Box Zone', default: 'W-1-1-1', description: 'Wooden box storage area' },
  'carton': { zone: 'A', zoneName: 'General Carton Zone', default: 'A-1-1-1', description: 'Standard carton storage' },
  'box': { zone: 'A', zoneName: 'General Carton Zone', default: 'A-1-1-1', description: 'Standard box storage' },
  'container': { zone: 'L', zoneName: 'Large Container Zone', default: 'L-1-1-1', description: 'Empty container storage' },
  '20ft_container': { zone: 'Y20', zoneName: '20ft Container Yard', default: 'Y20-1-1-1', description: '20ft container parking' },
  '40ft_container': { zone: 'Y40', zoneName: '40ft Container Yard', default: 'Y40-1-1-1', description: '40ft container parking' },
  'loose_cargo': { zone: 'B', zoneName: 'Bulk Cargo Zone', default: 'B-1-1-1', description: 'Bulk cargo storage' },
  'loose_tires': { zone: 'T', zoneName: 'Tire Storage Zone', default: 'T-1-1-1', description: 'Tire storage racks' },
  'envelope': { zone: 'S', zoneName: 'Small Items Zone', default: 'S-1-1-1', description: 'Small parcel storage' }
};

// 🚨 DAMAGE ZONE
const DAMAGE_ZONE = {
  zone: 'DZ',
  zoneName: '🚨 DAMAGE ZONE - Inspection Area',
  default: 'DZ-1-1-1',
  description: 'Damaged goods - Awaiting inspection/disposal'
};

// Default storage
const DEFAULT_STORAGE = { 
  zone: 'G', 
  zoneName: 'General Storage', 
  default: 'G-1-1-1',
  description: 'General purpose storage'
};

// Condition options for receiving
const RECEIVE_CONDITION_OPTIONS = [
  { value: 'Good', label: '✅ Good - No damage', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'Damaged', label: '❌ Damaged - Send to DAMAGE ZONE', color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'Partial', label: '⚠️ Partially Damaged - Send to DAMAGE ZONE', color: 'text-yellow-600', bg: 'bg-yellow-50' }
];

// Condition options for inspection
const INSPECTION_CONDITION_OPTIONS = [
  { value: 'Good', label: '✅ Good - No Issues', color: 'green', icon: ThumbsUp },
  { value: 'Minor Damage', label: '⚠️ Minor Damage', color: 'yellow', icon: AlertTriangle },
  { value: 'Major Damage', label: '❌ Major Damage', color: 'red', icon: ThumbsDown }
];

const DISPOSITION_OPTIONS = [
  { value: 'restock', label: 'Restock - Return to Inventory', icon: Package },
  { value: 'scrap', label: 'Scrap - Dispose', icon: Trash2 },
  { value: 'return', label: 'Return to Supplier', icon: X },
  { value: 'rework', label: 'Rework - Repair', icon: FileText },
  { value: 'quarantine', label: 'Quarantine - Hold', icon: AlertOctagon }
];

// app/warehouse/page.jsx - STATUS_COLORS কনস্ট্যান্ট আপডেট

const STATUS_COLORS = {
    'expected': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expected' },
    'received': { bg: 'bg-green-100', text: 'text-green-700', label: 'Received' },
    'inspected': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Inspected' },
    'consolidated': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Consolidated' },  // ← Add this
    'stored': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Storage' },
    'damaged_report': { bg: 'bg-red-100', text: 'text-red-700', label: 'Damaged' },
    'shortage_report': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Shortage' }
};

const ZONE_COLORS = {
  'P': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'C': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'W': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'A': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'L': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Y20': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Y40': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'B': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'T': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'S': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  'DZ': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'G': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract packages from various data structures
 */
const extractPackages = (item) => {
  if (!item) return [];
  
  // Check different possible package locations
  if (item.packages && Array.isArray(item.packages) && item.packages.length > 0) {
    return item.packages;
  }
  
  if (item.receivedPackages && Array.isArray(item.receivedPackages) && item.receivedPackages.length > 0) {
    return item.receivedPackages;
  }
  
  if (item.shipmentId?.packages && Array.isArray(item.shipmentId.packages) && item.shipmentId.packages.length > 0) {
    return item.shipmentId.packages;
  }
  
  // If no packages found, return a default package based on image data
  // This handles the case from the image where packages array might be empty
  return [{
    packagingType: 'carton',
    quantity: 1,
    weight: 10,
    volume: 0.1,
    description: 'Standard Package',
    condition: 'Good'
  }];
};

/**
 * Calculate totals from packages
 */
const calculateTotals = (item) => {
  const packages = extractPackages(item);
  
  if (!packages || packages.length === 0) {
    return { totalWeight: 0, totalVolume: 0, totalItems: 0, packageCount: 0 };
  }
  
  const packageCount = packages.length;
  let totalWeight = 0;
  let totalVolume = 0;
  let totalItems = 0;
  
  packages.forEach(pkg => {
    const quantity = pkg.quantity || 1;
    totalItems += quantity;
    totalWeight += (pkg.weight || 0) * quantity;
    totalVolume += (pkg.volume || 0) * quantity;
  });
  
  return { totalWeight, totalVolume, totalItems, packageCount };
};

/**
 * Get package types from shipment
 */
const getPackageTypes = (shipment) => {
  const packages = extractPackages(shipment);
  
  if (!packages || packages.length === 0) {
    return ['carton'];
  }
  
  const types = packages.map(p => p.packagingType || p.packageType || 'carton');
  return [...new Set(types)];
};

/**
 * Get suggested storage based on package types and condition
 */
const getSuggestedStorage = (shipment, condition = 'Good') => {
  if (condition === 'Damaged' || condition === 'Partial') {
    return {
      location: DAMAGE_ZONE.default,
      zone: DAMAGE_ZONE.zoneName,
      zoneCode: DAMAGE_ZONE.zone,
      packageTypes: getPackageTypes(shipment),
      description: DAMAGE_ZONE.description,
      isDamageZone: true
    };
  }
  
  const packageTypes = getPackageTypes(shipment);
  
  if (packageTypes.length === 1) {
    const map = PACKAGE_STORAGE_MAP[packageTypes[0]] || DEFAULT_STORAGE;
    return {
      location: map.default,
      zone: map.zoneName,
      zoneCode: map.zone,
      packageTypes: packageTypes,
      description: map.description,
      isDamageZone: false
    };
  } else {
    return {
      location: 'M-1-1-1',
      zone: 'Mixed Storage Zone',
      zoneCode: 'M',
      packageTypes: packageTypes,
      description: 'Multi-type package storage',
      isDamageZone: false
    };
  }
};

const getZoneColorClass = (zoneCode) => {
  return ZONE_COLORS[zoneCode] || ZONE_COLORS['G'];
};

const formatLocationDisplay = (location) => {
  if (!location) return 'Not assigned';
  const parts = location.split('-');
  if (parts.length === 4) {
    return `${parts[0]} • Aisle ${parts[1]} • Rack ${parts[2]} • Bin ${parts[3]}`;
  }
  return location;
};

const isDamagedReceipt = (receipt) => {
  if (!receipt) return false;
  const inspectionCond = (receipt?.inspection?.condition || '').toString().toLowerCase();
  const receivingCond = (receipt?.receivingCondition || '').toString().toLowerCase();
  const receiptCond = (receipt?.condition || '').toString().toLowerCase();
  const status = (receipt?.status || '').toString().toLowerCase();

  // Prefer the most recent inspection/receipt condition (latest history entry)
  const history = getInspectionHistory(receipt);
  const latestHistoryCondition = history.length > 0 ? (history[history.length - 1]?.condition || '').toString().toLowerCase() : '';

  const effectiveCond = latestHistoryCondition || inspectionCond || receivingCond || receiptCond || '';

  if (effectiveCond && effectiveCond !== 'good' && effectiveCond !== 'ok' && effectiveCond !== 'okay') return true;
  if (status && (status === 'damage_reported' || status === 'damaged' || status.includes('damage'))) return true;

  const currentCondition = getCurrentReceiptCondition(receipt);
  return currentCondition && currentCondition.toString().toLowerCase() !== 'good';
};

const getInspectionHistory = (receipt) => {
  if (!receipt) return [];

  const rawHistory = Array.isArray(receipt.inspectionHistory) ? receipt.inspectionHistory : [];
  const normalizedHistory = rawHistory
    .filter(Boolean)
    .map((entry) => ({
      condition: entry.condition || 'Good',
      findings: entry.findings || '',
      disposition: entry.disposition || '',
      conductedAt: entry.conductedAt || entry.createdAt || null,
      conductedBy: entry.conductedBy,
      summary: entry.summary || null
    }));

  if (normalizedHistory.length === 0 && receipt.inspection) {
    normalizedHistory.push({
      condition: receipt.inspection.condition || 'Good',
      findings: receipt.inspection.findings || '',
      disposition: receipt.inspection.disposition || '',
      conductedAt: receipt.inspection.conductedAt || null,
      conductedBy: receipt.inspection.conductedBy,
      summary: receipt.inspection.summary || null
    });
  }

  return normalizedHistory.sort((a, b) => new Date(a.conductedAt || 0) - new Date(b.conductedAt || 0));
};

const getConditionBadgeStyles = (condition) => {
  if (condition === 'Major Damage') {
    return 'bg-red-100 text-red-700';
  }

  if (condition === 'Minor Damage') {
    return 'bg-yellow-100 text-yellow-700';
  }

  return 'bg-green-100 text-green-700';
};

const getConditionTextClass = (condition) => {
  if (condition === 'Major Damage') {
    return 'text-red-700';
  }

  if (condition === 'Minor Damage') {
    return 'text-yellow-700';
  }

  return 'text-green-700';
};

const getCurrentReceiptCondition = (receipt) => {
  const history = getInspectionHistory(receipt);
  const latestHistoryCondition = history.length > 0 ? history[history.length - 1]?.condition : null;
  const rawCondition = (latestHistoryCondition || receipt?.inspection?.condition || receipt?.receivingCondition || receipt?.condition || '').toString().trim();
  const lc = rawCondition.toLowerCase();

  if (!lc || lc === 'good' || lc === 'ok' || lc === 'okay') return 'Good';
  if (lc.includes('major') || lc.includes('major damage') || lc.includes('damaged')) return 'Major Damage';
  if (lc.includes('minor') || lc.includes('minor damage') || lc.includes('partial')) return 'Minor Damage';

  const status = (receipt?.status || '').toString().toLowerCase();
  if (status === 'damage_reported' || status === 'damaged' || status.includes('damage')) return 'Major Damage';

  return rawCondition || 'Good';
};

// ==================== COMPONENTS ====================

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-[#E67E22] text-white' 
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    {children}
  </button>
);

const FilterBar = ({ filters, setFilters, total, placeholder = "Search...", totalLabel = 'items' }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            />
          </div>

          {filters.status !== undefined && (
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="expected">Expected</option>
              <option value="received">Received</option>
              <option value="inspected">Inspected</option>
              <option value="damaged_report">Damaged</option>
            </select>
          )}

          <button
            onClick={() => setFilters({ search: '', status: '' })}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Total: {total} {totalLabel}</span>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingConsolidationModal = ({ isOpen, group, onClose, onSubmit, onReinspect }) => {
  const [containerType, setContainerType] = useState('');
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !group) return null;

  const shipments = group.shipments || [];

  const handleSubmit = async () => {
    if (!containerType) {
      toast.warning('Please select a container type');
      return;
    }

    setSubmitting(true);
    try {
      const selectedShipmentIds = shipments.map((shipment) => shipment._id);
      const receiptIds = shipments
        .map((shipment) => shipment.receiptId || shipment.warehouseReceiptId || shipment.shipmentId?.receiptId)
        .filter(Boolean);

      const result = await createConsolidation({
        groupKey: group.groupKey,
        selectedShipmentIds,
        containerType,
        condition,
        notes,
        mainType: group.mainType,
        subType: group.subType,
        originWarehouse: group.origin,
        destinationPort: group.destination,
        receiptIds
      });

      if (result.success) {
        toast.success(result.message || 'Consolidation created successfully');
        onSubmit?.({
          data: result.data,
          shipmentIds: selectedShipmentIds,
          condition,
          groupKey: group.groupKey
        });
        onClose();
      } else {
        toast.error(result.message || 'Failed to create consolidation');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create consolidation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white">
        <div className="border-b px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Consolidate Pending Shipments</h3>
          <p className="mt-1 text-sm text-gray-500">
            {group.displayName || `${group.origin || 'Unknown'} → ${group.destination || 'Unknown'}`}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Container Type</label>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="">Select container</option>
              <option value="20ft">20ft Standard Container</option>
              <option value="40ft">40ft Standard Container</option>
              <option value="40ft HC">40ft High Cube Container</option>
              <option value="45ft">45ft High Cube Container</option>
              <option value="LCL">LCL - Less than Container Load</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            />
          </div>

          

         
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-[#E67E22] px-4 py-2 text-sm text-white hover:bg-[#d35400] disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Submit & Open Container Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== RECEIVE & INSPECTION MODAL ====================

const WarehouseModal = ({ shipment, receipt, mode, onClose, onComplete }) => {
  const [step, setStep] = useState(mode === 'inspect' ? 'inspection' : 'receive');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Inspection states
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [inspections, setInspections] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [findings, setFindings] = useState('');
  const [disposition, setDisposition] = useState('restock');
  const [packageErrors, setPackageErrors] = useState({});

  // Data to work with
  const data = shipment || receipt;
  const packages = extractPackages(data);

  // Initialize
  useEffect(() => {
    if (mode === 'receive') {
      const suggested = getSuggestedStorage(data, condition);
      setLocation(suggested.location);
      setSelectedPackages(packages.map((_, idx) => idx));
    } else if (mode === 'inspect' && packages.length > 0) {
      if (receipt?.inspection?.details) {
        setInspections(receipt.inspection.details);
        setFindings(receipt.inspection.findings || '');
        setDisposition(receipt.inspection.disposition || 'restock');
      } else {
        const initialInspections = packages.map((pkg, index) => ({
          packageIndex: index,
          condition: pkg.condition || 'Good',
          quantity: pkg.quantity || 1,
          passed: pkg.quantity || 1,
          failed: 0,
          notes: ''
        }));
        setInspections(initialInspections);
      }
    }
  }, [data, mode, condition, receipt, packages]);

  useEffect(() => {
    if (mode === 'receive' && data) {
      const suggested = getSuggestedStorage(data, condition);
      setLocation(suggested.location);
    }
  }, [condition, data, mode]);

  // Toggle package selection
  const togglePackage = (index) => {
    setSelectedPackages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const selectAllPackages = () => {
    setSelectedPackages(packages.map((_, idx) => idx));
  };

  const clearAllPackages = () => {
    setSelectedPackages([]);
  };

  // Inspection handlers
  const handleInspectionChange = (field, value) => {
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }

    const currentPkg = packages[currentPackageIndex];
    const maxQuantity = currentPkg?.quantity || 1;
    
    setInspections(prev => {
      const updated = [...prev];
      
      if (!updated[currentPackageIndex]) {
        updated[currentPackageIndex] = {
          packageIndex: currentPackageIndex,
          condition: 'Good',
          quantity: maxQuantity,
          passed: maxQuantity,
          failed: 0,
          notes: ''
        };
      }

      if (field === 'condition') {
        updated[currentPackageIndex] = {
          ...updated[currentPackageIndex],
          condition: value
        };
      }
      else if (field === 'passed' || field === 'failed') {
        const otherField = field === 'passed' ? 'failed' : 'passed';
        const otherValue = updated[currentPackageIndex]?.[otherField] || 0;
        
        const numValue = parseInt(value) || 0;
        
        if (numValue < 0) return prev;
        if (numValue + otherValue > maxQuantity) return prev;
        
        updated[currentPackageIndex] = {
          ...updated[currentPackageIndex],
          [field]: numValue
        };
      } 
      else if (field === 'notes') {
        updated[currentPackageIndex] = {
          ...updated[currentPackageIndex],
          notes: value
        };
      }
      
      return updated;
    });

    setPackageErrors(prev => ({
      ...prev,
      [currentPackageIndex]: null
    }));
  };

  const handleNext = () => {
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }
    
    if (!inspections[currentPackageIndex]) {
      toast.error('Please fill inspection for this package first');
      const currentPkg = packages[currentPackageIndex];
      if (currentPkg) {
        setInspections(prev => {
          const updated = [...prev];
          updated[currentPackageIndex] = {
            packageIndex: currentPackageIndex,
            condition: 'Good',
            quantity: currentPkg.quantity || 1,
            passed: currentPkg.quantity || 1,
            failed: 0,
            notes: ''
          };
          return updated;
        });
      }
      return;
    }

    const currentInspection = inspections[currentPackageIndex];
    const total = (currentInspection.passed || 0) + (currentInspection.failed || 0);
    const expectedTotal = packages[currentPackageIndex]?.quantity || 1;
    
    if (total !== expectedTotal) {
      setPackageErrors(prev => ({
        ...prev,
        [currentPackageIndex]: `Package ${currentPackageIndex + 1}: Total (${total}) must equal ${expectedTotal}`
      }));
      toast.error(`Quantity mismatch: Total must equal ${expectedTotal}`);
      return;
    }

    setPackageErrors(prev => ({
      ...prev,
      [currentPackageIndex]: null
    }));

    if (currentPackageIndex < packages.length - 1) {
      setCurrentPackageIndex(currentPackageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPackageIndex > 0) {
      setCurrentPackageIndex(currentPackageIndex - 1);
    }
  };

  // Photo handlers
  const handleAddPhoto = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (photoId) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId);
      const removed = prev.find(p => p.id === photoId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return filtered;
    });
  };

  // Submit handlers
  const handleReceiveSubmit = async () => {
    if (!location.trim()) {
      toast.error('Please enter storage location');
      return;
    }
    
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one package to receive');
      return;
    }
    
    setSubmitting(true);
    
    const receiveData = {
      location: location,
      notes: notes,
      packages: selectedPackages.map(idx => ({
        ...packages[idx],
        received: true,
        receivedAt: new Date(),
        condition: condition
      })),
      condition: condition,
      receivedBy: 'warehouse_staff',
      receivedAt: new Date()
    };
    
    const result = await receiveShipment(data._id, receiveData);
    
    if (result.success) {
      if (condition === 'Damaged' || condition === 'Partial') {
        toast.warning(`⚠️ Shipment moved to DAMAGE ZONE for inspection`);
        // Route damaged items to damage tab
        onComplete({ nextTab: 'damage', status: 'received', data: result.data, isDamaged: true });
      } else {
        toast.success(`Shipment received successfully at ${formatLocationDisplay(location)}`);
        const queueResult = await addToQueue(result.data?.shipmentId || data._id);
        if (!queueResult.success) {
          console.error('Failed to add received shipment to queue:', queueResult.message);
          toast.warning(queueResult.message || 'Shipment received, but it could not be added to the pending queue automatically.');
        }
        // Route good items to pending tab
        onComplete({ nextTab: 'pending', status: 'received', data: result.data, isDamaged: false });
      }
      onClose();
    } else {
      toast.error(result.message || 'Failed to receive shipment');
    }
    
    setSubmitting(false);
  };

  const handleInspectionSubmit = async () => {
    if (packages.length === 0) {
      toast.error('No packages to inspect');
      return;
    }

    // Validate all packages
    let hasError = false;
    const newErrors = {};

    inspections.forEach((insp, index) => {
      if (!insp) {
        newErrors[index] = `Package ${index + 1}: Not inspected`;
        hasError = true;
        return;
      }
      
      const total = (insp.passed || 0) + (insp.failed || 0);
      const expected = packages[index]?.quantity || 1;
      
      if (total !== expected) {
        newErrors[index] = `Package ${index + 1}: Total must equal ${expected}`;
        hasError = true;
      }
    });

    if (hasError) {
      setPackageErrors(newErrors);
      const firstErrorIndex = Object.keys(newErrors)[0];
      if (firstErrorIndex) {
        setCurrentPackageIndex(parseInt(firstErrorIndex));
      }
      toast.error('Please fix all package errors');
      return;
    }

    setSubmitting(true);
    try {
      const totalGood = inspections.reduce((sum, i) => sum + (i?.passed || 0), 0);
      const totalDamaged = inspections.reduce((sum, i) => sum + (i?.failed || 0), 0);
      
      const hasMajorDamage = inspections.some(i => i?.condition === 'Major Damage');
      const hasMinorDamage = inspections.some(i => i?.condition === 'Minor Damage');
      
      let overallCondition = 'Good';
      if (hasMajorDamage) {
        overallCondition = 'Major Damage';
      } else if (hasMinorDamage) {
        overallCondition = 'Minor Damage';
      } else if (totalDamaged > 0) {
        overallCondition = 'Minor Damage';
      }

      const inspectionData = {
        condition: overallCondition,
        findings: findings || 'Inspection completed',
        photos: photos.map(p => p.preview || p.url).filter(Boolean),
        disposition: disposition,
        details: inspections.map(insp => ({
          ...insp,
          condition: insp.condition || 'Good'
        })),
        summary: {
          totalPackages: packages.length,
          totalItems: inspections.reduce((sum, i) => sum + (i?.quantity || 1), 0),
          goodItems: totalGood,
          damagedItems: totalDamaged
        }
      };

      const receiptId = receipt?._id || data._id;
      const result = await inspectShipment(receiptId, inspectionData);
      
      if (result.success) {
        toast.success('✅ Inspection completed successfully');
        if (overallCondition !== 'Good') {
          toast.warning(`⚠️ Shipment marked as ${overallCondition}`);
          // Route damaged items to damage tab
          onComplete({ nextTab: 'damage', status: 'inspected', data: result.data, isDamaged: true });
        } else {
          // Try adding inspected-good receipt to pending queue so it moves out of Damage
          try {
            const queueRes = await addToQueue(result.data?.shipmentId || result.data?._id || receiptId);
            if (queueRes && queueRes.success) {
              toast.success(queueRes.message || 'Moved to pending queue');
            } else if (queueRes && !queueRes.success) {
              toast.warning(queueRes.message || 'Could not add to pending queue automatically');
            }
          } catch (err) {
            console.error('Failed to add to pending queue after inspection:', err);
            toast.warning('Failed to add to pending queue automatically');
          }

          // Route good items to pending tab (or consolidation if coming from consolidation page)
          onComplete({ nextTab: 'pending', status: 'inspected', data: result.data, isDamaged: false });
        }
        onClose();
      } else {
        toast.error(result.message || 'Failed to complete inspection');
      }
    } catch (error) {
      console.error('❌ Inspection error:', error);
      toast.error(error.message || 'Failed to complete inspection');
    } finally {
      setSubmitting(false);
    }
  };

  // If no packages
  if (packages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertOctagon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              This shipment has no packages to process. Creating default package...
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const suggested = getSuggestedStorage(data, condition);
  const zoneColor = getZoneColorClass(suggested.zoneCode);

  // RECEIVE STEP
  if (step === 'receive') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Receive Shipment</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Shipment Summary */}
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Tracking Number:</span>
                  <p className="font-medium">{data.trackingNumber || data.shipmentNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Shipment Number:</span>
                  <p className="font-medium">{data.shipmentNumber || data._id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Customer:</span>
                  <p className="font-medium">
                    {data.customerId?.firstName || data.customerId?.companyName || 'Unknown'} {data.customerId?.lastName || ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Origin/Destination:</span>
                  <p className="font-medium">
                    {data.shipmentDetails?.origin || 'N/A'} → {data.shipmentDetails?.destination || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Package Summary</span>
                </div>
                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                  {packages.length} Package(s)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-gray-500">Types:</span>
                  <span className="ml-1 font-medium">
                    {[...new Set(packages.map(p => p.packagingType || p.packageType || 'carton'))].join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Qty:</span>
                  <span className="ml-1 font-medium">
                    {packages.reduce((sum, p) => sum + (p.quantity || 1), 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Weight:</span>
                  <span className="ml-1 font-medium">
                    {packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)} kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Volume:</span>
                  <span className="ml-1 font-medium">
                    {packages.reduce((sum, p) => sum + ((p.volume || 0) * (p.quantity || 1)), 0)} m³
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-Suggested Location */}
            <div className={`${zoneColor.bg} ${zoneColor.border} border rounded-lg p-4 mb-4`}>
              <div className="flex items-start">
                {condition === 'Damaged' || condition === 'Partial' ? (
                  <AlertOctagon className={`h-5 w-5 ${zoneColor.text} mt-0.5 mr-3`} />
                ) : (
                  <Map className={`h-5 w-5 ${zoneColor.text} mt-0.5 mr-3`} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${zoneColor.text}`}>
                    {condition === 'Damaged' || condition === 'Partial' 
                      ? '🚨 DAMAGE ZONE - Inspection Required' 
                      : 'Suggested Storage Location'}
                  </p>
                  <p className={`text-xs ${zoneColor.text} mt-1`}>{suggested.description}</p>
                  <div className="mt-2">
                    <span className="text-gray-600 text-xs">Location:</span>
                    <span className={`ml-1 font-medium ${zoneColor.text}`}>{suggested.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Select Packages to Receive</label>
                <div className="space-x-2">
                  <button type="button" onClick={selectAllPackages} className="text-xs text-[#E67E22] hover:text-[#d35400]">
                    Select All
                  </button>
                  <button type="button" onClick={clearAllPackages} className="text-xs text-gray-500 hover:text-gray-700">
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {packages.map((pkg, idx) => {
                  const storage = PACKAGE_STORAGE_MAP[pkg.packagingType || pkg.packageType] || DEFAULT_STORAGE;
                  const pkgZoneColor = getZoneColorClass(storage.zone);
                  return (
                    <label key={idx} className={`flex items-start p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPackages.includes(idx) ? pkgZoneColor.bg : 'hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(idx)}
                        onChange={() => togglePackage(idx)}
                        className="mt-1 h-4 w-4 text-[#E67E22] rounded border-gray-300 focus:ring-[#E67E22]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{pkg.description || 'Package'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${pkgZoneColor.bg} ${pkgZoneColor.text}`}>
                            {pkg.packagingType || pkg.packageType || 'carton'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-500">
                          <span>Qty: {pkg.quantity || 1}</span>
                          <span>Wt: {pkg.weight || 0}kg</span>
                          <span>Vol: {pkg.volume || 0}m³</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Receive Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleReceiveSubmit(); }} className="space-y-4">
              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                >
                  {RECEIVE_CONDITION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {(condition === 'Damaged' || condition === 'Partial') && (
                  <p className="text-xs text-red-500 mt-1">⚠️ This package will be sent to DAMAGE ZONE for inspection</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                    readOnly={condition === 'Damaged' || condition === 'Partial'}
                  />
                  {condition !== 'Damaged' && condition !== 'Partial' && (
                    <button
                      type="button"
                      onClick={() => {
                        const suggested = getSuggestedStorage(data, condition);
                        setLocation(suggested.location);
                      }}
                      className="ml-2 px-3 py-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      Use Suggested
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {condition === 'Damaged' || condition === 'Partial' 
                    ? 'Damage Zone - Fixed location for damaged goods'
                    : 'Format: Zone-Aisle-Rack-Bin (e.g., P-1-1-1)'}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={condition === 'Damaged' || condition === 'Partial' 
                    ? 'Please describe the damage in detail...' 
                    : 'Any special notes about this receipt...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div className={`${condition === 'Damaged' || condition === 'Partial' ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-3`}>
                <p className="text-xs font-medium text-gray-700 mb-2">Receipt Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Packages:</span>
                    <span className="ml-1 font-medium">{selectedPackages.length} of {packages.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-1 font-medium">{formatLocationDisplay(location)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition:</span>
                    <span className={`ml-1 font-medium ${condition === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                      {condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-1 font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedPackages.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    condition === 'Damaged' || condition === 'Partial'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[#E67E22] hover:bg-[#d35400] text-white'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {condition === 'Damaged' || condition === 'Partial'
                        ? 'Send to Damage Zone'
                        : `Receive ${selectedPackages.length} Package(s)`}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // INSPECTION STEP
  const currentPkg = packages[currentPackageIndex];
  const currentInspection = inspections[currentPackageIndex] || {
    condition: 'Good',
    quantity: currentPkg?.quantity || 1,
    passed: currentPkg?.quantity || 1,
    failed: 0,
    notes: ''
  };
  const totalForCurrent = (currentInspection.passed || 0) + (currentInspection.failed || 0);
  const expectedTotal = currentPkg?.quantity || 1;
  const isTotalValid = totalForCurrent === expectedTotal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {receipt?.inspection ? 'Re-inspect Shipment' : 'Inspect Shipment'}
            </h2>
            <p className="text-sm text-gray-500">
              Receipt: {data.receiptNumber || data._id} • Package {currentPackageIndex + 1} of {packages.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Package Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentPackageIndex === 0}
              className={`px-3 py-1.5 rounded-lg flex items-center text-sm ${
                currentPackageIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {packages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPackageIndex(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    idx === currentPackageIndex
                      ? 'bg-[#E67E22] text-white'
                      : inspections[idx]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPackageIndex === packages.length - 1}
              className={`px-3 py-1.5 rounded-lg flex items-center text-sm ${
                currentPackageIndex === packages.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Package Details */}
        <div className="p-6">
          {/* Package Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Package Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{currentPkg?.packagingType || currentPkg?.packageType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="text-sm font-medium">{currentPkg?.quantity || 1} items</p>
              </div>
              {currentPkg?.weight && (
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-medium">{currentPkg.weight} kg</p>
                </div>
              )}
              {currentPkg?.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm font-medium">{currentPkg.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {packageErrors[currentPackageIndex] && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              {packageErrors[currentPackageIndex]}
            </div>
          )}

          {/* Inspection Form */}
          <div className="space-y-6">
            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INSPECTION_CONDITION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInspectionChange('condition', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentInspection.condition === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-1 text-${option.color}-600`} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Check */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Check <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Passed (Good)</label>
                  <input
                    type="number"
                    min="0"
                    max={currentPkg?.quantity || 1}
                    value={currentInspection.passed || 0}
                    onChange={(e) => handleInspectionChange('passed', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Failed (Damaged)</label>
                  <input
                    type="number"
                    min="0"
                    max={currentPkg?.quantity || 1}
                    value={currentInspection.failed || 0}
                    onChange={(e) => handleInspectionChange('failed', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Total: {totalForCurrent} of {expectedTotal} items
                </span>
                {!isTotalValid && (
                  <span className="text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Quantity mismatch
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Notes</label>
              <textarea
                value={currentInspection.notes || ''}
                onChange={(e) => handleInspectionChange('notes', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                placeholder="Add any observations or issues found..."
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <NextImage src={photo.preview} alt={photo.name} width={80} height={80} unoptimized className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer hover:border-[#E67E22] transition-colors">
                  <Camera className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleAddPhoto} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              >
                {DISPOSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <textarea
                placeholder="Overall findings..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent w-64"
                rows="1"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleInspectionSubmit}
                disabled={submitting || !isTotalValid}
                className={`px-4 py-2 text-sm text-white rounded-lg flex items-center ${
                  submitting || !isTotalValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#E67E22] hover:bg-[#d35400]'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {receipt?.inspection ? 'Update Inspection' : 'Complete Inspection'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function WarehousePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('expected');
  const [expectedShipments, setExpectedShipments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('receive');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedPendingGroup, setSelectedPendingGroup] = useState(null);
  const [pendingShipmentStatus, setPendingShipmentStatus] = useState({});
  const [pendingShipmentCondition, setPendingShipmentCondition] = useState({});
  
  // Details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReceiptDetails, setSelectedReceiptDetails] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    expected: 0,
    received: 0,
    pending: 0,
    inspected: 0,
    consolidated: 0,  // ← Add this
    damaged: 0
  });
// পেইজের ভিতরে, useState-এর পরে এই স্টেট যোগ করুন
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [receiptToDelete, setReceiptToDelete] = useState(null);
const [deleting, setDeleting] = useState(false);

// ডিলিট হ্যান্ডলার ফাংশন যোগ করুন
const handleDeleteClick = (receipt) => {
  setReceiptToDelete(receipt);
  setShowDeleteModal(true);
};

const handleConfirmDelete = async () => {
  if (!receiptToDelete) return;
  
  setDeleting(true);
  try {
    const result = await deleteWarehouseReceipt(receiptToDelete._id);
    if (result.success) {
      toast.success(result.message || 'Receipt deleted successfully');
      setShowDeleteModal(false);
      setReceiptToDelete(null);
      loadData(); // Refresh the list
    } else {
      toast.error(result.message || 'Failed to delete receipt');
    }
  } catch (error) {
    console.error('Delete error:', error);
    toast.error(error.message || 'Failed to delete receipt');
  } finally {
    setDeleting(false);
  }
};

  const getQueueShipmentCount = (groups = []) => {
    return groups.reduce((sum, group) => sum + (group.count || group.shipments?.length || 0), 0);
  };

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab === 'expected' || requestedTab === 'pending' || requestedTab === 'damage') {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expectedCountResult, pendingCountResult, damagedCountResult] = await Promise.all([
        getExpectedShipments({ page: 1, limit: 1 }),
        getConsolidationQueue(),
        getWarehouseReceipts({ page: 1, limit: 1, status: 'damaged_report' })
      ]);

      const expectedCount = expectedCountResult.success
        ? (expectedCountResult.pagination?.total ?? expectedCountResult.data?.length ?? 0)
        : 0;

      const pendingCount = pendingCountResult.success
        ? (pendingCountResult.data?.totalItems ?? getQueueShipmentCount(pendingCountResult.data?.groups || []))
        : 0;

      const damagedCount = damagedCountResult.success
        ? (damagedCountResult.pagination?.total ?? damagedCountResult.data?.length ?? 0)
        : 0;

      setStats(prev => ({
        ...prev,
        expected: expectedCount,
        pending: pendingCount,
        damaged: damagedCount
      }));

        if (activeTab === 'expected') {
            const result = await getExpectedShipments();
            if (result.success) {
                const processedShipments = result.data.map(shipment => {
                    const packages = extractPackages(shipment);
                    return {
                        ...shipment,
                        _packages: packages,
                        packageCount: packages.length,
                        totalItems: packages.reduce((sum, p) => sum + (p.quantity || 1), 0),
                        totalWeight: packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)
                    };
                });
                
           setExpectedShipments(processedShipments);
            }
        } else if (activeTab === 'pending') {
            const result = await getConsolidationQueue();
            if (result.success) {
                const groups = result.data?.groups || [];
                const totalGroups = result.data?.totalGroups || groups.length;

               setQueueData({
  ...result.data,
  groups
});

setStats(prev => ({
  ...prev,
  consolidated: totalGroups
}));
            }
        } else if (activeTab === 'damage') {
            // Load all receipts and filter for damaged ones
            const result = await getWarehouseReceipts({ limit: 100 });
            if (result.success) {
                const processedReceipts = result.data.map(receipt => {
                    const packages = extractPackages(receipt);
                    return {
                        ...receipt,
                        _packages: packages,
                        packageCount: packages.length,
                        totalItems: packages.reduce((sum, p) => sum + (p.quantity || 1), 0),
                        totalWeight: packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)
                    };
                });
                
                setReceipts(processedReceipts);
            }
        } else {
            const result = await getWarehouseReceipts({ limit: 50 });
            if (result.success) {
                const processedReceipts = result.data.map(receipt => {
                    const packages = extractPackages(receipt);
                    return {
                        ...receipt,
                        _packages: packages,
                        packageCount: packages.length,
                        totalItems: packages.reduce((sum, p) => sum + (p.quantity || 1), 0),
                        totalWeight: packages.reduce((sum, p) => sum + ((p.weight || 0) * (p.quantity || 1)), 0)
                    };
                });
                
                setReceipts(processedReceipts);

const receivedItems = processedReceipts
  .filter(r => r.status === 'received')
  .reduce((s, r) => s + (r.totalItems || 0), 0);

const inspectedItems = processedReceipts
  .filter(r => r.status === 'inspected')
  .reduce((s, r) => s + (r.totalItems || 0), 0);

const consolidatedItems = processedReceipts
  .filter(r => r.status === 'consolidated')
  .reduce((s, r) => s + (r.totalItems || 0), 0);

setStats({
  received: receivedItems,
  inspected: inspectedItems,
  consolidated: consolidatedItems,
  damaged: damagedCount,
  expected: expectedCount,
  pending: pendingCount
});
            }
        }
    } catch (error) {
        console.error('Load error:', error);
        toast.error('Failed to load data');
    } finally {
        setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReceiveClick = (shipment) => {
    setSelectedShipment(shipment);
    setSelectedReceipt(null);
    setModalMode('receive');
    setShowModal(true);
  };

  // app/warehouse/page.jsx - handleInspectClick ফাংশন আপডেট করুন

const handleInspectClick = (receipt) => {
  setSelectedReceipt(receipt);
  setSelectedShipment(null);
  setModalMode('inspect');
  setShowModal(true);
};

  const handleViewDetails = async (receipt) => {
    try {
      const result = await getReceiptById(receipt._id);
      if (result.success) {
        setSelectedReceiptDetails(result.data);
        setShowDetailsModal(true);
      } else {
        toast.error('Failed to load receipt details');
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      toast.error('Failed to load receipt details');
    }
  };

  const handleDownloadPDF = async (receiptId) => {
    try {
      const result = await generateReceiptPDF(receiptId);
      if (result.success) {
        toast.success(result.message || 'Report downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleModalComplete = (result = {}) => {
    // If a modal action returned an updated receipt, update local state immediately
    if (result?.data && result?.data._id) {
      const updated = result.data;
      // Remove from local receipts if the item is no longer damaged
      if (result.isDamaged === false) {
        setReceipts(prev => prev.filter(r => String(r._id) !== String(updated._id)));
      } else {
        // Replace or add the updated receipt in local receipts
        setReceipts(prev => {
          const found = prev.findIndex(r => String(r._id) === String(updated._id));
          if (found === -1) return [updated, ...prev];
          const next = [...prev];
          next[found] = { ...next[found], ...updated };
          return next;
        });
      }
    }

    if (result.nextTab) {
      setActiveTab(result.nextTab);
    }

    // Refresh lists to ensure backend state is consistent (pending/damage counts)
    loadData();
  };

  const handleOpenPendingModal = (group) => {
    setSelectedPendingGroup(group);
    setShowPendingModal(true);
  };

  const handlePendingSubmit = (payload = {}) => {
    const ids = payload.shipmentIds || [];

    if (ids.length > 0) {
      setPendingShipmentStatus((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = 'consolidated';
        });
        return next;
      });

      setPendingShipmentCondition((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = payload.condition || 'Good';
        });
        return next;
      });
    }

    setShowPendingModal(false);
    setSelectedPendingGroup(null);
    setActiveTab('pending');
    toast.success('Pending shipment status updated to Consolidated. You can re-inspect and consolidate again if needed.');
    router.push('/warehouse/all-consolidation');
  };

  const handlePendingReinspect = async (shipment) => {
    const shipmentTracking = shipment.trackingNumber || shipment.shipmentId?.trackingNumber;
    const shipmentObjectId = shipment.shipmentId?._id || shipment.shipmentId;

    let receiptId = [
      shipment.receiptId,
      shipment.warehouseReceiptId,
      shipment.receipt?._id,
      shipment.receipt?.id,
      shipment.shipmentId?.receiptId,
      shipment.shipmentId?.warehouseReceiptId
    ].find(Boolean);

    if (!receiptId) {
      try {
        const receiptsResult = await getWarehouseReceipts({ limit: 200 });
        const receiptPool = receiptsResult.success ? (receiptsResult.data || []) : [];

        const matchedReceipt = receiptPool.find((receipt) => {
          const receiptShipmentId = receipt.shipmentId?._id || receipt.shipmentId;
          const receiptTracking = receipt.shipmentId?.trackingNumber || receipt.trackingNumber;

          const idMatched = shipmentObjectId && receiptShipmentId && String(receiptShipmentId) === String(shipmentObjectId);
          const trackingMatched = shipmentTracking && receiptTracking && String(receiptTracking) === String(shipmentTracking);

          return idMatched || trackingMatched;
        });

        receiptId = matchedReceipt?._id || matchedReceipt?.id;
      } catch (error) {
        console.error('Fallback receipt lookup failed:', error);
      }
    }

    if (!receiptId) {
      toast.warning('No receipt found for that shipment. Please refresh pending list and try again.');
      return;
    }

    try {
      const result = await getReceiptById(receiptId);
      if (result.success) {
        const receipt = result.data?.receipt || result.data;
        setShowPendingModal(false);
        setSelectedPendingGroup(null);
        handleInspectClick(receipt);
      } else {
        toast.error(result.message || 'Failed to load receipt for inspection');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load receipt for inspection');
    }
  };

  // Filter data
  const filteredExpected = expectedShipments.filter(s => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      s.trackingNumber?.toLowerCase().includes(searchLower) ||
      s.shipmentNumber?.toLowerCase().includes(searchLower) ||
      s.customerId?.firstName?.toLowerCase().includes(searchLower) ||
      s.customerId?.lastName?.toLowerCase().includes(searchLower) ||
      s.customerId?.companyName?.toLowerCase().includes(searchLower)
    );
  });

  const filteredReceipts = receipts.filter(r => {
    if (filters.status && filters.status !== '') {
      if (filters.status === 'damaged_report') {
        if (!isDamagedReceipt(r)) return false;
      } else if (r.status !== filters.status) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        r.receiptNumber?.toLowerCase().includes(searchLower) ||
        r.shipmentId?.trackingNumber?.toLowerCase().includes(searchLower) ||
        r.customerId?.companyName?.toLowerCase().includes(searchLower) ||
        r.customerId?.firstName?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const filteredQueueGroups = (queueData?.groups || []).filter(group => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      group.displayName?.toLowerCase().includes(searchLower) ||
      group.origin?.toLowerCase().includes(searchLower) ||
      group.destination?.toLowerCase().includes(searchLower) ||
      group.shipments?.some(item =>
        item.trackingNumber?.toLowerCase().includes(searchLower) ||
        item.shipmentId?.trackingNumber?.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Warehouse className="h-6 w-6 mr-2 text-[#E67E22]" />
            Warehouse Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage expected shipments and pending consolidation in one place
          </p>
          <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Accept incoming shipments, inspect and consolidate pending shipments from the same expected and pending tab.
            </div>
        </div>

       

        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          <TabButton active={activeTab === 'expected'} onClick={() => setActiveTab('expected')}>
            <Package className="h-4 w-4 inline mr-1" />
            Expected ({stats.expected} shipments)
          </TabButton>
          <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
            <Ship className="h-4 w-4 inline mr-1" />
            Pending ({stats.pending} shipments)
          </TabButton>
          <TabButton active={activeTab === 'damage'} onClick={() => setActiveTab('damage')}>
            <AlertOctagon className="h-4 w-4 inline mr-1" />
            Damage ({stats.damaged} shipments)
          </TabButton>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          total={activeTab === 'expected' ? filteredExpected.length : activeTab === 'pending' ? filteredQueueGroups.reduce((sum, group) => sum + (group.count || group.shipments?.length || 0), 0) : filteredReceipts.filter(isDamagedReceipt).length}
          placeholder={activeTab === 'expected' ? "Search by tracking, shipment..." : "Search by destination, tracking..."}
          totalLabel={activeTab === 'damage' ? 'receipts' : 'shipments'}
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#E67E22]" />
          </div>
        ) : activeTab === 'expected' ? (
          // EXPECTED SHIPMENTS
          filteredExpected.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No expected shipments</h3>
              <p className="text-xs text-gray-500 mt-1">All clear! No shipments waiting to be received.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredExpected.map((shipment) => {
                const packages = shipment._packages || extractPackages(shipment);
                const packageTypes = getPackageTypes(shipment);
                const suggested = getSuggestedStorage(shipment, 'Good');
                const zoneColor = getZoneColorClass(suggested.zoneCode);
                const totals = calculateTotals(shipment);
                
                return (
                  <div key={shipment._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 ${zoneColor.bg} rounded-lg`}>
                          <Package className={`h-5 w-5 ${zoneColor.text}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{shipment.trackingNumber || shipment.shipmentNumber}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${zoneColor.bg} ${zoneColor.text}`}>
                              {suggested.zoneCode}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{shipment.shipmentNumber}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                    </div>

                    {/* Package Summary */}
                    <div className="bg-blue-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-blue-700">Packages: {packages.length}</span>
                        <span className="text-blue-600">Total Items: {totals.totalItems}</span>
                        <span className="text-blue-600">Total Weight: {totals.totalWeight.toFixed(1)} kg</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center text-xs text-gray-600">
                        <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {shipment.customerId?.firstName || shipment.customerId?.companyName || 'Unknown'} {shipment.customerId?.lastName || ''}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {formatDate(shipment.createdAt)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {shipment.shipmentDetails?.origin || 'N/A'} → {shipment.shipmentDetails?.destination || 'N/A'}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Layers className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {totals.totalItems} items • {totals.totalWeight.toFixed(1)} kg
                      </div>
                    </div>

                    {/* Package Types */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {packages.map((pkg, idx) => {
                        const storage = PACKAGE_STORAGE_MAP[pkg.packagingType || pkg.packageType] || DEFAULT_STORAGE;
                        const pkgZoneColor = getZoneColorClass(storage.zone);
                        return (
                          <span key={idx} className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${pkgZoneColor.bg} ${pkgZoneColor.text}`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {pkg.packagingType || pkg.packageType || 'carton'} x{pkg.quantity || 1}
                          </span>
                        );
                      })}
                    </div>

                    {/* Suggested Location */}
                    <div className={`p-2 rounded-lg ${zoneColor.bg} bg-opacity-50 flex items-center justify-between`}>
                      <div className="flex items-center text-xs">
                        <Map className={`h-3.5 w-3.5 mr-1.5 ${zoneColor.text}`} />
                        <span className={zoneColor.text}>
                          Suggested: <span className="font-medium">{suggested.zone}</span> • {suggested.location}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReceiveClick(shipment)}
                        className="text-xs bg-[#E67E22] text-white px-4 py-1.5 rounded-lg hover:bg-[#d35400] transition-colors"
                      >
                        Receive Now →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'pending' ? (
          // PENDING CONSOLIDATION QUEUE
          filteredQueueGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Ship className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No pending shipments</h3>
              <p className="text-xs text-gray-500 mt-1">
                {filters.search ? 'Try adjusting your search' : 'Received shipments will appear here for consolidation.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueueGroups.map((group) => {
                const shipments = group.shipments || [];
                return (
                  <div key={group.groupKey} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {group.displayName || `${group.origin || 'Unknown'} → ${group.destination || 'Unknown'}`}
                          </h3>
                          
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.origin || 'N/A'} → {group.destination || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.mainType || 'Mixed'} / {group.subType || 'General'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenPendingModal(group)}
                        className="text-xs bg-[#E67E22] text-white px-3 py-1.5 rounded-lg hover:bg-[#d35400] transition-colors"
                      >
                        Shipment Consolidate Now
                      </button>
                    </div>

                   
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // DAMAGE RECEIPTS
          filteredReceipts.filter(isDamagedReceipt).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <AlertOctagon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No damaged items</h3>
              <p className="text-xs text-gray-500 mt-1">All shipments are in good condition.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReceipts.filter(isDamagedReceipt).map((receipt) => {
                const packages = receipt._packages || extractPackages(receipt);
                const totals = calculateTotals(receipt);
                const currentCondition = getCurrentReceiptCondition(receipt);
                const conditionBadgeStyles = getConditionBadgeStyles(currentCondition);
                
                return (
                  <div key={receipt._id} className="bg-white rounded-xl border border-red-200 p-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <AlertOctagon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{receipt.shipmentId?.trackingNumber || receipt.trackingNumber || 'N/A'}</p>
                            
                          </div>
                          <p className="text-xs text-gray-500">{receipt.receiptNumber || 'N/A'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(receipt)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        View Details
                      </button>
                    </div>


                    {/* Package Summary */}
                    <div className="bg-gray-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">Packages: {packages.length}</span>
                        <span className="text-gray-600">Total Items: {totals.totalItems}</span>
                        <span className="text-gray-600">Total Weight: {totals.totalWeight.toFixed(1)} kg</span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center text-xs text-gray-600">
                        <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {receipt.customerId?.firstName || receipt.customerId?.companyName || 'Unknown'} {receipt.customerId?.lastName || ''}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {formatDate(receipt.createdAt)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {receipt.shipmentId?.shipmentDetails?.origin || 'N/A'} → {receipt.shipmentId?.shipmentDetails?.destination || 'N/A'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInspectClick(receipt)}
                        className="flex-1 text-xs bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Re-inspect
                      </button>
                    </div>

                   
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Combined Receive/Inspect Modal */}
      {showModal && (
        <WarehouseModal
          shipment={selectedShipment}
          receipt={selectedReceipt}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onComplete={handleModalComplete}
        />
      )}

      {showPendingModal && selectedPendingGroup && (
        <PendingConsolidationModal
          isOpen={showPendingModal}
          group={selectedPendingGroup}
          onClose={() => {
            setShowPendingModal(false);
            setSelectedPendingGroup(null);
          }}
          onSubmit={handlePendingSubmit}
          onReinspect={handlePendingReinspect}
        />
      )}

      {/* Receipt Details Modal */}
      {showDetailsModal && selectedReceiptDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedReceiptDetails.receipt?.receiptNumber || 'N/A'}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Status Badge */}
{selectedReceiptDetails.receipt?.status && (
  <div className={`inline-flex items-center px-3 py-1 rounded-full ${
    STATUS_COLORS[selectedReceiptDetails.receipt.status]?.bg || 'bg-gray-100'
  } ${
    STATUS_COLORS[selectedReceiptDetails.receipt.status]?.text || 'text-gray-700'
  } text-sm mb-4`}>
    {STATUS_COLORS[selectedReceiptDetails.receipt.status]?.label || selectedReceiptDetails.receipt.status}
  </div>
)}

{selectedReceiptDetails.receipt && (
  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
    <div className="flex items-center justify-between gap-3">
     
      <button
        onClick={() => {
          setShowDetailsModal(false);
          handleInspectClick(selectedReceiptDetails.receipt);
        }}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
      >
        Re-inspect
      </button>
    </div>
    {getCurrentReceiptCondition(selectedReceiptDetails.receipt) !== 'Good' && (
      <p className="mt-2 text-xs text-gray-600">
        Re-inspect this receipt to move it back to pending if the new condition is good.
      </p>
    )}
  </div>
)}

{/* ✅ Show consolidation info if consolidated */}
{selectedReceiptDetails.receipt?.status === 'consolidated' && (
  <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
    <h3 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
      <Ship className="h-4 w-4 mr-2" />
      Consolidation Information
    </h3>
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Consolidated At:</span>
        <span className="font-medium">
          {selectedReceiptDetails.receipt?.consolidatedAt 
            ? formatDate(selectedReceiptDetails.receipt.consolidatedAt)
            : 'N/A'}
        </span>
      </div>
      {selectedReceiptDetails.receipt?.consolidationId && (
        <div className="flex justify-between">
          <span className="text-gray-500">Consolidation ID:</span>
          <span className="font-medium">{selectedReceiptDetails.receipt.consolidationId}</span>
        </div>
      )}
    </div>
  </div>
)}

              {/* Two Column Layout */}
              <div className="grid grid-cols-3 gap-4">
                {/* Left Column - Main Info */}
                <div className="col-span-2 space-y-4">
                  {/* Shipment Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Shipment Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Tracking Number</p>
                        <p className="text-sm font-medium">{selectedReceiptDetails.receipt?.shipmentId?.trackingNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Shipment Number</p>
                        <p className="text-sm font-medium">{selectedReceiptDetails.receipt?.shipmentId?.shipmentNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Origin</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.shipmentId?.shipmentDetails?.origin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Destination</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.shipmentId?.shipmentDetails?.destination || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Company</p>
                        <p className="text-sm font-medium">{selectedReceiptDetails.receipt?.customerId?.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact Person</p>
                        <p className="text-sm">
                          {selectedReceiptDetails.receipt?.customerId?.firstName || ''} {selectedReceiptDetails.receipt?.customerId?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.customerId?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm">{selectedReceiptDetails.receipt?.customerId?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Packages List */}
                  {extractPackages(selectedReceiptDetails.receipt).length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Received Packages</h3>
                      <div className="space-y-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Package Count</span>
                            <span className="font-medium text-gray-900">{extractPackages(selectedReceiptDetails.receipt).length}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {extractPackages(selectedReceiptDetails.receipt).map((pkg, index) => (
                              <span key={`${pkg.packagingType || pkg.packageType || 'pkg'}-${index}`} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                {pkg.packagingType || pkg.packageType || 'carton'} x{pkg.quantity || 1}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedReceiptDetails.receipt?.status === 'consolidated' && (
                          <div className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Shipment Consolidated
                          </div>
                        )}

                        <button
                          onClick={() => setShowDetailsModal(false)}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Storage & Meta */}
                <div className="space-y-4">
                  {/* Storage Location */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Storage Location</h3>
                    {selectedReceiptDetails.receipt?.storageLocation?.zone ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Zone:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.zone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Aisle:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.aisle}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Rack:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.rack}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Bin:</span>
                          <span className="font-medium">{selectedReceiptDetails.receipt.storageLocation.bin}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not assigned</p>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Receipt Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Received By:</span>
                        <span className="font-medium">{selectedReceiptDetails.receipt?.receivedBy?.firstName || 'Warehouse'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">
                          {selectedReceiptDetails.receipt?.receivedDate ? formatDate(selectedReceiptDetails.receipt.receivedDate) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium">
                          {selectedReceiptDetails.receipt?.createdAt ? formatDate(selectedReceiptDetails.receipt.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedReceiptDetails.receipt?.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                      <p className="text-sm text-gray-600">{selectedReceiptDetails.receipt.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
{showDeleteModal && receiptToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Receipt</h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete receipt <strong>{receiptToDelete.receiptNumber}</strong>?
          <br />
          <span className="text-xs text-red-500 mt-1 block">
            This action cannot be undone. All associated data will be permanently removed.
          </span>
        </p>
        
        {/* Receipt Summary */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Tracking:</span>
              <span className="ml-1 font-medium">{receiptToDelete.shipmentId?.trackingNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                receiptToDelete.status === 'inspected' ? 'bg-blue-100 text-blue-700' :
                receiptToDelete.status === 'damaged_report' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'
              }`}>
                {receiptToDelete.status || 'received'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Packages:</span>
              <span className="ml-1 font-medium">{receiptToDelete._packages?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-1 font-medium">{formatDate(receiptToDelete.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
              deleting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}