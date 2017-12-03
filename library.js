"use strict";

var user = module.parent.require('./user.js'),
    db = module.parent.require('../src/database.js'),
    meta = module.parent.require('./meta'),
    winston = require('winston'),
    TeamSpeakClient = require('node-teamspeak'),
    loggedIn = module.parent.require('connect-ensure-login');

var plugin = {};

var tsTmpData = {};
var cl = undefined;

var log = {
    "info": function (msg) {
        winston.info("[TSV] " + msg);
    },
    "warn": function (msg) {
        winston.warn("[TSV] " + msg);
    }
};

plugin.sentMessage = function (tsid, msg) {
    if (cl !== undefined) {
        cl.send("clientgetids", {cluid: tsid}, function (err, response, rawResponse) {
            if (response === undefined) {
                log.warn("Client not found");
            } else {
                cl.send("sendtextmessage", {
                    targetmode: 1,
                    target: response.clid,
                    msg: msg
                });
            }
        });
        return true;
    } else {
        return false;
    }
};

plugin.addClientToGroup = function (tsid, servergroup) {
    if (cl !== undefined) {
        cl.send("clientgetdbidfromuid", {cluid: tsid}, function (err, response, rawResponse) {
            if (response === undefined) {
                log.warn("Client not found");
            } else {
                cl.send("servergroupaddclient", {
                    sgid: servergroup,
                    cldbid: response.cldbid
                });
            }
        });
        return true;
    } else {
        return false;
    }
};

plugin.removeClientFromGroup = function (tsid, servergroup) {
    if (cl !== undefined) {
        cl.send("clientgetdbidfromuid", {cluid: tsid}, function (err, response, rawResponse) {
            if (response === undefined) {
                log.warn("Client not found");
            } else {
                cl.send("servergroupdelclient", {
                    sgid: servergroup,
                    cldbid: response.cldbid
                });
            }
        });
        return true;
    } else {
        return false;
    }
};

plugin.init = function (data, callback) {
    var hostMiddleware = data.middleware;
    var hostHelpers = require.main.require('./src/routes/helpers');
    var controllers = require('./static/lib/controllers');

    function render(req, res, next) {
        res.render('admin/plugins/teamspeak-verify', {});
    }

    meta.settings.get('teamspeak-verify', function (err, settings) {
        log.info("init client");
        if (!err && settings["server"] && settings["port"] && settings["username"] && settings["password"] && settings["serid"] && settings["queryname"] && settings["sgroupid"]) {
            cl = new TeamSpeakClient(settings["server"], parseInt(settings["port"]));
            cl.send("login", {client_login_name: settings["username"], client_login_password: settings["password"]});
            cl.send("use", {sid: parseInt(settings["serid"])});
            cl.send("clientupdate", {client_nickname: settings["queryname"]});
            log.info("client initialised")
        }
    });

    data.router.get('/admin/plugins/teamspeak-verify', data.middleware.admin.buildHeader, render);
    data.router.get('/api/admin/plugins/teamspeak-verify', render);


    data.router.get('/api/plugins/teamspeak-verify/generate', loggedIn.ensureLoggedIn(), function (req, res) {
        res.json({error: true, info: "incorrect methode"});
    });
    data.router.post('/api/plugins/teamspeak-verify/generate', loggedIn.ensureLoggedIn(), function (req, res) {
        user.isAdminOrGlobalMod(req.session.passport.user, function (err, isAdminorMod) {
            if (isAdminorMod !== true && req.session.passport.user != req.body.uid) {
                res.json({error: true, info: "invalid user"});
                return;
            }

            user.getUserField(req.body.uid, "email", function (err, email) {
                user.getUserField(req.body.uid, "email:confirmed", function (err, confirmed) {
                    if (!(email.trim().length !== 0 && confirmed === 1)) {
                        res.json({error: true, info: "email not verified"});
                    } else {
                        plugin.isVerified(req.body.uid, function (err, isVerified) {
                            if (isVerified) {
                                res.json({error: true, info: "user already verified"});
                            } else {
                                plugin.getTSIDs(function (err, data) {
                                    if (data.indexOf(req.body.tsid) >= 0) {
                                        res.json({error: true, info: "TS ID already verified"});
                                    } else {
                                        var randomString = Math.random().toString(36).substring(4);
                                        if (plugin.sentMessage(req.body.tsid, randomString)) {
                                            tsTmpData[req.body.uid] = {
                                                tsid: req.body.tsid,
                                                random: randomString
                                            };
                                            res.json({error: false, info: "success"});
                                        } else {
                                            res.json({error: true, info: "internal server error"});
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });

    data.router.get('/api/plugins/teamspeak-verify/check', loggedIn.ensureLoggedIn(), function (req, res) {
        res.json({error: true, info: "incorrect methode"});
    });

    data.router.post('/api/plugins/teamspeak-verify/check', loggedIn.ensureLoggedIn(), function (req, res) {
        user.isAdminOrGlobalMod(req.session.passport.user, function (err, isAdminorMod) {
            if (isAdminorMod !== true && req.session.passport.user != req.body.uid) {
                res.json({error: true, info: "invalid user"});
                return;
            }

            meta.settings.get('teamspeak-verify', function (err, settings) {
                if (req.body.uid in tsTmpData && tsTmpData[req.body.uid].tsid === req.body.tsid && tsTmpData[req.body.uid].random === req.body.code) {
                    plugin.getTSIDs(function (err, data) {
                        if (data.indexOf(req.body.tsid) >= 0) {
                            res.json({error: true, info: "TS ID already verified"});
                        } else {
                            if (settings["sgroupid"] && plugin.addClientToGroup(req.body.tsid, parseInt(settings["sgroupid"]))) {
                                delete tsTmpData[req.body.uid];
                                res.json({error: false, info: "success"});
                                db.setObjectField('teamspeak-verify:uid:tid', req.body.uid, req.body.tsid, function (err) {
                                    if (err == null) {
                                        log.info("User " + req.body.uid + " now associated with " + req.body.tsid);
                                    } else {
                                        log.warn("DB Error " + err);
                                    }
                                });
                            } else {
                                res.json({error: true, info: "internal server error"});
                            }
                        }
                    });
                } else {
                    res.json({error: true, info: "invalid data"});
                }
            });
        });
    });

    data.router.get('/api/plugins/teamspeak-verify/checkUser', loggedIn.ensureLoggedIn(), function (req, res) {
        res.json({error: true, info: "incorrect methode"});
    });

    data.router.post('/api/plugins/teamspeak-verify/checkUser', loggedIn.ensureLoggedIn(), function (req, res) {
        plugin.getTSIDs(function (err, data) {
            if (data.indexOf(req.body.tsid) >= 0) {
                res.json({error: true, info: "TS ID already verified"});
            } else {
                cl.send("clientgetids", {cluid: req.body.tsid}, function (err, response, rawResponse) {
                    if (err !== undefined) {
                        res.json({error: true, info: "client not found"});
                    } else {
                        res.json({error: false, info: "ok"});
                    }
                });
            }
        });
    });

    data.router.get('/api/plugins/teamspeak-verify/disassociate/:uid', loggedIn.ensureLoggedIn(), function (req, res) {
        res.json({error: true, info: "incorrect methode"});
    });

    data.router.post('/api/plugins/teamspeak-verify/disassociate', loggedIn.ensureLoggedIn(), function (req, res) {
        user.isAdminOrGlobalMod(req.session.passport.user, function (err, isAdminorMod) {
            if (isAdminorMod !== true && req.session.passport.user != req.body.uid) {
                res.json({error: true, info: "invalid user"});
                return;
            }

            meta.settings.get('teamspeak-verify', function (err, settings) {
                plugin.isVerified(req.body.uid, function (err, isVerified) {
                    if (!isVerified) {
                        log.warn("" + req.body.uid + " not verified");
                        res.json({error: true, info: "internal server error"});
                    } else {
                        plugin.get(req.body.uid, function (err, tsid) {
                            if (settings["sgroupid"] && plugin.removeClientFromGroup(tsid, parseInt(settings["sgroupid"]))) {
                                res.json({error: false, info: "success"});
                                plugin.delete(req.body.uid, function (err) {
                                    if (err == null) {
                                        log.info("User " + req.body.uid + " disassociate - removed TS ID");
                                    } else {
                                        log.warn("DB Error " + err);
                                    }
                                });
                            } else {
                                res.json({error: true, info: "internal server error"});
                            }
                        });
                    }
                });
            });
        });
    });


    hostHelpers.setupPageRoute(data.router, '/user/:userslug/teamspeak', hostMiddleware, [hostMiddleware.checkGlobalPrivacySettings, hostMiddleware.checkAccountPermissions], controllers.renderSettings);
    callback();
};

plugin.userBanned = function (data, callback) {
    meta.settings.get('teamspeak-verify', function (err, settings) {
        plugin.isVerified(data.uid, function (err, isVerified) {
            if (isVerified) {
                plugin.get(data.uid, function (err, tsid) {
                    if (settings["sgroupid"] && plugin.removeClientFromGroup(tsid, parseInt(settings["sgroupid"]))) {
                        plugin.delete(data.uid, function (err) {
                            if (err == null) {
                                log.info("User " + data.uid + " banned - removed TS ID");
                            } else {
                                log.warn("DB Error " + err);
                            }
                        });
                    }
                });
            }
        });
    });
};

plugin.updateTitle = function (data, callback) {
    if (data.templateData.url.match(/user\/.+\/teamspeak/)) {
        data.templateData.title = "TeamSpeak";
    }
    callback(null, data);
};

plugin.addMenuItem = function (custom_header, callback) {
    if (cl !== undefined) {
        custom_header.plugins.push({
            'route': "/plugins/teamspeak-verify",
            'icon': "fa-microphone",
            'name': "Teamspeak"
        });
    }

    callback(null, custom_header);
};

plugin.editAccount = function (data, callback) {
    data.editButtons.push({
        link: "/user/" + data.userslug + "/teamspeak",
        text: "Teamspeak ID"
    });

    callback(null, data);
};

plugin.getText = function (callback) {
    meta.settings.get('teamspeak-verify', function (err, settings) {
        callback(err, settings["customtext"]);
    });
};

plugin.getUidByUserslug = function (uid, callback) {
    user.getUidByUserslug(uid, callback);
};

plugin.get = function (uid, callback) {
    db.getObjectField('teamspeak-verify:uid:tid', uid, callback);
};

plugin.isVerified = function (uid, callback) {
    db.isObjectField("teamspeak-verify:uid:tid", uid, callback);
};

plugin.getTSIDs = function (callback) {
    db.getObjectValues("teamspeak-verify:uid:tid", callback);
};

plugin.delete = function (uid, callback) {
    db.deleteObjectField("teamspeak-verify:uid:tid", uid, callback);
};

module.exports = plugin;