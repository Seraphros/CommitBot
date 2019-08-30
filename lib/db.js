let mysql = require('mysql');

let pool = mysql.createPool({
    connectionLimit: 10,
    host: '',
    user: '',
    password: '',
    database: ''
});

/*

    two tables needed :

        --
        -- Base de données :  `commitBot`
        --

        -- --------------------------------------------------------

        --
        -- Structure de la table `channels`
        --

        CREATE TABLE `channels` (
          `id` int(11) NOT NULL,
          `channelId` text NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

        -- --------------------------------------------------------

        --
        -- Structure de la table `strips`
        --

        CREATE TABLE `strips` (
          `id` int(11) NOT NULL,
          `url` text NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

        --
        -- Index pour les tables exportées
        --

        --
        -- Index pour la table `channels`
        --
        ALTER TABLE `channels`
          ADD PRIMARY KEY (`id`);

        --
        -- Index pour la table `strips`
        --
        ALTER TABLE `strips`
          ADD PRIMARY KEY (`id`);

        --
        -- AUTO_INCREMENT pour les tables exportées
        --

        --
        -- AUTO_INCREMENT pour la table `channels`
        --
        ALTER TABLE `channels`
          MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
        --
        -- AUTO_INCREMENT pour la table `strips`
        --
        ALTER TABLE `strips`
          MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;


 */

function retrieveAllStrips(cb, strips) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query("SELECT * FROM strips", function (err, result, fields) {
            connection.release();
            if (err) throw err;
            result.forEach(function (strip) {
                strips.push(strip.url);
            });
            cb();
        });
    });
}

function retrieveAllChannels(cb, channels) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query("SELECT * FROM channels", function (err, result, fields) {
            connection.release();
            if (err) throw err;
            result.forEach(function (channel) {
                channels.push(channel.channelId);
            });
            cb();
        });
    });
}
function insertStrips(url) {
    pool.getConnection(function (err, connection) {
        let sql = "INSERT INTO strips (url) VALUES ('" + url + "')";
        connection.query(sql, function (err, result) {
            connection.release();
            if (err) throw err;

            console.log("1 record inserted");
        });
    });
}

function insertChannel(channel) {
    pool.getConnection(function (err, connection) {
        let sql = "INSERT INTO channels (channelId) VALUES ('" + channel + "')";
        connection.query(sql, function (err, result) {
            connection.release();
            if (err) throw err;
            console.log("1 record inserted");
        });
    });
}

function removeChannel(channel) {
    pool.getConnection(function (err, connection) {
        let sql = "DELETE FROM channels WHERE channelId = " + channel;
        console.log("SQL : " + sql);
        connection.query(sql, function (err, result) {
            connection.release();
            if (err) throw err;
            console.log("Number of records deleted: " + result.affectedRows);
        });
    });
}

module.exports = {
    retrieveAllStrips,
    retrieveAllChannels,
    insertStrips,
    insertChannel,
    removeChannel
};
