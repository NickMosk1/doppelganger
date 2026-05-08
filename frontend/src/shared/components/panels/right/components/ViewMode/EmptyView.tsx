import { NoSelectionMessage } from "../../RightPanel.styles";

const EmptyView: React.FC = () => (
  <NoSelectionMessage>
    <span>📌</span>
    <p>Выберите элемент на канвасе,<br />чтобы редактировать его свойства</p>
  </NoSelectionMessage>
);

export default EmptyView;
