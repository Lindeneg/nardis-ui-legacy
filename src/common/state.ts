import { Action } from 'redux';
import { Nardis, Route, QueuedRouteItem, Upgrade, Player } from 'nardis-game';


export interface NardisState {
    _game?: Nardis,
    gameCreated: boolean,
    money: number,
    turn: number,
    level: number,
    routes: Route[],
    queue: QueuedRouteItem[],
    upgrades: Upgrade[],
    opponents: Player[]
}

export enum NardisAction {
    INITIALIZE_GAME,
    START_PLAYER_TURN,
    ADD_TO_PLAYER_QUEUE,
    ADD_PLAYER_UPGRADE,
    REMOVE_FROM_PLAYER_QUEUE,
    REMOVE_FROM_PLAYER_ROUTE,
    END_PLAYER_TURN
}

export interface ReducerPayload {
    initGame?: {
        name: string,
        money: number,
        opponents: number
    }
}

export interface ReducerAction extends Action<NardisAction> {
    payload: ReducerPayload
}