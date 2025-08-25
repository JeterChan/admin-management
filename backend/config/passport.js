const LocalStrategy = require('passport-local').Strategy;
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

    // Serialize user for session
    passport.serializeUser((admin, done) => {
        const sessionData = {
            id: admin._id.toString(),
            email: admin.email
        }
        done(null, sessionData);
    });

    // Deserialize user from session
    passport.deserializeUser(async (sessionData, done) => {
        try {
            const { Admin } = getModels();
            const admin = await Admin.findById(sessionData.id).select('-password');

            if(!admin) {
                return done(null, false);
            }
            
            done(null, admin);
        } catch (error) {
            done(error);
        }
    });
};

module.exports = configurePassport;