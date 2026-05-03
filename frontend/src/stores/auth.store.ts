import { makeAutoObservable } from "mobx";
import RootStore from "./root.store";
import { Nullable } from "../utils/types";
import { User } from "../shared";

export interface AppLoadingState {
  isLoaded: boolean;
  error: { isError: boolean; message: string };
};

class AuthStore {
  private rootStore: RootStore;

  private _authLoading: AppLoadingState = {
    isLoaded: true,
    error: { isError: false, message: "" },
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  };

  get accessToken(): Nullable<string> {
    return this.rootStore.userStore.accessToken;
  };

  get isAuthenticated(): boolean {
    return this.rootStore.userStore.isAuthenticated;
  };

  get authLoading(): AppLoadingState {
    return this._authLoading;
  };

  setAuthLoading(value: AppLoadingState) {
    this._authLoading = value;
  };

  setAuthenticated(token: string, user: User) {
    this.rootStore.userStore.setAccessToken(token);
    this.rootStore.userStore.setUser(user);
  };

  logout() {
    this.rootStore.userStore.clearAll();
  };
};

export default AuthStore;
