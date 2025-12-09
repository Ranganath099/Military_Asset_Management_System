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

export default function PurchasesPage() {
  const { isAdmin, baseId } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    base_id: '',
    equipment_type_id: '',
    start_date: '',
    end_date: '',
  });
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    base: '',
    equipment_type: '',
    quantity: '',
    unit_cost: '',
    purchased_at: '',
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
        setFilters((prev) => ({ ...prev, base_id: baseId }));
        setForm((prev) => ({ ...prev, base: baseId }));
      }
    }
    loadOptions();
  }, [isAdmin, baseId]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const fetchData = async () => {
    const res = await api.get('/purchases/', {
      params: {
        base_id: filters.base_id || undefined,
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
      base: form.base || baseId,
      equipment_type: form.equipment_type,
      quantity: Number(form.quantity),
      unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
      purchased_at: form.purchased_at,
      notes: form.notes,
    };
    await api.post('/purchases/', payload);
    setForm((prev) => ({ ...prev, quantity: '', unit_cost: '', notes: '' }));
    fetchData();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Purchases
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {isAdmin && (
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Base"
                name="base_id"
                value={filters.base_id}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {bases.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
          Add Purchase
        </Typography>
        <Grid container spacing={2} component="form" onSubmit={handleCreate}>
          {isAdmin && (
            <Grid item xs={12} md={3}>
              <TextField
                select
                required
                fullWidth
                label="Base"
                name="base"
                value={form.base}
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Unit Cost"
              name="unit_cost"
              value={form.unit_cost}
              onChange={handleFormChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Purchased At"
              name="purchased_at"
              InputLabelProps={{ shrink: true }}
              value={form.purchased_at}
              onChange={handleFormChange}
            />
          </Grid>
          <Grid item xs={12} md={10}>
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
          Purchase History
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Base</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit Cost</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Purchased At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.base}</TableCell>
                <TableCell>{p.equipment_type}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>{p.unit_cost}</TableCell>
                <TableCell>{p.total_cost}</TableCell>
                <TableCell>{p.purchased_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
