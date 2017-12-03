<div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">TeamSpeak Verify</div>
    <div class="col-sm-10 col-xs-12">
        <form role="form" class="teamspeak-verify-settings">
            <div class="form-group">
                <label for="server">Server IP</label>
                <input type="text" name="server" id="server" title="Server IP" class="form-control" value="127.0.0.1"
                       placeholder="Server IP">
            </div>

            <div class="form-group">
                <label for="port">Port</label>
                <input type="number" name="port" id="port" title="Port" class="form-control" value="10011"
                       placeholder="10011">
            </div>

            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" name="username" id="username" title="Username" class="form-control"
                       value="serveradmin" placeholder="Username">
            </div>

            <div class="form-group">
                <label for="queryname">Query Name</label>
                <input type="text" name="queryname" id="queryname" title="Queryname" class="form-control"
                       value="TeamSpeak Verify Bot" placeholder="Queryname">
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" title="Password" class="form-control"
                       placeholder="Password">
            </div>

            <div class="form-group">
                <label for="serid">ServerID</label>
                <input type="number" name="serid" id="serid" title="ServerID" class="form-control" value="1"
                       placeholder="1">
            </div>

            <div class="form-group">
                <label for="sgroupid">Server Group ID</label>
                <input type="number" name="sgroupid" id="sgroupid" title="ServerGroupID" class="form-control" value="1"
                       placeholder="1">
            </div>

            <div class="form-group">
                <label for="customtext">Custom Text</label>
                <textarea name="customtext" id="customtext" class="form-control"></textarea>
            </div>
        </form>
    </div>
</div>

<button id="save"
        class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
    <i class="material-icons">save</i>
</button>