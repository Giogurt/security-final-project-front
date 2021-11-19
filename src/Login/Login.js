import {
  Button,
  Container,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, { useState } from "react";

const qValue = 2426697107;

const Login = ({
  handleTextFieldOnChange,
  handleLoginOnSubmit,
  server,
  xValue,
  startingConversation,
  handleChecked,
}) => {
  return (
    <Container maxWidth="md" style={{ paddingTop: 100 }}>
      {console.log(startingConversation)}
      <form onSubmit={handleLoginOnSubmit}>
        <Grid container justifyContent="center" rowSpacing={2}>
          <Grid item xs={12}>
            <TextField
              name="server"
              value={server}
              label="Server to connect"
              onChange={handleTextFieldOnChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="xValue"
              value={xValue}
              label={`x value`}
              placeholder={`# less than ${qValue}`}
              onChange={handleTextFieldOnChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={startingConversation}
                  onChange={handleChecked}
                />
              }
              label="Are you starting the conversation?"
            />
          </Grid>
          <Button onClick={handleLoginOnSubmit}>Connect!</Button>
        </Grid>
      </form>
    </Container>
  );
};

export default Login;
