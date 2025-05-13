import { useGraphStore } from "../../state/graphStore";
import Button from "../basic/Button";

export default function GraphToolBar() {
  const createNode = useGraphStore((s) => s.createNode);

  return (
    <nav>
      <ul className="flex flex-row ">
        <li className="mr-2 items-center flex">
          <h3 className="text-xl">Create Node: </h3>
        </li>
        <li className="mr-2">
          <Button
            label="Prompt"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("prompt");
            }}
          />
        </li>
        <li className="mr-2">
          <Button
            label="LLM"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("llm");
            }}
          />
        </li>
        <li className="mr-2">
          <Button
            label="Output"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("output");
            }}
          />
        </li>
        <li>
          <Button
            label="Variable"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("variable");
            }}
          />
        </li>
      </ul>
    </nav>
  );
}
