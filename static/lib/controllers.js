'use strict';

var parent = module.parent.exports,
    passport = require.main.require('passport'),
    nconf = require.main.require('nconf'),
    async = require.main.require('async'),
    Controllers = {};

Controllers.renderSettings = function(req, res, next) {
    parent.getUidByUserslug(req.params.userslug, function (err, uid) {
        if(uid == null) {
            return res.render('403', {});
        }

        parent.getText(function (err, data) {
            parent.isVerified(uid, function(err, isVerified) {
                parent.get(uid, function(err, tsid) {
                    res.render('account/teamspeak', {
                        showSetup: !isVerified,
                        tsid: tsid,
                        uid: uid,
                        text: data
                    });
                });
            });
        });
    });
};

module.exports = Controllers;