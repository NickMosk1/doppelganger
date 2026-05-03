import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import { SubSchemaNodeContainer, SchemaIcon, SchemaName, SchemaType } from "./SubSchemaNode.styles";

interface SubSchemaNodeProps {
  data: {
    label: string;
    schemaId: string;
  };
  selected: boolean;
}

const SubSchemaNode: React.FC<SubSchemaNodeProps> = observer(({ data, selected }) => {
  return (
    <SubSchemaNodeContainer selected={selected}>
      <Handle type="target" position={Position.Top} />
      <SchemaIcon>📁</SchemaIcon>
      <SchemaName>{data.label}</SchemaName>
      <SchemaType>Вложенная схема</SchemaType>
      <Handle type="source" position={Position.Bottom} />
    </SubSchemaNodeContainer>
  );
});

export default SubSchemaNode;
