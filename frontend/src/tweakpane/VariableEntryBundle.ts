import { VariableEntryPlugin } from "./VariableEntryPlugin";

const VariableEntryBundle = {
  id: "variable-entry",
  plugins: [VariableEntryPlugin],
  css: `
    .tp-variable-entry {
      display: flex;
      width: 100%;
    }
    
    .tp-lblv_l {
      width: 0;
      padding: 0;
      margin: 0;
      display: none;
    }

    .tp-lblv_v {
      width: 100%;
    }

    .tp-variable-entry input {
      flex: 1;
      width: 40%;
      border-bottom: 1px solid #999;
      padding: 4px;
    }

    .tp-variable-entry select {
      width: 100px;
      width: 20%;
    }

    .tp-variable-entry button {
      border: none;
      background: #999;
      color: #333;
      cursor: pointer;
      padding: 2px;
      font-weight: bold;
      margin: 3px;
      width: 18px;
      max-width: 18px;
      height: 18px;
      margin-left: 4px;
      border-radius: 50%;
      align-self: center;
    }

    .tp-variable-entry button:hover {
      background: #666;
      color: #aaa;
    }
  `,
};

export default VariableEntryBundle;
