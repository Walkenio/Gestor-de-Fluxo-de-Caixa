import { clearUserSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
    clearUserSession(event);
    return { success: true };
});
