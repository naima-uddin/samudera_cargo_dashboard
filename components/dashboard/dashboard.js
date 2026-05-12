// components/dashboard/DashboardSummary.jsx
"use client";
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Download,
  MoreVert,
  CalendarToday,
  Inventory,
  LocalShipping,
  Receipt,
  Payment,
  Warning,
  CheckCircle,
  Pending,
  Assessment,
  Warehouse,
  Flight,
  DirectionsBoat,
  LocalShipping as TruckIcon,
  Info
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

// Import all service functions
import { getCurrentUser, isAdmin, isStaff } from '@/services/Authentication';
import { getAllBookings, getMyBookingsSummary, getStatusDisplayText } from '@/services/booking';
import { getAllShipments, getShipmentStatistics, getShipmentStatusDisplayText } from '@/services/shipping';
import { getAllInvoices, getInvoiceStats, getPaymentStatusDisplayText } from '@/services/invoice';
import { getAllTrackings, getTrackingStats, getTrackingStatusDisplay } from '@/services/tracking';
import { getConsolidations, getConsolidationStats } from '@/services/consolidation';
import { getWarehouseDashboard, getExpectedShipments } from '@/services/warehouse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const DashboardSummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // State for all data
  const [summary, setSummary] = useState({
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
      chartData: []
    },
    shipments: {
      total: 0,
      inTransit: 0,
      delivered: 0,
      pending: 0,
      active: 0,
      chartData: []
    },
    invoices: {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      amount: 0,
      collected: 0,
      chartData: []
    },
    tracking: {
      total: 0,
      active: 0,
      delivered: 0,
      delayed: 0,
      chartData: []
    },
    consolidation: {
      total: 0,
      inProgress: 0,
      completed: 0,
      readyForDispatch: 0,
      totalVolume: 0,
      totalWeight: 0,
      chartData: []
    },
    warehouse: {
      expectedToday: 0,
      received: 0,
      inventory: 0,
      storageUsed: 0,
      storageCapacity: 0,
      pendingInspection: 0,
      zoneUtilization: []
    },
    user: null
  });

  const user = getCurrentUser();
  const isAdminUser = isAdmin();
  const isStaffUser = isStaff();

  const quickActions = [
    {
      title: 'Bookings',
      description: 'View all bookings or create a new booking request.',
      href: '/Bookings/all_bookings'
    },
    {
      title: 'Shipments',
      description: 'Track active shipments and review shipment details.',
      href: '/shippings/all_shipping'
    },
    {
      title: 'Invoices',
      description: 'Review invoice status and any pending payments.',
      href: '/shippings/invoice'
    },
    {
      title: 'Warehouse',
      description: 'Check warehouse inventory and shipment queues.',
      href: '/warehouse'
    }
  ];

  useEffect(() => {
    fetchAllDashboardData();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300000);
    
    return () => clearInterval(interval);
  }, [timeRange, refreshKey]);

  const fetchAllDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled([
        fetchBookingsData(),
        fetchShipmentsData(),
        fetchInvoicesData(),
        fetchTrackingData(),
        fetchConsolidationData(),
        fetchWarehouseData()
      ]);

      const failedRequests = results.filter(r => r.status === 'rejected');
      if (failedRequests.length > 0) {
        console.warn(`${failedRequests.length} dashboard requests failed`);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsData = async () => {
    try {
      // Get bookings based on user role
      let bookingsData;
      if (isAdminUser || isStaffUser) {
        bookingsData = await getAllBookings({ limit: 100 });
      } else {
        bookingsData = await getMyBookingsSummary();
      }

      if (bookingsData.success) {
        const bookings = bookingsData.data || [];
        
        // Calculate booking stats
        const stats = {
          total: bookings.length,
          pending: bookings.filter(b => b.status === 'booking_requested').length,
          quoted: bookings.filter(b => b.status === 'price_quoted').length,
          confirmed: bookings.filter(b => b.status === 'booking_confirmed').length,
          delivered: bookings.filter(b => b.status === 'delivered').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
          revenue: bookings.reduce((sum, b) => sum + (b.quotedPrice?.amount || 0), 0)
        };

        // Generate chart data for last 7 days
        const chartData = generateBookingChartData(bookings);

        setSummary(prev => ({
          ...prev,
          bookings: { ...stats, chartData }
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchShipmentsData = async () => {
    try {
      let shipmentsData;
      if (isAdminUser || isStaffUser) {
        shipmentsData = await getAllShipments({ limit: 100 });
      } else {
        shipmentsData = await getShipmentStatistics();
      }

      if (shipmentsData.success) {
        const shipments = shipmentsData.data || [];
        
        const stats = {
          total: shipments.length,
          inTransit: shipments.filter(s => s.status === 'in_transit').length,
          delivered: shipments.filter(s => s.status === 'delivered').length,
          pending: shipments.filter(s => s.status === 'pending').length,
          active: shipments.filter(s => !['delivered', 'cancelled'].includes(s.status)).length,
          chartData: generateShipmentChartData(shipments)
        };

        setSummary(prev => ({
          ...prev,
          shipments: { ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchInvoicesData = async () => {
    try {
      let invoicesData;
      if (isAdminUser || isStaffUser) {
        invoicesData = await getAllInvoices({ limit: 100 });
      } else {
        invoicesData = await getInvoiceStats();
      }

      if (invoicesData.success) {
        const invoices = invoicesData.data || [];
        
        const stats = {
          total: invoices.length,
          paid: invoices.filter(i => i.paymentStatus === 'paid').length,
          pending: invoices.filter(i => i.paymentStatus === 'pending').length,
          overdue: invoices.filter(i => i.paymentStatus === 'overdue').length,
          amount: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
          collected: invoices
            .filter(i => i.paymentStatus === 'paid')
            .reduce((sum, i) => sum + (i.totalAmount || 0), 0),
          chartData: generateInvoiceChartData(invoices)
        };

        setSummary(prev => ({
          ...prev,
          invoices: { ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchTrackingData = async () => {
    try {
      if (isAdminUser || isStaffUser) {
        const trackingData = await getAllTrackings({ limit: 100 });
        
        if (trackingData.success) {
          const trackings = trackingData.data || [];
          
          const stats = {
            total: trackings.length,
            active: trackings.filter(t => !['delivered', 'cancelled'].includes(t.status)).length,
            delivered: trackings.filter(t => t.status === 'delivered').length,
            delayed: trackings.filter(t => {
              if (t.estimatedDelivery && t.status !== 'delivered') {
                return new Date() > new Date(t.estimatedDelivery);
              }
              return false;
            }).length,
            chartData: generateTrackingChartData(trackings)
          };

          setSummary(prev => ({
            ...prev,
            tracking: { ...stats }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    }
  };

  const fetchConsolidationData = async () => {
    try {
      if (isAdminUser || isStaffUser) {
        const [consolidationsData, statsData] = await Promise.allSettled([
          getConsolidations({ limit: 100 }),
          getConsolidationStats()
        ]);

        const consolidations = consolidationsData.value?.data || [];
        const stats = statsData.value?.data || {};

        const calculatedStats = {
          total: consolidations.length,
          inProgress: consolidations.filter(c => c.status === 'in_progress').length,
          completed: consolidations.filter(c => c.status === 'completed').length,
          readyForDispatch: consolidations.filter(c => c.status === 'ready_for_dispatch').length,
          totalVolume: consolidations.reduce((sum, c) => sum + (c.totalVolume || 0), 0),
          totalWeight: consolidations.reduce((sum, c) => sum + (c.totalWeight || 0), 0),
          chartData: generateConsolidationChartData(consolidations)
        };

        setSummary(prev => ({
          ...prev,
          consolidation: { ...calculatedStats, ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching consolidation:', error);
    }
  };

  const fetchWarehouseData = async () => {
    try {
      if (isStaffUser) {
        const [dashboardData, expectedData] = await Promise.allSettled([
          getWarehouseDashboard(),
          getExpectedShipments({ limit: 100 })
        ]);

        const dashboard = dashboardData.value?.data || {};
        const expected = expectedData.value?.data || [];

        const stats = {
          expectedToday: expected.filter(e => {
            const expectedDate = new Date(e.expectedDeliveryDate);
            const today = new Date();
            return expectedDate.toDateString() === today.toDateString();
          }).length,
          received: dashboard.totalReceived || 0,
          inventory: dashboard.totalInventory || 0,
          storageUsed: dashboard.storageUsed || 0,
          storageCapacity: dashboard.storageCapacity || 100,
          pendingInspection: dashboard.pendingInspection || 0,
          zoneUtilization: dashboard.zoneUtilization || []
        };

        setSummary(prev => ({
          ...prev,
          warehouse: { ...stats }
        }));
      }
    } catch (error) {
      console.error('Error fetching warehouse:', error);
    }
  };

  // Helper functions for chart data generation
  const generateBookingChartData = (bookings) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      count: bookings.filter(b => b.createdAt?.startsWith(date)).length,
      revenue: bookings
        .filter(b => b.createdAt?.startsWith(date))
        .reduce((sum, b) => sum + (b.quotedPrice?.amount || 0), 0)
    }));
  };

  const generateShipmentChartData = (shipments) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      count: shipments.filter(s => s.createdAt?.startsWith(date)).length,
      delivered: shipments.filter(s => 
        s.status === 'delivered' && s.updatedAt?.startsWith(date)
      ).length
    }));
  };

  const generateInvoiceChartData = (invoices) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      count: invoices.filter(i => i.createdAt?.startsWith(date)).length,
      amount: invoices
        .filter(i => i.createdAt?.startsWith(date))
        .reduce((sum, i) => sum + (i.totalAmount || 0), 0)
    }));
  };

  const generateTrackingChartData = (trackings) => {
    const statuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered'];
    return statuses.map(status => ({
      status: getTrackingStatusDisplay(status),
      count: trackings.filter(t => t.status === status).length
    }));
  };

  const generateConsolidationChartData = (consolidations) => {
    const statuses = ['draft', 'in_progress', 'completed', 'ready_for_dispatch'];
    return statuses.map(status => ({
      status: status.replace('_', ' ').toUpperCase(),
      count: consolidations.filter(c => c.status === status).length
    }));
  };

  // Chart configurations
  const bookingChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const bookingChartData = {
    labels: summary.bookings.chartData.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Bookings',
        data: summary.bookings.chartData.map(d => d.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  const invoiceChartData = {
    labels: summary.invoices.chartData.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Invoice Amount',
        data: summary.invoices.chartData.map(d => d.amount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4
      }
    ]
  };

  const trackingPieData = {
    labels: summary.tracking.chartData.map(d => d.status),
    datasets: [{
      data: summary.tracking.chartData.map(d => d.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ]
    }]
  };

  const consolidationBarData = {
    labels: summary.consolidation.chartData.map(d => d.status),
    datasets: [{
      label: 'Consolidations',
      data: summary.consolidation.chartData.map(d => d.count),
      backgroundColor: 'rgba(153, 102, 255, 0.8)'
    }]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: '#f7f9fc', minWidth: 0, width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Grid container spacing={3} sx={{ mb: 4, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', maxWidth: '100%' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Samudera Traffic Co., Ltd. Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.88, mb: 3, maxWidth: { xs: '100%', md: '85%' } }}>
                Welcome back, {user?.firstName || user?.name || 'User'}! Track the latest bookings, shipments, invoices, and warehouse activity all in one place.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip label={`Role: ${isStaffUser ? 'Warehouse Staff' : isAdminUser ? 'Admin' : 'User'}`} color="secondary" />
                <Chip label={`Updated: ${new Date().toLocaleString()}`} variant="outlined" sx={{ borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }} />
              </Box>
              
            </Box>
          </Card>
        </Grid>

      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4, width: '100%', maxWidth: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={action.title}>
              <Paper sx={{ p: 3, minHeight: 170, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: index % 2 === 0 ? 'rgba(255,241,224,0.8)' : 'rgba(232,244,253,0.8)' }} elevation={2}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
                <Button component="a" href={action.href} variant="contained" size="small" sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, width: { xs: '100%', sm: 'auto' }, mt: 2 }}>
                  View {action.title}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Box>
  );
};

// Export function for dashboard report
const exportDashboardReport = (summary) => {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      bookings: summary.bookings,
      shipments: summary.shipments,
      invoices: summary.invoices,
      tracking: summary.tracking,
      consolidation: summary.consolidation,
      warehouse: summary.warehouse
    }
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default DashboardSummary;