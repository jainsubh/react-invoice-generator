import { FC, useState, useEffect } from 'react'
import { Company, Invoice, ProductLine } from '../data/types'
import { initialInvoice, initialProductLine } from '../data/initialData'
import EditableInput from './EditableInput'
import EditableTextarea from './EditableTextarea'
import EditableCalendarInput from './EditableCalendarInput'
//import countryList from '../data/countryList'
import Document from './Document'
import Page from './Page'
import View from './View'
import Text from './Text'
import { Font } from '@react-pdf/renderer'
import Download from './DownloadPDF'
import { format } from 'date-fns/format'
import EditableCompany from './EditableCompany'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    {
      src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf',
      fontWeight: 600,
    },
  ],
})

interface Props {
  data?: Invoice
  pdfMode?: boolean
  onChange?: (invoice: Invoice) => void
}

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [saleTax, setSaleTax] = useState<number>()

  const dateFormat = 'MMM dd, yyyy'
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.invoiceDueDate !== ''
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.invoiceDueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30)
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    console.log(company); 
    const newInvoice = { ...invoice };
    newInvoice['company'] = company;
    setInvoice(newInvoice);
  };

  const handleNewCompanyAdded = (newOption: Company) => {
    setCompanies(prev => [...prev, newOption]);
    setSelectedCompany(newOption);
    const newInvoice = { ...invoice };
    newInvoice['company'] = newOption;
    setInvoice(newInvoice);
  };


  const handleChange = (name: keyof Invoice, value: string | number) => {
    if (name !== 'productLines' && name !== 'company') {
      const newInvoice = { ...invoice }

      if (name === 'logoWidth' && typeof value === 'number') {
        newInvoice[name] = value
      } else if (name !== 'logoWidth' && typeof value === 'string') {
        newInvoice[name] = value
      }

      setInvoice(newInvoice)
    }
  }

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (name === 'description') {
          newProductLine[name] = value
        } else {
          if (
            value[value.length - 1] === '.' ||
            (value[value.length - 1] === '0' && value.includes('.'))
          ) {
            newProductLine[name] = value
          } else {
            const n = parseFloat(value)

            newProductLine[name] = (n ? n : 0).toString()
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((_, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]

    setInvoice({ ...invoice, productLines })
  }

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity)
    const rateNumber = parseFloat(rate)
    const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

    return amount.toFixed(2)
  }

  const fetchCompany = async () => {
    console.log('fetch company');
    try {
      const response = await fetch('http://inventory.test/api/v1/companies');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json: Company[] = await response.json();
      setCompanies(json);
    } catch (e:any) {
      //setError(e.message);
    } finally {
      console.log('set loading false');
      //setLoading(false);
    }
  };

  useEffect(() => {
    let subTotal = 0

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity)
      const rateNumber = parseFloat(productLine.rate)
      const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

      subTotal += amount
    })

    setSubTotal(subTotal)
  }, [invoice.productLines])

  useEffect(() => {
    const match = invoice.taxLabel.match(/(\d+)%/)
    const taxRate = match ? parseFloat(match[1]) : 0
    const saleTax = subTotal ? (subTotal * taxRate) / 100 : 0

    setSaleTax(saleTax)
  }, [subTotal, invoice.taxLabel])

  useEffect(() => {
    if (onChange) {
      fetchCompany();
      onChange(invoice)
    }
  }, [onChange, invoice])

  return (
    <>
    
    {!pdfMode && <Download data={invoice} />}
    <Document pdfMode={pdfMode}>
    
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50" pdfMode={pdfMode}>
          </View>
          <View className="w-50" pdfMode={pdfMode}>
            <Text className="fs-45 right bold" pdfMode={pdfMode}>{invoice.title}</Text>
          </View>
        </View>

        <View className="flex mt-40" pdfMode={pdfMode}>
          {/* Company Selection */}
          <View className="w-55" pdfMode={pdfMode}>
            <EditableCompany options={companies} selected={selectedCompany} onSelect={handleCompanySelect} onAdd={handleNewCompanyAdded} pdfMode={pdfMode} />
            {selectedCompany ? (
              <>
                <Text pdfMode={pdfMode}>{selectedCompany.owner_name? selectedCompany.owner_name: 'Owner Name'}</Text>
                <Text pdfMode={pdfMode}>{selectedCompany.address1? selectedCompany.address1: 'Address 1'}</Text>
                <Text pdfMode={pdfMode}>{selectedCompany.address2? selectedCompany.address2: 'Address 2'}</Text>
                <Text pdfMode={pdfMode}>
                  {selectedCompany.city? selectedCompany.city: 'City, State'}
                </Text>
                <Text pdfMode={pdfMode}>
                  {selectedCompany.country? selectedCompany.country: 'Country, Pin Code'}
                </Text>
              </>
            ):(
              <>
                <Text pdfMode={pdfMode}>{invoice.company.owner_name? invoice.company.owner_name: 'Owner Name'}</Text>
                <Text pdfMode={pdfMode}>{invoice.company.address1? invoice.company.address1: 'Address 1'}</Text>
                <Text pdfMode={pdfMode}>{invoice.company.address2? invoice.company.address2: 'Address 2'}</Text>
                <Text pdfMode={pdfMode}>
                  {invoice.company.city? invoice.company.city: 'City, State'}
                </Text>
                <Text pdfMode={pdfMode}>
                  {invoice.company.country? invoice.company.country: 'Country, Pin Code'}
                </Text>
              </>
            )}
          </View>
          <View className="w-45" pdfMode={pdfMode}>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceTitleLabel}
                  onChange={(value) => handleChange('invoiceTitleLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableInput
                  placeholder="INV-12"
                  value={invoice.invoiceTitle}
                  onChange={(value) => handleChange('invoiceTitle', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDateLabel}
                  onChange={(value) => handleChange('invoiceDateLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDate, dateFormat)}
                  selected={invoiceDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : '',
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDueDateLabel}
                  onChange={(value) => handleChange('invoiceDueDateLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDueDate, dateFormat)}
                  selected={invoiceDueDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDueDate',
                      date ? (!Array.isArray(date) ? format(date, dateFormat) : '') : '',
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-30 bg-dark flex" pdfMode={pdfMode}>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineDescription}
              onChange={(value) => handleChange('productLineDescription', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-12 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineCode}
              onChange={(value) => handleChange('productLineCode', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange('productLineQuantity', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) => handleChange('productLineQuantityRate', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) => handleChange('productLineQuantityAmount', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === '' ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex" pdfMode={pdfMode}>
              <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableTextarea
                  className="dark"
                  rows={2}
                  placeholder="Enter item name/description"
                  value={productLine.description}
                  onChange={(value) => handleProductLineChange(i, 'description', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-12 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.code}
                  onChange={(value) => handleProductLineChange(i, 'code', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) => handleProductLineChange(i, 'quantity', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.rate}
                  onChange={(value) => handleProductLineChange(i, 'rate', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {calculateAmount(productLine.quantity, productLine.rate)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          )
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Add Line Item
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange('subTotalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {subTotal?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.taxLabel}
                  onChange={(value) => handleChange('taxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {saleTax?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange('totalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange('currency', value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {(typeof subTotal !== 'undefined' && typeof saleTax !== 'undefined'
                    ? subTotal + saleTax
                    : 0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.notesLabel}
            onChange={(value) => handleChange('notesLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.notes}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          />
        </View>
        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange('termLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.term}
            onChange={(value) => handleChange('term', value)}
            pdfMode={pdfMode}
          />
        </View>
      </Page>
    </Document>
    </>
    
  )
}

export default InvoicePage
