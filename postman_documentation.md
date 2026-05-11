# Samudera Cargo Cargo Dashboard Postman Collection

Generated from dashboard service wrappers. Use the Samudera Cargo Cargo Dashboard environment with `baseUrl` set to your API server and `authToken` for auth header.

## Environment

- `baseUrl`: `http://localhost:8000/api/v1`
- `authToken`: Bearer token for authenticated requests

## Authentication

### GET /users/profile [GET]

- Method: **GET**
- URL: `{{baseUrl}}/users/profile`

### GET /admin/users [GET]

- Method: **GET**
- URL: `{{baseUrl}}/admin/users`

### GET /admin/getUsers/${userId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/admin/getUsers/${userId}`

### GET /admin/users/role/${role} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/admin/users/role/${role}`

### POST /register [POST]

- Method: **POST**
- URL: `{{baseUrl}}/register`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /login [POST]

- Method: **POST**
- URL: `{{baseUrl}}/login`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /customer/register [POST]

- Method: **POST**
- URL: `{{baseUrl}}/customer/register`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /customer/verify-otp [POST]

- Method: **POST**
- URL: `{{baseUrl}}/customer/verify-otp`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /customer/resend-otp [POST]

- Method: **POST**
- URL: `{{baseUrl}}/customer/resend-otp`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /forgot-password [POST]

- Method: **POST**
- URL: `{{baseUrl}}/forgot-password`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /reset-password [POST]

- Method: **POST**
- URL: `{{baseUrl}}/reset-password`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /verify-reset-otp [POST]

- Method: **POST**
- URL: `{{baseUrl}}/verify-reset-otp`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /resend-reset-otp [POST]

- Method: **POST**
- URL: `{{baseUrl}}/resend-reset-otp`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /admin/setup [POST]

- Method: **POST**
- URL: `{{baseUrl}}/admin/setup`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /admin/staff/create [POST]

- Method: **POST**
- URL: `{{baseUrl}}/admin/staff/create`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /users/profile [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/users/profile`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /users/change-password [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/users/change-password`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /admin/updateUsers/${userId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/admin/updateUsers/${userId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /admin/users/${userId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/admin/users/${userId}`

## booking

### GET /getAllBooking?${queryParams.toString()} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getAllBooking?${queryParams.toString()}`

### GET /bookings/${bookingId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/${bookingId}`

### GET /bookings/my-bookings?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/my-bookings?${queryParams}`

### GET /bookings/my-bookings/${bookingId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/my-bookings/${bookingId}`

### GET /bookings/my-bookings/${bookingId}/timeline [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/my-bookings/${bookingId}/timeline`

### GET /bookings/my-bookings/${bookingId}/invoice [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/my-bookings/${bookingId}/invoice`

### GET /bookings/my-bookings/${bookingId}/quote [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/my-bookings/${bookingId}/quote`

### GET /bookings/my-bookings/summary [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/my-bookings/summary`

### GET /bookings/track/${trackingNumber} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/track/${trackingNumber}`

### GET /bookings/${bookingId}/documents/${documentId}/download [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/${bookingId}/documents/${documentId}/download`

### POST /createBooking [POST]

- Method: **POST**
- URL: `{{baseUrl}}/createBooking`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /bookings/${bookingId}/reject-quote [POST]

- Method: **POST**
- URL: `{{baseUrl}}/bookings/${bookingId}/reject-quote`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /bookings/${bookingId}/cancel [POST]

- Method: **POST**
- URL: `{{baseUrl}}/bookings/${bookingId}/cancel`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /bookings/${bookingId}/documents [POST]

- Method: **POST**
- URL: `{{baseUrl}}/bookings/${bookingId}/documents`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /booking/${bookingId}/price-quote [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/booking/${bookingId}/price-quote`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /bookings/${bookingId}/accept [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/bookings/${bookingId}/accept`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /bookings/${bookingId}/delivery-status [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/bookings/${bookingId}/delivery-status`

**Request body:**

```json
{
  "sample": "data"
}
```

## consolidation

### GET /queue/summary [GET]

- Method: **GET**
- URL: `{{baseUrl}}/queue/summary`

### GET /all/consolidations?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/all/consolidations?${queryParams}`

### GET /consolidation/${consolidationId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/consolidation/${consolidationId}`

### GET /consolidations/${consolidationId}/on-hold-shipments [GET]

- Method: **GET**
- URL: `{{baseUrl}}/consolidations/${consolidationId}/on-hold-shipments`

### GET /consolidations/${consolidationId}/cancelled-shipments [GET]

- Method: **GET**
- URL: `{{baseUrl}}/consolidations/${consolidationId}/cancelled-shipments`

### GET /shipments?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments?${queryParams}`

### GET /shipments/${shipmentId}/history [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/${shipmentId}/history`

### POST /queue/add [POST]

- Method: **POST**
- URL: `{{baseUrl}}/queue/add`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /queue/add-multiple [POST]

- Method: **POST**
- URL: `{{baseUrl}}/queue/add-multiple`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /consolidation/create [POST]

- Method: **POST**
- URL: `{{baseUrl}}/consolidation/create`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /consolidation/${consolidationId}/add-shipments [POST]

- Method: **POST**
- URL: `{{baseUrl}}/consolidation/${consolidationId}/add-shipments`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /consolidation/queue/bulk-remove [POST]

- Method: **POST**
- URL: `{{baseUrl}}/consolidation/queue/bulk-remove`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /consolidations/${consolidationId}/documents [POST]

- Method: **POST**
- URL: `{{baseUrl}}/consolidations/${consolidationId}/documents`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /consolidations/${consolidationId}/resume-all [POST]

- Method: **POST**
- URL: `{{baseUrl}}/consolidations/${consolidationId}/resume-all`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/restore [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/restore`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /consolidation/${consolidationId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/consolidation/${consolidationId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /consolidations/${consolidationId}/status [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/consolidations/${consolidationId}/status`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /consolidations/${id}/mark-ready [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/consolidations/${id}/mark-ready`

**Request body:**

```json
{
  "sample": "data"
}
```

### PATCH /consolidations/${consolidationId}/shipments/${shipmentId} [PATCH]

- Method: **PATCH**
- URL: `{{baseUrl}}/consolidations/${consolidationId}/shipments/${shipmentId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PATCH /shipments/${shipmentId}/status [PATCH]

- Method: **PATCH**
- URL: `{{baseUrl}}/shipments/${shipmentId}/status`

**Request body:**

```json
{
  "sample": "data"
}
```

### PATCH /shipments/bulk-status [PATCH]

- Method: **PATCH**
- URL: `{{baseUrl}}/shipments/bulk-status`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /consolidation/${consolidationId}/shipment/${shipmentId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/consolidation/${consolidationId}/shipment/${shipmentId}`

### DELETE /consolidation/${consolidationId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/consolidation/${consolidationId}`

### DELETE /consolidation/queue/${queueId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/consolidation/queue/${queueId}`

## damage

### GET /damage-reports/all?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/damage-reports/all?${queryParams}`

### GET /damage-reports/${reportId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/damage-reports/${reportId}`

### GET /damage-reports/stats [GET]

- Method: **GET**
- URL: `{{baseUrl}}/damage-reports/stats`

### GET /damage-reports/export?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/damage-reports/export?${queryParams}`

### POST /damage-reports/${reportId}/insurance [POST]

- Method: **POST**
- URL: `{{baseUrl}}/damage-reports/${reportId}/insurance`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /damage-reports/bulk/update [POST]

- Method: **POST**
- URL: `{{baseUrl}}/damage-reports/bulk/update`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /damage-reports/${reportId}/status [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/damage-reports/${reportId}/status`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /damage-reports/${reportId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/damage-reports/${reportId}`

## invoice

### GET /getAllInvoices?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getAllInvoices?${queryParams}`

### GET /getInvoiceById/${invoiceId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getInvoiceById/${invoiceId}`

### GET /invoices/customer/${customerId}?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/customer/${customerId}?${queryParams}`

### GET /getInvoiceStats [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getInvoiceStats`

### GET /invoices/admin/recent?limit=${limit} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/admin/recent?limit=${limit}`

### GET /invoices/booking/${bookingId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/booking/${bookingId}`

### GET /invoices/shipment/${shipmentId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/shipment/${shipmentId}`

### GET /invoices/track/${trackingNumber} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/track/${trackingNumber}`

### GET /bookings/${bookingId}/invoice [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/${bookingId}/invoice`

### GET /bookings/${bookingId}/quote [GET]

- Method: **GET**
- URL: `{{baseUrl}}/bookings/${bookingId}/quote`

### POST /invoices/${invoiceId}/send-email [POST]

- Method: **POST**
- URL: `{{baseUrl}}/invoices/${invoiceId}/send-email`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /invoices/${invoiceId}/generate-pdf [POST]

- Method: **POST**
- URL: `{{baseUrl}}/invoices/${invoiceId}/generate-pdf`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /invoices/${invoiceId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/invoices/${invoiceId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /mark-paid/${invoiceId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/mark-paid/${invoiceId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /invoices/bulk/update [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/invoices/bulk/update`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /invoices/${invoiceId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/invoices/${invoiceId}`

## manualIvnoice

### GET /invoices/${invoiceId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/${invoiceId}`

### GET /invoices/${invoiceId}/download [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/${invoiceId}/download`

### GET /invoices/summary [GET]

- Method: **GET**
- URL: `{{baseUrl}}/invoices/summary`

### DELETE /deletemanualInvoice/${invoiceId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/deletemanualInvoice/${invoiceId}`

## newShipping

### GET /getNewShipment?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getNewShipment?${queryParams}`

### PUT /updateShipmentStatus/${shipmentId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/updateShipmentStatus/${shipmentId}`

**Request body:**

```json
{
  "sample": "data"
}
```

## shipping

### GET /getAllShipment?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getAllShipment?${queryParams}`

### GET /shipments/${shipmentId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/${shipmentId}`

### GET /shipments/my-shipments?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/my-shipments?${queryParams}`

### GET /shipments/my-shipments/${shipmentId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/my-shipments/${shipmentId}`

### GET /shipments/my-shipments/${shipmentId}/timeline [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/my-shipments/${shipmentId}/timeline`

### GET /shipments/${shipmentId}/timeline [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/${shipmentId}/timeline`

### GET /shipments/${shipmentId}/costs [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/${shipmentId}/costs`

### GET /shipments/warehouse/pending [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/warehouse/pending`

### GET /shipments/stats/dashboard?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/stats/dashboard?${queryParams}`

### GET /shipments/track/${trackingNumber} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/track/${trackingNumber}`

### GET /shipments/${shipmentId}/return-status [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/${shipmentId}/return-status`

### GET /admin/return-requests?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/admin/return-requests?${queryParams}`

### GET /admin/return-requests/stats [GET]

- Method: **GET**
- URL: `{{baseUrl}}/admin/return-requests/stats`

### POST /create-shipments [POST]

- Method: **POST**
- URL: `{{baseUrl}}/create-shipments`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/create [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/create`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/assign [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/assign`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/tracking [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/tracking`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/transport [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/transport`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/documents [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/documents`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/notes/internal [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/notes/internal`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/notes/customer [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/notes/customer`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/cancel [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/cancel`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/costs [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/costs`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /shipments/${shipmentId}/return-request [POST]

- Method: **POST**
- URL: `{{baseUrl}}/shipments/${shipmentId}/return-request`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /update-shipment/${shipmentId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/update-shipment/${shipmentId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /shipments/${shipmentId}/costs/${costId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/shipments/${shipmentId}/costs/${costId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /update-shipment-tracking/${shipmentId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/update-shipment-tracking/${shipmentId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /shipments/${shipmentId}/return-confirm [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/shipments/${shipmentId}/return-confirm`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /shipments/${shipmentId}/return-reject-customer [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/shipments/${shipmentId}/return-reject-customer`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /admin/return-requests/${returnId}/approve [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/admin/return-requests/${returnId}/approve`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /admin/return-requests/${returnId}/reject [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/admin/return-requests/${returnId}/reject`

**Request body:**

```json
{
  "sample": "data"
}
```

### PATCH /shipments/${shipmentId}/status [PATCH]

- Method: **PATCH**
- URL: `{{baseUrl}}/shipments/${shipmentId}/status`

**Request body:**

```json
{
  "sample": "data"
}
```

### PATCH /shipments/${shipmentId}/warehouse/receive [PATCH]

- Method: **PATCH**
- URL: `{{baseUrl}}/shipments/${shipmentId}/warehouse/receive`

**Request body:**

```json
{
  "sample": "data"
}
```

### PATCH /shipments/${shipmentId}/warehouse/process [PATCH]

- Method: **PATCH**
- URL: `{{baseUrl}}/shipments/${shipmentId}/warehouse/process`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /shipments/${shipmentId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/shipments/${shipmentId}`

### DELETE /shipments/${shipmentId}/costs/${costId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/shipments/${shipmentId}/costs/${costId}`

## tracking

### GET /getAllTracking?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getAllTracking?${queryParams}`

### GET /trackings/${id}?type=${type} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/trackings/${id}?type=${type}`

### GET /getTrackingStats [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getTrackingStats`

### GET /tracking/search?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/tracking/search?${queryParams}`

### GET /tracking/export?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/tracking/export?${queryParams}`

### GET /trackings/public/${trackingNumber} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/trackings/public/${trackingNumber}`

### POST /trackings/bulk/delete [POST]

- Method: **POST**
- URL: `{{baseUrl}}/trackings/bulk/delete`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /trackings/${id} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/trackings/${id}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /trackings/bulk/update [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/trackings/bulk/update`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /trackings/${id}?type=${type} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/trackings/${id}?type=${type}`

## warehouse

### GET /shipments/${shipmentId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/shipments/${shipmentId}`

### GET /expected-shipments?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/expected-shipments?${queryParams}`

### GET /receipts?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/receipts?${queryParams}`

### GET /receipts/${receiptId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/receipts/${receiptId}`

### GET /warehouse/inventory?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/inventory?${queryParams}`

### GET /dashboard [GET]

- Method: **GET**
- URL: `{{baseUrl}}/dashboard`

### GET /warehouse/consolidations?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/consolidations?${queryParams}`

### GET /warehouse/consolidations/${consolidationId} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/consolidations/${consolidationId}`

### GET /getAllwarehouses [GET]

- Method: **GET**
- URL: `{{baseUrl}}/getAllwarehouses`

### GET /warehouse/inventory/by-zone${warehouseId ?  [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/inventory/by-zone${warehouseId ? `

### GET /warehouse/receipts/recent?limit=${limit} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/receipts/recent?limit=${limit}`

### GET /receipts/${receiptId}/pdf [GET]

- Method: **GET**
- URL: `{{baseUrl}}/receipts/${receiptId}/pdf`

### GET /warehouse/consolidations/${consolidationId}/packing-list [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/consolidations/${consolidationId}/packing-list`

### GET /warehouse/inventory/export?${queryParams} [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/inventory/export?${queryParams}`

### POST /receive/${shipmentId} [POST]

- Method: **POST**
- URL: `{{baseUrl}}/receive/${shipmentId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /warehouse/consolidations/start [POST]

- Method: **POST**
- URL: `{{baseUrl}}/warehouse/consolidations/start`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /warehouse/consolidations/${consolidationId}/depart [POST]

- Method: **POST**
- URL: `{{baseUrl}}/warehouse/consolidations/${consolidationId}/depart`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /warehouse/consolidations/${consolidationId}/documents [POST]

- Method: **POST**
- URL: `{{baseUrl}}/warehouse/consolidations/${consolidationId}/documents`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /warehouses [POST]

- Method: **POST**
- URL: `{{baseUrl}}/warehouses`

**Request body:**

```json
{
  "sample": "data"
}
```

### POST /inspect/${receiptId} [POST]

- Method: **POST**
- URL: `{{baseUrl}}/inspect/${receiptId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /warehouse/inventory/${inventoryId}/location [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/warehouse/inventory/${inventoryId}/location`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /warehouse/consolidations/${consolidationId}/complete [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/warehouse/consolidations/${consolidationId}/complete`

**Request body:**

```json
{
  "sample": "data"
}
```

### PUT /warehouses/${warehouseId} [PUT]

- Method: **PUT**
- URL: `{{baseUrl}}/warehouses/${warehouseId}`

**Request body:**

```json
{
  "sample": "data"
}
```

### DELETE /receipts/${receiptId} [DELETE]

- Method: **DELETE**
- URL: `{{baseUrl}}/receipts/${receiptId}`

### GET /warehouse/receipts/${receiptId}/consolidate [GET]

- Method: **GET**
- URL: `{{baseUrl}}/warehouse/receipts/${receiptId}/consolidate`

