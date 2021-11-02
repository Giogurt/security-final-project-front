import { Button, TextField } from "@mui/material";
import React, { useState } from "react";

const Login = ({ handleTextFieldOnChange, handleLoginOnSubmit, server }) => {
  return (
    <div>
      <form onSubmit={handleLoginOnSubmit}>
        <TextField
          name="server"
          value={server}
          label="Server to connect"
          onChange={handleTextFieldOnChange}
        />
        <Button onClick={handleLoginOnSubmit} >Connect!</Button>
      </form>
    </div>
  );
};

export default Login;
