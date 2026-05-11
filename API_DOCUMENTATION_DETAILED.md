# Samudera Cargo Cargo Dashboard Detailed API Documentation

## Overview
This document covers every API route used by `B2B_Cargo_Dashboard`.
The dashboard uses a shared backend and reads `NEXT_PUBLIC_API_URL` from `.env.local`.

Base URL example:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Most requests use `B2B_Cargo_Dashboard/lib/axiosInstance.js`.

---

# 1. Authentication APIs (`services/Authentication.js`)

## `POST /register`
- Auth: No
- Description: Register a dashboard user
- Use: `register(userData)`

## `POST /login`
- Auth: No
- Description: Login with email/password
- Use: `login(email, password)`

## `POST /customer/register`
- Auth: No
- Description: Create a customer from dashboard
- Use: `registerCustomer(userData)`

## `POST /customer/verify-otp`
- Auth: No
- Description: Verify customer OTP
- Use: `verifyOTP(email, otp)`

## `POST /customer/resend-otp`
- Auth: No
- Description: Resend customer OTP
- Use: `resendOTP(email)`

## `POST /forgot-password`
- Auth: No
- Description: Request forgot password OTP
- Use: `forgotPassword(email)`

## `POST /reset-password`
- Auth: No
- Description: Reset password with OTP
- Use: `resetPassword(email, otp, newPassword)`

## `POST /verify-reset-otp`
- Auth: No
- Description: Verify password reset OTP
- Use: `verifyResetOTP(email, otp)`

## `POST /resend-reset-otp`
- Auth: No
- Description: Resend reset password OTP
- Use: `resendResetOTP(email)`

## `GET /users/profile`
- Auth: Yes
- Description: Load user profile
- Use: `getUserProfile()`

## `PUT /users/profile`
- Auth: Yes
- Description: Update profile
- Use: `updateUserProfile(userData)`

## `PUT /users/change-password`
- Auth: Yes
- Description: Change current password
- Use: `changePassword(oldPassword, newPassword)`

## `POST /admin/setup`
- Auth: No
- Description: Initialize admin account
- Use: `setupAdmin(adminData)`

## `POST /admin/staff/create`
- Auth: Yes
- Admin: yes
- Description: Create new staff user
- Use: `createStaff(staffData)`

## `GET /admin/users`
- Auth: Yes
- Admin: yes
- Description: List all users
- Use: `getUsers()`

## `GET /admin/getUsers/:userId`
- Auth: Yes
- Admin: yes
- Description: Get a user by ID
- Use: `getUserById(userId)`

## `PUT /admin/updateUsers/:userId`
- Auth: Yes
- Admin: yes
- Description: Update a user
- Use: `updateUser(userId, userData)`

## `DELETE /admin/users/:userId`
- Auth: Yes
- Admin: yes
- Description: Delete a user
- Use: `deleteUser(userId)`

## `GET /admin/users/role/:role`
- Auth: Yes
- Admin: yes
- Description: Filter users by role
- Use: `getUsersByRole(role)`

---

# 2. Booking APIs (`services/booking.js`)

## `POST /createBooking`
- Auth: Yes
- Description: Create new booking
- Use: `createBooking(bookingData)`

## `GET /getAllBooking`
- Auth: Yes
- Admin: yes
- Description: Fetch all bookings with filters
- Query params: `page`, `limit`, `status`, `search`, `startDate`, `endDate`, `sort`, `sortBy`, `sortOrder`
- Use: `getAllBookings(params)`

## `GET /bookings/:bookingId`
- Auth: Yes
- Description: Get booking by ID
- Use: `getBookingById(bookingId)`

## `PUT /booking/:bookingId/price-quote`
- Auth: Yes
- Admin: yes
- Description: Update booking price quote
- Use: `updatePriceQuote(bookingId, quoteData)`

## `PUT /bookings/:bookingId/accept`
- Auth: Yes
- Description: Customer accepts booking quote
- Use: `acceptQuote(bookingId, notes)`

## `POST /bookings/:bookingId/reject-quote`
- Auth: Yes
- Description: Reject quote request
- Use: `rejectQuote(bookingId, reason)`

## `POST /bookings/:bookingId/cancel`
- Auth: Yes
- Description: Cancel booking
- Use: `cancelBooking(bookingId, reason)`

## `GET /bookings/my-bookings`
- Auth: Yes
- Description: Get customer bookings
- Use: `getMyBookings(params)`

## `GET /bookings/my-bookings/:bookingId`
- Auth: Yes
- Description: Get customer booking detail
- Use: `getMyBookingById(bookingId)`

## `GET /bookings/my-bookings/:bookingId/timeline`
- Auth: Yes
- Description: Get booking timeline
- Use: `getBookingTimeline(bookingId)`

## `GET /bookings/my-bookings/:bookingId/invoice`
- Auth: Yes
- Description: Get booking invoice
- Use: `getBookingInvoice(bookingId)`

## `GET /bookings/my-bookings/:bookingId/quote`
- Auth: Yes
- Description: Get booking quote
- Use: `getBookingQuote(bookingId)`

## `GET /bookings/my-bookings/summary`
- Auth: Yes
- Description: Get booking summary
- Use: `getBookingsSummary()`

## `GET /bookings/track/:trackingNumber`
- Auth: Yes
- Description: Track booking by tracking number
- Use: `trackBookingByNumber(trackingNumber)`

## `PUT /bookings/:bookingId/delivery-status`
- Auth: Yes
- Description: Update delivery status
- Use: `updateDeliveryStatus(bookingId, statusData)`

## `GET /bookings/:bookingId/documents/:documentId/download`
- Auth: Yes
- Description: Download booking document
- Use: `downloadBookingDocument(bookingId, documentId)`

## `POST /bookings/:bookingId/documents`
- Auth: Yes
- Description: Upload booking document
- Use: `uploadBookingDocument(bookingId, documentData)`

---

# 3. Shipping APIs (`services/shipping.js`)

## `POST /create-shipments`
- Auth: Yes
- Description: Create shipment record
- Use: `createShipments(shipmentData)`

## `GET /getAllShipment`
- Auth: Yes
- Description: List shipments
- Query params: `page`, `limit`, `status`, `mode`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`
- Use: `getAllShipments(params)`

## `GET /shipments/:shipmentId`
- Auth: Yes
- Description: Get shipment by ID
- Use: `getShipmentById(shipmentId)`

## `PATCH /shipments/:shipmentId/status`
- Auth: Yes
- Description: Update shipment status
- Use: `updateShipmentStatus(shipmentId, statusData)`

## `GET /shipments/my-shipments`
- Auth: Yes
- Description: Get logged-in user shipments
- Use: `getMyShipments(params)`

## `GET /shipments/my-shipments/:shipmentId`
- Auth: Yes
- Description: Get single user shipment
- Use: `getMyShipmentById(shipmentId)`

## `GET /shipments/my-shipments/:shipmentId/timeline`
- Auth: Yes
- Description: Shipment timeline
- Use: `getMyShipmentTimeline(shipmentId)`

## `PUT /shipments/:shipmentId`
- Auth: Yes
- Description: Update shipment
- Use: `updateShipment(shipmentId, updateData)`

## `DELETE /shipments/:shipmentId`
- Auth: Yes
- Description: Delete shipment
- Use: `deleteShipment(shipmentId)`

## `POST /shipments/:shipmentId/assign`
- Auth: Yes
- Description: Assign shipment
- Use: `assignShipment(shipmentId, assignmentData)`

## `POST /shipments/:shipmentId/tracking`
- Auth: Yes
- Description: Add tracking update
- Use: `addTrackingUpdate(shipmentId, trackingData)`

## `GET /shipments/:shipmentId/timeline`
- Auth: Yes
- Description: Shipment timeline
- Use: `getShipmentTimeline(shipmentId)`

## `POST /shipments/:shipmentId/transport`
- Auth: Yes
- Description: Add transport details
- Use: `updateTransportDetails(shipmentId, transportData)`

## `POST /shipments/:shipmentId/documents`
- Auth: Yes
- Description: Add shipment documents
- Use: `addShipmentDocument(shipmentId, documentData)`

## `POST /shipments/:shipmentId/notes/internal`
- Auth: Yes
- Description: Add internal note
- Use: `addInternalNote(shipmentId, noteData)`

## `POST /shipments/:shipmentId/notes/customer`
- Auth: Yes
- Description: Add customer note
- Use: `addCustomerNote(shipmentId, noteData)`

## `POST /shipments/:shipmentId/cancel`
- Auth: Yes
- Description: Cancel shipment
- Use: `cancelShipment(shipmentId, cancelData)`

## `POST /shipments/:shipmentId/costs`
- Auth: Yes
- Description: Add shipment cost
- Use: `addShipmentCost(shipmentId, costData)`

## `GET /shipments/:shipmentId/costs`
- Auth: Yes
- Description: Get shipment costs
- Use: `getShipmentCosts(shipmentId)`

## `PUT /shipments/:shipmentId/costs/:costId`
- Auth: Yes
- Description: Update shipment cost
- Use: `updateShipmentCost(shipmentId, costId, updateData)`

## `DELETE /shipments/:shipmentId/costs/:costId`
- Auth: Yes
- Description: Delete shipment cost
- Use: `deleteShipmentCost(shipmentId, costId)`

## `GET /shipments/warehouse/pending`
- Auth: Yes
- Description: Warehouse pending shipments
- Use: `getPendingWarehouseShipments()`

## `PATCH /shipments/:shipmentId/warehouse/receive`
- Auth: Yes
- Description: Receive shipment in warehouse
- Use: `receiveAtWarehouse(shipmentId, receiveData)`

## `PATCH /shipments/:shipmentId/warehouse/process`
- Auth: Yes
- Description: Process warehouse shipment
- Use: `processWarehouse(shipmentId, processData)`

---

# 4. New shipping APIs (`services/newShipping.js`)

## `GET /my-new-shipments`
- Auth: Yes
- Description: Get new shipment list for user
- Use: `getMyNewShipments(params)`

## `GET /shipments/my-shipments/:shipmentId`
- Auth: Yes
- Description: Get user shipment detail
- Use: `getMyShipmentById(shipmentId)`

## `GET /shipments/my-shipments/:shipmentId/tracking`
- Auth: Yes
- Description: Get shipment tracking info
- Use: `getMyShipmentTracking(shipmentId)`

## `GET /shipments/my-shipments/summary`
- Auth: Yes
- Description: Get shipment summary
- Use: `getMyShipmentSummary()`

## `POST /shipments/my-shipments/:shipmentId/return-request`
- Auth: Yes
- Description: Submit customer return request
- Use: `requestReturn(shipmentId, returnData)`

## `PUT /shipments/return-requests/:returnRequestId/cancel`
- Auth: Yes
- Description: Cancel return request
- Use: `cancelReturnRequest(returnRequestId)`

---

# 5. Tracking APIs (`services/tracking.js`)

## `GET /getAllTracking`
- Auth: Yes
- Description: Get all tracking records
- Query params: `page`, `limit`, `status`, `search`, `customerId`, `startDate`, `endDate`, `sort`
- Use: `getAllTrackings(params)`

## `GET /trackings/:id?type=<type>`
- Auth: Yes
- Description: Get tracking by ID and type
- Use: `getTrackingById(id, type)`

## `PUT /trackings/:id`
- Auth: Yes
- Description: Update tracking status
- Use: `updateTrackingStatus(id, updateData)`

## `PUT /trackings/bulk/update`
- Auth: Yes
- Description: Bulk update tracking records
- Use: `bulkUpdateTrackings(trackingIds, updateData)`

## `DELETE /trackings/:id?type=<type>`
- Auth: Yes
- Description: Delete tracking record
- Use: `deleteTracking(id, type)`

## `POST /trackings/bulk/delete`
- Auth: Yes
- Description: Bulk delete tracking records
- Use: `bulkDeleteTrackings(trackingIds)`

## `GET /getTrackingStats`
- Auth: Yes
- Description: Get tracking statistics
- Use: `getTrackingStats()`

## `GET /tracking/search`
- Auth: Yes
- Description: Search tracking records
- Use: `searchTrackings(query, params)`

## `GET /tracking/export`
- Auth: Yes
- Description: Export tracking data
- Use: `exportTrackings(params, format)`

## `GET /trackings/public/:trackingNumber`
- Auth: Yes
- Description: Public tracking by tracking number
- Use: `publicTracking(trackingNumber)`

---

# 6. Consolidation APIs (`services/consolidation.js`)

## `POST /queue/add`
- Auth: Yes
- Description: Add shipment to consolidation queue
- Use: `addToQueue(shipmentId)`

## `POST /queue/add-multiple`
- Auth: Yes
- Description: Add multiple shipments to queue
- Use: `addMultipleToQueue(shipmentIds)`

## `GET /queue`
- Auth: Yes
- Description: View queue with filters
- Use: `getQueue(params)`

## `GET /queue/summary`
- Auth: Yes
- Description: Queue summary data
- Use: `getQueueSummary()`

## `POST /consolidation/create`
- Auth: Yes
- Description: Create consolidation batch
- Use: `createConsolidation(consolidationData)`

## `GET /all/consolidations`
- Auth: Yes
- Description: List all consolidations
- Use: `getAllConsolidations(params)`

## `GET /stats/consolidations`
- Auth: Yes
- Description: Consolidation statistics
- Use: `getConsolidationStats(params)`

## `GET /container-types/consolidations`
- Auth: Yes
- Description: Fetch container types for consolidation
- Use: `getConsolidationContainerTypes(params)`

## `GET /consolidations/:id`
- Auth: Yes
- Description: Get consolidation by ID
- Use: `getConsolidationById(consolidationId)`

## `PUT /consolidations/:id`
- Auth: Yes
- Description: Update consolidation
- Use: `updateConsolidation(consolidationId, updateData)`

## `PUT /consolidations/:id/mark-ready`
- Auth: Yes
- Description: Mark consolidation ready for dispatch
- Use: `markConsolidationReady(id)`

## `PUT /consolidations/:id/status`
- Auth: Yes
- Description: Update consolidation status
- Use: `updateConsolidationStatus(id, statusData)`

## `POST /consolidations/:id/add-shipments`
- Auth: Yes
- Description: Add shipments into consolidation
- Use: `addShipmentsToConsolidation(id, shipmentIds)`

## `DELETE /consolidation/:id/shipment/:shipmentId`
- Auth: Yes
- Description: Remove shipment from consolidation
- Use: `removeShipmentFromConsolidation(consolidationId, shipmentId)`

## `DELETE /consolidation/:id`
- Auth: Yes
- Description: Delete consolidation
- Use: `deleteConsolidation(consolidationId)`

## `POST /consolidations/:id/documents`
- Auth: Yes
- Description: Upload consolidation docs
- Use: `uploadDocument(consolidationId, files)`

## `PATCH /consolidations/:consolidationId/shipments/:shipmentId`
- Auth: Yes
- Description: Update shipment details inside consolidation
- Use: `patchConsolidationShipment(consolidationId, shipmentId, data)`

## `GET /:id/on-hold-shipments`
- Auth: Yes
- Description: Get on-hold shipments for consolidation
- Use: `getOnHoldShipments(consolidationId)`

## `POST /:id/resume-all`
- Auth: Yes
- Description: Resume all on-hold shipments
- Use: `resumeAllConsolidationShipments(consolidationId, notes)`

## `GET /:id/cancelled-shipments`
- Auth: Yes
- Description: Get cancelled consolidation shipments
- Use: `getCancelledConsolidationShipments(consolidationId)`

---

# 7. Damage APIs (`services/damage.js`)

## `GET /damage-reports/all`
- Auth: Yes
- Description: Get all damage reports
- Use: `getAllDamageReports(params)`

## `GET /damage-reports/:id`
- Auth: Yes
- Description: Get single damage report
- Use: `getDamageReportById(reportId)`

## `PUT /damage-reports/:id/status`
- Auth: Yes
- Description: Update damage report status
- Use: `updateDamageReportStatus(reportId, statusData)`

## `POST /damage-reports/:id/insurance`
- Auth: Yes
- Description: Add insurance claim to damage report
- Use: `addInsuranceClaim(reportId, claimData)`

## `GET /damage-reports/stats`
- Auth: Yes
- Description: Get damage report statistics
- Use: `getDamageReportStats()`

## `POST /damage-reports/bulk/update`
- Auth: Yes
- Admin: yes
- Description: Bulk update multiple damage reports
- Use: `bulkUpdateDamageReports(updateData)`

## `DELETE /damage-reports/:id`
- Auth: Yes
- Admin: yes
- Description: Delete a damage report
- Use: `deleteDamageReport(reportId)`

## `GET /damage-reports/export`
- Auth: Yes
- Description: Export damage reports to CSV
- Use: `exportDamageReports(params, format)`

---

# 8. Invoice APIs (`services/invoice.js`)

## `GET /getAllInvoices`
- Auth: Yes
- Description: Get all invoices
- Use: `getAllInvoices(params)`

## `GET /getInvoiceById/:invoiceId`
- Auth: Yes
- Description: Get invoice details by ID
- Use: `getInvoiceById(invoiceId)`

## `GET /invoices/customer/:customerId`
- Auth: Yes
- Description: Get invoices for a customer
- Use: `getInvoicesByCustomer(customerId, params)`

## `PUT /invoices/:invoiceId`
- Auth: Yes
- Description: Update invoice
- Use: `updateInvoice(invoiceId, updateData)`

## `DELETE /invoices/:invoiceId`
- Auth: Yes
- Description: Delete invoice
- Use: `deleteInvoice(invoiceId)`

## `PUT /mark-paid/:invoiceId`
- Auth: Yes
- Description: Mark invoice paid
- Use: `markInvoiceAsPaid(invoiceId, paymentData)`

## `POST /invoices/:invoiceId/send-email`
- Auth: Yes
- Description: Send invoice email
- Use: `sendInvoiceEmail(invoiceId, emailData)`

## `GET /getInvoiceStats`
- Auth: Yes
- Description: Invoice statistics
- Use: `getInvoiceStats()`

## `POST /invoices/:invoiceId/generate-pdf`
- Auth: Yes
- Description: Generate PDF for invoice
- Use: `generateInvoicePDF(invoiceId)`

## `PUT /invoices/bulk/update`
- Auth: Yes
- Description: Bulk update invoices
- Use: `bulkUpdateInvoices(invoiceIds, updateData)`

## `GET /invoices/admin/recent`
- Auth: Yes
- Description: Get recent invoices for admin
- Use: `getRecentInvoices(limit)`

## `GET /invoices/booking/:bookingId`
- Auth: Yes
- Description: Get invoice by booking ID
- Use: `getInvoiceByBooking(bookingId)`

## `GET /invoices/shipment/:shipmentId`
- Auth: Yes
- Description: Get invoice by shipment ID
- Use: `getInvoiceByShipment(shipmentId)`

## `GET /invoices/track/:trackingNumber`
- Auth: Yes
- Description: Get invoice by tracking number
- Use: `getInvoiceByTracking(trackingNumber)`

## `GET /bookings/:bookingId/invoice`
- Auth: Yes
- Description: Get booking invoice by booking ID
- Use: `getBookingInvoiceByBookingId(bookingId)`

## `GET /bookings/:bookingId/quote`
- Auth: Yes
- Description: Get booking quote by booking ID
- Use: `getBookingQuoteByBookingId(bookingId)`

---

# 9. Manual Invoice APIs (`services/manualIvnoice.js`)

## `GET /getAllmanualInvoices`
- Auth: Yes
- Description: Get all manual invoices
- Use: `getManualInvoices(params)`

## `GET /invoices/:invoiceId`
- Auth: Yes
- Description: Get manual invoice by ID
- Use: `getManualInvoiceById(invoiceId)`

## `DELETE /deletemanualInvoice/:invoiceId`
- Auth: Yes
- Description: Delete manual invoice
- Use: `ManualdeleteInvoice(invoiceId)`

## `GET /invoices/:invoiceId/download`
- Auth: Yes
- Description: Download manual invoice PDF
- Use: `downloadInvoicePDF(invoiceId)`

## `GET /invoices/summary`
- Auth: Yes
- Description: Get manual invoice summary
- Use: `getInvoiceSummary()`

---

# 10. Warehouse APIs (`services/warehouse.js`)

## `GET /expected-shipments`
- Auth: Yes
- Description: Get expected warehouse shipments
- Use: `getExpectedShipments(params)`

## `POST /receive/:shipmentId`
- Auth: Yes
- Description: Receive shipment at warehouse
- Use: `receiveShipment(shipmentId, receiptData)`

## `GET /receipts`
- Auth: Yes
- Description: Get warehouse receipts
- Use: `getWarehouseReceipts(params)`

## `DELETE /receipts/:receiptId`
- Auth: Yes
- Description: Delete receipt
- Use: `deleteWarehouseReceipt(receiptId)`

## `GET /receipts/:receiptId`
- Auth: Yes
- Description: Get receipt by ID
- Use: `getWarehouseReceiptById(receiptId)`

## `GET /warehouse/inventory`
- Auth: Yes
- Description: Get warehouse inventory
- Use: `getWarehouseInventory(params)`

## `PUT /warehouse/inventory/:inventoryId/location`
- Auth: Yes
- Description: Update inventory location
- Use: `updateInventoryLocation(inventoryId, locationData)`

## `POST /warehouse/consolidations/start`
- Auth: Yes
- Description: Start a warehouse consolidation
- Use: `startWarehouseConsolidation(consolidationData)`

## `PUT /warehouse/consolidations/:consolidationId/complete`
- Auth: Yes
- Description: Complete a warehouse consolidation
- Use: `completeWarehouseConsolidation(consolidationId, completionData)`

## `POST /warehouse/consolidations/:consolidationId/depart`
- Auth: Yes
- Description: Depart warehouse consolidation
- Use: `departWarehouseConsolidation(consolidationId, departureData)`

## `GET /dashboard`
- Auth: Yes
- Description: Warehouse dashboard summary
- Use: `getWarehouseDashboard()`

## `GET /warehouse/consolidations`
- Auth: Yes
- Description: Get warehouse consolidations
- Use: `getWarehouseConsolidations(params)`

## `GET /warehouse/consolidations/:consolidationId`
- Auth: Yes
- Description: Get warehouse consolidation by ID
- Use: `getWarehouseConsolidationById(consolidationId)`

## `POST /warehouse/consolidations/:consolidationId/documents`
- Auth: Yes
- Description: Add consolidation documents
- Use: `addWarehouseConsolidationDocuments(consolidationId, documents)`

## `GET /getAllwarehouses`
- Auth: Yes
- Description: List warehouses
- Use: `getAllWarehouses()`

## `POST /warehouses`
- Auth: Yes
- Description: Create warehouse
- Use: `createWarehouse(warehouseData)`

## `PUT /warehouses/:warehouseId`
- Auth: Yes
- Description: Update warehouse
- Use: `updateWarehouse(warehouseId, updateData)`

## `POST /inspect/:receiptId`
- Auth: Yes
- Description: Inspect a received shipment receipt
- Use: `inspectReceipt(receiptId, inspectionData)`

## `GET /warehouse/inventory/by-zone`
- Auth: Yes
- Description: Get inventory grouped by zone
- Use: `getInventoryByZone(warehouseId)`

## `GET /warehouse/receipts/recent`
- Auth: Yes
- Description: Get recent warehouse receipts
- Use: `getRecentWarehouseReceipts(limit)`

## `GET /receipts/:receiptId/pdf`
- Auth: Yes
- Description: Download receipt PDF
- Use: `generateReceiptPDF(receiptId)`

## `GET /warehouse/consolidations/:consolidationId/packing-list`
- Auth: Yes
- Description: Download packing list PDF for consolidation
- Use: `generatePackingListPDF(consolidationId)`

## `GET /warehouse/inventory/export`
- Auth: Yes
- Description: Export warehouse inventory data
- Use: `exportWarehouseInventory(params)`

---

# Examples

### Login
```bash
curl -X POST http://localhost:8000/api/v1/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Password123"}'
```

### Fetch all bookings
```bash
curl -X GET "http://localhost:8000/api/v1/getAllBooking?page=1&limit=10" \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Track shipment
```bash
curl -X GET http://localhost:8000/api/v1/shipments/track/TRACKING123 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Approve return
```bash
curl -X PUT http://localhost:8000/api/v1/admin/return-requests/RETURN_ID/approve \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{"returnTrackingNumber":"RETURN123","notes":"Approved","adjustCost":50}'
```

---

# Notes
- Use the exact HTTP method described for each route.
- `Authorization: Bearer <token>` is required for all protected backend calls.
- Admin-only endpoints are restricted by backend `adminOnly` middleware.
