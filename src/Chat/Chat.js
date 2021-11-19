import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Button from "@mui/material/Button";
import { Container, TextField, Typography } from "@mui/material";
import crypto from "crypto";

const aValue = 17123207;
const qValue = 2426697107;

const Chat = ({
  socket,
  xValue,
  yValue,
  startingConversation,
  cryptoKey,
  handleKeyChange,
}) => {
  const [chat, setChat] = useState({
    messages: {},
    lastMessage: "",
    myLastMessage: "",
    messageToSend: "",
    otherYValue: 0,
    // cryptoKey: 0,
  });
  console.log(cryptoKey);

  useEffect(() => {
    if (cryptoKey != "") {
      socket.on("Mensaje ASCP", (response) => {
        if (response.function === 1) {
          const message = decodeDesECB(response.data, cryptoKey);
          // const message = response.data;
          console.log(message);
          if (message !== chat.lastMessage) {
            setChat({ ...chat, lastMessage: message });
          }
        }
      });
    }
  }, [cryptoKey]);

  useEffect(() => {
    if (socket !== undefined) {
      console.log(socket);
      if (startingConversation) {
        socket.emit("Mensaje ASCP", {
          function: 2,
          q: 2426697107,
          a: 17123207,
          y: yValue,
        });
      } else {
        socket.emit("Mensaje ASCP", {
          function: 3,
          q: 2426697107,
          a: 17123207,
          y: yValue,
        });
      }
      socket.on("Mensaje ASCP", (response) => {
        switch (response.function) {
          case 2:
            if (!startingConversation) {
              const tempKey = calculateKey(response.y);
              handleKeyChange(tempKey.toString().substring(0, 8));
              // setChat({
              //   ...chat,
              //   cryptoKey: tempKey.toString().substring(0, 8),
              // });
            }
            break;
          case 3:
            if (startingConversation) {
              const tempKey = calculateKey(response.y);
              handleKeyChange(tempKey.toString().substring(0, 8));
              // setChat({
              //   ...chat,
              //   cryptoKey: tempKey.toString().substring(0, 8),
              // });
              socket.emit("Mensaje ASCP", {
                function: 2,
                q: 2426697107,
                a: 17123207,
                y: yValue,
              });
            }
            break;
          default:
            break;
        }
      });
    }
  }, [socket]);

  const handleSendOnClick = (_) => {
    const msg = chat.messageToSend;
    const eMsg = encodeDesECB(msg, cryptoKey);
    console.log("sending encrypted message", eMsg);
    socket.emit("Mensaje ASCP", { function: 1, data: eMsg });
  };

  const handleMessageToSendOnChange = (e) => {
    e.preventDefault();
    setChat({ ...chat, messageToSend: e.target.value });
  };

  const encodeDesECB = (textToEncode, keyString) => {
    var key = new Buffer(keyString.substring(0, 8), "utf8");

    var cipher = crypto.createCipheriv("des-ecb", key, "");

    var c = cipher.update(textToEncode, "utf8", "base64");
    c += cipher.final("base64");

    return c;
  };

  const decodeDesECB = (textToDecode, keyString) => {
    var key = new Buffer(keyString.substring(0, 8), "utf8");

    var decipher = crypto.createDecipheriv("des-ecb", key, "");

    var c = decipher.update(textToDecode, "base64", "utf8");
    c += decipher.final("utf8");

    return c;
  };

  const calculateKey = (y) => {
    const x = parseInt(xValue);
    return Math.pow(y, x) % qValue;
  };
  return (
    <Container>
      {`My key is ${cryptoKey}`}
      {cryptoKey === "" ? (
        <div>Waiting for the other key</div>
      ) : (
        <div>
          <Typography variant="h5"> {chat.lastMessage} </Typography>
          <TextField
            name="chat"
            value={chat.messageToSend}
            variant="outlined"
            onChange={handleMessageToSendOnChange}
          />
          <Button onClick={handleSendOnClick}>Send</Button>
        </div>
      )}
    </Container>
  );
};

export default Chat;
