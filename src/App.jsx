import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import NetworkGraph from './components/NetworkGraph';
import InspectorPanel from './components/InspectorPanel';
import { chat, exportHistory, getToken, getRole, getUsername, isAuthenticated } from './services/chatApi';
import { FULL_NETWORK } from './mockData';

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    role: null,
    username: null
  });

  const [messages, setMessages] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check auth credentials on mount
  useEffect(() => {
    if (isAuthenticated()) {
      setAuth({
        isAuthenticated: true,
        token: getToken(),
        role: getRole(),
        username: getUsername()
      });
    }
  }, []);

  // Seed default overview and network when authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      setGraph(FULL_NETWORK);
      setMessages([
        {
          sender: 'system',
          text: "Welcome to the Police Crime Database search system. Currently indexing 3 active cases, 3 suspects, 2 corporate victims, and 3 locations. Click on any node in the graph to view intelligence reports, or type a query in the chat (e.g., 'Marcus Vance' or 'Case 101') to filter the network.",
          zcql_query: "SELECT * FROM crime_records WHERE status = 'active';",
          result_rows: [
            { case_id: "case_101", status: "active", primary_suspect: "Serena Chen" },
            { case_id: "case_102", status: "active", primary_suspect: "Serena Chen" },
            { case_id: "case_103", status: "active", primary_suspect: "Marcus Vance" }
          ],
          sources: [
            "Case File #CR-2026-101 (Sovereign Trust Bank Robbery)",
            "Case File #CR-2026-102 (Syndicate Money Laundering)",
            "Incident Report #IR-2026-884 (Warehouse Cargo Theft)"
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [auth.isAuthenticated]);

  const handleLoginSuccess = (username, token, role) => {
    setAuth({
      isAuthenticated: true,
      token,
      role,
      username
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      token: null,
      role: null,
      username: null
    });
    setMessages([]);
    setGraph({ nodes: [], edges: [] });
    setSelectedNode(null);
    setConversationId(null);
  };

  const handleSendMessage = async (text) => {
    if (loading) return;
    
    setLoading(true);
    
    // 1. Add user query to chat log
    const userMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // 2. Fetch answer from single API seam
      const response = await chat(text, conversationId);
      
      // 3. Save conversation ID for thread continuity
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // 4. Append system response
      const systemMessage = {
        sender: 'system',
        text: response.answer,
        zcql_query: response.zcql_query,
        sources: response.sources,
        result_rows: response.result_rows,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, systemMessage]);

      // 5. Update active network graph view
      if (response.graph) {
        setGraph(response.graph);
        
        // Clear inspector details if currently selected node is filtered out
        if (selectedNode && !response.graph.nodes.some(n => n.id === selectedNode.id)) {
          setSelectedNode(null);
        }
      }
    } catch (err) {
      // Handle network errors
      const errorMessage = {
        sender: 'system',
        text: `Secure decryption failed: ${err.message}. Please check connection variables.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryNode = (label) => {
    handleSendMessage(label);
  };

  // If unauthorized, lock system with the decrypt access login overlay
  if (!auth.isAuthenticated) {
    return (
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <div className="app-container">
      <Header
        username={auth.username}
        role={auth.role}
        conversationId={conversationId}
        onLogout={handleLogout}
        onExport={exportHistory}
      />
      <div className="dashboard-grid">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>
          <NetworkGraph
            graph={graph}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
          />
          <InspectorPanel
            selectedNode={selectedNode}
            activeGraph={graph}
            onClose={() => setSelectedNode(null)}
            onQueryNode={handleQueryNode}
            onSelectNode={setSelectedNode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
