import { EditorNode } from '../../../../../types';
import { Button } from '../../../../Button';
import { PropertyGroup, PropertyLabel, PropertyValue } from '../../RightPanel.styles';

interface SubSchemaViewProps {
  node: EditorNode;
};

const SubSchemaView: React.FC<SubSchemaViewProps> = ({ node }) => {
  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{node.customName || node.name}</PropertyValue>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyValue>Вложенная схема</PropertyValue>
      </PropertyGroup>
      <Button fullWidth onClick={() => {
        if (node.schemaId) {
          window.location.href = `/editor/${node.schemaId}`;
        }
      }}>
        📂 Открыть схему
      </Button>
    </>
  );
};

export default SubSchemaView;
