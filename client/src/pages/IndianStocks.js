import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../utils/api';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const IndianStocks = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState({
    indices: [],
    topGainers: [],
    topLosers: [],
    mostActive: [],
    watchlist: []
  });
  const [selectedIndex, setSelectedIndex] = useState('NIFTY 50');
  const [timeframe, setTimeframe] = useState('1D');

  useEffect(() => {
    fetchMarketData();
  }, [selectedIndex, timeframe]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/indian-stocks/market-data', {
        params: { index: selectedIndex, timeframe }
      });
      setMarketData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to fetch market data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/indian-stocks/search?query=${searchQuery}`);
      setMarketData(prev => ({ ...prev, searchResults: response.data }));
      setError(null);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setError('Failed to search stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStockRow = (stock) => (
    <TableRow key={stock.symbol} hover>
      <TableCell>{stock.symbol}</TableCell>
      <TableCell>{stock.companyName}</TableCell>
      <TableCell>₹{stock.price.toFixed(2)}</TableCell>
      <TableCell>
        <Chip
          icon={stock.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          label={`${stock.change}%`}
          color={stock.change >= 0 ? 'success' : 'error'}
          size="small"
        />
      </TableCell>
      <TableCell>₹{stock.volume.toLocaleString()}</TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Indian Stock Market
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Market Overview */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Market Overview</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <MenuItem value="1D">1 Day</MenuItem>
                  <MenuItem value="1W">1 Week</MenuItem>
                  <MenuItem value="1M">1 Month</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              {marketData.indices.map((index) => (
                <Grid item xs={12} sm={6} md={3} key={index.name}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {index.name}
                      </Typography>
                      <Typography variant="h6">
                        {index.value.toFixed(2)}
                      </Typography>
                      <Chip
                        icon={index.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${index.change}%`}
                        color={index.change >= 0 ? 'success' : 'error'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Search and Tabs */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks..."
                variant="outlined"
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
            </Box>

            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Top Gainers" />
              <Tab label="Top Losers" />
              <Tab label="Most Active" />
              <Tab label="Watchlist" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      marketData.topGainers.map(renderStockRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      marketData.topLosers.map(renderStockRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      marketData.mostActive.map(renderStockRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      marketData.watchlist.map(renderStockRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default IndianStocks; 