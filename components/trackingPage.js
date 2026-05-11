'use client';

// Import the client tracking page component with all the canonical status logic
// The dashboard will use the same tracking interface as the client
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, Package, MapPin, Calendar, Clock, Ship, Truck,
  Weight, Box, Layers, ChevronDown, ChevronUp, FileText,
  Container, User, Building, Phone, Mail, CheckCircle,
  AlertCircle, XCircle, Download, QrCode, Shield, Activity,
  Award, Send, Play, Pause, Ban, RotateCcw, Flag, Home,
  RefreshCw, Undo2, Copy, Share2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { trackByNumber } from '@/services/booking'; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TrackingPDF } from '@/components/trackingPdf';

// ==================== CANONICAL 16-STATUS STEPS ====================
// Timeline shows EXACTLY these 16 statuses in this order
const CANONICAL_STATUS_STEPS = [
  { status: 'booking', label: 'Booking', icon: Package, order: 0 },
  { status: 'pending', label: 'Pending', icon: Package, order: 1 },
  { status: 'picked_up_from_warehouse', label: 'Picked up from Warehouse', icon: Truck, order: 2 },
  { status: 'loaded_into_container', label: 'Loaded into Container', icon: Container, order: 3 },
  { status: 'container_sealed', label: 'Container Sealed', icon: Shield, order: 4 },
  { status: 'departed_port_of_origin', label: 'Departed Port of Origin', icon: Ship, order: 5 },
  { status: 'in_transit_sea_freight', label: 'In Transit (Sea Freight)', icon: Ship, order: 6 },
  { status: 'arrived_at_destination_port', label: 'Arrived at Destination Port', icon: Flag, order: 7 },
  { status: 'under_customs_clearance', label: 'Under Customs Clearance', icon: Shield, order: 8 },
  { status: 'customs_cleared', label: 'Customs Cleared', icon: Shield, order: 9 },
  { status: 'unloaded_from_vessel', label: 'Unloaded from Vessel', icon: Container, order: 10 },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, order: 11 },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle, order: 12 },
  { status: 'on_hold', label: 'On Hold', icon: Pause, order: 13 },
  { status: 'cancelled', label: 'Cancelled', icon: Ban, order: 14 },
  { status: 'returned', label: 'Returned', icon: RotateCcw, order: 15 }
];

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG = {
  'booking': { label: 'Booking', color: 'bg-gray-100 text-gray-600', icon: Package, progress: 5, order: 0, stage: 'pending' },
  'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Package, progress: 10, order: 1, stage: 'pending' },
  'picked_up_from_warehouse': { label: 'Picked up from Warehouse', color: 'bg-blue-100 text-blue-800', icon: Truck, progress: 20, order: 2, stage: 'warehouse' },
  'loaded_into_container': { label: 'Loaded into Container', color: 'bg-blue-200 text-blue-800', icon: Container, progress: 30, order: 3, stage: 'dispatch' },
  'container_sealed': { label: 'Container Sealed', color: 'bg-blue-300 text-blue-900', icon: Shield, progress: 35, order: 4, stage: 'dispatch' },
  'departed_port_of_origin': { label: 'Departed Port of Origin', color: 'bg-red-100 text-red-800', icon: Ship, progress: 40, order: 5, stage: 'transit' },
  'in_transit_sea_freight': { label: 'In Transit (Sea Freight)', color: 'bg-amber-100 text-amber-800', icon: Ship, progress: 50, order: 6, stage: 'transit' },
  'arrived_at_destination_port': { label: 'Arrived at Destination Port', color: 'bg-green-100 text-green-800', icon: Flag, progress: 60, order: 7, stage: 'arrival' },
  'under_customs_clearance': { label: 'Under Customs Clearance', color: 'bg-blue-100 text-blue-800', icon: Shield, progress: 70, order: 8, stage: 'customs' },
  'customs_cleared': { label: 'Customs Cleared', color: 'bg-emerald-100 text-emerald-800', icon: Shield, progress: 80, order: 9, stage: 'customs' },
  'unloaded_from_vessel': { label: 'Unloaded from Vessel', color: 'bg-emerald-100 text-emerald-800', icon: Container, progress: 85, order: 10, stage: 'customs' },
  'out_for_delivery': { label: 'Out for Delivery', color: 'bg-sky-100 text-sky-800', icon: Truck, progress: 90, order: 11, stage: 'delivery' },
  'delivered': { label: 'Delivered', color: 'bg-green-600 text-white', icon: CheckCircle, progress: 100, order: 12, stage: 'delivery' },
  'on_hold': { label: 'On Hold', color: 'bg-gray-100 text-gray-800', icon: Pause, progress: 50, order: 13, stage: 'hold' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Ban, progress: 0, order: 14, stage: 'cancelled' },
  'returned': { label: 'Returned', color: 'bg-red-100 text-red-800', icon: RotateCcw, progress: 100, order: 15, stage: 'return' }
};

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [expandedPackages, setExpandedPackages] = useState(new Set());
  const [activeTab, setActiveTab] = useState('timeline');
  const [timelineView, setTimelineView] = useState('newToOld');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  // Process hold/resume events
  const processTimelineForHoldResume = (data) => {
    if (!data?.timeline) return data;
    
    let timeline = [...data.timeline];
    let processedEvents = [];
    let currentStatus = null;
    let statusBeforeHold = null;
    let isOnHold = false;
    let holdEventEncountered = false;
    let originalStatusBeforeHold = null;
    
    timeline.sort((a, b) => {
      const dateA = new Date(a.date || a.timestamp || a.createdAt || 0);
      const dateB = new Date(b.date || b.timestamp || b.createdAt || 0);
      return dateA - dateB;
    });
    
    for (let i = 0; i < timeline.length; i++) {
      const event = timeline[i];
      const status = event.status?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      
      if (status === 'on_hold' || description.includes('on hold')) {
        if (!holdEventEncountered && currentStatus && currentStatus !== 'pending') {
          statusBeforeHold = currentStatus;
          originalStatusBeforeHold = currentStatus;
          holdEventEncountered = true;
        }
      } 
      else if (status !== 'on_hold' && !status.includes('hold')) {
        if (!(isOnHold && status === 'pending')) {
          currentStatus = status;
        }
      }
      
      if (status === 'on_hold' || description.includes('on hold')) {
        isOnHold = true;
      } else if (description.includes('resumed') || status.includes('resumed')) {
        isOnHold = false;
      }
    }
    
    currentStatus = null;
    isOnHold = false;
    holdEventEncountered = false;
    let restoredStatus = null;
    let pendingEvent = null;
    let bookingRequestedEvent = null;
    
    for (let i = 0; i < timeline.length; i++) {
      const event = timeline[i];
      const status = event.status?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      
      if (status === 'booking_requested') {
        bookingRequestedEvent = {
          ...event,
          mappedStatus: 'booking_requested',
          originalStatus: event.status,
          isHoldEvent: false,
          date: event.date || event.timestamp || event.createdAt || new Date().toISOString()
        };
        continue;
      }
      
      if (status === 'on_hold' || description.includes('on hold')) {
        if (!holdEventEncountered) {
          if (currentStatus && currentStatus !== 'pending') {
            statusBeforeHold = currentStatus;
          }
          isOnHold = true;
          holdEventEncountered = true;
          
          processedEvents.push({
            ...event,
            isHoldEvent: true,
            statusBeforeHold: statusBeforeHold,
            originalStatus: event.status,
            mappedStatus: 'on_hold'
          });
        }
        continue;
      }
      
      else if (description.includes('resumed from hold') || status.includes('resumed')) {
        isOnHold = false;
        
        if (statusBeforeHold && statusBeforeHold !== 'pending') {
          restoredStatus = statusBeforeHold;
          
          const restoredEvent = {
            ...event,
            status: statusBeforeHold,
            displayStatus: statusBeforeHold,
            mappedStatus: statusBeforeHold,
            description: `Shipment resumed from hold. Status restored to ${statusBeforeHold.replace(/_/g, ' ')}. ${event.description || ''}`,
            isResumeEvent: true,
            restoredFromHold: true,
            originalStatus: statusBeforeHold
          };
          processedEvents.push(restoredEvent);
          currentStatus = statusBeforeHold;
          statusBeforeHold = null;
        } else if (originalStatusBeforeHold) {
          restoredStatus = originalStatusBeforeHold;
          const restoredEvent = {
            ...event,
            status: originalStatusBeforeHold,
            displayStatus: originalStatusBeforeHold,
            mappedStatus: originalStatusBeforeHold,
            description: `Shipment resumed from hold. Status restored to ${originalStatusBeforeHold.replace(/_/g, ' ')}. ${event.description || ''}`,
            isResumeEvent: true,
            restoredFromHold: true,
            originalStatus: originalStatusBeforeHold
          };
          processedEvents.push(restoredEvent);
          currentStatus = originalStatusBeforeHold;
          originalStatusBeforeHold = null;
        }
        continue;
      }
      
      else {
        if (status === 'pending' && currentStatus && currentStatus !== 'pending') {
          continue;
        }
        
        if (status === 'pending' && !currentStatus) {
          pendingEvent = event;
          continue;
        }
        
        currentStatus = status;
        
        processedEvents.push({
          ...event,
          mappedStatus: status,
          originalStatus: event.status,
          isHoldEvent: false
        });
      }
    }
    
    if (bookingRequestedEvent) {
      let earliestDate = new Date();
      if (processedEvents.length > 0) {
        const firstEventDate = processedEvents[0].date || processedEvents[0].timestamp || processedEvents[0].createdAt;
        if (firstEventDate) {
          earliestDate = new Date(firstEventDate);
        }
      }
      const bookingDate = new Date(earliestDate);
      bookingDate.setMinutes(bookingDate.getMinutes() - 2);
      
      processedEvents.unshift({
        ...bookingRequestedEvent,
        date: bookingDate.toISOString(),
        timestamp: bookingDate.toISOString(),
        mappedStatus: 'booking_requested',
        isBookingRequest: true
      });
    }
    
    if (pendingEvent && processedEvents.length === 0) {
      processedEvents.unshift({
        ...pendingEvent,
        mappedStatus: 'pending',
        originalStatus: pendingEvent.status
      });
    }
    
    processedEvents = processedEvents.filter((event, index) => {
      const mappedStatus = event.mappedStatus || event.status?.toLowerCase() || '';
      if (mappedStatus === 'pending' && index > 0) {
        const hasNonPendingBefore = processedEvents.slice(0, index).some(e => {
          const s = e.mappedStatus || e.status?.toLowerCase() || '';
          return s !== 'pending' && s !== 'booking_requested';
        });
        if (hasNonPendingBefore) {
          return false;
        }
      }
      return true;
    });
    
    return {
      ...data,
      timeline: processedEvents,
      originalTimeline: timeline,
      status: restoredStatus || data.status
    };
  };

  // Get tracking number from URL on load
  const handleTrackFromUrl = useCallback(async (trackingNum) => {
    setLoading(true);
    setError(null);
    setTrackingData(null);
    
    try {
      const result = await trackByNumber(trackingNum);
      
      if (result.success) {
        const processedData = processTimelineForHoldResume(result.data);
        setTrackingData(processedData);
        toast.success('Tracking data found');
      } else {
        setError(result.message || 'No shipment found with this tracking number');
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch tracking data');
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trackingParam = searchParams.get('tracking');
    if (trackingParam) {
      setTrackingNumber(trackingParam.toUpperCase());
      handleTrackFromUrl(trackingParam.toUpperCase());
    }
  }, [searchParams, handleTrackFromUrl]);

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast.warning('Please enter a tracking number');
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set('tracking', trackingNumber.toUpperCase());
    router.push(`/tracking-number?${params.toString()}`, { scroll: false });

    setLoading(true);
    setError(null);
    setTrackingData(null);
    
    try {
      const result = await trackByNumber(trackingNumber);
      
      if (result.success) {
        const processedData = processTimelineForHoldResume(result.data);
        setTrackingData(processedData);
        toast.success('Tracking data found');
      } else {
        setError(result.message || 'No shipment found with this tracking number');
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch tracking data');
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Minimal implementation - placeholder for now
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Tracking Dashboard</h1>
        <p className="text-gray-600 mb-6">Use the tracking page to view shipment details and status updates</p>
        
        <form onSubmit={handleTrack} className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 border rounded-lg">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Enter tracking number (e.g., CLG-BC6944CD)"
                className="w-full px-3 py-4 focus:outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] disabled:bg-gray-300 font-medium"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-800 mb-2">Shipment Not Found</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {trackingData && !error && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{trackingData.trackingNumber || 'N/A'}</h2>
            <p className="text-gray-600 mb-4">
              Booking: {trackingData.bookingNumber || 'N/A'} | Shipment: {trackingData.shipmentNumber || 'N/A'}
            </p>
            <p className="text-gray-600">Status: {trackingData.status || 'Unknown'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
