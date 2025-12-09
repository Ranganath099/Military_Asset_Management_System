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

export default function AssignmentsPage() {
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
    assigned_to: '',
    quantity: '',
    assigned_at: '',
    purpose: '',
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
    const res = await api.get('/assignments/', {
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
      assigned_to: form.assigned_to,
      quantity: Number(form.quantity),
      assigned_at: form.assigned_at,
      purpose: form.purpose,
    };
    await api.post('/assignments/', payload);
    setForm((prev) => ({
      ...prev,
      assigned_to: '',
      quantity: '',
      assigned_at: '',
      purpose: '',
    }));
    fetchData();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Assignments
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
          Add Assignment
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

          <Grid item xs={12} md={3}>
            <TextField
              required
              fullWidth
              label="Assigned To"
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleFormChange}
            />
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
              label="Assigned At"
              name="assigned_at"
              InputLabelProps={{ shrink: true }}
              value={form.assigned_at}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              label="Purpose"
              name="purpose"
              value={form.purpose}
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
          Assignments History
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Base (id)</TableCell>
              <TableCell>Equipment (id)</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Assigned At</TableCell>
              <TableCell>Purpose</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.base}</TableCell>
                <TableCell>{a.equipment_type}</TableCell>
                <TableCell>{a.assigned_to}</TableCell>
                <TableCell>{a.quantity}</TableCell>
                <TableCell>{a.assigned_at}</TableCell>
                <TableCell>{a.purpose}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
