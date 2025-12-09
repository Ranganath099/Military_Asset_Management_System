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

const ACTION_TYPES = [
  { value: '', label: 'All' },
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'EXPENDITURE', label: 'Expenditure' },
];

export default function LogsPage() {
  const { isAdmin, baseId } = useAuth();
  const [bases, setBases] = useState([]);
  const [filters, setFilters] = useState({
    action_type: '',
    base_id: '',
    start_date: '',
    end_date: '',
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadBases() {
      const res = await api.get('/bases/');
      setBases(res.data);

      if (!isAdmin && baseId) {
        setFilters((prev) => ({ ...prev, base_id: baseId }));
      }
    }
    loadBases();
  }, [isAdmin, baseId]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const fetchData = async () => {
    const res = await api.get('/logs/', {
      params: {
        action_type: filters.action_type || undefined,
        base_id: filters.base_id || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      },
    });
    setItems(res.data);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Audit Logs
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Action Type"
              name="action_type"
              value={filters.action_type}
              onChange={handleFilterChange}
            >
              {ACTION_TYPES.map((a) => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

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

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Log Entries
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Object ID</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action_type}</TableCell>
                <TableCell>{log.model_name}</TableCell>
                <TableCell>{log.object_id}</TableCell>
                <TableCell>
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.75rem',
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
