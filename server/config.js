
var Config = (function () {
    function Config() {
    }
    Config.postgres = process.env.DATABASE_URL || 'postgres://postgres:1@localhost:5432/seo';
    Config.redis = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    Config.passport_key = process.env.PASSPORT_KEY || 'JHYY79YGI89GKGKG9';
    Config.antigate_key = process.env.ANTIGATE_KEY || '';
    Config.private_ip = process.env.PRIVATE_IP || '127.0.0.1';
    Config.port = process.env.PORT || 3000;
    Config.isHeroku = process.env.IS_HEROKU || false;
    Config.logLevel = process.env.LOG_LEVEL || 'INFO';

    return Config;
})();

module.exports = Config;
