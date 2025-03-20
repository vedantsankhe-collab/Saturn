import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon } from '@mui/icons-material';
import api from '../utils/api';

const InvestmentChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/indian-stocks/ai/investment-advice', {
        message: userMessage
      });

      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: response.data.advice,
        strategy: response.data.strategy
      }]);
    } catch (error) {
      console.error('Error getting AI advice:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component="div">
          Investment Strategy Assistant
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ 
                flexDirection: 'column', 
                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start' 
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1,
                  gap: 1
                }}>
                  {message.type === 'bot' && (
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BotIcon />
                    </Avatar>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </Typography>
                </Box>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    maxWidth: '80%',
                    bgcolor: message.type === 'user' ? 'primary.light' : 'background.paper'
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  {message.strategy && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        Suggested Strategy:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {message.strategy.map((item, idx) => (
                          <Chip 
                            key={idx} 
                            label={item} 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
          {loading && (
            <ListItem>
              <CircularProgress size={20} />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about investment strategies..."
            variant="outlined"
            size="small"
          />
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default InvestmentChatbot; 