// components/shipments/AllShipments.jsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Lock, Plus, Shield, Trash2 } from "lucide-react"; // ✅ correct
import { 
  getAllNewShipments,
  updateShipmentStatus,
  updateSenderReceiverInfo
} from '@/services/newShipping';

// ==================== ICONS ====================
import {
  Package, Search, ChevronDown, ChevronLeft, ChevronRight,
  Eye, MoreVertical, ArrowUpDown, Download as ExportIcon,
  X, Hash, Activity, CheckCircle as CheckCircleSolid,
  XCircle as XCircleSolid, Clock, Truck, MapPin, User,
  ChevronsLeft, ChevronsRight, Loader2, RefreshCw,
  Box, Ship, Plane, Train, Building2, DollarSign,
  Calendar, AlertCircle, FileText, Send, Flag, Edit3,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { getAuthToken } from '@/utils/SessionHelper';
import { useRouter } from 'next/navigation';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#F91616',
  primaryDark: '#BF0000',
  primaryLight: '#FA9991',
  secondary: '#3C719D',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6'
};

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  booking_requested: {
    label: 'Booking Created',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    progress: 5
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    progress: 10
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: Building2,
    progress: 10
  },
  picked_up_from_warehouse: {
    label: 'Picked up from Warehouse',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Truck,
    progress: 12
  },
  loaded_in_container: {
    label: 'Loaded into Container',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: Truck,
    progress: 30
  },
  container_sealed: {
    label: 'Container Sealed',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Ship,
    progress: 50
  },
  departed_port_of_origin: {
    label: 'Departed Port of Origin',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 60
  },
  arrived_at_destination_port: {
    label: 'Arrived at Destination Port',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: Flag,
    progress: 70
  },
  under_customs_cleared: {
    label: 'Under Customs Clearance',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Shield,
    progress: 75
  },
  customs_cleared: {
    label: 'Customs Cleared',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: FileText,
    progress: 80
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: Truck,
    progress: 90
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    progress: 95
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-800 text-white border-green-900',
    icon: CheckCircleSolid,
    progress: 100
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-[#EDEDED] text-amber-700 border-amber-200',
    icon: AlertTriangle,
    progress: 0
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleSolid,
    progress: 0
  }
};

// All statuses in sequence
const ALL_STATUSES = [
  { value: 'booking_requested', label: 'Booking Requested', order: 1 },
  { value: 'pending', label: 'Pending', order: 2 },
  { value: 'received_at_warehouse', label: 'Received at Warehouse', order: 3 },
  { value: 'picked_up_from_warehouse', label: 'Picked up from Warehouse', order: 4 },
  { value: 'loaded_in_container', label: 'Loaded into Container', order: 5 },
  { value: 'container_sealed', label: 'Container Sealed', order: 6 },
  { value: 'departed_port_of_origin', label: 'Departed Port of Origin', order: 7 },
  { value: 'in_transit', label: 'In Transit', order: 8 },

  // ✅ NEW
  { value: 'on_hold', label: 'On Hold', order: 9},

  { value: 'arrived_at_destination_port', label: 'Arrived at Destination Port', order: 10 },

  // ✅ NEW
  { value: 'under_customs_cleared', label: 'Under Customs Clearance', order: 11 },

  { value: 'customs_cleared', label: 'Customs Cleared', order: 12 },
  { value: 'unloaded_from_vessel', label: 'Unloaded from Vessel', order: 13 },
  { value: 'out_for_delivery', label: 'Out for Delivery', order: 14 },
  { value: 'delivered', label: 'Delivered', order: 15 },
  { value: 'completed', label: 'Completed', order: 16 },
  { value: 'cancelled', label: 'Cancelled', order: 17 }
];

const NON_LINEAR_STATUSES = ['on_hold', 'cancelled'];
const LINEAR_FLOW_STATUSES = ALL_STATUSES.filter(
  (status) => !NON_LINEAR_STATUSES.includes(status.value)
);
// ==================== SHIPMENT MODE CONFIG ====================
const getShipmentModeIcon = (mainType) => {
  const icons = {
    air_freight: Plane,
    sea_freight: Ship,
    road_freight: Truck,
    multimodal: Package,
    inland_trucking: Truck
  };
  return icons[mainType] || Package;
};

const getShipmentModeLabel = (mainType) => {
  const labels = {
    air_freight: 'Air Freight',
    sea_freight: 'Sea Freight',
    road_freight: 'Road Freight',
    multimodal: 'Multimodal',
    inland_trucking: 'Inland Trucking'
  };
  return labels[mainType] || mainType || 'Standard';
};

// ==================== HELPER FUNCTIONS ====================
const getShipmentProgress = (status) => STATUS_CONFIG[status]?.progress || 0;
const getShipmentStatusDisplayText = (status) => STATUS_CONFIG[status]?.label || status?.replace(/_/g, ' ') || 'Unknown';
const getStatusOrder = (status) => {
  const found = ALL_STATUSES.find(s => s.value === status);
  return found ? found.order : 0;
};

const SHIPMENT_STATUS_ALIASES = {
  departed_port_of_origin_sea_freight: 'departed_port_of_origin',
  loaded_into_container: 'loaded_in_container',
  under_customs_clearance: 'under_customs_cleared',
  customs_clearance: 'customs_cleared',
  customs_cleared: 'customs_cleared',
  under_customs_cleared: 'under_customs_cleared'
};

const normalizeShipmentStatus = (status) => SHIPMENT_STATUS_ALIASES[status] || status;

const getShipmentFlowStartStatus = (shipment, fallbackStatus) => {
  const explicitStart = normalizeShipmentStatus(shipment?.initialShipmentStatus);
  if (explicitStart && LINEAR_FLOW_STATUSES.some((item) => item.value === explicitStart)) {
    return explicitStart;
  }

  const firstLinearTimelineEntry = shipment?.timeline?.find((entry) => {
    const normalizedEntryStatus = normalizeShipmentStatus(entry?.status);
    return LINEAR_FLOW_STATUSES.some((item) => item.value === normalizedEntryStatus);
  });

  if (firstLinearTimelineEntry?.status) {
    return normalizeShipmentStatus(firstLinearTimelineEntry.status);
  }

  return normalizeShipmentStatus(fallbackStatus);
};

const getShipmentFlowStatuses = (shipment, fallbackStatus) => {
  return LINEAR_FLOW_STATUSES;
};

const getShipmentTimelineStatuses = (shipment, fallbackStatus) => {
  const flowStatuses = getShipmentFlowStatuses(shipment, fallbackStatus);
  const normalizedEndStatus = normalizeShipmentStatus(fallbackStatus);
  const endIndex = flowStatuses.findIndex((item) => item.value === normalizedEndStatus);

  if (endIndex === -1) {
    return flowStatuses;
  }

// For manual shipping: handle delivered/completed separation
    const result = flowStatuses.slice(0, endIndex + 1);
    
    // If normalized end status is 'completed', don't include 'delivered' in the timeline
    if (normalizedEndStatus === 'completed') {
      return result.filter(s => s.value !== 'delivered' || s.value === 'completed');
    }
    
    // If normalized end status is 'delivered', don't include 'completed' 
    if (normalizedEndStatus === 'delivered') {
      return result.filter(s => s.value !== 'completed');
    }
    
    return result;
};

// ==================== UI COMPONENTS ====================

const Button = ({ children, type = 'button', variant = 'primary', size = 'md', isLoading = false, disabled = false, onClick, className = '', icon = null, iconPosition = 'left' }) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-[${COLORS.primaryDark}] focus:ring-[${COLORS.primary}] shadow-sm`,
    secondary: `bg-[${COLORS.secondary}] text-white hover:bg-[#2c5a8c] focus:ring-[${COLORS.secondary}]`,
    light: `bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`,
    success: `bg-[${COLORS.success}] text-white hover:bg-[#0d9488] focus:ring-[${COLORS.success}]`,
    danger: `bg-[${COLORS.danger}] text-white hover:bg-[#dc2626] focus:ring-[${COLORS.danger}]`,
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </div>
      )}
    </button>
  );
};

const Input = ({ type = 'text', name, value, onChange, placeholder, label, icon: Icon, required = false, disabled = false, className = '' }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>}
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-gray-400" /></div>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-sm border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent
            ${Icon ? 'pl-10' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${className}
          `}
        />
      </div>
    </div>
  );
};

const TextArea = ({ name, value, onChange, placeholder, label, rows = 3 }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
      />
    </div>
  );
};

const Select = ({ name, value, onChange, options, placeholder = 'Select option', label }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent pr-10"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: getShipmentStatusDisplayText(status),
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Clock
  };
  const Icon = config.icon;
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs', lg: 'px-3 py-1.5 text-sm' };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizes[size]}`}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </span>
  );
};

const ShipmentModeBadge = ({ classification }) => {
  const mainType = classification?.mainType || 'standard';
  const label = getShipmentModeLabel(mainType);
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
};

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-24">
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="rounded-full transition-all duration-500 h-1.5"
          style={{ width: `${progress}%`, backgroundColor: progress === 100 ? COLORS.success : COLORS.primary }}
        />
      </div>
    </div>
  );
};

const ActionMenu = ({ shipment, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - 192)
    });
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    updateMenuPosition();

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [showMenu, updateMenuPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedShipmentStatus = normalizeShipmentStatus(shipment?.shipmentStatus || shipment?.status);

  const actions = [
    { label: 'View Details', icon: Eye, action: 'view', color: 'text-blue-600', show: true },
    { label: 'Update Status', icon: Edit3, action: 'updateStatus', color: 'text-green-600', show: normalizedShipmentStatus !== 'cancelled' && normalizedShipmentStatus !== 'completed' }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!showMenu) updateMenuPosition();
          setShowMenu(!showMenu);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {showMenu && (
        <div
          className="fixed w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-[200] py-1"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          {actions.filter(a => a.show).map((action) => (
            <button
              key={action.action}
              onClick={() => { onAction(action.action, shipment); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, onClick, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all duration-200
        hover:shadow-md hover:border-[${COLORS.primary}]/30
        ${active ? `border-[${COLORS.primary}] ring-2 ring-[${COLORS.primary}]/20 bg-[${COLORS.primaryLight}]` : 'border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-300 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} w-full`}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== UPDATE STATUS MODAL ==================== 

// ==================== UPDATE STATUS MODAL ==================== 

const UpdateStatusModal = ({
  isOpen,
  onClose,
  shipment,
  currentStatus,
  onStatusUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateDate, setUpdateDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [updateTime, setUpdateTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [remarks, setRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const normalizedCurrentStatus = normalizeShipmentStatus(currentStatus);
  const currentOrder = getStatusOrder(normalizedCurrentStatus);
  const shipmentFlowStatuses = getShipmentFlowStatuses(shipment, normalizedCurrentStatus);

  // Get all statuses based on current status
  const getAvailableStatuses = () => {
    if (normalizedCurrentStatus === 'on_hold') {
      // When on hold, only show Resume (previous active status) and Cancel
      const previousActiveStatus = normalizeShipmentStatus(shipment?.lastActiveStatus || shipment?.initialShipmentStatus || 'departed_port_of_origin');
      return [
        { value: previousActiveStatus, label: `Resume (${getShipmentStatusDisplayText(previousActiveStatus)})`, order: getStatusOrder(previousActiveStatus), isResume: true },
        { value: 'cancelled', label: 'Cancelled', order: 99, isCancelled: true }
      ];
    }

    if (normalizedCurrentStatus === 'cancelled' || normalizedCurrentStatus === 'completed') {
      return [];
    }

    if (normalizedCurrentStatus === 'delivered') {
      return [{ value: 'completed', label: 'Completed', order: getStatusOrder('completed') }];
    }
    
    // Normal flow - show shipment path from its start status + always-available branch actions.
    return [
      ...shipmentFlowStatuses,
      { value: 'on_hold', label: 'On Hold', order: 97, isOnHold: true },
      { value: 'cancelled', label: 'Cancelled', order: 99, isCancelled: true }
    ];
  };

  const availableStatuses = getAvailableStatuses();

  // Get immediate next status for normal flow
  const getImmediateNextStatus = () => {
    if (normalizedCurrentStatus === 'on_hold') return null;

    const next = shipmentFlowStatuses
      .filter((s) => s.order > currentOrder)
      .sort((a, b) => a.order - b.order)[0];

    return next?.value || null;
  };

  const immediateNextStatus = getImmediateNextStatus();

  // Check if status is selectable
  const isStatusSelectable = (statusValue, statusItem) => {
    // If on hold, only resume and cancel are selectable
    if (normalizedCurrentStatus === 'on_hold') {
      return statusItem.isResume || statusItem.isCancelled;
    }

    // Normal flow rules
    if (NON_LINEAR_STATUSES.includes(statusValue)) return true;
    return statusValue === immediateNextStatus;
  };

  // Check if status is past (completed)
  const isPast = (order) => {
    if (normalizedCurrentStatus === 'on_hold') return false;
    return order < currentOrder;
  };

  // Check if status is current
  const isCurrent = (order, value) => {
    if (normalizedCurrentStatus === 'on_hold') return false;
    return order === currentOrder && value === normalizedCurrentStatus;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      // Properly handle timezone - create date in local timezone, not UTC
      const [year, month, day] = updateDate.split('-');
      const [hours, minutes] = updateTime.split(':');
      
      // Create timestamp in local timezone
      const localTimestamp = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0);
      
      // Format for API storage
      const updateDateTime = `${updateDate}T${updateTime}:00`;

      const payload = {
        status: selectedStatus,
        notes: remarks,
        updatedBy: "admin",
        updateDateTime,
        timestamp: localTimestamp.toISOString(), // Store as ISO string for proper timezone handling
        date: updateDate, // Store date string separately for client display
        time: updateTime // Store time string separately for client display
      };

      // If resuming from on_hold, send the status to resume to
      if (normalizedCurrentStatus === 'on_hold' && selectedStatus !== 'cancelled') {
        payload.resumeTo = selectedStatus;
      }

      const response = await updateShipmentStatus(shipment._id, payload);

      if (response.success) {
        toast.success(
          normalizedCurrentStatus === 'on_hold' && selectedStatus !== 'cancelled'
            ? `Resumed to ${getShipmentStatusDisplayText(selectedStatus)}`
            : `Updated → ${getShipmentStatusDisplayText(selectedStatus)}`
        );
        onStatusUpdate(selectedStatus);
        onClose();
      } else {
        toast.error(response.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
      setShowConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Update Shipment Status" size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CURRENT STATUS */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Current Status</p>
            <StatusBadge status={normalizedCurrentStatus} />
            {normalizedCurrentStatus === 'on_hold' && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Shipment is on hold. You can resume or cancel.
              </p>
            )}
          </div>

          {/* INFO BOX */}
          {normalizedCurrentStatus !== 'on_hold' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Only next step, On Hold, or Cancel allowed
            </div>
          )}

          {/* STATUS LIST */}
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
            {availableStatuses.map((status) => {
              const statusValue = status.value || status;
              const statusLabel = status.label || getShipmentStatusDisplayText(statusValue);
              const isResumeItem = status.isResume;
              const isCancelledItem = status.isCancelled;
              
              const selectable = isStatusSelectable(statusValue, status);
              const disabled = !selectable;

              const past = isPast(status.order);
              const current = isCurrent(status.order, statusValue);
              const next = statusValue === immediateNextStatus && normalizedCurrentStatus !== 'on_hold';
              const isOnHold = statusValue === 'on_hold' && normalizedCurrentStatus !== 'on_hold';

              // Special styling for on_hold status in normal flow
              if (isOnHold && !disabled) {
                return (
                  <label
                    key={statusValue}
                    className={`
                      flex items-center p-3 rounded-lg border-2 border-dashed
                      ${selectedStatus === statusValue ? "border-red-500 bg-red-50" : "border-yellow-400 bg-yellow-50"}
                      hover:bg-yellow-100 cursor-pointer transition-all
                    `}
                  >
                    <input
                      type="radio"
                      disabled={disabled}
                      value={statusValue}
                      checked={selectedStatus === statusValue}
                      onChange={(e) => {
                        if (selectable) setSelectedStatus(e.target.value);
                      }}
                    />
                    <div className="ml-3 flex-1 flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-700">
                        ⏸️ {statusLabel}
                      </span>
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 rounded-full">
                        Pause Shipment
                      </span>
                    </div>
                  </label>
                );
              }

              // Resume item styling
              if (isResumeItem) {
                return (
                  <label
                    key={statusValue}
                    className={`
                      flex items-center p-3 rounded-lg border-2 border-green-500 bg-green-50
                      ${selectedStatus === statusValue ? "border-green-700 bg-green-100" : ""}
                      hover:bg-green-100 cursor-pointer transition-all
                    `}
                  >
                    <input
                      type="radio"
                      disabled={disabled}
                      value={statusValue}
                      checked={selectedStatus === statusValue}
                      onChange={(e) => {
                        if (selectable) setSelectedStatus(e.target.value);
                      }}
                    />
                    <div className="ml-3 flex-1 flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">
                        ▶️ {statusLabel}
                      </span>
                      <span className="text-xs bg-green-200 text-green-800 px-2 rounded-full">
                        Resume
                      </span>
                    </div>
                  </label>
                );
              }

              // Normal status styling
              return (
                <label
                  key={statusValue}
                  className={`
                    flex items-center p-3 rounded-lg border
                    ${current ? "border-blue-400 bg-blue-50" : ""}
                    ${selectedStatus === statusValue ? "border-red-500 bg-red-50" : ""}
                    ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}
                  `}
                >
                  <input
                    type="radio"
                    disabled={disabled}
                    value={statusValue}
                    checked={selectedStatus === statusValue}
                    onChange={(e) => {
                      if (selectable) setSelectedStatus(e.target.value);
                    }}
                  />

                  <div className="ml-3 flex-1 flex justify-between items-center flex-wrap gap-2">
                    <span className={`text-sm font-medium ${isCancelledItem ? "text-red-600" : ""}`}>
                      {statusLabel}
                    </span>

                    <div className="flex gap-2 flex-wrap">
                      {next && !isCancelledItem && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 rounded">
                          Next Step
                        </span>
                      )}

                      {current && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 rounded">
                          Current
                        </span>
                      )}

                      {past && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 rounded">
                          Completed
                        </span>
                      )}

                      {disabled && !isCancelledItem && !isOnHold && !isResumeItem && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 rounded flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </span>
                      )}

                      {isCancelledItem && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 rounded">
                          Cancel Shipment
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* DATE AND TIME */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Date
              </label>
              <input
                type="date"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            
          </div>

          {/* REMARKS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks / Notes
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={
                normalizedCurrentStatus === 'on_hold'
                  ? "Reason for resuming or cancelling..."
                  : "Reason for status change..."
              }
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-green-500 text-white" type="submit"  disabled={!selectedStatus}>
              Continue
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM MODAL */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Status Update" size="sm">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <p className="text-sm text-gray-600">Change status from</p>
            <p className="text-lg font-semibold text-gray-900 my-1">
              {getShipmentStatusDisplayText(normalizedCurrentStatus)}
            </p>
            <p className="text-sm text-gray-600">→</p>
            <p className="text-lg font-semibold text-red-600 my-1">
              {selectedStatus === 'on_hold' 
                ? 'On Hold (Paused)' 
                : normalizedCurrentStatus === 'on_hold' && selectedStatus !== 'cancelled'
                ? `Resume to ${getShipmentStatusDisplayText(selectedStatus)}`
                : getShipmentStatusDisplayText(selectedStatus)}
            </p>
          </div>
          
          {/* Display Update Date & Time */}
          <div className="bg-blue-50 p-3 rounded-lg text-left">
            <p className="text-xs text-gray-500 mb-2">Update: {updateDate} </p>
          </div>

          {remarks && (
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-xs text-gray-500 mb-1">Remarks:</p>
              <p className="text-sm text-gray-700">{remarks}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="light" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500 text-white" type="button" onClick={handleConfirm} isLoading={isUpdating}>
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ==================== SHIPMENT DETAILS MODAL ====================
const ShipmentDetailsModal = ({ isOpen, onClose, shipment, onStatusUpdated }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [containerNumbers, setContainerNumbers] = useState(shipment?.containers || []);
  const [newContainer, setNewContainer] = useState({ containerNumber: "", sealNumber: "", blNumber: "" });
  const [transportEntries, setTransportEntries] = useState(
    Array.isArray(shipment?.transportLegs) && shipment.transportLegs.length > 0
      ? shipment.transportLegs
      : (shipment?.transport?.vesselName || shipment?.transport?.voyageNumber
        ? [{ vesselName: shipment.transport.vesselName || '', voyageNumber: shipment.transport.voyageNumber || '' }]
        : [])
  );
  const [newTransport, setNewTransport] = useState({ vesselName: '', voyageNumber: '' });
  const [bookingNumber, setBookingNumber] = useState(shipment?.bookingNumber || '');
  const [isSavingContainers, setIsSavingContainers] = useState(false);
  const [editingSender, setEditingSender] = useState(false);
  const [editingReceiver, setEditingReceiver] = useState(false);
  const [senderData, setSenderData] = useState(shipment?.sender || {});
  const [receiverData, setReceiverData] = useState(shipment?.receiver || {});
  const [isSavingSenderReceiver, setIsSavingSenderReceiver] = useState(false);
  const currentShipmentStatus = normalizeShipmentStatus(shipment?.shipmentStatus || shipment?.status);

  React.useEffect(() => {
    if (isOpen && shipment) {
      setContainerNumbers(shipment?.containers || []);
      setSenderData(shipment?.sender || {});
      setReceiverData(shipment?.receiver || {});
      setTransportEntries(
        Array.isArray(shipment?.transportLegs) && shipment.transportLegs.length > 0
          ? shipment.transportLegs
          : (shipment?.transport?.vesselName || shipment?.transport?.voyageNumber
            ? [{ vesselName: shipment.transport.vesselName || '', voyageNumber: shipment.transport.voyageNumber || '' }]
            : [])
      );
      setNewTransport({ vesselName: '', voyageNumber: '' });
      setBookingNumber(shipment?.bookingNumber || '');
      setEditingSender(false);
      setEditingReceiver(false);
    }
  }, [isOpen, shipment]);

  if (!isOpen || !shipment) return null;

  const progress = getShipmentProgress(currentShipmentStatus);
  const totalWeight = shipment.shipmentDetails?.totalWeight || 0;
  const totalPackages = shipment.shipmentDetails?.totalPackages || 0;

  const handleStatusUpdate = (newStatus) => {
    if (onStatusUpdated) {
      onStatusUpdated();
    }
  };

  const handleUpdateStatusClick = () => {
    setShowUpdateModal(true);
  };

  const addContainer = () => {
    if (!newContainer.containerNumber && !newContainer.sealNumber && !newContainer.blNumber) {
      toast.warning("Please provide container number, seal number, or BL number");
      return;
    }
    setContainerNumbers([...containerNumbers, { ...newContainer }]);
    setNewContainer({ containerNumber: "", sealNumber: "", blNumber: "" });
    toast.success("Container/Seal/BL added");
  };

  const removeContainer = (index) => {
    setContainerNumbers(containerNumbers.filter((_, i) => i !== index));
    toast.success("Container removed");
  };

  const addTransport = () => {
    if (!newTransport.vesselName && !newTransport.voyageNumber) {
      toast.warning("Please provide vessel name or voyage number");
      return;
    }

    setTransportEntries([...transportEntries, { ...newTransport }]);
    setNewTransport({ vesselName: '', voyageNumber: '' });
    toast.success("Vessel/Voyage added");
  };

  const removeTransport = (index) => {
    setTransportEntries(transportEntries.filter((_, i) => i !== index));
    toast.success("Vessel/Voyage removed");
  };

  const resetShipmentDetails = () => {
    setContainerNumbers(shipment?.containers || []);
    setTransportEntries(
      Array.isArray(shipment?.transportLegs) && shipment.transportLegs.length > 0
        ? shipment.transportLegs
        : (shipment?.transport?.vesselName || shipment?.transport?.voyageNumber
          ? [{ vesselName: shipment.transport.vesselName || '', voyageNumber: shipment.transport.voyageNumber || '' }]
          : [])
    );
    setNewContainer({ containerNumber: "", sealNumber: "", blNumber: "" });
    setNewTransport({ vesselName: '', voyageNumber: '' });
  };

  const saveContainers = async () => {
    setIsSavingContainers(true);
    try {
      const normalizedTransports = transportEntries
        .map((entry) => ({
          vesselName: entry?.vesselName || '',
          voyageNumber: entry?.voyageNumber || ''
        }))
        .filter((entry) => entry.vesselName || entry.voyageNumber);

      const response = await updateShipmentStatus(shipment._id, {
        status: currentShipmentStatus,
        notes: 'Updated shipment containers and transport details',
        containers: containerNumbers,
        transports: normalizedTransports,
        transport: normalizedTransports[normalizedTransports.length - 1] || { vesselName: '', voyageNumber: '' },
        ...(bookingNumber.trim() && { bookingNumber: bookingNumber.trim() })
      });

      if (response.success) {
        toast.success('Containers saved successfully');
        if (onStatusUpdated) {
          onStatusUpdated();
        }
      } else {
        toast.error(response.message || 'Failed to save containers');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save containers');
    } finally {
      setIsSavingContainers(false);
    }
  };

  const saveSenderReceiverInfo = async () => {
    setIsSavingSenderReceiver(true);
    try {
      const updateData = {};
      if (editingSender) updateData.sender = senderData;
      if (editingReceiver) updateData.receiver = receiverData;

      const response = await updateSenderReceiverInfo(shipment._id, updateData);

      if (response.success) {
        toast.success('Sender and receiver information updated successfully');
        setEditingSender(false);
        setEditingReceiver(false);
        if (onStatusUpdated) {
          onStatusUpdated();
        }
      } else {
        toast.error(response.message || 'Failed to save sender/receiver information');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save sender/receiver information');
    } finally {
      setIsSavingSenderReceiver(false);
    }
  };

  const handleSenderChange = (field, value) => {
    setSenderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReceiverChange = (field, value) => {
    setReceiverData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (type, field, value) => {
    if (type === 'sender') {
      setSenderData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setReceiverData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    }
  };

  const renderEventContainers = (event) => {
    const containers = Array.isArray(event.containers) ? event.containers : [];
    const forcedContainer = event.containerNumber || event.containerNumbers;
    const forcedSeal = event.sealNumber || event.sealNumbers;

    if (containers.length === 0 && !forcedContainer && !forcedSeal) {
      return null;
    }

    const containerItems = containers.length > 0
      ? containers
      : [{ containerNumber: forcedContainer, sealNumber: forcedSeal }];

    return (
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-medium text-blue-700 mb-1">📦 Containers</p>
        {containerItems.map((container, idx) => (
          <p key={idx} className="text-xs text-blue-600">
            <span className="text-red-600">Container:</span> {container?.containerNumber || 'N/A'}{' '}
            <span className="text-red-600">Seal:</span> {container?.sealNumber || 'N/A'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Shipment Details" size="lg">
        <div className="space-y-5">
          {/* Header with Status Update Button */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">#{shipment.shipmentNumber}</h4>
              {shipment.trackingNumber && (
                <p className="text-sm text-red-500">Tracking: {shipment.trackingNumber}</p>
              )}
              {(shipment.bookingNumber || bookingNumber) && (
                <p className="text-sm text-blue-600 font-medium">Booking: {shipment.bookingNumber || bookingNumber}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={currentShipmentStatus} size="lg" />
              {currentShipmentStatus !== 'cancelled' && currentShipmentStatus !== 'completed' && (
                <Button size="sm" variant="light" onClick={handleUpdateStatusClick} icon={<Edit3 className="h-4 w-4" />}>
                  Update Status
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {currentShipmentStatus !== 'on_hold' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Shipment Progress</span>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
              <ProgressBar progress={progress} />
            </div>
          )}

          {/* Status Timeline Visualization */}
<div className="border rounded-lg p-4">
  <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
    <Activity className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
    Status Timeline
  </h5>
  <div className="flex flex-wrap gap-2">
    {(() => {
      const timelineEndStatus = (currentShipmentStatus === 'on_hold' || currentShipmentStatus === 'cancelled')
        ? normalizeShipmentStatus(shipment?.lastActiveStatus || shipment?.initialShipmentStatus || shipment?.status)
        : currentShipmentStatus;
      let timelineStatuses = getShipmentTimelineStatuses(shipment, timelineEndStatus)
        .filter((status) => status.value !== 'pending');
      
      // For manual shipping: filter delivered/completed based on current status
      if (currentShipmentStatus === 'delivered') {
        timelineStatuses = timelineStatuses.filter(s => s.value !== 'completed');
      } else if (currentShipmentStatus === 'completed') {
        timelineStatuses = timelineStatuses.filter(s => s.value !== 'delivered' || s.value === 'completed');
      }
      
      const currentOrder = getStatusOrder(timelineEndStatus);

      return timelineStatuses.map((status, index) => {
        const statusOrder = status.order;
        const isCompleted = statusOrder < currentOrder;
        const isCurrent = status.value === timelineEndStatus;

        return (
          <div key={status.value} className="flex items-center">
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
              ${isCompleted ? 'bg-green-100 text-green-700' : ''}
              ${isCurrent ? 'bg-red-100 text-red-700 border border-red-300' : ''}
              ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-500' : ''}
            `}>
              {status.label}
            </div>
            {index < timelineStatuses.length - 1 && (
              <ChevronRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
            )}
          </div>
        );
      });
    })()}
  </div>
  {(currentShipmentStatus === 'on_hold' || currentShipmentStatus === 'cancelled') && (
    <p className="mt-2 text-xs text-red-600">
      {currentShipmentStatus === 'on_hold'
        ? 'Shipment is on hold. The timeline above stops at the last active shipment step.'
        : 'Shipment is cancelled. The timeline above stops at the last active shipment step.'}
    </p>
  )}
</div>

          {/* CONTAINER AND SEAL NUMBERS - For Full Shipment */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Box className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              📦 Container & Seal Numbers
            </h5>
            
            {/* Container Number Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Container Number
              </label>
              <input
                type="text"
                placeholder="Enter container number"
                value={newContainer.containerNumber}
                onChange={(e) => setNewContainer({ ...newContainer, containerNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
              />
            </div>

            {/* Seal Number Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Seal Number
              </label>
              <input
                type="text"
                placeholder="Enter seal number"
                value={newContainer.sealNumber}
                onChange={(e) => setNewContainer({ ...newContainer, sealNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
              />
            </div>

            {/* BL Number Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                BL Number
              </label>
              <input
                type="text"
                placeholder="Enter BL number"
                value={newContainer.blNumber}
                onChange={(e) => setNewContainer({ ...newContainer, blNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
              />
            </div>

             {/* Add Button */}
            <Button 
              type="button" 
              size="sm" 
              className="w-full mb-3 bg-red-500 text-white" 
              onClick={addContainer}
              icon={<Plus className="h-3 w-3" />}
            >
              Add Container/Seal/BL
            </Button>

            {/* List of Containers */}
            {containerNumbers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <p className="text-xs text-gray-600 font-medium mb-2">Added Containers ({containerNumbers.length}):</p>
                {containerNumbers.map((container, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                    <div className="flex-1">
                      <p className="text-xs text-red-600 font-medium">#{index + 1}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        <span className="font-medium">Container:</span> {container.containerNumber}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Seal:</span> {container.sealNumber}
                      </p>
                      {container.blNumber && (
                        <p className="text-xs text-gray-700">
                          <span className="font-medium">BL:</span> {container.blNumber}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContainer(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600 flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {containerNumbers.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">No containers added yet</p>
            )}

            {/* Vessel and Voyage Inputs */}
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center mt-6">Add Vessel and Voyage Information</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vessel Name</label>
                <input
                  type="text"
                  placeholder="Enter vessel name"
                  value={newTransport.vesselName}
                  onChange={(e) => setNewTransport({ ...newTransport, vesselName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Voyage Number</label>
                <input
                  type="text"
                  placeholder="Enter voyage number"
                  value={newTransport.voyageNumber}
                  onChange={(e) => setNewTransport({ ...newTransport, voyageNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="light"
              size="sm"
              className="w-full mb-3"
              onClick={addTransport}
              icon={<Plus className="h-3 w-3" />}
            >
              Add Vessel/Voyage
            </Button>

            {transportEntries.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 mb-3">
                <p className="text-xs text-gray-600 font-medium mb-2">Added Vessel/Voyage ({transportEntries.length}):</p>
                {transportEntries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                    <div className="flex-1">
                      <p className="text-xs text-red-600 font-medium">#{index + 1}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        <span className="font-medium">Vessel:</span> {entry.vesselName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Voyage:</span> {entry.voyageNumber || 'N/A'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTransport(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600 flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {transportEntries.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">No vessel/voyage added yet</p>
            )}

           

            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={resetShipmentDetails}
                disabled={isSavingContainers}
              >
                Reset
              </Button>
              <Button
                type="button"
                className="bg-green-500 text-white"
                size="sm"
                onClick={saveContainers}
                isLoading={isSavingContainers}
              >
                Save Shipment Details
              </Button>
            </div>
          </div>

          {/* Rest of the modal content remains the same */}
          {/* Sender & Receiver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender Information */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Sender Information
                </h5>
                <button
                  onClick={() => setEditingSender(!editingSender)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  {editingSender ? '✕ Cancel' : '✎ Edit'}
                </button>
              </div>
              
              {!editingSender ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{senderData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium">{senderData?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{senderData?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{senderData?.phone || 'N/A'}</p>
                  </div>
                  {senderData?.address && (
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">
                        {senderData.address.addressLine1}{senderData.address.addressLine2 ? ', ' + senderData.address.addressLine2 : ''}
                        {senderData.address.city ? ', ' + senderData.address.city : ''}
                        {senderData.address.state ? ', ' + senderData.address.state : ''}
                        {senderData.address.country ? ', ' + senderData.address.country : ''}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={senderData?.name || ''}
                    onChange={(e) => handleSenderChange('name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={senderData?.companyName || ''}
                    onChange={(e) => handleSenderChange('companyName', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={senderData?.email || ''}
                    onChange={(e) => handleSenderChange('email', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={senderData?.phone || ''}
                    onChange={(e) => handleSenderChange('phone', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            {/* Receiver Information */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Receiver Information
                </h5>
                <button
                  onClick={() => setEditingReceiver(!editingReceiver)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  {editingReceiver ? '✕ Cancel' : '✎ Edit'}
                </button>
              </div>
              
              {!editingReceiver ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{receiverData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium">{receiverData?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{receiverData?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{receiverData?.phone || 'N/A'}</p>
                  </div>
                  {receiverData?.address && (
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">
                        {receiverData.address.addressLine1}{receiverData.address.addressLine2 ? ', ' + receiverData.address.addressLine2 : ''}
                        {receiverData.address.city ? ', ' + receiverData.address.city : ''}
                        {receiverData.address.state ? ', ' + receiverData.address.state : ''}
                        {receiverData.address.country ? ', ' + receiverData.address.country : ''}
                      </p>
                    </div>
                  )}
                  {receiverData?.deliveryInstructions && (
                    <div>
                      <p className="text-xs text-gray-500">Delivery Instructions</p>
                      <p className="text-sm font-medium">{receiverData.deliveryInstructions}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={receiverData?.name || ''}
                    onChange={(e) => handleReceiverChange('name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={receiverData?.companyName || ''}
                    onChange={(e) => handleReceiverChange('companyName', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={receiverData?.email || ''}
                    onChange={(e) => handleReceiverChange('email', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={receiverData?.phone || ''}
                    onChange={(e) => handleReceiverChange('phone', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <textarea
                    placeholder="Delivery Instructions"
                    value={receiverData?.deliveryInstructions || ''}
                    onChange={(e) => handleReceiverChange('deliveryInstructions', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows="2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save Button for Sender/Receiver when editing */}
          {(editingSender || editingReceiver) && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={() => {
                  setEditingSender(false);
                  setEditingReceiver(false);
                  setSenderData(shipment?.sender || {});
                  setReceiverData(shipment?.receiver || {});
                }}
              >
                Discard
              </Button>
              <Button
                type="button"
                className="bg-green-500 text-white"
                size="sm"
                isLoading={isSavingSenderReceiver}
                onClick={saveSenderReceiverInfo}
              >
                Save Changes
              </Button>
            </div>
          )}

          {/* Customer Info - kept for backward compatibility but will show both sender/receiver above */}
          {!shipment.sender && !shipment.receiver && (
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                Customer Information
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium">{shipment.customerInfo?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm font-medium">{shipment.customerInfo?.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{shipment.customerInfo?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{shipment.customerInfo?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shipment Details */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Shipment Details
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="text-sm font-medium">{shipment.shipmentDetails?.origin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-medium">{shipment.shipmentDetails?.destination || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mode</p>
                <ShipmentModeBadge classification={shipment.shipmentClassification} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Shipping Mode</p>
                <p className="text-sm font-medium">{shipment.shipmentDetails?.shippingMode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Packages</p>
                <p className="text-sm font-medium">{totalPackages}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Weight</p>
                <p className="text-sm font-medium">{totalWeight} kg</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Schedule
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Created Date</p>
                <p className="text-sm font-medium">
                  {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {shipment.lastStatusUpdate && (
                <div>
                  <p className="text-xs text-gray-500">Last Status Update</p>
                  <p className="text-sm font-medium">
                    {new Date(shipment.lastStatusUpdate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
              Pricing
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Quoted Amount</p>
                <p className="text-sm font-medium">{shipment.quotedPrice?.amount} {shipment.quotedPrice?.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="text-sm font-medium capitalize">{shipment.payment?.status || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timeline Events */}
          {shipment.timeline && shipment.timeline.length > 0 && (() => {
            // Filter and organize timeline for manual shipping
            let filteredTimeline = [...shipment.timeline];
            
            // For manual shipments: don't show 'completed' in timeline if current status is 'delivered'
            if (currentShipmentStatus === 'delivered') {
              filteredTimeline = filteredTimeline.filter(event => 
                normalizeShipmentStatus(event.status) !== 'completed'
              );
            }
            
            // For manual shipments: don't show 'delivered' in timeline if current status is 'completed'
            if (currentShipmentStatus === 'completed') {
              filteredTimeline = filteredTimeline.filter(event => 
                normalizeShipmentStatus(event.status) !== 'delivered' ||
                // But keep the completed entry
                normalizeShipmentStatus(event.status) === 'completed'
              );
            }
            
            // Sort chronologically (oldest first) for display
            const sortedTimeline = filteredTimeline.sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            return filteredTimeline.length > 0 ? (
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Activity Timeline
                </h5>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {sortedTimeline.map((event, index) => {
                    const normalizedEventStatus = normalizeShipmentStatus(event.status);
                    const isOnHoldEvent = normalizedEventStatus === 'on_hold';
                    const isResumeAfterHold = index > 0 && 
                      normalizeShipmentStatus(sortedTimeline[index - 1].status) === 'on_hold' &&
                      normalizedEventStatus !== 'cancelled';
                    
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div 
                            className="w-2 h-2 mt-2 rounded-full" 
                            style={{ 
                              backgroundColor: isOnHoldEvent ? '#f59e0b' : COLORS.primary
                            }}
                          ></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {event.status?.replace(/_/g, ' ')}
                            </p>
                            {isResumeAfterHold && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Resumed
                              </span>
                            )}
                            {isOnHoldEvent && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                Paused
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                          )}
                          {event.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          )}
                          {/* Display containers if present */}
                          {renderEventContainers(event)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}

          <div className="flex justify-end pt-4">
            <Button type="button" className="bg-red-500 text-white" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        shipment={shipment}
        currentStatus={currentShipmentStatus}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

// ==================== MAIN COMPONENT ====================
export default function AllShipments() {
  const router = useRouter(); 
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, [router]);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [summary, setSummary] = useState({ total: 0, active: 0, delivered: 0, on_hold: 0, cancelled: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStat, setActiveStat] = useState('all');
  const [filters, setFilters] = useState({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.status && { status: filters.status })
      };
      
      if (searchTerm) params.search = searchTerm;

      const response = await getAllNewShipments(params);
      
      if (response.success) {
        setShipments(response.data || []);
        setPagination(response.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
        const shipmentsData = response.data || [];
        const responseSummary = response.summary || {};
        const onHoldFromData = shipmentsData.filter(s => (s.shipmentStatus || s.status) === 'on_hold').length;
        setSummary({
          total: responseSummary.total ?? shipmentsData.length,
          active: responseSummary.active ?? shipmentsData.filter(s => !['delivered', 'cancelled', 'on_hold'].includes(s.shipmentStatus || s.status)).length,
          delivered: responseSummary.delivered ?? shipmentsData.filter(s => (s.shipmentStatus || s.status) === 'delivered').length,
          on_hold: responseSummary.on_hold ?? responseSummary.onHold ?? onHoldFromData,
          cancelled: responseSummary.cancelled ?? shipmentsData.filter(s => (s.shipmentStatus || s.status) === 'cancelled').length
        });

        return shipmentsData;
      } else {
        toast.error(response.message || 'Failed to fetch shipments');
        return [];
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch shipments');
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.status, searchTerm]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchShipments();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchShipments]);

  const handleSort = (field) => {
    const sortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveStat('all');
    setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc', status: '' });
    toast.info('Filters cleared');
  };

  const handleAction = (action, shipment) => {
    setSelectedShipment(shipment);
    if (action === 'view') {
      setShowDetailsModal(true);
    } else if (action === 'updateStatus') {
      setShowDetailsModal(true);
    }
  };

  const handleStatusUpdated = async () => {
    const latestShipments = await fetchShipments();

    if (!selectedShipment?._id || !Array.isArray(latestShipments)) {
      return;
    }

    const refreshedSelectedShipment = latestShipments.find(
      (item) => item?._id === selectedShipment._id
    );

    if (refreshedSelectedShipment) {
      setSelectedShipment(refreshedSelectedShipment);
    }
  };

  const filterByStatus = (status) => {
    setActiveStat(status);
    const statusMap = {
      all: '',
      active: '',
      delivered: 'delivered',
      on_hold: 'on_hold',
      cancelled: 'cancelled'
    };
    setFilters(prev => ({ ...prev, page: 1, status: statusMap[status] ?? '' }));
  };

  const displayedShipments = shipments.filter((shipment) => {
    const status = shipment.shipmentStatus || shipment.status;
    if (activeStat === 'delivered') return status === 'delivered';
    if (activeStat === 'on_hold') return status === 'on_hold';
    if (activeStat === 'cancelled') return status === 'cancelled';
    if (activeStat === 'active') return !['delivered', 'cancelled', 'on_hold'].includes(status);
    return true;
  });

  const handleExport = () => {
    if (shipments.length === 0) {
      toast.warning('No shipments to export');
      return;
    } 
    toast.success(`${shipments.length} shipments exported!`);
  };

  const visibleStats = [
    { key: 'all', label: 'All Shipments', value: summary.total, icon: Package, color: 'bg-gray-100 text-gray-600' },
    { key: 'active', label: 'Active', value: summary.active, icon: Activity, color: 'bg-blue-100 text-blue-600' },
    { key: 'delivered', label: 'Delivered', value: summary.delivered, icon: CheckCircleSolid, color: 'bg-green-100 text-green-600' },
    { key: 'on_hold', label: 'On Hold', value: summary.on_hold || 0, icon: AlertTriangle, color: 'bg-amber-100 text-amber-700' },
    { key: 'cancelled', label: 'Cancelled', value: summary.cancelled, icon: XCircleSolid, color: 'bg-red-100 text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                  <Package className="h-4 w-4" style={{ color: COLORS.primary }} />
                </div>
                <h1 className="ml-2 text-lg font-semibold text-gray-900">Shipments Management</h1>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {summary.total} Total
              </span>
            </div> 
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {visibleStats.map(stat => (
            <StatCard 
              key={stat.key}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              active={activeStat === stat.key}
              onClick={() => filterByStatus(stat.key)}
            />
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <Input 
              type="text" 
              placeholder="Search by shipment number, tracking number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('shipmentNumber')}>
                      Shipment Info
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('createdAt')}>
                      Created
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
                        <span className="ml-2 text-sm text-gray-500">Loading shipments...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayedShipments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">No shipments found</p>
                        {(searchTerm) && (
                          <Button variant="light" size="sm" onClick={clearFilters} className="mt-3">
                            Clear search
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedShipments.map((shipment) => {
                    const displayNumber = shipment.shipmentNumber || shipment._id?.slice(-8).toUpperCase();
                    const progress = getShipmentProgress(shipment.shipmentStatus || shipment.status);
                    const totalPackages = shipment.shipmentDetails?.totalPackages || 
                      (shipment.shipmentDetails?.packageDetails?.length || 0);
                    
                    return (
                      <tr key={shipment._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div>
                            <button
                              onClick={() => { setSelectedShipment(shipment); setShowDetailsModal(true); }}
                              className="text-sm font-medium hover:underline text-left"
                              style={{ color: COLORS.primary }}
                            >
                              {displayNumber}
                            </button>
                            {shipment.trackingNumber && (
                              <div className="text-xs text-red-500 flex items-center mt-0.5">
                                <Hash className="h-3 w-3 mr-1" />
                                {shipment.trackingNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.customerInfo?.name || 
                             shipment.customerInfo?.companyName || 
                             'N/A'}
                          </div>
                          {shipment.customerInfo?.email && (
                            <div className="text-xs text-gray-500 truncate max-w-[180px]">
                              {shipment.customerInfo.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-xs">
                            <span className="font-medium text-gray-900 max-w-[100px] truncate">
                              {shipment.shipmentDetails?.origin || 'N/A'}
                            </span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900 max-w-[100px] truncate">
                              {shipment.shipmentDetails?.destination || 'N/A'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <ShipmentModeBadge classification={shipment.shipmentClassification} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="text-gray-900">
                              {shipment.createdAt
                                ? new Date(shipment.createdAt).toLocaleDateString()
                                : 'N/A'}
                            </div>
                            {shipment.createdAt && (
                              <div className="text-gray-500">
                                {new Date(shipment.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="text-gray-900">{totalPackages} pkgs</div>
                            {shipment.shipmentDetails?.totalWeight > 0 && (
                              <div className="text-gray-500">{shipment.shipmentDetails.totalWeight} kg</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <StatusBadge status={shipment.shipmentStatus || shipment.status} size="sm" />
                            <ProgressBar progress={progress} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu shipment={shipment} onAction={handleAction} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="border-t px-4 py-3 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-600">
                    Showing {(pagination.page - 1) * filters.limit + 1} to {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total} results
                  </span>
                  <Select 
                    name="limit" 
                    value={filters.limit} 
                    onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))} 
                    options={[
                      { value: 10, label: '10 / page' }, 
                      { value: 20, label: '20 / page' }, 
                      { value: 50, label: '50 / page' }
                    ]} 
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: 1 }))} 
                    disabled={filters.page === 1} 
                    icon={<ChevronsLeft className="h-4 w-4" />} 
                  />
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} 
                    disabled={filters.page === 1} 
                    icon={<ChevronLeft className="h-4 w-4" />} 
                  />
                  <span className="text-sm text-gray-600 px-3">
                    Page {filters.page} of {pagination.pages}
                  </span>
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} 
                    disabled={filters.page === pagination.pages} 
                    icon={<ChevronRight className="h-4 w-4" />} 
                  />
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setFilters(prev => ({ ...prev, page: pagination.pages }))} 
                    disabled={filters.page === pagination.pages} 
                    icon={<ChevronsRight className="h-4 w-4" />} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        shipment={selectedShipment}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}