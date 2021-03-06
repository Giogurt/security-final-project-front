import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Button from "@mui/material/Button";
import {
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import crypto from "crypto";
import bigInt from "big-integer";

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
    keyReceived: false,
    interfere: false,
    messageStatus: "",
    // cryptoKey: 0,
  });
  console.log(cryptoKey);

  useEffect(() => {
    if (cryptoKey != "") {
      socket.on("Mensaje ASCP", (response) => {
        if (response.function === 1) {
          const message = decodeDesECB(response.data, cryptoKey);
          const hashReceived = decodeDesECB(response.mac, cryptoKey);
          console.log("hash received", hashReceived);
          const hashMsg = calculateHashMessage(message);
          console.log("calculated hash", hashMsg);
          // const message = response.data;
          console.log(message);
          if (message !== chat.lastMessage) {
            if (hashReceived === hashMsg){

              setChat({ ...chat, lastMessage: message, messageStatus: "" });
            } else {
              setChat({ ...chat, lastMessage: message, messageStatus: "EL MENSAJE PUEDE QUE ESTÉ COMPROMETIDO" });
            }
          }
        }
      });
    }
  }, [cryptoKey]);

  // useEffect(() => {
  //   listenSocket();
  // }, [socket]);

  const listenSocket = () => {
    if (socket !== undefined) {
      console.log(socket);
      if (startingConversation) {
        socket.emit("Mensaje ASCP", {
          function: 2,
          data: {
            q: 2426697107,
            a: 17123207,
            y: yValue,
          },
        });
      } else {
        socket.emit("Mensaje ASCP", {
          function: 3,
          data: {
            q: qValue,
            a: aValue,
            y: yValue,
          },
        });
      }
      socket.on("Mensaje ASCP", (response) => {
        switch (response.function) {
          case 2:
            if (!startingConversation) {
              const tempKey = calculateKey(response.data.y);
              if (!chat.keyReceived) {
                setChat({
                  ...chat,
                  keyReceived: true,
                });
                chat.keyReceived = true;
                handleKeyChange(tempKey.toString().substring(0, 8));
                socket.emit("Mensaje ASCP", {
                  function: 3,
                  data: {
                    q: qValue,
                    a: aValue,
                    y: yValue,
                  },
                });
              }
            }
            break;
          case 3:
            if (startingConversation) {
              const tempKey = calculateKey(response.data.y);
              console.log(chat.keyReceived);
              if (!chat.keyReceived) {
                setChat({
                  ...chat,
                  keyReceived: true,
                });
                chat.keyReceived = true;
                handleKeyChange(tempKey.toString().substring(0, 8));
                socket.emit("Mensaje ASCP", {
                  function: 2,
                  data: {
                    q: qValue,
                    a: aValue,
                    y: yValue,
                  },
                });
              }
            }
            break;
          default:
            break;
        }
      });
    }
  };

  const calculateHashMessage = (msg) => {
    let shasum = crypto.createHash("sha1");
    shasum.update(msg);
    return shasum.digest("base64");
  };
  const handleSendOnClick = (_) => {
    let msg = chat.messageToSend;
    const hash = calculateHashMessage(msg);

    if (chat.interfere) {
      msg = "NUNCA TE AMÉ";
    }

    console.log("hash before sending", hash);
    const eHash = encodeDesECB(hash, cryptoKey);
    let eMsg = encodeDesECB(msg, cryptoKey);

    console.log("sending encrypted message", eMsg);
    socket.emit("Mensaje ASCP", { function: 1, data: eMsg, mac: eHash });
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
    console.log(keyString);
    var key = new Buffer(keyString.substring(0, 8), "utf8");

    var decipher = crypto.createDecipheriv("des-ecb", key, "");

    var c = textToDecode;
    try {
      var c = decipher.update(textToDecode, "base64", "utf8");
      c += decipher.final("utf8");
    } catch {
      c = textToDecode;
    }

    return c;
  };

  const calculateKey = (y) => {
    const x = parseInt(xValue);
    // let tempY = BigInt(BigInt(Math.pow(y, x)) % qValue);
    // console.log(tempY)
    // return tempY;
    const tempKey = bigInt(y).modPow(x, qValue).toString();
    console.log("la llave", tempKey);
    return tempKey;
    // return Math.pow(y, x) % qValue;
    // return powerMod(y, x, qValue).toString()
  };

  const handleSendKey = (_) => {
    listenSocket();
  };

  const handleChecked = (event) => {
    setChat({...chat, interfere: event.target.checked });
  };

  const powerMod = (base, exponent, modulus) => {
    if (modulus === 1) return 0;
    var result = 1;
    base = base % modulus;
    while (exponent > 0) {
      if (exponent % 2 === 1)
        //odd number
        result = (result * base) % modulus;
      exponent = exponent >> 1; //divide by 2
      base = (base * base) % modulus;
    }
    return result;
  };

  return (
    <Container>
      {`My key is ${cryptoKey}`}
      {cryptoKey === "" ? (
        <div>Waiting for the other key</div>
      ) : (
        <Grid container justifyContent="center">
          <Grid item xs={12} >
            <h2 >{chat.messageStatus}</h2>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5"> {chat.lastMessage} </Typography>
          </Grid>
          <Grid item container justifyContent="flex-end" xs={6}>
            <TextField
              name="chat"
              value={chat.messageToSend}
              variant="outlined"
              onChange={handleMessageToSendOnChange}
            />
          </Grid>
          <Grid item container justifyContent="flex-start" xs={6}>
            <Button onClick={handleSendOnClick}>Send</Button>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox checked={chat.interfere} onChange={handleChecked} />
              }
              label="Interfere with the communication"
            />
          </Grid>
        </Grid>
      )}
      <Grid container justifyContent="center">
        <Grid item>
          <Button onClick={handleSendKey}>Send Key</Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
