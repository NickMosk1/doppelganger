import AuthStore from "./auth.store";
import UserStore from "./user.store";
import EditorStore from "./editor.store";
import CatalogStore from "./catalog.store";
import SchemaStore from "./schema.store";

class RootStore {
  authStore: AuthStore;
  userStore: UserStore;
  editorStore: EditorStore;
  catalogStore: CatalogStore;
  schemaStore: SchemaStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.userStore = new UserStore();
    this.editorStore = new EditorStore();
    this.catalogStore = new CatalogStore();
    this.schemaStore = new SchemaStore();
  };
};

export default RootStore;
