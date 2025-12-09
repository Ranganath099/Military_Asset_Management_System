import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TransfersPage() {
  const { isAdmin, baseId } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    equipment_type_id: '',
    start_date: '',
    end_date: '',
  });
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    from_base: '',
    to_base: '',
    equipment_type: '',
    quantity: '',
    transfer_at: '',
    notes: '',
  });

  useEffect(() => {
    async function loadOptions() {
      const [basesRes, eqRes] = await Promise.all([
        api.get('/bases/'),
        api.get('/equipment-types/'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);

      if (!isAdmin && baseId) {
        setForm((prev) => ({ ...prev, from_base: baseId }));
      }
    }
    loadOptions();
  }, [isAdmin, baseId]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const fetchData = async () => {
    const res = await api.get('/transfers/', {
      params: {
        equipment_type_id: filters.equipment_type_id || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      },
    });
    setItems(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      from_base: form.from_base || baseId,
      to_base: form.to_base,
      equipment_type: form.equipment_type,
      quantity: Number(form.quantity),
      transfer_at: form.transfer_at,
      notes: form.notes,
    };
    await api.post('/transfers/', payload);
    setForm((prev) => ({
      ...prev,
      to_base: '',
      equipment_type: '',
      quantity: '',
      transfer_at: '',
      notes: '',
    }));
    fetchData();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Transfers
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Equipment"
              name="equipment_type_id"
              value={filters.equipment_type_id}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {equipmentTypes.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} ({e.category})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Start Date"
              name="start_date"
              InputLabelProps={{ shrink: true }}
              value={filters.start_date}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="End Date"
              name="end_date"
              InputLabelProps={{ shrink: true }}
              value={filters.end_date}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'end' }}>
            <Button variant="contained" fullWidth onClick={fetchData}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Transfer
        </Typography>
        <Grid container spacing={2} component="form" onSubmit={handleCreate}>
          {isAdmin && (
            <Grid item xs={12} md={3}>
              <TextField
                select
                required
                fullWidth
                label="From Base"
                name="from_base"
                value={form.from_base}
                onChange={handleFormChange}
              >
                {bases.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          {!isAdmin && (
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="From Base"
                value={
                  bases.find((b) => b.id === (form.from_base || baseId))?.name ||
                  ''
                }
                disabled
              />
            </Grid>
          )}

          <Grid item xs={12} md={3}>
            <TextField
              select
              required
              fullWidth
              label="To Base"
              name="to_base"
              value={form.to_base}
              onChange={handleFormChange}
            >
              {bases.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.code} - {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              required
              fullWidth
              label="Equipment"
              name="equipment_type"
              value={form.equipment_type}
              onChange={handleFormChange}
            >
              {equipmentTypes.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} ({e.category})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              required
              fullWidth
              type="number"
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Transfer At"
              name="transfer_at"
              InputLabelProps={{ shrink: true }}
              value={form.transfer_at}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'end' }}>
            <Button type="submit" variant="contained" fullWidth>
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Transfer History
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>From Base (id)</TableCell>
              <TableCell>To Base (id)</TableCell>
              <TableCell>Equipment (id)</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Transfer At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.from_base}</TableCell>
                <TableCell>{t.to_base}</TableCell>
                <TableCell>{t.equipment_type}</TableCell>
                <TableCell>{t.quantity}</TableCell>
                <TableCell>{t.transfer_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
