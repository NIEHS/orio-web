import * as types from '../constants/ActionTypes';

export function loadConfig() {
    return { type: types.CONFIG.LOAD };
}