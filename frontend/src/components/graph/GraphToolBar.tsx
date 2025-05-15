import { useGraphStore } from "../../state/graphStore";
import Button from "../basic/Button";

export default function GraphToolBar() {
  const createNode = useGraphStore((s) => s.createNode);
  const compiled = useGraphStore((s) =>
    s.activeGraphId ? s.getCompiledGraph(s.activeGraphId) : undefined
  );
  const compile = useGraphStore((s) => () => s.compileGraph("default"));

  return (
    <nav>
      <ul className="flex flex-row ">
        <li className="mr-2">
          <Button
            label="Run Graph"
            variant={compiled ? "primary" : "disabled"}
            disabled={compiled === undefined}
            size="sm"
            onClick={async () => {
              if (compiled) {
                for await (const res of compiled.execute()) {
                  console.log(res);
                }
              }
            }}
          />
        </li>
        <li className="mr-12">
          <Button
            label="Compile Graph"
            variant="destructive"
            size="sm"
            onClick={() => compile()}
          />
        </li>
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
