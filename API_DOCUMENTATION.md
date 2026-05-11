# Samudera Cargo Cargo Dashboard API Documentation

## Overview
This document describes the frontend API integration for `B2B_Cargo_Dashboard`.
The dashboard is a separate frontend app that communicates with the same backend API server as the client.

- Frontend root: `B2B_Cargo_Dashboard`
- Base API env variable: `NEXT_PUBLIC_API_URL`
- Example local value: `http://localhost:8000/api/v1`
- Main API client: `B2B_Cargo_Dashboard/lib/axiosInstance.js`

---

## Environment Setup

### `B2B_Cargo_Dashboard/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### `B2B_Cargo_Dashboard/lib/axiosInstance.js`
- Uses: `process.env.NEXT_PUBLIC_API_URL`
- Adds: `Content-Type: application/json`
- Adds auth header if token exists:
  - `Authorization: Bearer <token>`
- Handles 401 responses by logging out the user

---

## Authentication APIs (`services/Authentication.js`)

### `POST /register`
- Function: `register(userData)`
- Purpose: register a new dashboard user

### `POST /login`
- Function: `login(email, password)`
- Purpose: login dashboard or admin user
- Response: `success`, `token`, `data`

### `POST /customer/register`
- Function: `registerCustomer(userData)`
- Purpose: support customer registration flow from dashboard

### `POST /customer/verify-otp`
- Function: `verifyOTP(email, otp)`

### `POST /customer/resend-otp`
- Function: `resendOTP(email)`

### `POST /forgot-password`
- Function: `forgotPassword(email)`

### `POST /reset-password`
- Function: `resetPassword(email, otp, newPassword)`

### `POST /verify-reset-otp`
- Function: `verifyResetOTP(email, otp)`

### `POST /resend-reset-otp`
- Function: `resendResetOTP(email)`

### `GET /users/profile`
- Function: `getUserProfile()`
- Purpose: load current dashboard user profile

### `PUT /users/profile`
- Function: `updateUserProfile(userData)`
- Purpose: update dashboard user profile

### `PUT /users/change-password`
- Function: `changePassword(oldPassword, newPassword)`

### `POST /admin/setup`
- Function: `setupAdmin(adminData)`
- Purpose: create or initialize admin account

### `POST /admin/staff/create`
- Function: `createStaff(staffData)`
- Purpose: create new staff user

### `GET /admin/users`
- Function: `getUsers()`
- Purpose: list all users

### `GET /admin/getUsers/:userId`
- Function: `getUserById(userId)`

### `PUT /admin/updateUsers/:userId`
- Function: `updateUser(userId, userData)`

### `DELETE /admin/users/:userId`
- Function: `deleteUser(userId)`

### `GET /admin/users/role/:role`
- Function: `getUsersByRole(role)`
- Purpose: filter users by role

---

## Booking APIs (`services/booking.js`)

### `POST /createBooking`
- Function: `createBooking(bookingData)`
- Purpose: create a new booking from dashboard

### `GET /getAllBooking`
- Function: `getAllBookings(params)`
- Query params: `page`, `limit`, `status`, `search`, `startDate`, `endDate`, `sort`, `sortBy`, `sortOrder`

### `GET /bookings/:bookingId`
- Function: `getBookingById(bookingId)`

### `PUT /booking/:bookingId/price-quote`
- Function: `updatePriceQuote(bookingId, quoteData)`

### `PUT /bookings/:bookingId/accept`
- Function: `acceptQuote(bookingId, notes)`

### `POST /bookings/:bookingId/reject-quote`
- Function: `rejectQuote(bookingId, reason)`

### `POST /bookings/:bookingId/cancel`
- Function: `cancelBooking(bookingId, reason)`

### `GET /bookings/my-bookings`
- Function: `getMyBookings(params)`
- Purpose: fetch customer-specific bookings

### `GET /bookings/my-bookings/:bookingId`
- Function: `getMyBookingById(bookingId)`

### `GET /bookings/my-bookings/:bookingId/timeline`
- Function: `getBookingTimeline(bookingId)`

### `GET /bookings/my-bookings/:bookingId/invoice`
- Function: `getBookingInvoice(bookingId)`

### `GET /bookings/my-bookings/:bookingId/quote`
- Function: `getBookingQuote(bookingId)`

### `GET /bookings/my-bookings/summary`
- Function: `getBookingsSummary()`

### `GET /bookings/track/:trackingNumber`
- Function: `trackBookingByNumber(trackingNumber)`

### `PUT /bookings/:bookingId/delivery-status`
- Function: `updateDeliveryStatus(bookingId, statusData)`

### `GET /bookings/:bookingId/documents/:documentId/download`
- Function: `downloadBookingDocument(bookingId, documentId)`

### `POST /bookings/:bookingId/documents`
- Function: `uploadBookingDocument(bookingId, documentData)`

---

## Shipping APIs (`services/shipping.js`)

### `POST /create-shipments`
- Function: `createShipments(shipmentData)`
- Purpose: create shipment records

### `GET /getAllShipment`
- Function: `getAllShipments(params)`
- Query params: `page`, `limit`, `status`, `mode`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`

### `GET /shipments/:shipmentId`
- Function: `getShipmentById(shipmentId)`

### `PATCH /shipments/:shipmentId/status`
- Function: `updateShipmentStatus(shipmentId, statusData)`

### `GET /shipments/my-shipments`
- Function: `getShipmentsMyShipments(params)`

### `GET /shipments/my-shipments/:shipmentId`
- Function: `getMyShipmentById(shipmentId)`

### `GET /shipments/my-shipments/:shipmentId/timeline`
- Function: `getMyShipmentTimeline(shipmentId)`

### `PUT /update-shipment/:shipmentId`
- Function: `updateShipment(shipmentId, updateData)`

### `DELETE /shipments/:shipmentId`
- Function: `deleteShipment(shipmentId)`

### `POST /shipments/:shipmentId/assign`
- Function: `assignShipment(shipmentId, assignmentData)`

### `POST /shipments/:shipmentId/tracking`
- Function: `addTrackingUpdate(shipmentId, trackingData)`

### `GET /shipments/:shipmentId/timeline`
- Function: `getShipmentTimeline(shipmentId)`

### `POST /shipments/:shipmentId/transport`
- Function: `updateTransportDetails(shipmentId, transportData)`

### `POST /shipments/:shipmentId/documents`
- Function: `addShipmentDocument(shipmentId, documentData)`

### `POST /shipments/:shipmentId/notes/internal`
- Function: `addInternalNote(shipmentId, noteData)`

### `POST /shipments/:shipmentId/notes/customer`
- Function: `addCustomerNote(shipmentId, noteData)`

### `POST /shipments/:shipmentId/cancel`
- Function: `cancelShipment(shipmentId, cancelData)`

### `POST /shipments/:shipmentId/costs`
- Function: `addShipmentCost(shipmentId, costData)`

### `GET /shipments/:shipmentId/costs`
- Function: `getShipmentCosts(shipmentId)`

### `PUT /shipments/:shipmentId/costs/:costId`
- Function: `updateShipmentCost(shipmentId, costId, updateData)`

### `DELETE /shipments/:shipmentId/costs/:costId`
- Function: `deleteShipmentCost(shipmentId, costId)`

### `GET /shipments/warehouse/pending`
- Function: `getPendingWarehouseShipments()`

### `PATCH /shipments/:shipmentId/warehouse/receive`
- Function: `receiveAtWarehouse(shipmentId, receiveData)`

### `PATCH /shipments/:shipmentId/warehouse/process`
- Function: `processWarehouseShipment(shipmentId, processData)`

### `GET /shipments/stats/dashboard`
- Function: `getShipmentStats(params)`

### `GET /shipments/track/:trackingNumber`
- Function: `trackShipmentByNumber(trackingNumber)`

### `POST /shipments/:shipmentId/return-request`
- Function: `requestShipmentReturn(shipmentId, returnData)`

### `GET /shipments/:shipmentId/return-status`
- Function: `getShipmentReturnStatus(shipmentId)`

### `PUT /shipments/:shipmentId/return-confirm`
- Function: `confirmShipmentReturn(shipmentId, confirmData)`

### `PUT /shipments/:shipmentId/return-reject-customer`
- Function: `rejectShipmentReturn(shipmentId, rejectData)`

### `GET /admin/return-requests`
- Function: `getAdminReturnRequests(params)`

### `PUT /admin/return-requests/:returnId/approve`
- Function: `approveReturnRequest(returnId, data)`

### `PUT /admin/return-requests/:returnId/reject`
- Function: `rejectReturnRequest(returnId, rejectionReason)`

### `GET /admin/return-requests/stats`
- Function: `getReturnRequestStats()`

---

## New Shipping APIs (`services/newShipping.js`)

### `GET /getNewShipment`
- Function: `getNewShipment(params)`
- Purpose: fetch dashboard shipment listing for new shipping flow

### `PUT /updateShipmentStatus/:shipmentId`
- Function: `updateNewShipmentStatus(shipmentId, statusData)`

### `PUT /new-update-shipment-tracking/:shipmentId`
- Function: `updateNewTrackingNumber(shipmentId, trackingNumber)`
- Note: uses `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'`

---

## Tracking APIs (`services/tracking.js`)

### `GET /getAllTracking`
- Function: `getAllTrackings(params)`
- Query params: `page`, `limit`, `status`, `search`, `customerId`, `startDate`, `endDate`, `sort`

### `GET /trackings/:id?type=<type>`
- Function: `getTrackingById(id, type)`
- Purpose: fetch tracking record by ID

### `PUT /trackings/:id`
- Function: `updateTrackingStatus(id, updateData)`

### `PUT /trackings/bulk/update`
- Function: `bulkUpdateTrackings(trackingIds, updateData)`

### `DELETE /trackings/:id?type=<type>`
- Function: `deleteTracking(id, type)`

### `POST /trackings/bulk/delete`
- Function: `bulkDeleteTrackings(trackingIds)`

### `GET /getTrackingStats`
- Function: `getTrackingStats()`

### `GET /tracking/search`
- Function: `searchTrackings(query, params)`
- Query params: `q`, `type`, `status`, `customerId`, `startDate`, `endDate`

### `GET /tracking/export`
- Function: `exportTrackings(params, format)`
- Response type: `blob`

### `GET /trackings/public/:trackingNumber`
- Function: `publicTracking(trackingNumber)`
- Purpose: public tracking access without auth

---

## Consolidation APIs (`services/consolidation.js`)

### `POST /queue/add`
- Function: `addToQueue(shipmentId)`

### `POST /queue/add-multiple`
- Function: `addMultipleToQueue(shipmentIds)`

### `GET /queue`
- Function: `getQueue(params)`

### `GET /queue/summary`
- Function: `getQueueSummary()`

### `POST /consolidation/create`
- Function: `createConsolidation(consolidationData)`

### `GET /all/consolidations`
- Function: `getAllConsolidations(params)`

### `GET /consolidation/:consolidationId`
- Function: `getConsolidationById(consolidationId)`

### `PUT /consolidation/:consolidationId`
- Function: `updateConsolidation(consolidationId, updateData)`

### `PUT /consolidations/:consolidationId/status`
- Function: `updateConsolidationStatus(consolidationId, statusData)`

### `POST /consolidation/:consolidationId/add-shipments`
- Function: `addShipmentsToConsolidation(consolidationId, shipmentIds)`

### `DELETE /consolidation/:consolidationId/shipment/:shipmentId`
- Function: `removeShipmentFromConsolidation(consolidationId, shipmentId)`

### `DELETE /consolidation/:consolidationId`
- Function: `deleteConsolidation(consolidationId)`

### `DELETE /consolidation/queue/:queueId`
- Function: `deleteQueueItem(queueId)`

### `POST /consolidation/queue/bulk-remove`
- Function: `bulkRemoveQueueItems(queueItemIds)`

### `GET /stats/consolidations`
- Function: `getConsolidationStats(params)`

### `GET /consolidation/container-types`
- Function: `getConsolidationContainerTypes(params)`

### `PUT /consolidations/:id/mark-ready`
- Function: `markConsolidationReady(id)`

### `PATCH /consolidations/:consolidationId/shipments/:shipmentId`
- Function: `patchConsolidationShipment(consolidationId, shipmentId, data)`

### `GET /consolidations/:consolidationId/on-hold-shipments`
- Function: `getOnHoldShipments(consolidationId)`

### `POST /consolidations/:consolidationId/resume-all`
- Function: `resumeAllConsolidationShipments(consolidationId, notes)`

### `GET /consolidations/:consolidationId/cancelled-shipments`
- Function: `getCancelledConsolidationShipments(consolidationId)`

### `PUT /consolidations/:consolidationId/status`
- Function: `updateConsolidationStatus(consolidationId, status)`

### `PATCH /shipments/:shipmentId/status`
- Function: `patchShipmentStatusFromConsolidation(shipmentId, statusData)`

### `GET /shipments?status=on_hold`
- Function: `getShipmentsByStatus(params)`

### `GET /shipments?status=cancelled`
- Function: `getCancelledShipments(params)`

### `POST /shipments/:shipmentId/restore`
- Function: `restoreShipment(shipmentId, data)`

### `PATCH /shipments/bulk-status`
- Function: `bulkUpdateShipmentStatus(updateData)`

### `GET /shipments/:shipmentId/history`
- Function: `getShipmentHistory(shipmentId)`

---

## Damage APIs (`services/damage.js`)

### `GET /damage-reports/all`
- Function: `getAllDamageReports(params)`

### `GET /damage-reports/:id`
- Function: `getDamageReportById(reportId)`

### `PUT /damage-reports/:id/status`
- Function: `updateDamageReportStatus(reportId, statusData)`

### `POST /damage-reports/:id/insurance`
- Function: `addInsuranceClaim(reportId, claimData)`

### `GET /damage-reports/stats`
- Function: `getDamageReportStats()`

### `POST /damage-reports/bulk/update`
- Function: `bulkUpdateDamageReports(updateData)`

### `DELETE /damage-reports/:id`
- Function: `deleteDamageReport(reportId)`

### `GET /damage-reports/export`
- Function: `exportDamageReports(params, format)`
- Response type: `blob`

---

## Invoice APIs (`services/invoice.js`)

### `GET /getAllInvoices`
- Function: `getAllInvoices(params)`
- Query params: `page`, `limit`, `status`, `paymentStatus`, `customerId`, `startDate`, `endDate`, `sort`

### `GET /getInvoiceById/:invoiceId`
- Function: `getInvoiceById(invoiceId)`

### `GET /invoices/customer/:customerId`
- Function: `getInvoicesByCustomer(customerId, params)`

### `PUT /invoices/:invoiceId`
- Function: `updateInvoice(invoiceId, updateData)`

### `DELETE /invoices/:invoiceId`
- Function: `deleteInvoice(invoiceId)`

### `PUT /mark-paid/:invoiceId`
- Function: `markInvoiceAsPaid(invoiceId, paymentData)`

### `POST /invoices/:invoiceId/send-email`
- Function: `sendInvoiceEmail(invoiceId, emailData)`

### `GET /getInvoiceStats`
- Function: `getInvoiceStats()`

### `POST /invoices/:invoiceId/generate-pdf`
- Function: `generateInvoicePDF(invoiceId)`

### `PUT /invoices/bulk/update`
- Function: `bulkUpdateInvoices(invoiceIds, updateData)`

### `GET /invoices/admin/recent`
- Function: `getRecentInvoices(limit)`

### `GET /invoices/booking/:bookingId`
- Function: `getInvoiceByBooking(bookingId)`

### `GET /invoices/shipment/:shipmentId`
- Function: `getInvoiceByShipment(shipmentId)`

### `GET /invoices/track/:trackingNumber`
- Function: `getInvoiceByTracking(trackingNumber)`

### `GET /bookings/:bookingId/invoice`
- Function: `getBookingInvoiceByBookingId(bookingId)`

### `GET /bookings/:bookingId/quote`
- Function: `getBookingQuoteByBookingId(bookingId)`

---

## Manual Invoice APIs (`services/manualIvnoice.js`)

### `GET /getAllmanualInvoices`
- Function: `getManualInvoices(params)`

### `GET /invoices/:invoiceId`
- Function: `getManualInvoiceById(invoiceId)`

### `DELETE /deletemanualInvoice/:invoiceId`
- Function: `ManualdeleteInvoice(invoiceId)`

### `GET /invoices/:invoiceId/download`
- Function: `downloadInvoicePDF(invoiceId)`
- Response type: `blob`

### `GET /invoices/summary`
- Function: `getInvoiceSummary()`

---

## Warehouse APIs (`services/warehouse.js`)

### `GET /expected-shipments`
- Function: `getExpectedShipments(params)`

### `POST /receive/:shipmentId`
- Function: `receiveShipment(shipmentId, receiptData)`

### `GET /receipts`
- Function: `getWarehouseReceipts(params)`

### `DELETE /receipts/:receiptId`
- Function: `deleteWarehouseReceipt(receiptId)`

### `GET /receipts/:receiptId`
- Function: `getWarehouseReceiptById(receiptId)`

### `GET /warehouse/inventory`
- Function: `getWarehouseInventory(params)`

### `PUT /warehouse/inventory/:inventoryId/location`
- Function: `updateInventoryLocation(inventoryId, locationData)`

### `POST /warehouse/consolidations/start`
- Function: `startWarehouseConsolidation(consolidationData)`

### `PUT /warehouse/consolidations/:consolidationId/complete`
- Function: `completeWarehouseConsolidation(consolidationId, completionData)`

### `POST /warehouse/consolidations/:consolidationId/depart`
- Function: `departWarehouseConsolidation(consolidationId, departureData)`

### `GET /dashboard`
- Function: `getWarehouseDashboard()`

### `GET /warehouse/consolidations`
- Function: `getWarehouseConsolidations(params)`

### `GET /warehouse/consolidations/:consolidationId`
- Function: `getWarehouseConsolidationById(consolidationId)`

### `POST /warehouse/consolidations/:consolidationId/documents`
- Function: `addWarehouseConsolidationDocuments(consolidationId, documents)`

### `GET /getAllwarehouses`
- Function: `getAllWarehouses()`

### `POST /warehouses`
- Function: `createWarehouse(warehouseData)`

### `PUT /warehouses/:warehouseId`
- Function: `updateWarehouse(warehouseId, updateData)`

### `POST /inspect/:receiptId`
- Function: `inspectReceipt(receiptId, inspectionData)`

### `GET /warehouse/inventory/by-zone`
- Function: `getInventoryByZone(warehouseId)`

### `GET /warehouse/receipts/recent`
- Function: `getRecentWarehouseReceipts(limit)`

### `GET /receipts/:receiptId/pdf`
- Function: `generateReceiptPDF(receiptId)`

### `GET /warehouse/consolidations/:consolidationId/packing-list`
- Function: `generatePackingListPDF(consolidationId)`

### `GET /warehouse/inventory/export`
- Function: `exportWarehouseInventory(params)`

---

## Example Usage

### Example: Login and fetch dashboard profile
```javascript
import { login, getUserProfile } from '@/services/Authentication';

async function runAuthExample() {
  const loginRes = await login('admin@example.com', 'Password123');
  if (!loginRes.success) {
    throw new Error(loginRes.message);
  }

  const profileRes = await getUserProfile();
  console.log('Dashboard user:', profileRes.data);
}
```

### Example: Create a booking
```javascript
import { createBooking } from '@/services/booking';

const bookingData = {
  origin: 'Shanghai',
  destination: 'New York',
  freightType: 'Sea Freight (FCL)',
  weight: 1200,
  dimensions: '20x8x8',
  senderName: 'Acme Logistics',
  receiverName: 'Enterprise Inc.',
  notes: 'Fragile goods'
};

const bookingRes = await createBooking(bookingData);
console.log('Booking response:', bookingRes);
```

### Example: Track a shipment by tracking number
```javascript
import { trackShipmentByNumber } from '@/services/shipping';

const trackingRes = await trackShipmentByNumber('TRACK123456');
console.log('Shipment status:', trackingRes.data.status);
```

### Example: Approve a return request
```javascript
import { approveReturnRequest } from '@/services/shipping';

const approveRes = await approveReturnRequest('RETURN_ID_123', {
  returnTrackingNumber: 'RETURN-456',
  notes: 'Approved by operations',
  adjustCost: 75
});
console.log('Approve response:', approveRes.message);
```

### Example: Start a warehouse consolidation
```javascript
import { startWarehouseConsolidation } from '@/services/warehouse';

const consolidationRes = await startWarehouseConsolidation({
  name: 'June Consolidation',
  warehouseId: 'WAREHOUSE_001',
  shipmentIds: ['SHIP_001', 'SHIP_002']
});
console.log('Consolidation created:', consolidationRes.data);
```

---

## Helper and local-only modules

### `services/location.js`
- This file is a local location helper using `country-state-city`.
- It does not call backend APIs directly.

---

## Notes

- The dashboard frontend relies on the same backend URL as the client.
- If the env variable is missing, some files may fall back incorrectly or use the local API explicitly.
- All protected routes require auth token injection by `axiosInstance`.
- Use this document as the reference when adding dashboard features or fixing endpoint issues.
