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
            label="Output"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("output");
            }}
          />
        </li>
        <li className="mr-2">
          <Button
            label="String"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("string");
            }}
          />
        </li>
        <li className="mr-2">
          <Button
            label="Boolean"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("boolean");
            }}
          />
        </li>
        <li className="mr-2">
          <Button
            label="Number"
            variant="primary"
            size="sm"
            onClick={() => {
              createNode("number");
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
      </ul>
    </nav>
  );
}
