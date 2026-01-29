export function genererToken(taille) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < taille; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}