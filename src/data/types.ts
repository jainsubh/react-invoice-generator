import { CSSProperties } from 'react'
import { z, TypeOf } from 'zod'

export interface ProductLine {
  description: string
  code: string
  quantity: string
  rate: string
}

export interface Company {
  id: number
  company_name: string
  owner_name: string
  address1: string
  address2: string
  city: string
  state: string
  country: string
  pin_code: number
  inputValue: string; // used for custom "Add XYZ" logic
}

export const TProductLine = z.object({
  description: z.string(),
  code: z.string(),
  quantity: z.string(),
  rate: z.string(),
})

export const TCompany = z.object({
  id: z.number(),
  company_name: z.string(),
  owner_name: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pin_code: z.number(),
  inputValue: z.string()
})

export const TInvoice = z.object({
  logo: z.string(),
  logoWidth: z.number(),
  title: z.string(),
  company: TCompany,
  billTo: z.string(),
  clientName: z.string(),
  clientAddress: z.string(),
  clientAddress2: z.string(),
  clientCountry: z.string(),
  invoiceTitleLabel: z.string(),
  invoiceTitle: z.string(),
  invoiceDateLabel: z.string(),
  invoiceDate: z.string(),
  invoiceDueDateLabel: z.string(),
  invoiceDueDate: z.string(),
  productLineDescription: z.string(),
  productLineCode:z.string(),
  productLineQuantity: z.string(),
  productLineQuantityRate: z.string(),
  productLineQuantityAmount: z.string(),
  productLines: z.array(TProductLine),
  subTotalLabel: z.string(),
  taxLabel: z.string(),
  totalLabel: z.string(),
  currency: z.string(),
  notesLabel: z.string(),
  notes: z.string(),
  termLabel: z.string(),
  term: z.string(),
})

export type Invoice = TypeOf<typeof TInvoice>

export interface CSSClasses {
  [key: string]: CSSProperties
}
