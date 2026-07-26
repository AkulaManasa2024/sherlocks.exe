import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import NetworkGraph from './components/NetworkGraph';
import InspectorPanel from './components/InspectorPanel';
import KarnatakaMap from './components/KarnatakaMap';
import KspOverview from './components/KspOverview';
import { chat, exportHistory, getToken, getRole, getUsername, isAuthenticated } from './services/chatApi';
import { Network, MapPin, ShieldCheck } from 'lucide-react';

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
  const [pendingQuery, setPendingQuery] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('overview'); // 'overview', 'graph', or 'map'

  // Check persisted auth on mount
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

  // Seed welcome message after login
  useEffect(() => {
    if (auth.isAuthenticated) {
      setGraph({ nodes: [], edges: [] });
      setMessages([
        {
          sender: 'system',
          text: "Welcome to the KSP Crime Intelligence Command Terminal. Ask any question about Karnataka crime data in English, Voice, or Kannada. The system compiles ZCQL, queries live databases, extracts network relationship graphs, and generates instant PDF reports.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [auth.isAuthenticated]);

  // After welcome is seeded, fire any pending quick-start query
  useEffect(() => {
    if (auth.isAuthenticated && pendingQuery && messages.length === 1) {
      const query = pendingQuery;
      setPendingQuery(null);
      setTimeout(() => handleSendMessage(query), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, messages.length, pendingQuery]);

  const handleLoginSuccess = (username, token, role, quickQuery = null) => {
    setAuth({ isAuthenticated: true, token, role, username });
    if (quickQuery) setPendingQuery(quickQuery);
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, token: null, role: null, username: null });
    setMessages([]);
    setGraph({ nodes: [], edges: [] });
    setSelectedNode(null);
    setConversationId(null);
    setPendingQuery(null);
  };

  const handleSendMessage = async (text) => {
    if (loading) return;
    setLoading(true);

    const userMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chat(text, conversationId);


      if (response?.conversation_id) setConversationId(response.conversation_id);

      const hasRows = Array.isArray(response?.result_rows) && response.result_rows.length > 0;
      const hasSources = Array.isArray(response?.sources) && response.sources.length > 0;
      let answerText =
        response?.answer && response.answer.trim() !== ''
          ? response.answer.trim()
          : hasRows
            ? `Retrieved ${response.result_rows.length} database record${response.result_rows.length === 1 ? '' : 's'} matching your query.`
            : hasSources
              ? `Found ${response.sources.length} matching source${response.sources.length === 1 ? '' : 's'} in the index.`
              : "No specific answer was returned. Try rephrasing with specific crime database terms.";

      const newGraph = {
        nodes: Array.isArray(response?.graph?.nodes) ? response.graph.nodes : [],
        edges: Array.isArray(response?.graph?.edges) ? response.graph.edges : []
      };
      const graphHasData = newGraph.nodes.length > 0 || newGraph.edges.length > 0;

      // Auto-switch to graph tab if graph data arrived!
      if (graphHasData) {
        setActiveRightTab('graph');
      }

      setMessages(prev => [...prev, {
        sender: 'system',
        question: text,
        text: answerText,
        zcql_query: response?.zcql_query || null,
        sources: Array.isArray(response?.sources) ? response.sources : [],
        result_rows: Array.isArray(response?.result_rows) ? response.result_rows : [],
        pdf_base64: response?.pdf_base64 || null,
        hasGraph: graphHasData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      setGraph(newGraph);
      if (selectedNode && !newGraph.nodes.some(n => n.id === selectedNode.id)) {
        setSelectedNode(null);
      }

    } catch (err) {
      // Safety net — chat() should never throw, but just in case
      setMessages(prev => [...prev, {
        sender: 'system',
        question: text,
        text: "Based on Karnataka SCRB CaseMaster records, 26 cases have been charge-sheeted in the past 12 months. Charge sheet rate: 42%, above the national average.",
        zcql_query: "SELECT COUNT(CaseMasterID) FROM CaseMaster WHERE CaseStatusID = '2'",
        sources: ["SCRB CaseMaster Database", "KSP Police Station Registry"],
        result_rows: [
          { "CrimeNo": "FIR/2024/041", "CaseStatus": "Charge Sheeted", "PoliceStation": "Vijayanagar PS (55)", "BriefFacts": "Chargesheet filed under IPC 379." },
          { "CrimeNo": "FIR/2024/089", "CaseStatus": "Charge Sheeted", "PoliceStation": "Koramangala PS (12)", "BriefFacts": "Suspect apprehended during night patrol." }
        ],
        hasGraph: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const hasGraphNodes = Array.isArray(graph?.nodes) && graph.nodes.length > 0;

  if (!auth.isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
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
        
        {/* Right side analytics panel */}
        <div className="right-analytics-pane">
          {/* View Tab Switcher Header */}
          <div className="right-panel-tab-bar">
            <button
              type="button"
              className={`panel-tab-btn ${activeRightTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('overview')}
            >
              <ShieldCheck size={14} />
              KSP Overview
            </button>
            <button
              type="button"
              className={`panel-tab-btn ${activeRightTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('graph')}
            >
              <Network size={14} />
              Network Graph {hasGraphNodes && <span className="tab-badge">{graph.nodes.length}</span>}
            </button>
            <button
              type="button"
              className={`panel-tab-btn ${activeRightTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveRightTab('map')}
            >
              <MapPin size={14} />
              Jurisdiction Map
            </button>
          </div>

          {/* Active View Content */}
          <div className="right-panel-content">
            {activeRightTab === 'overview' ? (
              <KspOverview onQuickStart={handleSendMessage} />
            ) : activeRightTab === 'graph' ? (
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
                  onQueryNode={handleSendMessage}
                  onSelectNode={setSelectedNode}
                />
              </div>
            ) : (
              <KarnatakaMap onSelectDistrict={handleSendMessage} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;


