import { makeAutoObservable } from 'mobx';
import AuthStore, { AUTH_STORE } from './AuthStore';
import UserStore, { USER_STORE } from './UserStore';
import SchemaStore, { SCHEMA_STORE } from './SchemaStore';
import DeviceStore, { DEVICE_STORE } from './DeviceStore';
import CableStore, { CABLE_STORE } from './CableStore';
import FactorStore, { FACTOR_STORE } from './FactorStore';
import SimulationStore, { SIMULATION_STORE } from './SimulationStore';

export class RootStore {
  authStore: AuthStore;
  userStore: UserStore;
  schemaStore: SchemaStore;
  deviceStore: DeviceStore;
  cableStore: CableStore;
  factorStore: FactorStore;
  simulationStore: SimulationStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.userStore = new UserStore(this);
    this.schemaStore = new SchemaStore(this);
    this.deviceStore = new DeviceStore(this);
    this.cableStore = new CableStore(this);
    this.factorStore = new FactorStore(this);
    this.simulationStore = new SimulationStore(this);

    makeAutoObservable(this);
  }
}

export const ROOT_STORE = Symbol('RootStore');
export { AUTH_STORE, USER_STORE, SCHEMA_STORE, DEVICE_STORE, CABLE_STORE, FACTOR_STORE, SIMULATION_STORE };
