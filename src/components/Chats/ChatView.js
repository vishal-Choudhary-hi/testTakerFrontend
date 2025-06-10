import { useEffect, useRef, useState } from "react";
import { Modal,Offcanvas } from "react-bootstrap";
import { FiSend } from "react-icons/fi";
import constants from "../../services/constants";
import apiCall from "../../services/api";
const ChatView = ({ fromUserId, toUserId, showModal, toUserName, onModalClose,testId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchOldMessages();
  },[])
  const fetchOldMessages = async () => {
    const response=await apiCall('GET', `getUserTestMessage?testId=${testId}&receiverId=${toUserId}`, null, null, true);
    console.log("response", response);
    if (response?.data) {
      const oldMessages = response.data.map(msg => ({
        ...msg,
        incoming: msg.sender_id !== fromUserId,
        content:msg.message
      }));
      setMessages(oldMessages);
    }
  }
  useEffect(() => {
    const socket = new WebSocket(constants.webSocketServer);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "register", userId: fromUserId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, { ...data, incoming: true }]);
    };

    return () => socket.close();
  }, [fromUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const payload = {
      type: "message",
      to: toUserId,
      content: input,
      testId: testId,
    };
    socketRef.current.send(JSON.stringify(payload));
    setMessages((prev) => [...prev, { ...payload, incoming: false }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <Offcanvas placement="bottom" show={showModal} onHide={onModalClose}  style={{ height: '55vh' }} > 
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Chat with {toUserName}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div
          className="d-flex flex-column"
          style={{ height: "40vh" }}
        >
          {/* Messages */}
          <div
            className="flex-grow-1 overflow-auto p-2 mb-3 bg-light rounded"
            style={{ maxHeight: "100%", minHeight: 0 }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex ${msg.incoming ? "justify-content-start" : "justify-content-end"} mb-2`}
              >
                
                <div
                  className={`p-2 rounded-pill  ${
                    msg.incoming ? "bg-success text-white" : "bg-primary text-white"
                  }`}
                  style={{ maxWidth: "75%"}}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>


          {/* Input */}
          <div className="d-flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="form-control rounded-pill"
            />
            <button
              onClick={sendMessage}
              className="btn btn-primary rounded-pill"
              disabled={!input.trim()}
            >
              <FiSend size={20}/>
            </button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ChatView;
