const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const configurePassport = (passport) => {
    // Jwt strategy - API 授權
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // from Authorization header get Bearer Token
    opts.secretOrKey = process.env.JWT_SECRET;

    passport.use('jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            // 驗證 token 的有效性，不再依賴本地資料庫
            // 這裡可以進一步呼叫核心服務來驗證使用者
            if(jwt_payload.sub) {
                // 簡單的 token 驗證，返回基本的使用者資訊
                const user = {
                    _id: jwt_payload.sub,
                    email: jwt_payload.email || 'admin' // 可從 token 中取得或設定預設值
                };
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }));

};

module.exports = configurePassport;