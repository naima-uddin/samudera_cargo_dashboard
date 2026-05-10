// components/TrackingPDF.jsx
'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #E67E22',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: '#FFF3E0',
    padding: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#F5F5F5',
    padding: 6,
    marginBottom: 8,
    color: '#E67E22',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 9,
    color: '#666666',
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    padding: 6,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginVertical: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#E67E22',
    borderRadius: 3,
  },
  timelineItem: {
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E67E22',
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  timelineStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 8,
    color: '#999999',
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 8,
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
});

export const TrackingPDF = ({ data }) => {
  // ডেট ফরম্যাট ফাংশন
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // ক্লিন টেক্সট ফাংশন - স্পেশাল ক্যারেক্টার রিমুভ করে
  const cleanText = (text) => {
    if (!text) return '';
    // Remove special characters like =Í, å, Ã, ±, etc.
    return text
      .replace(/[=ÍåÃ±â‚¬â„¢â€œâ€�â€"]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
  };

  // স্ট্যাটাস ফরম্যাট ফাংশন
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    const clean = cleanText(status);
    return clean
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  // লোকেশন নির্ধারণ ফাংশন - ইভেন্ট টাইপ অনুযায়ী
  const getLocationForEvent = (event, mainData) => {
    // প্রথমে ইভেন্টের নিজের লোকেশন চেক করি
    if (event.location && event.location !== 'Unknown') {
      const cleaned = cleanText(event.location);
      if (cleaned && cleaned !== 'Consolidation Facility') {
        return cleaned;
      }
    }
    
    const status = event.status?.toLowerCase() || '';
    const destination = mainData?.destination || 'USA';
    const origin = mainData?.origin || 'Thailand';
    
    // স্ট্যাটাস অনুযায়ী লোকেশন নির্ধারণ
    if (status.includes('delivered') || status.includes('completed')) {
      return destination;
    }
    if (status.includes('out_for_delivery')) {
      return destination;
    }
    if (status.includes('customs_cleared') || status.includes('customs')) {
      return destination;
    }
    if (status.includes('arrived_at_destination')) {
      return destination;
    }
    if (status.includes('arrived')) {
      return destination;
    }
    if (status.includes('departed') || status.includes('transit')) {
      return 'In Transit';
    }
    if (status.includes('picked') || status.includes('warehouse')) {
      return origin;
    }
    
    return 'In Transit';
  };

  // প্রগ্রেস ক্যালকুলেশন
  const calculateProgress = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('completed') || statusLower.includes('delivered')) return 100;
    if (statusLower.includes('out_for_delivery')) return 90;
    if (statusLower.includes('customs_cleared')) return 85;
    if (statusLower.includes('arrived')) return 75;
    if (statusLower.includes('in_transit')) return 50;
    if (statusLower.includes('dispatched')) return 40;
    return 10;
  };

  // টাইমলাইন সাজানো (পুরনো থেকে নতুন)
  const getSortedTimeline = () => {
    if (!data?.timeline) return [];
    return [...data.timeline]
      .filter(event => event.status) // বাদ ইভেন্ট ফিল্টার
      .sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp || a.createdAt || 0);
        const dateB = new Date(b.date || b.timestamp || b.createdAt || 0);
        return dateA - dateB; // Ascending order (old to new)
      });
  };

  // ইউনিক লোকেশন ট্র্যাকিংয়ের জন্য (ডুপ্লিকেট লোকেশন এড়াতে)
  const getUniqueEvents = (timeline) => {
    const seen = new Set();
    return timeline.filter(event => {
      const key = `${event.status}_${formatDate(event.date)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const timeline = getSortedTimeline();
  const uniqueTimeline = getUniqueEvents(timeline);
  const currentProgress = calculateProgress(data?.status);
  
  const statusColor = data?.status?.toLowerCase().includes('completed') || 
                      data?.status?.toLowerCase().includes('delivered') 
                      ? '#22C55E' : '#E67E22';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Shipment Tracking Report</Text>
          <Text style={styles.subtitle}>Generated on {formatDate(new Date())}</Text>
        </View>

        {/* Tracking Number */}
        <View style={styles.trackingNumber}>
          <Text>Tracking Number: {cleanText(data?.trackingNumber) || 'N/A'}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {data?.status?.toLowerCase().includes('completed') ? 'COMPLETED' : 
             data?.status?.toLowerCase().includes('delivered') ? 'DELIVERED' :
             formatStatus(data?.status)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${currentProgress}%` }]} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Progress</Text>
            <Text style={styles.value}>{currentProgress}% Complete</Text>
          </View>
        </View>

        {/* Route Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{cleanText(data?.origin) || 'Thailand Warehouse'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current Location</Text>
            <Text style={styles.value}>
              {currentProgress === 100 ? cleanText(data?.destination) || 'Delivered' : 
               cleanText(data?.destination) || 'In Transit'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{cleanText(data?.destination) || 'USA'}</Text>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Booking Number</Text>
            <Text style={styles.value}>{cleanText(data?.bookingNumber) || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Packages</Text>
            <Text style={styles.value}>{data?.shipmentDetails?.totalPackages || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Weight</Text>
            <Text style={styles.value}>{data?.shipmentDetails?.totalWeight || 0} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Volume</Text>
            <Text style={styles.value}>{data?.shipmentDetails?.totalVolume || 0} m³</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Shipping Mode</Text>
            <Text style={styles.value}>{cleanText(data?.shipmentDetails?.shippingMode) || 'CIF'}</Text>
          </View>
        </View>

        {/* Packages */}
        {data?.packages && data.packages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Packages ({data.packages.length})</Text>
            {data.packages.map((pkg, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>Package #{idx + 1}</Text>
                  <Text style={styles.value}>{cleanText(pkg.type) || 'Carton'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.value}>{cleanText(pkg.description) || 'General Cargo'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Weight</Text>
                  <Text style={styles.value}>{pkg.weight || 0} kg</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tracking Timeline - Correctly Formatted */}
        {uniqueTimeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Timeline</Text>
            {uniqueTimeline.map((event, idx) => {
              const statusLabel = formatStatus(event.status);
              const eventLocation = getLocationForEvent(event, data);
              const eventDate = formatDate(event.date || event.timestamp || event.createdAt);
              const cleanLocation = cleanText(eventLocation);
              
              return (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStatus}>{statusLabel}</Text>
                    <Text style={styles.timelineDate}>{eventDate}</Text>
                    {cleanLocation && cleanLocation !== 'Unknown' && (
                      <Text style={styles.timelineLocation}>📍 {cleanLocation}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated document. No signature is required.</Text>
          <Text>© {new Date().getFullYear()} Your Company Name - All Rights Reserved</Text>
        </View>
      </Page>
    </Document>
  );
};
