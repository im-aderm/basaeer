/**
 * Central security tunables.
 *
 * BCRYPT_ROUNDS is the bcrypt cost factor used for every password hash in the
 * system. Kept in one place so it can be raised over time without hunting down
 * call sites. 12 is the current sensible floor for interactive logins; raise as
 * hardware improves. When a stored hash's cost is below this value, callers
 * should opportunistically re-hash on the next successful login.
 */
export const BCRYPT_ROUNDS = 12;
