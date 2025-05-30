import { FC, useCallback } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Invoice } from '../data/types'
//import { Invoice, TInvoice } from '../data/types'
import { useDebounce } from '@uidotdev/usehooks'
import InvoicePage from './InvoicePage'
import FileSaver from 'file-saver'
import Button from '@mui/material/Button'
import { Grid2 } from '@mui/material'

interface Props {
  data: Invoice
}

const Download: FC<Props> = ({ data }) => {
  const debounced = useDebounce(data, 500)

  const document = useCallback(() => <InvoicePage pdfMode={true} data={debounced} />, []);


  // function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
  //   if (!e.target.files?.length) return

  //   const file = e.target.files[0]
  //   file
  //     .text()
  //     .then((str: string) => {
  //       try {
  //         if (!(str.startsWith('{') && str.endsWith('}'))) {
  //           str = atob(str)
  //         }
  //         const d = JSON.parse(str)
  //         const dParsed = TInvoice.parse(d)
  //         console.info('parsed correctly')
  //         setData(dParsed)
  //       } catch (e) {
  //         console.error(e)
  //         return
  //       }
  //     })
  //     .catch((err) => console.error(err))
  // }

  function handleSaveTemplate() {
    const blob = new Blob([JSON.stringify(debounced)], {
      type: 'text/plain;charset=utf-8',
    })
    FileSaver(blob, title + '.template')
  }

  const title = data.invoiceTitle ? data.invoiceTitle.toLowerCase() : 'invoice'
  return (
    <>
      <Grid2 container sx={{ p: 0 }}>
        <Grid2 size={{ xs: 0, md: 8 }}></Grid2>
        <Grid2 size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right', alignItems: 'center' }}>
          <PDFDownloadLink
            key="pdf"
            document={document()}
            fileName={`${title}.pdf`}
            aria-label="Save PDF"
            title="Save PDF"
          >
            <Button variant="contained" size="small" sx={{ my: 2 }}>
              Print PDF
            </Button>
          </PDFDownloadLink>
          
          <Button
            variant="contained"
            size="small"
            className=""
            onClick={handleSaveTemplate}
            sx={{ ml: 2, my: 2 }}
          >
            Save Invoice
          </Button>
        </Grid2>
      </Grid2>

      {/* 
      <label className="download-pdf__template_upload">
        <input type="file" accept=".json,.template" onChange={handleInput} />
      </label>
      <p className="text-small">Upload Template</p>
      */}
    </>
  )
}

export default Download
