import AuthStore from "./auth.store";
import UserStore from "./user.store";

class RootStore {
  userStore: UserStore;
  authStore: AuthStore;

  constructor() {
    this.userStore = new UserStore();
    this.authStore = new AuthStore(this);
  }
}

export default RootStore;
