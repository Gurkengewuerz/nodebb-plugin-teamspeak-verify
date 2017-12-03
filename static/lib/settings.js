define('forum/account/teamspeak', ['translator'], function (translator) {
    var Settings = {};

    Settings.init = function () {
        if (ajaxify.data.showSetup) {
            $('button[data-action="verify"]').on('click', Settings.beginSetup);
            $('button[data-action="checkNow"]').on('click', Settings.endSetup);
        } else {
            $('button[data-action="reverify"]').on('click', Settings.disassociate);
        }
        $("#notFound").hide();
    };

    Settings.beginSetup = function () {
        if ($("#tsid").val().trim().length === 0) return;

        if(!(app.user.email.trim().length !== 0 && app.user["email:confirmed"])) {
            app.alertError("Bitte setzte/bestätige vorher deine Email.");
            return;
        }

        $.ajax("/api/plugins/teamspeak-verify/checkUser", {
            method: "post",
            data: {
                tsid: $("#tsid").val()
            }
        }).done(function (data) {
            if (data.error === true) {
                found = false;
                if(data.info === "TS ID already verified") {
                    app.alertError("Teamspeak ID wurde bereits verifiziert!");
                } else {
                    app.alertError("Client nicht gefunden!");
                }
            } else {
                $.ajax("/api/plugins/teamspeak-verify/generate", {
                    method: "post",
                    data: {
                        uid: $("#uid").val(),
                        tsid: $("#tsid").val()
                    }
                }).done(function (data) {
                    if (data.error === false) {
                        $('#codeCheck').modal('show');
                    } else {
                        app.alertError(data.info);
                    }
                });
            }
        });
    };

    Settings.endSetup = function () {
        if ($("#tsid").val().trim().length === 0) return;
        $.ajax("/api/plugins/teamspeak-verify/check", {
            method: "post",
            data: {
                uid: $("#uid").val(),
                tsid: $("#tsid").val(),
                code: $("#randomcode").val()
            }
        }).done(function (data) {
            if (data.error === false) {
                $('#codeCheck').modal('hide');
                setTimeout(function () {
                    ajaxify.refresh();
                }, 1000);
            } else {
                $("#randomcode").attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            }
        });
    };

    Settings.disassociate = function () {
        $.ajax("/api/plugins/teamspeak-verify/disassociate", {
            method: "post",
            data: {
                uid: $("#uid").val()
            }
        }).done(function (data) {
            if (data.error === false) {
                ajaxify.refresh();
            } else {
                app.alertError(data.info);
            }
        });
    };

    return Settings;
});