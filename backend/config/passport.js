const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { getModels } = require('../models');

const configurePassport = (passport) => {
    // local strategy - 登入驗證
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const { Admin } = getModels();
            const admin = await Admin.findOne({ email });

            if(!admin) {
                return done(null, false, { message: 'Admin not found' });
            }

            const isMatch = await admin.comparePassword(password);
            if(!isMatch) {
                return done(null, false, { message: 'Invalid password'});
            }

            return done(null, admin);
        } catch (error) {
            return done(error);
        }
    }));

    // Jwt strategy - API 授權
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // from Authorization header get Bearer Token
    opts.secretOrKey = process.env.JWT_SECRET;

    passport.use('jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const { Admin } = getModels();
            // jwt_payload 解碼後的 token content
            // 登入時將 user.id 存入了 payload 的 sub(subject)
            const admin = await Admin.findById(jwt_payload.sub);

            if(admin) {
                // if admin exists
                return done(null, admin);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }));

};

module.exports = configurePassport;