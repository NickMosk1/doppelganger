import { makeAutoObservable } from "mobx";
import { User } from "../shared/types/user";
import { Nullable } from "../utils/types";

class UserStore {
  private _user: Nullable<User> = null;
  private _accessToken: Nullable<string> = null;
  private _refreshToken: Nullable<string> = null;

  constructor() {
    makeAutoObservable(this);

    if (typeof window !== "undefined") {
      this._accessToken = localStorage.getItem("access_token");
      this._refreshToken = localStorage.getItem("refresh_token");

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          this._user = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  }

  get user(): Nullable<User> {
    return this._user;
  }

  get accessToken(): Nullable<string> {
    return this._accessToken;
  }

  get refreshToken(): Nullable<string> {
    return this._refreshToken;
  }

  get isAuthenticated(): boolean {
    return !!this._accessToken && !!this._user;
  }

  get userFullName(): string {
    return this._user?.fullName || "Пользователь";
  }

  setUser(user: Nullable<User>) {
    this._user = user;
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    }
  }

  setAccessToken(token: Nullable<string>) {
    this._accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
    }
  }

  setRefreshToken(token: Nullable<string>) {
    this._refreshToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("refresh_token", token);
      } else {
        localStorage.removeItem("refresh_token");
      }
    }
  }

  clearAll() {
    this._user = null;
    this._accessToken = null;
    this._refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }
}

export default UserStore;
