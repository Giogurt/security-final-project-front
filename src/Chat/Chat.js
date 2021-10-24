import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Button from "@mui/material/Button";
import { TextField, Typography } from "@mui/material";

const Chat = ({ server }) => {
  const socket = io(server);
  const [chat, setChat] = useState({
    messages: {},
    lastMessage: "",
    myLastMessage: "",
    messageToSend: "",
  });

  useEffect(() => {
    socket.on("Mensaje ASCP", (message) => {
      console.log(message);
      if (message !== chat.lastMessage) {
        setChat({ ...chat, lastMessage: message.data });
      }
    });
  }, []);

  const handleTextAreaChange = (e) => {};

  const handleSendOnClick = (_) => {
    const msg = chat.messageToSend;
    socket.emit("Mensaje ASCP", { function: 1, data: msg });
  };

  const handleMessageToSendOnChange = (e) => {
    e.preventDefault();
    setChat({ ...chat, messageToSend: e.target.value });
  };
  return (
    <div>
      <Typography variant="h5"> {chat.lastMessage} </Typography>
      <TextField
        value={chat.messageToSend}
        variant="outlined"
        onChange={handleMessageToSendOnChange}
      />
      <Button onClick={handleSendOnClick}>Send</Button>
    </div>
  );
};

export default Chat;
