import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { addMessageRoute, getAllMessagesRoute } from "@/utils/APIRoutes";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);

  const [arrivalMessage, setArrivalMessage] = useState(null);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChat) {
        await axios
          .get(`${getAllMessagesRoute}/${currentUser._id}/${currentChat._id}`)
          .then((res) => {
            setMessages(res.data);
          });
      }
    };
    fetchMessages();
  }, [currentChat, currentUser]);

  const handleSendMessage = async (message) => {
    await axios.post(addMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message,
    });
    socket.current.emit("send-message", {
      to: currentChat._id,
      from: currentUser._id,
      message,
    });

    setMessages((prev) => [...prev, { fromSelf: true, message }]);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("message-received", (message) => {
        setArrivalMessage({ fromSelf: false, message });
      });
    }
  }, [socket]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img src={currentChat.avatarImage} alt="avatar" />
              </div>
              <div className="username">
                <h3>{currentChat.username}</h3>
              </div>
            </div>
            <Logout />
          </div>
          <div className="chat-messages">
            {messages?.map((message) => (
              <div key={message._id} ref={scrollRef}>
                <div
                  className={`message ${
                    message.fromSelf ? "sender" : "receiver"
                  }`}
                >
                  <div className="content">
                    <p>{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ChatInput handleSendMessage={handleSendMessage} />
        </Container>
      )}
    </>
  );
};

export default ChatContainer;

const Container = styled.div`
  padding-top: 1rem;
  display: grid;
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
          border-radius: 50%;
          width: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
      }
    }
  }
  .sender {
    justify-content: flex-end;
    .content {
      background-color: #4f04ff21;
    }
  }
  .receiver {
    justify-content: flex-start;
    .content {
      /* background-color: #9900ff20; */
      background-color: white;
      p {
        color: #333232;
      }
    }
  }
`;
