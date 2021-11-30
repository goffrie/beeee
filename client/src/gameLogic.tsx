import { RoomState } from "./gameState";

export function newStartingPhase(): RoomState {
    return {
        buzzed: null
    };
}