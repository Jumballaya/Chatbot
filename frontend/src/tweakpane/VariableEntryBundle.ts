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
      width: 33%;
      border-bottom: 1px solid #999;
      padding: 4px;
    }

    .tp-variable-entry select {
      width: 100px;
      width: 33%;
    }
  `,
};

export default VariableEntryBundle;
