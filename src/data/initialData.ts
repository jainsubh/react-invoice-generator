import { ProductLine, Invoice, Company } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  code: '',
  quantity: '1',
  rate: '0.00',
}

export const initialCompany: Company = {
  "id": 0,
  "company_name": "",
  "owner_name": "",
  "address1": "",
  "address2": "",
  "city": "",
  "state": "",
  "country": "",
  "pin_code": 0,
  "inputValue": "",
}

export const initialInvoice: Invoice = {
  "logo": "",
  "logoWidth": 100,
  "title": "Challan",
  "company": initialCompany,
  "billTo": "Bill To:",
  "clientName": "",
  "clientAddress": "",
  "clientAddress2": "",
  "clientCountry": "United States",
  "invoiceTitleLabel": "Invoice#",
  "invoiceTitle": "",
  "invoiceDateLabel": "Invoice Date",
  "invoiceDate": "",
  "invoiceDueDateLabel": "Due Date",
  "invoiceDueDate": "",
  "productLineDescription": "Item Description",
  "productLineCode": "HSN Code",
  "productLineQuantity": "Qty",
  "productLineQuantityRate": "Rate",
  "productLineQuantityAmount": "Amount",
  "productLines": [
    { ...initialProductLine },
  ],
  "subTotalLabel": "Sub Total",
  "taxLabel": "Sale Tax (10%)",
  "totalLabel": "TOTAL",
  "currency": "$",
  "notesLabel": "Notes",
  "notes": "It was great doing business with you.",
  "termLabel": "Terms & Conditions",
  "term": "Please make the payment by the due date."
}