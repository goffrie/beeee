import { newStartingPhase } from './gameLogic';
import { callMakeRoom } from './gameAPI';

export async function createNewRoom(): Promise<string> {
    const initial = newStartingPhase();
    const reply = await callMakeRoom(initial);
    return reply.room;
}
