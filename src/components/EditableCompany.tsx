// CompanyAutocomplete.tsx
import React, { useState } from 'react';
import {
  Autocomplete,
  createFilterOptions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Stack,
  Box,
} from '@mui/material';
import axios from 'axios';
import { Company } from '../data/types';
import { Text } from '@react-pdf/renderer'

interface Props {
  options: Company[];
  selected: Company | null;
  onSelect: (company: Company | null) => void;
  onAdd: (newCompany: Company) => void;
  pdfMode?: boolean
}

const filter = createFilterOptions<Company>();

const EditableCompany: React.FC<Props> = ({ options, selected, onSelect, onAdd, pdfMode }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [form, setForm] = useState<Company>({
    id: -1, 
    company_name: '',
    owner_name: '',
    address1: '', 
    address2: '',
    city: '',
    state: '',
    country: '',
    pin_code: 0,
    inputValue: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAutocompleteChange = (_: any, newValue: Company | null) => {
    if (newValue?.inputValue) {
      setForm({ company_name: newValue.inputValue });
      setOpen(true);
    } else {
      onSelect(newValue);
    }
  };

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCompany = async () => {
    if (!form.company_name.trim() || !form.address1.trim() || !form.pin_code) return;

    setLoading(true);
    try {
      const res = await axios.post<Company>('http://inventory.test/api/v1/companies', form);
      const created = res.data;

      onAdd(created);
      setOpen(false);
    } catch (err) {
      console.error('Error adding company:', err);
      alert('Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = (option: Company) =>
    `${option.company_name}`;

  return (
    <>
    {pdfMode ? (
        <Text></Text>
      ) : (
        <Box
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{ width: 300 }}
        >
          {
          isHovered ? (
            <>
              <Autocomplete
              value={selected}
              options={options}
              getOptionLabel={(option) =>
                typeof option === 'string'
                  ? option
                  : option.inputValue ?? renderLabel(option)
              }
              filterOptions={(opts, params) => {
                const filtered = filter(opts, params);
                const isExisting = opts.some(
                  (opt) => opt.company_name.toLowerCase() === params.inputValue.toLowerCase()
                );

                if (params.inputValue !== '' && !isExisting) {
                  filtered.push({
                    inputValue: params.inputValue,
                    id: -1,
                    company_name: params.inputValue,
                    address1: '',
                    pin_code: 0,
                  });
                }

                return filtered;
              }}
              renderInput={(params) => (
                <TextField {...params} 
                placeholder="Select or Add Company" 
                variant='standard'
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  sx: {
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '4px 3px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    '&:focus-within': {
                      borderColor: '#66afe9',
                      boxShadow: '0 0 3px rgba(102, 175, 233, .6)',
                    },
                  },
                }} 
                value={selected?.company_name}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    display: 'none', // Optional: hide dropdown arrow
                  },
                  '& .MuiAutocomplete-clearIndicator': {
                    display: 'none', // Optional: hide clear button
                  },
                }}
                size="small" />
              )}
              onChange={handleAutocompleteChange}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              />

              <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Add New Company</DialogTitle>
                <DialogContent>
                  <Stack spacing={2} mt={1}>
                    <TextField
                      label="Company Name"
                      fullWidth
                      value={form.company_name}
                      onChange={(e) => handleFormChange('company_name', e.target.value)}
                    />
                    <TextField
                      label="Owner Name"
                      fullWidth
                      value={form.owner_name}
                      onChange={(e) => handleFormChange('owner_name', e.target.value)}
                    />
                    <TextField
                      label="address1"
                      fullWidth
                      value={form.address1}
                      onChange={(e) => handleFormChange('address1', e.target.value)}
                    />
                    <TextField
                      label="address2"
                      fullWidth
                      value={form.address2}
                      onChange={(e) => handleFormChange('address2', e.target.value)}
                    />
                    <TextField
                      label="city"
                      fullWidth
                      value={form.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                    />
                    <TextField
                      label="state"
                      fullWidth
                      value={form.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                    />
                    <TextField
                      label="country"
                      fullWidth
                      value={form.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
                    />
                    <TextField
                      label="pin_code"
                      fullWidth
                      value={form.pin_code}
                      onChange={(e) => handleFormChange('pin_code', e.target.value)}
                    />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCompany} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : 'Add'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ):(
            <input
              readOnly={true}
              type="text"
              className={'input '}
              placeholder={'Select Company'}
              onFocus={() => setIsHovered(false)}
              value={selected?.company_name}
            />
          )}
        </Box>
      )
    }
    </>
  )
};

export default EditableCompany;
