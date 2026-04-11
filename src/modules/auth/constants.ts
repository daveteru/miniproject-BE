const now = new Date();
const day = 24 * 60 * 60 * 100;

export const POINTS_EXPIRE_DATE: number = now.setMonth(now.getMonth() + 3);
export const COUPON_EXPIRE_DATE: number = now.setMonth(now.getMonth() + 3);

export const POINTS_ON_REGISTRATION = 10000;
export const COUPON_ON_REGISTRATION = 20;

export const REFRESH_TOKEN_EXPIRES_IN: number = Date.now() + 7 * day;
export const EXPIRED_ACCESS_TOKEN_JWT = "10m";
export const EXPIRED_REFRESH_TOKEN_JWT = "7d";
