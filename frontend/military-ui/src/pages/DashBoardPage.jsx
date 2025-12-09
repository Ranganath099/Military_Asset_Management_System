import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { isAdmin, isCommander, isLogistics, baseId } = useAuth();

  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    base_id: '',
    equipment_type_id: '',
    start_date: '',
    end_date: '',
  });

  const [data, setData] = useState(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [addEqOpen, setAddEqOpen] = useState(false);
  const [newEq, setNewEq] = useState({
    name: '',
    category: '',
    description: '',
    unit: '',
    units: '',
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const [basesRes, eqRes] = await Promise.all([
          api.get('/bases/'),
          api.get('/equipment-types/'),
        ]);

        setBases(basesRes.data);
        setEquipmentTypes(eqRes.data);

        if (!isAdmin && baseId) {
          setFilters((prev) => ({ ...prev, base_id: baseId }));
        }
      } catch (err) {
        console.error('Failed to load bases/equipment types', err);
      }
    }

    loadOptions();
  }, [isAdmin, baseId]);

  const handleChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFetch = async () => {
    if (!filters.base_id || !filters.equipment_type_id) {
      alert('Please select Base and Equipment Type');
      return;
    }

    try {
      const res = await api.get('/dashboard/', {
        params: {
          base_id: filters.base_id,
          equipment_type_id: filters.equipment_type_id,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      alert('Failed to load dashboard data');
    }
  };

  const canSeeAssignments = isAdmin || isCommander;

  let roleTitle = '';
  let roleDescription = '';

  if (isAdmin) {
    roleTitle = 'Admin';
  } else if (isCommander) {
    roleTitle = 'Base Commander';
  } else if (isLogistics) {
    roleTitle = 'Logistics Officer';
  }

  const handleNewEqChange = (e) => {
    const { name, value } = e.target;
    setNewEq((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEquipmentType = async () => {
    try {
      const payload = {
        name: newEq.name,
        category: newEq.category,
        description: newEq.description,
        unit: newEq.unit,
        units: newEq.units,
      };

      const res = await api.post('/equipment-types/', payload);
      setEquipmentTypes((prev) => [...prev, res.data]);
      setFilters((prev) => ({
        ...prev,
        equipment_type_id: res.data.id,
      }));
      setNewEq({
        name: '',
        category: '',
        description: '',
        unit: '',
        units: '',
      });
      setAddEqOpen(false);
    } catch (err) {
      console.error('Failed to create equipment type', err);
      alert('Failed to create equipment type');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View opening balances, net movements, assignments and closing balances
          for your selected base and equipment type.
        </Typography>
      </Box>

      {roleTitle && (
        <Paper
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            boxShadow: 0,
            border: '1px solid',
            borderColor: 'divider',
            background:
              roleTitle === 'Admin'
                ? 'rgba(25, 118, 210, 0.04)'
                : roleTitle === 'Base Commander'
                ? 'rgba(46, 125, 50, 0.04)'
                : 'rgba(255, 143, 0, 0.04)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {roleTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {roleDescription}
          </Typography>
        </Paper>
      )}

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            {isAdmin ? (
              <TextField
                select
                fullWidth
                size="small"
                label="Base"
                name="base_id"
                value={filters.base_id}
                onChange={handleChange}
              >
                {bases.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                size="small"
                label="Base (Assigned)"
                value={
                  bases.find((b) => b.id === filters.base_id)
                    ? `${bases.find((b) => b.id === filters.base_id)?.code} - ${
                        bases.find((b) => b.id === filters.base_id)?.name
                      }`
                    : 'My Base'
                }
                disabled
              />
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Equipment Type"
                name="equipment_type_id"
                value={filters.equipment_type_id}
                onChange={handleChange}
              >
                {equipmentTypes.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name} ({e.category})
                  </MenuItem>
                ))}
              </TextField>

              {isAdmin && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setAddEqOpen(true)}
                >
                  Add
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              name="start_date"
              InputLabelProps={{ shrink: true }}
              value={filters.start_date}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              name="end_date"
              InputLabelProps={{ shrink: true }}
              value={filters.end_date}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={1}
            sx={{ display: 'flex', alignItems: 'flex-end' }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={handleFetch}
              sx={{ height: 40 }}
            >
              Load
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {data && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Opening Balance
                </Typography>
                <Typography variant="h6">{data.opening_balance}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{ p: 2, borderRadius: 2, boxShadow: 1, cursor: 'pointer' }}
                onClick={() => setMovementOpen(true)}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Net Movement
                </Typography>
                <Typography variant="h6">
                  {data.net_movement.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (Click to view breakdown)
                </Typography>
              </Paper>
            </Grid>

            {canSeeAssignments && (
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned
                  </Typography>
                  <Typography variant="h6">
                    {data.assigned_total}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {canSeeAssignments && (
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expended
                  </Typography>
                  <Typography variant="h6">
                    {data.expended_total}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Closing Balance
                </Typography>
                <Typography variant="h6">{data.closing_balance}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Dialog open={movementOpen} onClose={() => setMovementOpen(false)}>
            <DialogTitle>Net Movement Breakdown</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Purchases: {data.net_movement.purchases}
              </DialogContentText>
              <DialogContentText>
                Transfers In: {data.net_movement.transfers_in}
              </DialogContentText>
              <DialogContentText>
                Transfers Out: {data.net_movement.transfers_out}
              </DialogContentText>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={addEqOpen} onClose={() => setAddEqOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Equipment Type</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Define a new equipment type to be used across the system.
          </DialogContentText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              size="small"
              value={newEq.name}
              onChange={handleNewEqChange}
            />
            <TextField
              label="Category"
              name="category"
              fullWidth
              size="small"
              value={newEq.category}
              onChange={handleNewEqChange}
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              size="small"
              multiline
              minRows={2}
              value={newEq.description}
              onChange={handleNewEqChange}
            />
            <TextField
              label="Unit"
              name="unit"
              fullWidth
              size="small"
              placeholder="e.g., rounds, vehicles, crates"
              value={newEq.unit}
              onChange={handleNewEqChange}
            />
            <TextField
              label="Units"
              name="units"
              type="number"
              fullWidth
              size="small"
              value={newEq.units}
              onChange={handleNewEqChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEqOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEquipmentType}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
